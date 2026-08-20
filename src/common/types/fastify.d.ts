import 'fastify';

declare module 'fastify' {
    /**
     * Usuário autenticado anexado à requisição pelo `AuthGuard`
     * (`src/auth/auth.guard.ts`), a partir do header `x-user-id`.
     *
     * A forma reflete o retorno de `AuthService.validateUser`: o registro de
     * `sis_usuarios` com `sis_permissoes` incluídas. A assinatura de índice
     * preserva o acesso permissivo que os controllers já faziam quando
     * `@Req() req` era implicitamente `any`.
     */
    interface UsuarioAutenticado {
        id: string;
        setor: string | null;
        sis_permissoes: Array<{
            tela: string | null;
            editar: boolean | null;
            deletar: boolean | null;
            [chave: string]: unknown;
        }>;
        [chave: string]: unknown;
    }

    interface FastifyRequest {
        /**
         * Sempre preenchido nas rotas protegidas por `AuthGuard`, que roda
         * antes dos handlers e aborta a requisição quando não há usuário
         * válido. Por isso é declarado como obrigatório: é o que os
         * controllers já assumiam antes da migração.
         */
        user: UsuarioAutenticado;
    }
}
