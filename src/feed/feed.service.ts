import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class FeedService {
    constructor(
        private prisma: PrismaService,
        private minio: MinioService,
    ) { }

    async create(createPostDto: CreatePostDto, authorId: string, files: Express.Multer.File[] = []) {
        // 1. Upload files
        const mediaEntries: any[] = [];
        for (const file of files) {
            const upload = await this.minio.uploadFile(file, 'posts/');
            let type = 'documento';
            if (file.mimetype.startsWith('image/')) type = 'imagem';
            else if (file.mimetype.startsWith('video/')) type = 'video';

            mediaEntries.push({
                url: upload.url,
                bucket: upload.bucket,
                chave: upload.key,
                tipo: type,
            });
        }

        // 2. Create Post
        const post = await this.prisma.fed_posts.create({
            data: {
                conteudo: createPostDto.conteudo,
                tipo: createPostDto.tipo || 'texto',
                autor_id: authorId,
                midias: {
                    create: mediaEntries,
                },
            },
            include: {
                midias: true,
                autor: {
                    select: {
                        id: true,
                        nome: true,
                        setor: true,
                        avatar_url: true,
                    }
                }
            }
        });

        // Sign URLs
        if (post.midias) {
            for (const media of post.midias) {
                try {
                    const signedUrl = await this.minio.getPresignedGetUrl(media.chave, 3600, media.bucket);
                    if (signedUrl) {
                        media.url = signedUrl;
                    }
                } catch (e) {
                    console.error(`Error signing URL for media ${media.id}`, e);
                }
            }
        }

        return post;
    }

    async findAll(skip = 0, take = 10, userId?: string) {
        const posts = await this.prisma.fed_posts.findMany({
            skip,
            take,
            orderBy: { criado_em: 'desc' },
            include: {
                autor: {
                    select: {
                        id: true,
                        nome: true,
                        setor: true,
                        avatar_url: true,
                    }
                },
                midias: true,
                comentarios: {
                    include: {
                        autor: { select: { id: true, nome: true, avatar_url: true } }
                    },
                    take: 5
                },
                likes: userId ? {
                    where: {
                        autor_id: userId
                    }
                } : false,
                _count: {
                    select: {
                        likes: true
                    }
                }
            }
        });

        // Pre-sign URLs for midias
        const result: any[] = [];
        for (const post of posts) {
            // Add ja_curtiu flag
            const ja_curtiu = userId ? (post as any).likes?.length > 0 : false;

            // Use real count from database relation
            const realLikeCount = (post as any)._count?.likes || 0;

            // Remove the likes array and _count from the object we return to keep it clean
            delete (post as any).likes;
            delete (post as any)._count;

            if (post.midias) {
                for (const media of post.midias) {
                    try {
                        const signedUrl = await this.minio.getPresignedGetUrl(media.chave, 3600, media.bucket);
                        if (signedUrl) {
                            media.url = signedUrl;
                        }
                    } catch (e) {
                        console.error(`Error signing URL for media ${media.id}`, e);
                    }
                }
            }
            result.push({ ...post, curtidas: realLikeCount, ja_curtiu });
        }

        return result;
    }

    async findOne(id: string) {
        return this.prisma.fed_posts.findUnique({
            where: { id },
            include: {
                autor: {
                    select: {
                        id: true,
                        nome: true,
                        setor: true,
                        avatar_url: true,
                    }
                },
                midias: true,
            }
        });
    }

    async remove(id: string) {
        // 1. Get post with midia to delete files
        const post = await this.prisma.fed_posts.findUnique({
            where: { id },
            include: { midias: true }
        });

        if (post) {
            // 2. Delete files from MinIO
            for (const media of post.midias) {
                try {
                    await this.minio.deleteFile(media.chave, media.bucket);
                } catch (e) {
                    console.error(`Error deleting file ${media.chave} from MinIO`, e);
                }
            }
        }

        // 3. Delete from DB (onDelete: Cascade handle comments and midia records)
        return this.prisma.fed_posts.delete({
            where: { id }
        });
    }
    async toggleLike(postId: string, userId: string) {
        const existingLike = await this.prisma.fed_curtidas.findUnique({
            where: {
                autor_id_post_id: {
                    autor_id: userId,
                    post_id: postId
                }
            }
        });

        if (existingLike) {
            await this.prisma.$transaction([
                this.prisma.fed_curtidas.delete({
                    where: { id: existingLike.id }
                }),
                this.prisma.fed_posts.update({
                    where: { id: postId },
                    data: { curtidas: { decrement: 1 } }
                })
            ]);
            return { liked: false };
        } else {
            await this.prisma.$transaction([
                this.prisma.fed_curtidas.create({
                    data: {
                        autor_id: userId,
                        post_id: postId
                    }
                }),
                this.prisma.fed_posts.update({
                    where: { id: postId },
                    data: { curtidas: { increment: 1 } }
                })
            ]);
            return { liked: true };
        }
    }

    async addComment(postId: string, userId: string, conteudo: string) {
        return this.prisma.fed_comentarios.create({
            data: {
                conteudo,
                autor_id: userId,
                post_id: postId
            },
            include: {
                autor: {
                    select: {
                        id: true,
                        nome: true,
                        avatar_url: true
                    }
                }
            }
        });
    }

    async getComments(postId: string) {
        return this.prisma.fed_comentarios.findMany({
            where: { post_id: postId },
            orderBy: { criado_em: 'asc' },
            include: {
                autor: {
                    select: {
                        id: true,
                        nome: true,
                        avatar_url: true
                    }
                }
            }
        });
    }

    async removeComment(commentId: string, userId: string, isAdmin: boolean) {
        const comment = await this.prisma.fed_comentarios.findUnique({
            where: { id: commentId }
        });

        if (!comment) throw new Error('Comentário não encontrado');

        if (comment.autor_id !== userId && !isAdmin) {
            throw new Error('Sem permissão para excluir este comentário');
        }

        return this.prisma.fed_comentarios.delete({
            where: { id: commentId }
        });
    }
}
