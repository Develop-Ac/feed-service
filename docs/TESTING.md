# Testes (Testing)

Diretrizes para testes no `feed-service`.

## 1. Tipos de Teste

### Testes Unitários (`*.spec.ts`)
- Focam em testar **Services** e lógica de negócio isolada.
- Devem mockar dependências (Prisma, S3) usando o sistema de injeção de dependência do NestJS.
- **Comando**: `npm test`

### Testes End-to-End (`test/*.e2e-spec.ts`)
- Testam a aplicação como um todo, disparando requisições HTTP reais (usando Supertest) contra uma instância de teste do NestJS.
- Geralmente utilizam um banco de dados de teste (Docker Container ou banco em memória se possível, mas Prisma recomenda DB real).
- **Comando**: `npm run test:e2e`

## 2. Escrevendo Testes

### Exemplo Unitário (Service)
```typescript
it('deve retornar posts do feed', async () => {
  jest.spyOn(prisma.post, 'findMany').mockResolvedValue([]);
  expect(await service.findAll()).toEqual([]);
});
```

### Exemplo E2E (Controller)
```typescript
it('/feed (GET)', () => {
  return request(app.getHttpServer())
    .get('/feed')
    .expect(200)
    .expect([]);
});
```
