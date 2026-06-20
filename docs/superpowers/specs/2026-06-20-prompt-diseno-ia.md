# Prompt de diseño para IA — Express Printer (rediseño premium)

> Pégalo en la IA de diseño que prefieras (v0, Lovable, Claude, Stitch, Figma
> AI…). Está en español porque la UI es en español (Venezuela). Si la
> herramienta rinde mejor en inglés, tradúcelo conservando el contenido.

---

Actúa como un **diseñador de producto senior**. Diseña la interfaz completa de
**Express Printer**, la tienda web de una **imprenta venezolana** (impresión
comercial y publicitaria) en Maracay. Entrégame un **sistema de diseño
coherente** (paleta/tokens, tipografía, componentes) y las **pantallas** en
**desktop y móvil**.

## Marca y contexto
- Imprenta confiable y con buen gusto; público venezolano: **personas y
  negocios**. Tono profesional pero cercano.
- **Conservar la identidad**: logo existente "Express Printer" y colores de
  marca **amarillo (`#ffd45f` / `#fbbf24`)** y **azul (`#3558ff`)**. El amarillo
  es **acento puntual** (no fondo); el azul para **acciones**. Texto en gris
  tinta casi negro sobre fondos claros.
- Idioma **español (Venezuela)**, precios en **USD ($)**, **tema claro**.

## Estética buscada
- **Limpio, premium, boutique**: mucho espacio en blanco, **jerarquía
  tipográfica fuerte** (un display con carácter + un sans muy legible),
  superficies sobrias, sombras suaves, radios moderados.
- Que transmita **"imprenta con buen gusto"**: profesional, confiable, cálida.
- Imágenes reales de productos impresos (tarjetas, stickers, pendones,
  talonarios, volantes) como protagonistas, bien presentadas.

## Pantallas a diseñar
1. **Home**: hero con propuesta de valor + CTA principal (pedir) y WhatsApp;
   categorías destacadas; bloque "lo que imprimimos"; sección de confianza
   ("cómo trabajamos" / por qué elegirnos, **sin reseñas inventadas**); franja
   para **empresas**; footer con datos reales (dirección, teléfono, horario).
2. **Catálogo / listado**: filtro por categoría + búsqueda; tarjetas de
   producto limpias (imagen, nombre, categoría, desde-precio).
3. **Detalle de producto**: imagen grande; **configurador de opciones**
   (medida, material, acabado, cantidad) con **precio en vivo**; elección
   **"Subo mi arte" / "Que lo diseñe la imprenta"**; botón **Añadir al
   carrito** + **Pedir por WhatsApp**. Variante **"a cotización"** (sin precio,
   botón "Solicitar cotización").
4. **Carrito**.
5. **Checkout + pago**: datos del cliente (**invitado**: nombre + teléfono, o
   **cuenta**); resumen del pedido; **pago con Pago Móvil**: instrucciones +
   campos de referencia + **subir comprobante (imagen)**. Al enviar, el pedido
   queda en estado **"pago en revisión"**.
6. **Confirmación + seguimiento**: muestra el **código de pedido** y los
   estados (recibido → pago en revisión → aprobado → en producción → listo).
7. **Mis pedidos** (cuenta): historial + estado de cada pedido.
8. **Login / registro** simple.

## Componentes y flujos clave
- **Botón flotante de WhatsApp** siempre accesible.
- **Configurador** con cálculo de precio en vivo según opciones.
- **Subida de comprobante** de Pago Móvil + indicador de estado de aprobación.
- **Pedido como invitado** con código de seguimiento + opción de crear cuenta.
- Estados de pedido claros y legibles para el cliente.

## Requisitos
- **Responsive, móvil primero**; accesible (contraste AA, texto cuerpo ≥ 4.5:1).
- Mantener **logo + paleta** de marca.
- Sistema consistente: define tokens de color, tipografía, espaciado y los
  componentes reutilizables (botón, input, tarjeta de producto, chip de estado,
  paso de checkout).

## Evitar (anti-genérico, importante)
- Look de **marketplace/tienda genérica**: mega-menús densos, carruseles
  ruidosos, **grillas infinitas de promos con precios tachados**.
- **Descuentos, estrellas o reseñas inventadas**; banners de oferta de relleno;
  formularios que no hacen nada.
- Gradientes morado-azul, glassmorphism por defecto, **texto con gradiente**,
  eyebrows en mayúsculas sobre cada sección, **tarjetas idénticas repetidas**.

Entrega: paleta/tokens + tipografía + las 8 pantallas en **desktop y móvil**,
con un par de **estados** clave (carrito vacío, pago en revisión, producto a
cotización).
