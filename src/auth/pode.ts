/**
 * Admin (setor) OU flag da ação em `sis_permissoes` para a tela.
 * Tela /feed: editar = postar; criar = criar eventos; deletar = excluir posts, comentários e eventos.
 */
export function pode(user: any, tela: string, acao: 'visualizar' | 'editar' | 'criar' | 'deletar'): boolean {
    if (user?.setor?.toLowerCase() === 'admin') return true;
    return !!user?.sis_permissoes?.some((p: any) => p.tela === tela && p[acao]);
}
