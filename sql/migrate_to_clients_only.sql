-- MIGRACIÓN: Consolidar todo en tabla 'clients' y eliminar 'customer_profiles'
-- ⚠️ IMPORTANTE: Ejecuta esto SOLO después de verificar el diagnóstico

-- PASO 1: Migrar datos de customer_profiles a clients (si existen)
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
  cp.user_id,
  cp.first_name,
  cp.last_name,
  u.email,
  cp.phone,
  COALESCE(cp.id_document_type::text, 'cedula'),
  COALESCE(cp.id_document_number, 'N/A'),
  COALESCE(cp.marketing_emails, false),
  100, -- puntos iniciales
  'bronce',
  'CLIENT_' || cp.user_id || '_' || extract(epoch from now())::bigint,
  now()
FROM public.customer_profiles cp
JOIN auth.users u ON u.id = cp.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.clients c WHERE c.user_id = cp.user_id
)
ON CONFLICT (email) DO NOTHING;

-- PASO 2: Verificar migración
SELECT 'Antes de eliminar' as estado,
  (SELECT count(*) FROM public.customer_profiles) as customer_profiles_count,
  (SELECT count(*) FROM public.clients) as clients_count;

-- PASO 3: Eliminar constraint de customer_points que apunta a customer_profiles
ALTER TABLE public.customer_points 
DROP CONSTRAINT IF EXISTS customer_points_customer_id_fkey;

-- PASO 4: Agregar nueva columna en customer_points que apunte a clients
-- (o mejor aún, migrar customer_points a loyalty_transactions que ya existe)

-- PASO 5: Eliminar tabla customer_profiles y su vista
DROP VIEW IF EXISTS public.customer_points_summary;
DROP TABLE IF EXISTS public.customer_points CASCADE;
DROP TABLE IF EXISTS public.customer_profiles CASCADE;

-- PASO 6: Verificar que loyalty_transactions existe y funciona
SELECT count(*) as loyalty_transactions_count 
FROM public.loyalty_transactions;

-- PASO 7: Asegurar RLS en clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own client profile" ON public.clients;
DROP POLICY IF EXISTS "Users can create their own client profile" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own client profile" ON public.clients;

CREATE POLICY "Users can view their own client profile"
ON public.clients FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own client profile"
ON public.clients FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own client profile"
ON public.clients FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- PASO 8: Asegurar RLS en loyalty_transactions
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.loyalty_transactions;
DROP POLICY IF EXISTS "System can create transactions" ON public.loyalty_transactions;

CREATE POLICY "Users can view their own transactions"
ON public.loyalty_transactions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = loyalty_transactions.client_id 
    AND clients.user_id = auth.uid()
  )
);

CREATE POLICY "System can create transactions"
ON public.loyalty_transactions FOR INSERT
TO authenticated
WITH CHECK (true);

-- VERIFICACIÓN FINAL
SELECT 'Después de migración' as estado,
  (SELECT count(*) FROM public.clients) as clients_count,
  (SELECT count(*) FROM public.loyalty_transactions) as transactions_count;

SELECT id, user_id, nombre, apellidos, email, puntos_acumulados, nivel_fidelidad
FROM public.clients
ORDER BY created_at DESC
LIMIT 5;
