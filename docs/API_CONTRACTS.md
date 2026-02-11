# Contratos de API (API Contracts)

Este documento serve como referência para os contratos de API do `feed-service`.

> [!TIP]
> A documentação viva e interativa está disponível via **Swagger** em `/api` quando o serviço está rodando (`SWAGGER_ENABLED=true`).

## 1. Padrões de Resposta

### Sucesso (200 OK / 201 Created)
Geralmente retorna o objeto criado ou a lista solicitada.
```json
{
  "id": 1,
  "titulo": "Novo Evento",
  "data": "2023-10-27T10:00:00Z"
}
```

### Erro (4xx / 5xx)
Segue o padrão de exceções do NestJS (`HttpException`).
```json
{
  "statusCode": 400,
  "message": ["titulo must be a string"],
  "error": "Bad Request"
}
```

## 2. Recursos Principais

### Feed (`/feed`)
- `GET /feed`: Listar postagens (com paginação).
- `POST /feed`: Criar nova postagem.
- `PUT /feed/:id`: Editar postagem.
- `DELETE /feed/:id`: Remover postagem.

### Eventos (`/events`)
- `GET /events`: Listar eventos (filtro por data).
- `POST /events`: Criar evento.

### Uploads (`/upload` ou via recursos)
- Endpoints para envio de imagens/anexos.
