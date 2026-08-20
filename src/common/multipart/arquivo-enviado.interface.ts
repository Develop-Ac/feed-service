/**
 * Representa um arquivo recebido em uma requisição `multipart/form-data`.
 *
 * Substitui o tipo global `Express.Multer.File` (fornecido por `@types/multer`),
 * que não existe no adapter Fastify. Os nomes das propriedades foram mantidos
 * idênticos aos do Multer para que os services que já consomem esses arquivos
 * (`MinioService.uploadFile`, `FeedService.create`, `UsersService.uploadAvatar`)
 * continuem funcionando sem qualquer alteração de lógica.
 */
export interface ArquivoEnviado {
    /** Nome do campo do formulário que transportou o arquivo. */
    fieldname: string;
    /** Nome original do arquivo enviado pelo cliente. */
    originalname: string;
    /** Codificação de transferência informada pelo cliente. */
    encoding: string;
    /** Content-Type informado pelo cliente. */
    mimetype: string;
    /** Conteúdo do arquivo carregado em memória. */
    buffer: Buffer;
    /** Tamanho do arquivo em bytes. */
    size: number;
}
