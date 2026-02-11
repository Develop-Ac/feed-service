<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Feed Service - AC Acessórios

Serviço de backend desenvolvido com **NestJS** para gerenciar as funcionalidades sociais e o feed de notícias da aplicação **AC Acessórios**.

## 📋 Descrição

Este projeto é responsável por fornecer a API para:
- **Feed de Notícias**: Publicação e listagem de posts.
- **Calendário de Eventos**: Gestão de feriados e eventos corporativos.
- **Usuários**: Integração e dados de perfil.
- **Uploads**: Armazenamento de mídia via MinIO/S3.

## 🚀 Tecnologias

- [NestJS](https://nestjs.com/) - Framework Node.js
- [Prisma](https://www.prisma.io/) - ORM
- [PostgreSQL](https://www.postgresql.org/) - Banco de Dados (Via Prisma)
- [MinIO](https://min.io/) - Object Storage compatível com S3

## 🛠️ Instalação

```bash
$ npm install
```

## ▶️ Executando a aplicação

```bash
# desenvolvimento
$ npm run start

# modo watch (dev)
$ npm run start:dev

# produção
$ npm run start:prod
```

## 🧪 Testes

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## 📝 Licença

Este projeto é privado e proprietário da **AC Acessórios**.
Todos os direitos reservados.
