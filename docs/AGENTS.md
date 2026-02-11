# Contexto do Projeto: Feed Service (Backend)

Este arquivo define os critérios operacionais e diretrizes para agentes de IA atuarem neste microserviço.

> [!IMPORTANT]
> **Atenção:** Para obter a visão técnica completa, consulte o arquivo **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

## 1. Critérios de Uso Obrigatórios (Regras de Ouro)

1.  **Planejamento e Aprovação (Mandatório)**:
    - Antes de qualquer alteração de código, **você deve criar um plano de implementação detalhado**.
    - **Aguarde a aprovação explícita do usuário** antes de executar.

2.  **Consulta à Arquitetura**:
    - Leia o `ARCHITECTURE.md` para seguir os padrões NestJS (Módulos, Controllers, Services, DTOs).
    - Respeite a camada de acesso a dados (Prisma) e serviços externos (AWS S3).

3.  **Análise Prévia**:
    - Nunca presuma o estado do arquivo. Leia o conteúdo atual antes de propor edições.

4.  **Segurança**:
    - **Nunca** inclua credenciais no código.
    - Use variáveis de ambiente (`.env`).
    - Valide todos os inputs nos DTOs usando `class-validator`.

5.  **Idioma e Documentação**:
    - **Sempre** responda e crie documentos em **Português**.

## 2. Padrões de Código Resumidos
*(Detalhes em `CONVENTIONS.md` e `ARCHITECTURE.md`)*

- **Framework**: NestJS (Modular).
- **Linguagem**: TypeScript (Strict).
- **Banco de Dados**: Prisma ORM.
- **Validação**: DTOs com `class-validator`.
- **Documentação API**: Decorators do Swagger (`@ApiProperty`, `@ApiOperation`) são obrigatórios em Controllers e DTOs.
- **Testes**: Manter testes unitários (`.spec.ts`) atualizados.

## 3. Comandos Operacionais

- **Instalar Dependências**: `npm install`
- **Rodar Desenvolvimento**: `npm run start:dev`
- **Build de Produção**: `npm run build`
- **Lint/Verificação**: `npm run lint`
- **Rodar Testes**: `npm test`
