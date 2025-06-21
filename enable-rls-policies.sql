-- HABILITAR RLS para parar emails chatos do Supabase
-- Execute no Supabase SQL Editor

-- 1. Habilitar RLS na tabela
ALTER TABLE qualified_leads_jun25 ENABLE ROW LEVEL SECURITY;

-- 2. REMOVER policy anterior se existir
DROP POLICY IF EXISTS "service_role_full_access" ON qualified_leads_jun25;

-- 3. Policy CORRETA para service_role
-- O service_role precisa de policy específica para bypass do RLS
CREATE POLICY "bypass_rls_for_service_role" 
ON qualified_leads_jun25 
AS PERMISSIVE
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 4. ALTERNATIVA: Permitir para qualquer role autenticado (mais permissivo)
-- Descomente se a policy acima não funcionar
/*
CREATE POLICY "allow_all_for_authenticated" 
ON qualified_leads_jun25 
FOR ALL 
TO authenticated, anon, service_role
USING (true) 
WITH CHECK (true);
*/

-- VERIFICAR SE FUNCIONOU
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as "RLS_Enabled",
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'qualified_leads_jun25') as "Policies_Count"
FROM pg_tables 
WHERE tablename = 'qualified_leads_jun25';

-- LISTAR POLICIES CRIADAS
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'qualified_leads_jun25';
