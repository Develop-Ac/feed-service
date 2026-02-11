# Convenções de Código: Padrões e Nomeação (Backend)

Este documento estabelece as diretrizes para o `feed-service` (NestJS).

> [!IMPORTANT]
> **Regra Geral de Idioma**: Toda a nomeação de variáveis, funções, arquivos e pastas deve ser em **Português**, exceto termos técnicos universais ou obrigatórios do framework (ex: `main.ts`, `app.module.ts`, métodos do ciclo de vida como `onModuleInit`).

## 1. Nomeação (Naming)

### Arquivos
Siga o padrão do NestJS (`kebab-case` com sufixo do tipo).
- **Controllers**: `nome-do-recurso.controller.ts` (ex: `usuarios.controller.ts`).
- **Services**: `nome-do-recurso.service.ts` (ex: `notificacoes.service.ts`).
- **Modules**: `nome-do-recurso.module.ts`.
- **DTOs**: `criar-usuario.dto.ts`.
- **Entities**: `usuario.entity.ts` (ou schema do Prisma).

### Classes
- **Controllers**: `UsuariosController`.
- **Services**: `NotificacoesService`.
- **DTOs**: `CriarUsuarioDto`.

### Métodos e Variáveis
- **Métodos**: `camelCase` (verbo + substantivo).
    - `buscarTodos()`, `criar()`, `atualizarHome()`.
- **Variáveis**: `camelCase`.
- **Booleanos**: Prefixos `eh`, `tem`, `pode` ou `ativo` (ex: `ativo`, `podeEditar`).

## 2. Estrutura de Módulos
Cada recurso deve ter sua própria pasta contendo:
- `recurso.module.ts`
- `recurso.controller.ts`
- `recurso.service.ts`
- `/dto` (pasta com DTOs)
- `/entities` (se necessário além do Prisma)

## 3. Padrão de API (DTOs e Validation)
- Use `class-validator` para todas as entradas.
- Use `class-transformer` para transformar dados se necessário.
- **Swagger**: Todo DTO e Controller deve ter decorators `@ApiProperty` e `@ApiOperation` em Português.

## 4. Banco de Dados (Prisma)
- **Schema**: Nomes de tabelas e colunas no banco podem seguir o padrão do banco (snake_case), mas o mapeamento no Prisma Client deve ser camelCase para o JS/TS.
- **Repository**: O Service acessa o `PrismaService` diretamente ou via padrão Repository se a complexidade exigir.

## 5. Comentários
- Use JSDoc para explicar regras de negócio complexas nos Services.
- Em Português.
