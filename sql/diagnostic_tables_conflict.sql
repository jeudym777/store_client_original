-- DIAGNÓSTICO: Verificar conflicto entre customer_profiles y clients

-- 1. Ver estructura y datos de customer_profiles
SELECT 
  'customer_profiles' as tabla,
  count(*) as total_registros
FROM public.customer_profiles;

SELECT id, user_id, first_name, last_name, created_at 
FROM public.customer_profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Ver estructura y datos de clients
SELECT 
  'clients' as tabla,
  count(*) as total_registros
FROM public.clients;

SELECT id, user_id, nombre, apellidos, email, puntos_acumulados, nivel_fidelidad, created_at
FROM public.clients 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Ver usuarios en auth sin perfil en ninguna tabla
SELECT u.id, u.email, u.created_at,
  CASE 
    WHEN c.user_id IS NOT NULL THEN 'clients'
    WHEN cp.user_id IS NOT NULL THEN 'customer_profiles'
    ELSE 'SIN PERFIL'
  END as tiene_perfil_en
FROM auth.users u
LEFT JOIN public.clients c ON c.user_id = u.id
LEFT JOIN public.customer_profiles cp ON cp.user_id = u.id
ORDER BY u.created_at DESC
LIMIT 10;

-- 4. Ver las foreign keys que causan conflicto
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND (tc.table_name = 'customer_points' OR tc.table_name = 'loyalty_transactions');

-- 5. Ver políticas RLS en ambas tablas
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('clients', 'customer_profiles')
ORDER BY tablename, policyname;
