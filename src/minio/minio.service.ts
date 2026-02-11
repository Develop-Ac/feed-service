import { Injectable } from '@nestjs/common';
import {
    S3Client,
    PutObjectCommand,
    HeadObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
    PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import * as https from 'https';

type S3Opts = {
    endpoint: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketDefault: string;
    forcePathStyle?: boolean;
    tlsInsecure?: boolean;
};

@Injectable()
export class MinioService {
    private client: S3Client;
    private bucketDefault: string;

    constructor() {
        // Sanitize endpoint: remove trailing slash for client config
        const rawEndpoint = process.env.S3_ENDPOINT || 'http://s3-painel.acacessorios.local/';
        const sanitizedEndpoint = rawEndpoint.replace(/\/$/, '');

        const opts: S3Opts = {
            endpoint: sanitizedEndpoint,
            region: process.env.S3_REGION || 'us-east-1',
            accessKeyId: process.env.S3_ACCESS_KEY || 'admin',
            secretAccessKey: process.env.S3_SECRET_KEY || 'admin123456',
            bucketDefault: process.env.S3_BUCKET_FEED || 'feed',
            forcePathStyle: true,
            tlsInsecure: ['1', 'true', 'yes'].includes(String(process.env.S3_TLS_INSECURE || '').toLowerCase()),
        };

        const isHttps = opts.endpoint.startsWith('https://');
        const handler = isHttps && opts.tlsInsecure
            ? new NodeHttpHandler({
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            })
            : undefined;

        this.client = new S3Client({
            region: opts.region,
            endpoint: opts.endpoint,
            forcePathStyle: opts.forcePathStyle,
            credentials: {
                accessKeyId: opts.accessKeyId,
                secretAccessKey: opts.secretAccessKey,
            },
            ...(handler ? { requestHandler: handler } : {}),
        });

        this.bucketDefault = opts.bucketDefault;
        this.ensureBucketIsPublic();
    }

    private async ensureBucketIsPublic() {
        try {
            const policy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: '*',
                        Action: ['s3:GetObject'],
                        Resource: [`arn:aws:s3:::${this.bucketDefault}/*`],
                    },
                ],
            };

            await this.client.send(new PutBucketPolicyCommand({
                Bucket: this.bucketDefault,
                Policy: JSON.stringify(policy),
            }));
        } catch (error) {
            console.error(`Failed to set public policy for bucket ${this.bucketDefault}:`, error.message);
        }
    }

    // Log bucket details for debugging
    private async ensureBucketDetails() {
        // console.log(`MinioService initialized. Bucket: ${this.bucketDefault}, Endpoint: ${process.env.S3_ENDPOINT}`);
    }

    getDefaultBucket() {
        return this.bucketDefault;
    }

    async putObject(
        key: string,
        body: Buffer | Uint8Array | Blob | string,
        contentType = 'application/octet-stream',
        bucket = this.bucketDefault,
    ): Promise<void> {
        await this.client.send(
            new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: body as any,
                ContentType: contentType,
            }),
        );
    }

    async headObject(key: string, bucket = this.bucketDefault): Promise<void> {
        await this.client.send(
            new HeadObjectCommand({
                Bucket: bucket,
                Key: key,
            }),
        );
    }

    async getPresignedGetUrl(
        key: string,
        expiresSeconds = 3600,
        bucket = this.bucketDefault,
    ): Promise<string | null> {
        try {
            await this.headObject(key, bucket);
        } catch (e) {
            // Objeto não existe
            return null;
        }

        const cmd = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        });

        return await getSignedUrl(this.client, cmd, { expiresIn: expiresSeconds });
    }

    async uploadFile(file: Express.Multer.File | { buffer: Buffer, originalname: string, mimetype: string }, prefix: string = ''): Promise<any> {
        const timestamp = Date.now();
        // Sanitize filename
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `${prefix}${timestamp}_${safeName}`;

        await this.putObject(key, file.buffer, file.mimetype);

        // Return the URL directly if public or presigned?
        // User asked "documentos... armazenamos... nesse dominio". 
        // Construct public URL manually or use presigned?
        // The endpoint is http://s3-painel.acacessorios.local/. which maps to the bucket if dns is set?
        // Or http://s3-painel.../feed/key ?
        // Minio with path style: http://host/bucket/key.

        // Returning the key and a constructed URL.
        // If endpoint ends with slash, remove it for joining.
        const endpoint = (process.env.S3_ENDPOINT || '').replace(/\/$/, '');
        const url = `${endpoint}/${this.bucketDefault}/${key}`;

        return {
            key: key,
            url: url,
            bucket: this.bucketDefault,
        };
    }

    async deleteFile(key: string, bucket = this.bucketDefault): Promise<any> {
        return await this.client.send(
            new DeleteObjectCommand({
                Bucket: bucket,
                Key: key,
            }),
        );
    }
}
