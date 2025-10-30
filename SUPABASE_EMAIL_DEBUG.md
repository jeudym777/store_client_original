# 🔍 Guía: Resolver Problemas de Email y Registro en Supabase

## Problema Actual
- ✅ El registro muestra "exitoso" en la UI
- ❌ NO llega correo de confirmación
- ❌ NO aparece el cliente en la tabla `public.clients`
- ❌ NO aparece el usuario en `auth.users`

## Solución Rápida (Para Desarrollo)

### Opción 1: **DESACTIVAR confirmación de email (RECOMENDADO para dev)**

1. Ve a Supabase Dashboard → **Authentication** → **Providers** → **Email**
2. Desactiva: **"Confirm email"** (toggle OFF)
3. Guarda los cambios
4. Prueba registrar un nuevo usuario

**Resultado**: El usuario se creará inmediatamente, obtendrá sesión activa, el trigger insertará en `clients` y funcionará todo sin depender de correos.

---

### Opción 2: Arreglar el envío de emails (Para producción)

#### A. Verificar configuración de Email en Supabase

1. **Authentication** → **Providers** → **Email**:
   - ✅ Confirm email: ON
   - ✅ Secure email change: ON (opcional)
   
2. **Authentication** → **Email Templates**:
   - Verifica que exista la plantilla "Confirm signup"
   - El link debe apuntar a: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup`

3. **Authentication** → **URL Configuration**:
   - **Site URL**: `http://localhost:5175` (o tu puerto actual)
   - **Redirect URLs**: Agrega `http://localhost:5175/**` y `http://localhost:5175/auth/confirm`

4. **Project Settings** → **API**:
   - Confirma que tienes Rate Limits adecuados (no bloqueados)

#### B. SMTP (Opcional - para emails reales en producción)

Si usas el proveedor por defecto de Supabase:
- Los emails pueden ir a spam
- Revisa **carpeta de SPAM** y **Promociones** en Gmail

Para usar tu propio SMTP:
1. **Project Settings** → **Auth** → **SMTP Settings**
2. Configura tu servidor SMTP (Gmail, SendGrid, AWS SES, etc.)

---

## Verificar que el Trigger Funciona

### 1. Ejecuta esto en SQL Editor para verificar el trigger:

```sql
-- ¿Existe la función?
SELECT 
  p.proname AS function_name,
  n.nspname AS schema,
  p.prosecdef AS is_security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname = 'create_client_on_signup' AND n.nspname = 'public';

-- ¿Existe el trigger?
SELECT 
  t.tgname AS trigger_name,
  t.tgenabled AS enabled,
  c.relname AS table_name,
  n.nspname AS schema
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'users' AND n.nspname = 'auth' AND t.tgname = 'create_client_on_signup';
```

**Resultado esperado**:
- Function: `create_client_on_signup`, `is_security_definer = true`
- Trigger: `create_client_on_signup`, `enabled = O` (O = enabled)

### 2. Si NO aparecen, ejecuta de nuevo:

```sql
-- Copia y pega el contenido completo de: sql/clients_auto_profile.sql
```

---

## Verificar usuarios registrados

```sql
-- Ver últimos usuarios en auth
SELECT id, email, created_at, confirmed_at, email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Ver últimos clientes creados
SELECT id, user_id, nombre, apellidos, email, created_at
FROM public.clients
ORDER BY created_at DESC
LIMIT 10;
```

---

## Logs de Auth (Para debug de emails)

1. Supabase Dashboard → **Authentication** → **Logs**
2. Filtrar por:
   - Event: `user.signup`
   - Level: All
3. Busca errores relacionados con email delivery

---

## Solución si el usuario YA existe

Si intentaste registrar con un email que ya usaste antes:

```sql
-- Ver usuarios existentes con ese email
SELECT id, email, confirmed_at, email_confirmed_at
FROM auth.users
WHERE email = 'tu@email.com';

-- OPCIÓN A: Eliminar usuario anterior (cuidado en producción)
DELETE FROM auth.users WHERE email = 'tu@email.com';

-- OPCIÓN B: Confirmar manualmente el usuario existente
UPDATE auth.users 
SET email_confirmed_at = now(), confirmed_at = now()
WHERE email = 'tu@email.com';

-- Luego crear el perfil manualmente si no existe
INSERT INTO public.clients (
  user_id, nombre, apellidos, email, numero_identificacion,
  puntos_acumulados, nivel_fidelidad, qr_code, fecha_ultimo_punto
)
SELECT 
  id, 'Nombre', 'Apellido', email, 'N/A',
  100, 'bronce', 'CLIENT_' || id || '_' || extract(epoch from now())::bigint, now()
FROM auth.users
WHERE email = 'tu@email.com'
ON CONFLICT (email) DO NOTHING;
```

---

## Checklist de Prueba

- [ ] Desactivé "Confirm email" en Supabase Auth
- [ ] Ejecuté el SQL del trigger (`sql/clients_auto_profile.sql`)
- [ ] Verifiqué que function y trigger existen
- [ ] Site URL configurado en Supabase: `http://localhost:5175`
- [ ] Eliminé usuarios de prueba anteriores
- [ ] Intenté registrar con un **email nuevo**
- [ ] Revisé en `auth.users` que se creó el usuario
- [ ] Revisé en `public.clients` que se creó el perfil
- [ ] Vi "¡Registro exitoso! Bienvenido a YeooLabs Store" (sin aviso de correo)

---

## Resumen del Flujo Correcto

### Con email confirmation DESACTIVADO (desarrollo):
1. Usuario llena formulario → signUp
2. Supabase crea usuario en `auth.users`
3. Trigger ejecuta → inserta en `public.clients` con 100 puntos
4. Usuario tiene sesión activa → UI muestra éxito
5. Usuario ya puede usar la app

### Con email confirmation ACTIVADO (producción):
1. Usuario llena formulario → signUp
2. Supabase crea usuario en `auth.users` (confirmed_at = NULL)
3. Supabase **envía email** con link de confirmación
4. Trigger ejecuta → inserta en `public.clients` con 100 puntos
5. UI muestra: "Revisa tu correo para confirmar"
6. Usuario hace clic en link del correo
7. Supabase confirma → usuario puede hacer login
8. Login exitoso → obtiene su perfil de `clients`

---

## Contacto de Soporte

Si después de seguir todos los pasos aún no funciona:
- Supabase Discord: https://discord.supabase.com
- Docs: https://supabase.com/docs/guides/auth/auth-email
