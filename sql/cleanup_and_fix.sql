-- LIMPIEZA Y CORRECCIÓN COMPLETA
-- Ejecuta esto en Supabase SQL Editor

-- PASO 1: Ver cuántos duplicados de jeudym777@gmail.com hay
SELECT email, count(*) as veces_registrado
FROM auth.users
WHERE email = 'jeudym777@gmail.com'
GROUP BY email;

-- PASO 2: Eliminar usuarios duplicados de jeudym777@gmail.com (dejar solo el más reciente)
DELETE FROM auth.users
WHERE email = 'jeudym777@gmail.com'
AND id NOT IN (
  SELECT id FROM auth.users
  WHERE email = 'jeudym777@gmail.com'
  ORDER BY created_at DESC
  LIMIT 1
);

-- PASO 3: Crear perfiles faltantes para usuarios sin perfil
INSERT INTO public.clients (
  user_id,
  nombre,
  apellidos,
  email,
  telefono,
  tipo_identificacion,
  numero_identificacion,
  recibir_promociones,
  puntos_acumulados,
  nivel_fidelidad,
  qr_code,
  fecha_ultimo_punto
)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'nombre', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'apellidos', ''),
  u.email,
  u.raw_user_meta_data->>'telefono',
  COALESCE(u.raw_user_meta_data->>'tipo_identificacion', 'cedula'),
  COALESCE(u.raw_user_meta_data->>'numero_identificacion', 'N/A'),
  COALESCE((u.raw_user_meta_data->>'recibir_promociones')::boolean, false),
  100,
  'bronce',
  'CLIENT_' || u.id || '_' || extract(epoch from now())::bigint,
  now()
FROM auth.users u
LEFT JOIN public.clients c ON c.user_id = u.id
WHERE c.id IS NULL
ON CONFLICT (email) DO NOTHING;

-- PASO 4: LIMPIAR todas las políticas RLS duplicadas en clients
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own data" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated users to read their own data" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated users to update their own data" ON public.clients;
DROP POLICY IF EXISTS "Users can create their own client profile" ON public.clients;
DROP POLICY IF EXISTS "Users can create their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can see their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own client profile" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can view their own client profile" ON public.clients;
DROP POLICY IF EXISTS "clients_policy" ON public.clients;

-- PASO 5: Crear SOLO las 3 políticas necesarias (limpias)
CREATE POLICY "clients_select_own"
ON public.clients FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "clients_insert_own"
ON public.clients FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "clients_update_own"
ON public.clients FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- PASO 6: Verificar que todo quedó limpio
SELECT 'Usuarios únicos' as verificacion, count(*) as total
FROM auth.users;

SELECT 'Usuarios con perfil en clients' as verificacion, count(*) as total
FROM public.clients;

SELECT 'Usuarios SIN perfil' as verificacion, count(*) as total
FROM auth.users u
LEFT JOIN public.clients c ON c.user_id = u.id
WHERE c.id IS NULL;

-- PASO 7: Ver usuarios y sus perfiles
SELECT 
  u.email,
  u.created_at as user_created,
  c.nombre,
  c.apellidos,
  c.puntos_acumulados,
  c.nivel_fidelidad,
  c.created_at as profile_created
FROM auth.users u
LEFT JOIN public.clients c ON c.user_id = u.id
ORDER BY u.created_at DESC;

-- PASO 8: Ver solo las políticas actuales (deben ser 3)
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'clients'
ORDER BY policyname;
