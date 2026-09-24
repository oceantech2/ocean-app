-- =============================================================================
-- Ocean App — habilitar RLS no Supabase (schema public)
-- =============================================================================
-- Objetivo: fechar acesso via PostgREST (roles anon / authenticated).
-- O backend FastAPI conecta como dono das tabelas e CONTINUA funcionando
-- (owner ignora RLS; NÃO usamos FORCE ROW LEVEL SECURITY).
--
-- Como aplicar (recomendado):
--   Supabase → SQL Editor → New query → colar este arquivo → Run
--
-- Ou via psql (Session pooler):
--   psql "$DATABASE_URL" -f backend/scripts/enable_rls_supabase.sql
-- =============================================================================

BEGIN;

-- 1) RLS em todas as tabelas base do public (deny-by-default para não-owners)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT n.nspname AS schemaname, c.relname AS tablename
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'  -- tabelas regulares
      AND NOT c.relrowsecurity
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',
      r.schemaname,
      r.tablename
    );
    RAISE NOTICE 'RLS enabled: %.%', r.schemaname, r.tablename;
  END LOOP;
END $$;

-- 2) Revogar grants das roles da API pública do Supabase
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;

-- 3) Impedir grants automáticos em objetos futuros criados pelo role atual
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON ROUTINES FROM anon, authenticated;

COMMIT;

-- 4) Verificação (deve listar todas as tabelas com rls_enabled = true)
SELECT
  n.nspname AS schema,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ORDER BY c.relname;
