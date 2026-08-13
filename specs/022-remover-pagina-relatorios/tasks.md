# Tasks: Remover página de Relatórios

**Feature**: [spec.md](./spec.md)

Fluxo Speckit reduzido (pedido do usuário): spec + implementação direta.

- [x] T001 Remover item Relatórios do menu e da busca em `frontend/src/components/Layout.tsx`
- [x] T002 Remover rota da página; redirecionar `/relatorios` para `/dashboard` em `frontend/src/App.tsx`
- [x] T003 Remover permissão Relatórios em `frontend/src/pages/Configuracoes.tsx`
- [x] T004 Remover ícone e mapeamento em `frontend/src/components/navIcons.tsx`
- [x] T005 Excluir `frontend/src/pages/Relatorios.tsx`
- [x] T006 Manter agregações usadas pela Dashboard (`relatoriosService` e API `/api/relatorios`)
