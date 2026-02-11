# Ambiente de Desenvolvimento (Environment Setup)

Este documento detalha como configurar o ambiente de desenvolvimento para o `feed-service`.

## 1. Checklist de Setup

- **Node.js**: Versão **20** ou superior recomendada.
- **Banco de Dados**: PostgreSQL (acessível via `DATABASE_URL`).
- **MinIO/S3**: Para armazenamento de arquivos (Feed/Eventos).

### Passo a Passo
1.  Clone o repositório.
2.  Copie o `.env.example` para `.env`.
3.  Instale as dependências:
    ```bash
    npm install
    ```
4.  Gere o cliente do Prisma:
    ```bash
    npx prisma generate
    ```
5.  Rode as migrações (se necessário):
    ```bash
    npx prisma migrate dev
    ```
6.  Inicie o servidor:
    ```bash
    npm run start:dev
    ```

## 2. Variáveis de Ambiente

Crie um arquivo `.env` na raiz.

| Variável | Descrição | Exemplo (Local) |
|---|---|---|
| `PORT` | Porta do serviço | `8001` |
| `DATABASE_URL` | String de conexão PostgreSQL | `postgresql://user:pass@localhost:5432/feed_db?schema=public` |
| `SWAGGER_ENABLED` | Habilita documentação `/api` | `true` |
| `AWS_ACCESS_KEY_ID` | Chave de acesso S3/MinIO | `minioadmin` |
| `AWS_SECRET_ACCESS_KEY` | Segredo S3/MinIO | `minioadmin` |
| `AWS_REGION` | Região AWS (usar `us-east-1` p/ MinIO) | `us-east-1` |
| `AWS_S3_BUCKET_NAME` | Nome do Bucket | `feed-bucket` |
| `AWS_S3_ENDPOINT` | Endpoint (se usar MinIO local) | `http://localhost:9000` |

## 3. Scripts Principais

| Comando | Descrição |
|---|---|
| `npm run start:dev` | Inicia em modo watch. |
| `npm run build` | Compila para `dist/`. |
| `npm run start:prod` | Executa a versão compilada. |
| `npm test` | Roda testes unitários. |
| `npm run test:e2e` | Roda testes end-to-end. |
