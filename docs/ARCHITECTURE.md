# Arquitetura do Projeto: Feed Service

Este documento descreve a arquitetura técnica do microserviço `feed-service`.

## 1. Visão Geral
O `feed-service` é um backend desenvolvido em **NestJS** responsável por gerenciar:
- Feeds de notícias/atualizações.
- Eventos (Calendário).
- Upload de arquivos (Imagens/Anexos) via S3/MinIO.

## 2. Tecnologias Principais
- **Framework**: NestJS (Express adapter).
- **Banco de Dados**: PostgreSQL com **Prisma ORM**.
- **Object Storage**: AWS S3 SDK (compatível com MinIO).
- **Documentação**: Swagger (OpenAPI).

## 3. Estrutura do Projeto (`src/`)

### Módulos Principais
- **`app.module.ts`**: Módulo raiz.
- **`feed/`**: Gerenciamento de postagens do feed.
- **`events/`**: Gerenciamento de eventos de calendário.
- **`auth/`**: Autenticação (provavelmente JWT ou Guard).
- **`minio/`**: Integração com serviço de armazenamento S3.
- **`prisma/`**: Módulo global para conexão com banco.

### Camadas
1.  **Controllers** (`*.controller.ts`): Recebem requisições HTTP, validam DTOs e chamam Services.
2.  **Services** (`*.service.ts`): Contêm a lógica de negócio e acessam o banco via Prisma.
3.  **DTOs**: Objetos de Transferência de Dados com validação (`class-validator`).
4.  **Entities/Prisma**: Definição do modelo de dados.

## 4. Fluxo de Dados

1.  **Request**: Cliente envia JSON para endpoint REST.
2.  **Validation**: `ValidationPipe` valida o DTO.
3.  **Controller**: Repassa para o Service.
4.  **Service**: Executa lógica, transações, uploads e chama Prisma.
5.  **Database**: PostgreSQL persiste os dados.
6.  **Response**: Retorna JSON ou arquivo.

## 5. Integração com S3/MinIO
Uploads são gerenciados pelo `MinioModule` (ou similar).
- O serviço gera URLs pré-assinadas ou faz upload direto (dependendo da implementação).
- Buckets devem ser configurados via variáveis de ambiente.
