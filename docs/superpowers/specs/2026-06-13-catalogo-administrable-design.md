# Catálogo administrable + tienda conectada — Diseño

- **Fecha:** 2026-06-13
- **Proyecto:** Express Printer (expressprinter.com.ve)
- **Estado:** Aprobado el rumbo; pendiente revisión del spec antes de planificar.
- **Bloque:** 1 de la hoja de ruta "terminar la tienda del cliente".

## Contexto y problema

Hoy el catálogo de la tienda vive **quemado en código** (`src/app/storefront-data.ts`: 8 productos con
precio en string `"Desde $18"`). El admin no puede crear/editar productos ni precios, y —más grave— el
precio es cosmético: en el checkout se cobra `parsePrice(precio) × cantidad`, así que **elegir
"100 / 250 / 500 unidades" no cambia el precio**. Para una tienda donde la gente compra directo, eso es un
bug de modelo.

El sitio está **live pero sin uso real** (datos de prueba), así que podemos cambiar esquema y datos con
libertad. No se controla stock: la imprenta produce **bajo pedido**.

## Objetivo

Que productos, categorías, precios y fotos vivan en la base de datos y se gestionen desde el panel admin, y
que el storefront + checkout lean de ahí calculando el **precio real según las opciones elegidas**. El resto
del flujo de compra (subir arte → entrega → pago móvil/saldo → pipeline en el admin) se mantiene igual.

### En alcance
- Tablas `product_categories` y `products`; bucket público `product-images`.
- Pestaña "Productos" en el panel admin (crear/editar/ocultar/eliminar; subir foto; definir opciones y precios).
- Storefront y checkout leyendo de la BD, con precio calculado por opciones.
- Semilla con los 8 productos actuales para que la tienda no quede vacía.

### Fuera de alcance (YAGNI)
- Control de stock / existencias.
- Variantes/SKU por combinación.
- Pasarela de pago automática (Stripe sigue apagado).
- Rediseño visual del storefront o del checkout (solo se cambia la **fuente de datos** y el **precio**).

## Modelo de precios (decisión)

Flexible **por producto**, para no encerrarnos en un solo esquema:

- `pricing_mode = 'package'` (por defecto): un grupo de opciones es el **driver de precio** (ej. *Cantidad*:
  100u → \$18, 250u → \$30, 500u → \$45, con descuento por volumen). El valor elegido **fija** el precio del
  ítem. La "cantidad" del carrito = cuántos paquetes.
- `pricing_mode = 'unit'`: no hay grupo driver; el precio = `base_price` × (unidades del carrito).
- En ambos modos, los grupos marcados como **recargo** (ej. *Acabado*, *Material*) **suman** su monto al
  precio unitario.

**Cálculo (un solo helper compartido cliente+servidor, `src/lib/pricing.ts`):**

```
unitPrice =
  (modo 'package' ? valorDriverSeleccionado.amount : base_price)
  + Σ (valoresDeRecargoSeleccionados.amount)
lineTotal = unitPrice × cartQuantity
```

`cartQuantity` mantiene el stepper que ya existe (nº de paquetes en 'package', nº de unidades en 'unit').
La tarjeta del producto muestra "Desde {mínimo precio de paquete | base_price}".

## Esquema de datos (Supabase)

`product_categories`
- `id uuid pk default gen_random_uuid()`, `name text not null`, `slug text not null unique`,
  `sort_order int not null default 0`, `is_active boolean not null default true`,
  `created_at timestamptz not null default now()`.

`products`
- `id uuid pk`, `slug text not null unique`, `title text not null`, `description text`,
  `category_id uuid references product_categories(id) on delete set null`,
  `image_path text` (ruta en el bucket) · `image_alt text` · `tint text` (clases de degradado que ya se usan),
  `turnaround text` (tiempo de entrega), `highlights jsonb not null default '[]'` (string[]),
  `pricing_mode text not null default 'package' check (pricing_mode in ('package','unit'))`,
  `base_price numeric(12,2)`,
  `options jsonb not null default '[]'`
    — forma: `[{ "name": "Cantidad", "role": "package"|"surcharge", "values": [{ "label": "500u", "amount": 45 }] }]`,
  `is_active boolean not null default true`, `sort_order int not null default 0`,
  `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()`
    (+ trigger `updated_at`, como `customer_profiles`).

