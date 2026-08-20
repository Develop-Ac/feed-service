import {
    BadRequestException,
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    PayloadTooLargeException,
    Type,
    mixin,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import type { FastifyRequest } from 'fastify';
import type { ArquivoEnviado } from './arquivo-enviado.interface';

/**
 * Limites aceitos no upload, equivalentes aos `limits` do Multer usados
 * anteriormente com `FileInterceptor`/`FilesInterceptor` do Express.
 */
export interface OpcoesUpload {
    limits?: {
        fileSize?: number;
        files?: number;
        fields?: number;
        parts?: number;
    };
}

/**
 * Slots gravados na requisição pelos interceptors.
 *
 * O `@fastify/multipart` já declara `request.file` e `request.files` como
 * *métodos* (API de stream do plugin), enquanto os decorators `@UploadedFile()`
 * e `@UploadedFiles()` do Nest leem `request.file` e `request.files` como
 * *valores*. Os decorators do Fastify vivem no protótipo, então atribuir na
 * instância apenas os sombreia — seguro em tempo de execução, mas exige este
 * cast para conviver com as tipagens do plugin.
 */
interface RequisicaoComArquivos {
    file?: ArquivoEnviado;
    files?: ArquivoEnviado[];
    body?: unknown;
}

/** Códigos de erro emitidos pelo `@fastify/multipart` ao estourar limites. */
const CODIGO_ARQUIVO_MUITO_GRANDE = 'FST_REQ_FILE_TOO_LARGE';

/**
 * Converte os erros do `@fastify/multipart` para as mesmas exceções HTTP que o
 * `FileInterceptor` do Express produzia a partir dos erros do Multer:
 * limite de tamanho de arquivo vira 413 e os demais limites viram 400.
 */
function traduzirErroMultipart(erro: unknown): never {
    const codigo = (erro as { code?: string })?.code;

    if (codigo === CODIGO_ARQUIVO_MUITO_GRANDE) {
        throw new PayloadTooLargeException('Arquivo excede o tamanho máximo permitido.');
    }

    if (typeof codigo === 'string' && codigo.startsWith('FST_')) {
        throw new BadRequestException((erro as Error).message);
    }

    throw erro;
}

/** Descarta um stream de arquivo que não interessa, liberando o iterador. */
function descartarStream(stream: NodeJS.ReadableStream): Promise<void> {
    return new Promise((resolve, reject) => {
        stream.on('end', () => resolve());
        stream.on('error', reject);
        stream.resume();
    });
}

/**
 * Percorre as partes de uma requisição `multipart/form-data`, carregando em
 * memória os arquivos do campo informado e devolvendo-os no formato
 * {@link ArquivoEnviado}.
 *
 * Os campos de texto do formulário são mesclados em `request.body`. Isso
 * reproduz o comportamento do Multer no Express, onde o `@Body()` (e portanto o
 * `ValidationPipe`) enxergava os campos textuais enviados junto dos arquivos.
 */
async function lerArquivosMultipart(
    requisicao: FastifyRequest,
    nomeCampo: string,
    opcoes: OpcoesUpload,
): Promise<ArquivoEnviado[]> {
    const arquivos: ArquivoEnviado[] = [];
    const campos: Record<string, unknown> = {};

    try {
        for await (const parte of requisicao.parts(opcoes)) {
            if (parte.type !== 'file') {
                campos[parte.fieldname] = parte.value;
                continue;
            }

            if (parte.fieldname !== nomeCampo) {
                await descartarStream(parte.file);
                continue;
            }

            const buffer = await parte.toBuffer();
            arquivos.push({
                fieldname: parte.fieldname,
                originalname: parte.filename,
                encoding: parte.encoding,
                mimetype: parte.mimetype,
                buffer,
                size: buffer.length,
            });
        }
    } catch (erro) {
        traduzirErroMultipart(erro);
    }

    (requisicao as unknown as RequisicaoComArquivos).body = {
        ...((requisicao.body as Record<string, unknown> | undefined) ?? {}),
        ...campos,
    };

    return arquivos;
}

/**
 * Equivalente ao `FileInterceptor` do `@nestjs/platform-express` para o adapter
 * Fastify. Popula `request.file`, consumido pelo decorator `@UploadedFile()`.
 */
export function FastifyFileInterceptor(
    nomeCampo: string,
    opcoes: OpcoesUpload = {},
): Type<NestInterceptor> {
    @Injectable()
    class InterceptorDeArquivo implements NestInterceptor {
        async intercept(contexto: ExecutionContext, proximo: CallHandler): Promise<Observable<unknown>> {
            const requisicao = contexto.switchToHttp().getRequest<FastifyRequest>();

            if (requisicao.isMultipart()) {
                const arquivos = await lerArquivosMultipart(requisicao, nomeCampo, opcoes);
                (requisicao as unknown as RequisicaoComArquivos).file = arquivos[0];
            }

            return proximo.handle();
        }
    }

    return mixin(InterceptorDeArquivo);
}

/**
 * Equivalente ao `FilesInterceptor` do `@nestjs/platform-express` para o adapter
 * Fastify. Popula `request.files`, consumido pelo decorator `@UploadedFiles()`.
 */
export function FastifyFilesInterceptor(
    nomeCampo: string,
    opcoes: OpcoesUpload = {},
): Type<NestInterceptor> {
    @Injectable()
    class InterceptorDeArquivos implements NestInterceptor {
        async intercept(contexto: ExecutionContext, proximo: CallHandler): Promise<Observable<unknown>> {
            const requisicao = contexto.switchToHttp().getRequest<FastifyRequest>();

            if (requisicao.isMultipart()) {
                (requisicao as unknown as RequisicaoComArquivos).files =
                    await lerArquivosMultipart(requisicao, nomeCampo, opcoes);
            }

            return proximo.handle();
        }
    }

    return mixin(InterceptorDeArquivos);
}
