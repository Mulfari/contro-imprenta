# Express Printer — Rumbo, alcance del cliente y rediseño (entrega a Javier)

Fecha: 2026-06-20
Estado: aprobado (brainstorming) — pendiente de implementar por fases

## 1. Contexto y objetivo

Express Printer (storefront + panel admin, Next.js 16 + Supabase, en
`expressprinter.com.ve`) está construido a medias. El objetivo es **dejarlo
listo para entregar a Javier** (dueño de la imprenta): un sitio que se vea
profesional, con un flujo de pedido claro para el cliente y herramientas de
gestión para Javier.

Dos focos de esta ronda:
1. **Rediseño** — el diseño actual ("tienda genérica": mega-menú, carrusel,
   grillas de promos) no convence; se quiere un look limpio y premium.
2. **Aclarar la funcionalidad del cliente** — qué puede hacer exactamente en
   la web.

## 2. Decisiones (rumbo)

- **Modelo de pedido: HÍBRIDO.** Conviven el pedido online (carrito/checkout)
  y el pedido por WhatsApp (mensaje prellenado). Ambos caminos se conservan.
- **Pago: Pago Móvil con comprobante (sin pasarela).** El cliente paga por su
  cuenta y **sube el comprobante + la referencia/datos** en la web; el pedido
  queda en **"pago en revisión"** y el **admin lo aprueba** desde el panel. No
  se integra pasarela automática (fuera de alcance).
- **Cuentas: invitado + cuenta opcional ("las dos").** Se puede pedir como
  invitado (nombre + teléfono, seguimiento por **código de pedido**) o crear
  cuenta para tener **"Mis pedidos"** con historial. El registro actual está
  roto (Supabase exige confirmar correo y no hay SMTP) → hay que arreglarlo.
- **Diseño: limpio y premium (boutique).** Espacioso, tipografía cuidada,
  pocas cosas por pantalla, sensación profesional/confiable.
- **Marca: se mantiene.** Logo Express Printer + colores actuales (amarillo
  `#ffd45f`/`#fbbf24` + azul `#3558ff`); se moderniza layout/espaciado/
  tipografía, no se rebrandea.

## 3. Alcance funcional del cliente

- Explorar catálogo: categorías, búsqueda, ver producto.
- Configurar producto: opciones (medida, material, acabado, cantidad) con
  **precio en vivo**.
- Diseño: **subir su arte** listo para imprimir **o** pedir que **la imprenta
  lo diseñe** (opción ya modelada como grupo "Diseño").
- Pedir por dos vías:
  - **Online**: carrito → checkout → **Pago Móvil** (sube comprobante +
    referencia) → "pago en revisión" → aprobación del admin.
  - **WhatsApp**: pedido prellenado a `wa.me`.
- **Invitado**: pedir con nombre + teléfono + **código de pedido** para
  seguimiento.
- **Cuenta opcional**: "Mis pedidos" (historial + estados).
- **Cotización**: productos marcados "a cotización" → el cliente solicita
  precio; el admin lo coloca y queda pagable.

## 4. Roadmap de entrega

### Fase 1 — Rediseño premium (prioridad)
Generar el diseño con una IA de diseño (ver prompt asociado) y montarlo en el
storefront. Pantallas: home, catálogo/listado, detalle de producto (con
configurador + camino de diseño + cotización), carrito, checkout + pago
(Pago Móvil/comprobante), confirmación + seguimiento de pedido, "Mis pedidos",
login/registro. Mantener logo + paleta de marca, estética limpia y boutique,
responsive y en español (Venezuela).

### Fase 2 — Checkout + pago real
- Arreglar el registro de clientes (desactivar confirmación de correo en
  Supabase o método alterno).
- **Checkout invitado**: pedido con nombre + teléfono + código de seguimiento.
- **Flujo Pago Móvil**: el cliente sube comprobante + datos de la referencia
  → estado "pago en revisión" → **aprobación del admin** en el panel.
  (Base existente: buckets de subida de archivos + estados/áreas de pedido +
  funciones de pagos en `lib/customer-commerce.ts` y `lib/business.ts`.)

### Fase 3 — Contenido y entrega
- Cargar el **catálogo real** de Javier (productos, precios, fotos) desde el
  panel admin (gestión ya existe).
- Confirmar con Javier los datos del hero: **"delivery gratis"** y **horarios**
  (hoy son afirmaciones por verificar).
- QA final recorriendo el flujo como cliente real → **entrega**.

## 5. Dirección de diseño (insumo para el prompt)

- **Personalidad**: imprenta confiable y con buen gusto; profesional pero
  cercana; pública venezolana (personas y negocios).
- **Estética**: limpio/premium/boutique. Mucho espacio en blanco, jerarquía
  tipográfica fuerte, superficies sobrias, acento de marca usado con medida.
- **Evitar**: look "tienda genérica" (mega-menú denso, carrusel ruidoso,
  grillas de promos repetidas), descuentos/estrellas/reseñas inventadas,
  formularios muertos.
- **Mantener**: logo Express Printer, amarillo + azul de marca, CTA de
  WhatsApp siempre accesible, español.

## 6. Fuera de alcance / pendientes con Javier

- Pasarela de pago automática (solo queda la costura para el futuro).
- Rebranding (logo/colores nuevos).
- Confirmar: WhatsApp `584243390487`, correo, dirección, horarios y
  "delivery gratis" reales; catálogo real (los 8 productos actuales son
  semillas genéricas).
