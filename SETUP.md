# Configuración de la Aplicación YeooLabsStore

## 🚀 Pasos para configurar el proyecto

### 1. Configurar Variables de Entorno

Crea o edita el archivo `.env` en la raíz del proyecto con tus credenciales de Supabase:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# PayPal Configuration (opcional)
VITE_PAYPAL_CLIENT_ID=tu_paypal_client_id_aqui
```

### 2. Obtener las credenciales de Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 3. Configurar la Base de Datos

Ejecuta el SQL que está en `sample-db.sql` en tu proyecto de Supabase:

1. Ve a **SQL Editor** en tu dashboard de Supabase
2. Copia y ejecuta todo el contenido de `sample-db.sql`
3. Esto creará las tablas:
   - `tasks` - Para las tareas de los usuarios
   - `products` - Para los productos del store
   - `product_images` - Para las imágenes de los productos

### 4. Configurar Storage (para imágenes)

En Supabase, ve a **Storage** y crea un bucket llamado `images`:

1. Ve a **Storage** → **Buckets**
2. Crear nuevo bucket con nombre `images`
3. Configurar como público para que las imágenes sean accesibles

### 5. Instalar dependencias y ejecutar

```bash
npm install
npm run dev
```

## 📊 Estructura de la Base de Datos

### Tabla `products`
- `id` (SERIAL PRIMARY KEY)
- `created_at` (TIMESTAMP)
- `description` (TEXT)
- `price_month` (NUMERIC)
- `user_id` (UUID) - referencia a auth.users
- `name_product` (TEXT)
- `category` (TEXT)
- `discount` (INTEGER)
- `stock` (INTEGER)
- `content_url` (TEXT)

### Tabla `product_images`
- `id` (SERIAL PRIMARY KEY)
- `created_at` (TIMESTAMP)
- `product_id` (INTEGER) - referencia a products
- `image_url` (TEXT)
- `position` (INTEGER)

### Tabla `tasks`
- `id` (UUID PRIMARY KEY)
- `created_at` (TIMESTAMP)
- `text` (TEXT)
- `user_id` (UUID) - referencia a auth.users

## 🔧 Cambios Realizados

✅ **Corregido**: Variables de entorno de Supabase
✅ **Corregido**: Importaciones de módulos 
✅ **Corregido**: Referencias de campos de base de datos (`price` → `price_month`)
✅ **Actualizado**: Esquema de base de datos completo
✅ **Añadido**: Políticas RLS para seguridad
✅ **Mejorado**: Manejo de errores en supabaseClient

## ⚠️ Notas Importantes

1. **Nunca subas el archivo `.env` a git** - Ya está incluido en `.gitignore`
2. **Actualiza las credenciales** en `.env` con las de tu proyecto real
3. **Ejecuta el SQL** completo en Supabase para crear todas las tablas
4. **Configura el storage** para las imágenes de productos

## 🆘 Si tienes errores

1. Verifica que las variables de entorno estén correctas
2. Asegúrate de que las tablas existan en Supabase
3. Revisa que el bucket `images` esté configurado como público
4. Reinicia el servidor de desarrollo después de cambiar `.env`