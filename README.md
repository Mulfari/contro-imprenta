# Control de Imprenta

Base inicial para una tienda de imprenta construida con Next.js 16, Supabase y despliegue pensado para Vercel.

## Que incluye

- Portada comercial para presentar el sistema.
- Login con nombre de usuario y contrasena.
- Dashboard protegido y modulo base para crear mas usuarios.
- Middleware para mantener la sesion activa en App Router.
- Archivos listos para publicar en GitHub y desplegar en Vercel.

## Requisitos

- Node.js 22 o superior.
- Una cuenta en Supabase.
- Una cuenta en GitHub.
- Una cuenta en Vercel.

## Configuracion local

1. Crea un proyecto en Supabase.
2. En Supabase, ve a `Project Settings > API` y copia:
   - `Project URL`
   - `service_role key`
3. Duplica `.env.example` como `.env.local`.
4. Completa las variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
APP_SESSION_SECRET=una-clave-larga-y-segura
```

5. Crea la tabla de usuarios ejecutando el SQL de [supabase/setup.sql](/C:/Users/joses/OneDrive/Documentos/control-imprenta/supabase/setup.sql) en el SQL Editor de Supabase.
6. Instala dependencias y levanta el proyecto:

```bash
npm install
npm run dev
```

## Publicar en GitHub

```bash
git init
git add .
git commit -m "feat: bootstrap control de imprenta"
git branch -M main
git remote add origin <tu-repo>
git push -u origin main
```

## Desplegar en Vercel

1. Importa el repositorio en Vercel.
2. Agrega las mismas variables de entorno del archivo `.env.local`.
3. Ejecuta el despliegue.

Tambien puedes usar la CLI:

```bash
vercel
vercel --prod
```

## Siguientes modulos sugeridos

- Gestion de pedidos.
- Tabla de clientes.
- Cotizaciones y estados de produccion.
- Reportes de ventas y entregas.