`storage.buckets`: `product-images` **público** (las `<img src>` del storefront salen directo), límite ~5 MB.

**RLS:** `product_categories` y `products` con RLS **ON sin policies** — se leen/escriben solo server-side con
service role (el storefront es server component que ya usa el admin client). Consistente con el resto del
proyecto. El bucket de imágenes es público para lectura; escritura solo vía route handler admin.

**Invariante de seguridad:** el precio que manda el cliente en el checkout **no se confía**; el servidor
**recalcula** `unitPrice`/`lineTotal` desde el producto en BD antes de crear la orden.

## Panel admin — pestaña "Productos"

- Nueva vista `"productos"` (admin-only) en `dashboardViews` / `sideNavItems` / `adminSideNavViews`.
- Server actions en `dashboard/page.tsx` (mismo patrón: re-valida `getCurrentSession()` + rol admin →
  `lib/catalog.ts` → `revalidatePath`): `createProductAction`, `updateProductAction`,
  `deleteProductAction`, `toggleProductActiveAction`, y CRUD mínimo de categorías.
- `lib/catalog.ts`: `listCategories`, `listProducts`, `getProductBySlug`, `createProduct`, `updateProduct`,
  `deleteProduct`, `setProductActive` (usan `createSupabaseAdminClient`).
- Cliente: `dashboard/products-panel.tsx` (lista + acciones) y `dashboard/product-modal.tsx` (formulario con
  editor de opciones: agregar grupos, marcar driver/recargo, valores con monto).
- Subida de foto: route handler `api/admin/products/image/upload/route.ts` (guardado por sesión admin,
  espejo de `api/order-files/upload`), sube al bucket `product-images` y devuelve la ruta.

## Storefront + checkout (cambios)

- `storefront-data.ts`: se conserva **solo el tipo** `StorefrontProduct` (extendido con `pricingMode`,
  `basePrice`, `options[].role/values[].amount`, `imagePath`). El **array** de datos sale; los datos vienen
  de la BD.
- Carga: la home (`storefront-shell`) y `checkout/page.tsx` son server components → cargan productos con
  `listProducts()` y los pasan al cliente. Se agrega `GET /api/storefront/products` como fuente para
  contextos solo-cliente (rehidratar el carrito).
- Carrito (`storefront-cart.ts`): hoy resuelve productos con un import estático (`getProductById`,
  `restoreStoredCart`). Pasa a resolverlos contra un **mapa `productsById` inyectado** (desde props/API). El
  carrito sigue guardando `productId + quantity + options` en localStorage.
- Precio: `CatalogProductCard` / `ProductPreviewModal` muestran el precio **calculado** con `computeUnitPrice`
  (no más string fijo). `checkout-client` arma `unitPrice` con el helper en vez de `parsePrice`.
- `customer-commerce.createStorefrontCheckout`: **recalcula** el precio desde BD por ítem (no confía en el
  cliente) antes de insertar la orden.
- `inventory-panel.tsx`: deja de importar el array estático; recibe los productos cargados.

## Semilla / migración

Cargar los 8 productos actuales en las nuevas tablas (categorías + productos) con `pricing_mode='package'`,
asignando tiers de precio sensatos a partir de sus opciones de "Cantidad" actuales. Como no hay datos reales,
no hay migración de órdenes; solo seed del catálogo. Las imágenes existentes en `public/` se referencian por
ruta (o se migran al bucket).

## Riesgos / notas

- **Refactor del carrito**: pasar de import estático a catálogo inyectado toca varios componentes; es el punto
  de mayor cuidado. Mitigación: un único `productsById` y un loader compartido.
- **Órdenes con texto libre**: el checkout arma `material/size/lamination_finish` desde nombres de opción fijos
  (`Material`, `Tamano`, `Acabado`). Con opciones libres por producto, mapear esos campos de forma laxa
  (best-effort) y volcar todas las opciones al `description`, como ya hace hoy.
- **Imágenes**: definir si las 8 fotos actuales se quedan en `public/` (referenciadas por ruta) o se suben al
  bucket. Propuesta: dejar las actuales en `public/` y usar el bucket solo para fotos nuevas subidas desde el
  admin.
