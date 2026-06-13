// Tipos del catálogo del storefront.
//
// El catálogo real vive en la base de datos (tablas `product_categories` y
// `products`) y se gestiona desde el panel admin. `fallbackProducts` es la
// semilla/red de seguridad: si la BD aún no tiene productos (o falla la
// lectura), el storefront sigue funcionando con estos 8 productos. La semilla
// SQL en `supabase/setup.sql` crea exactamente estos mismos productos.

export type ProductOptionValue = {
  label: string;
  // En grupos `package` es el precio total del paquete; en `surcharge` es el
  // monto que se suma al precio.
  amount: number;
};

export type ProductOptionRole = "package" | "surcharge";

export type ProductOptionGroup = {
  name: string;
  role: ProductOptionRole;
  values: ProductOptionValue[];
};

export type StorefrontProduct = {
  id: string;
  title: string;
  // Texto "Desde $X" que se muestra en tarjetas; derivado del precio mínimo.
  price: string;
  note: string;
  category: string;
  tint: string;
  image: string;
  imageAlt: string;
  description: string;
  turnaround: string;
  highlights: string[];
  // 'package': un grupo de opciones (role 'package') fija el precio.
  // 'unit': el precio = basePrice por unidad.
  pricingMode: "package" | "unit";
  basePrice: number;
  options: ProductOptionGroup[];
};

export const storefrontCategories = [
  "Tarjetas de presentacion",
  "Stickers y etiquetas",
  "Pendones y gran formato",
  "Facturas y talonarios",
  "Invitaciones y papeleria",
];

export const fallbackProducts: StorefrontProduct[] = [
  {
    id: "tarjetas-premium",
    title: "Tarjetas premium",
    price: "$18",
    note: "Mate o brillante",
    category: "Tarjetas de presentacion",
    tint: "from-amber-100 via-white to-orange-50",
    image: "/storefront-promo-cards-premium.webp",
    imageAlt: "Tarjetas premium impresas",
    description: "Tarjetas de presentacion con acabado profesional para marcas, vendedores y equipos comerciales.",
    turnaround: "24 a 48 horas",
    highlights: ["Papel grueso", "Acabado mate o brillante", "Diseno listo para imprimir"],
    pricingMode: "package",
    basePrice: 18,
    options: [
      {
        name: "Cantidad",
        role: "package",
        values: [
          { label: "100 unidades", amount: 18 },
          { label: "250 unidades", amount: 32 },
          { label: "500 unidades", amount: 55 },
        ],
      },
      {
        name: "Acabado",
        role: "surcharge",
        values: [
          { label: "Mate", amount: 0 },
          { label: "Brillante", amount: 0 },
          { label: "Soft touch", amount: 8 },
        ],
      },
    ],
  },
  {
    id: "stickers-troquelados",
    title: "Stickers troquelados",
    price: "$12",
    note: "Personalizados",
    category: "Stickers y etiquetas",
    tint: "from-sky-100 via-white to-cyan-50",
    image: "/storefront-promo-stickers-labels-trimmed.webp",
    imageAlt: "Stickers troquelados personalizados",
    description: "Stickers con corte personalizado para empaques, promociones, frascos, bolsas y regalos.",
    turnaround: "2 a 3 dias",
    highlights: ["Corte a la forma", "Vinil adhesivo", "Ideal para packaging"],
    pricingMode: "package",
    basePrice: 12,
    options: [
      {
        name: "Material",
        role: "package",
        values: [
          { label: "Papel adhesivo", amount: 12 },
          { label: "Vinil blanco", amount: 18 },
          { label: "Vinil transparente", amount: 22 },
        ],
      },
      {
        name: "Corte",
        role: "surcharge",
        values: [
          { label: "Circular", amount: 0 },
          { label: "Cuadrado", amount: 0 },
          { label: "Troquelado", amount: 6 },
        ],
      },
    ],
  },
  {
    id: "pendon-publicitario",
    title: "Pendon publicitario",
    price: "$25",
    note: "Gran formato",
    category: "Pendones y gran formato",
    tint: "from-violet-100 via-white to-fuchsia-50",
    image: "/storefront-promo-banners-posters-transparent.webp",
    imageAlt: "Pendones y afiches publicitarios",
    description: "Piezas de gran formato para promociones, vitrinas, ferias, eventos y puntos de venta.",
    turnaround: "24 a 72 horas",
    highlights: ["Alta visibilidad", "Listo para evento", "Formatos personalizados"],
    pricingMode: "package",
    basePrice: 25,
    options: [
      {
        name: "Tamano",
        role: "package",
        values: [
          { label: "60 x 160 cm", amount: 25 },
          { label: "90 x 190 cm", amount: 38 },
          { label: "Personalizado", amount: 55 },
        ],
      },
      {
        name: "Formato",
        role: "surcharge",
        values: [
          { label: "Pendon", amount: 0 },
          { label: "Afiche", amount: 0 },
          { label: "Roll up", amount: 20 },
        ],
      },
    ],
  },
  {
    id: "talonarios-fiscales",
    title: "Talonarios fiscales",
    price: "$14",
    note: "Autocopiativos",
    category: "Facturas y talonarios",
    tint: "from-emerald-100 via-white to-lime-50",
    image: "/storefront-promo-invoices-receipts-transparent.webp",
    imageAlt: "Talonarios y recibos impresos",
    description: "Talonarios, recibos y formatos comerciales para ventas, entregas y control administrativo.",
    turnaround: "2 a 4 dias",
    highlights: ["Numeracion disponible", "Copias autocopiativas", "Formato a medida"],
    pricingMode: "package",
    basePrice: 14,
    options: [
      {
        name: "Copias",
        role: "package",
        values: [
          { label: "Original", amount: 14 },
          { label: "Original + copia", amount: 22 },
          { label: "Triplicado", amount: 30 },
        ],
      },
      {
        name: "Tipo",
        role: "surcharge",
        values: [
          { label: "Recibo", amount: 0 },
          { label: "Factura", amount: 0 },
          { label: "Nota de entrega", amount: 0 },
        ],
      },
    ],
  },
  {
    id: "invitaciones-save-the-date",
    title: 'Invitaciones "Save the date"',
    price: "$22",
    note: "Eventos y bodas",
    category: "Invitaciones y papeleria",
    tint: "from-rose-100 via-white to-pink-50",
    image: "/storefront-invitations.webp",
    imageAlt: "Invitaciones impresas para eventos",
    description: "Invitaciones y papeleria social con una presentacion cuidada para eventos especiales.",
    turnaround: "2 a 5 dias",
    highlights: ["Papeles finos", "Corte limpio", "Acabado premium"],
    pricingMode: "package",
    basePrice: 22,
    options: [
      {
        name: "Cantidad",
        role: "package",
        values: [
          { label: "25 unidades", amount: 22 },
          { label: "50 unidades", amount: 38 },
          { label: "100 unidades", amount: 65 },
        ],
      },
      {
        name: "Papel",
        role: "surcharge",
        values: [
          { label: "Opalina", amount: 0 },
          { label: "Lino", amount: 6 },
          { label: "Texturizado", amount: 10 },
        ],
      },
    ],
  },
  {
    id: "etiquetas-packaging",
    title: "Etiquetas para packaging",
    price: "$11",
    note: "Rollos y cortes",
    category: "Stickers y etiquetas",
    tint: "from-cyan-100 via-white to-sky-50",
    image: "/storefront-labels.webp",
    imageAlt: "Etiquetas para packaging",
    description: "Etiquetas para productos, cajas, bolsas y empaques con opciones resistentes y llamativas.",
    turnaround: "2 a 3 dias",
    highlights: ["Para productos", "Por pliego o rollo", "Colores vivos"],
    pricingMode: "package",
    basePrice: 11,
    options: [
      {
        name: "Entrega",
        role: "package",
        values: [
          { label: "Pliego", amount: 11 },
          { label: "Corte individual", amount: 18 },
          { label: "Rollo", amount: 24 },
        ],
      },
      {
        name: "Acabado",
        role: "surcharge",
        values: [
          { label: "Mate", amount: 0 },
          { label: "Brillante", amount: 0 },
          { label: "Laminado", amount: 5 },
        ],
      },
    ],
  },
  {
    id: "tarjetas-corporativas",
    title: "Tarjetas corporativas",
    price: "$20",
    note: "Acabado ejecutivo",
    category: "Tarjetas de presentacion",
    tint: "from-zinc-100 via-white to-slate-50",
    image: "/storefront-cards.webp",
    imageAlt: "Tarjetas corporativas",
    description: "Tarjetas para equipos comerciales con identidad consistente, buena lectura y presencia sobria.",
    turnaround: "24 a 48 horas",
    highlights: ["Paquetes por equipo", "Marca corporativa", "Revision de arte"],
    pricingMode: "package",
    basePrice: 20,
    options: [
      {
        name: "Cantidad",
        role: "package",
        values: [
          { label: "250 unidades", amount: 20 },
          { label: "500 unidades", amount: 34 },
          { label: "1000 unidades", amount: 60 },
        ],
      },
      {
        name: "Acabado",
        role: "surcharge",
        values: [
          { label: "Mate", amount: 0 },
          { label: "Brillante", amount: 0 },
          { label: "Laminado", amount: 8 },
        ],
      },
    ],
  },
  {
    id: "pendones-roll-up",
    title: "Pendones roll up",
    price: "$39",
    note: "Estructura incluida",
    category: "Pendones y gran formato",
    tint: "from-yellow-100 via-white to-amber-50",
    image: "/storefront-banners.webp",
    imageAlt: "Pendones roll up",
    description: "Pendones roll up con estructura para stands, ferias, vitrinas y presentaciones de marca.",
    turnaround: "2 a 4 dias",
    highlights: ["Estructura incluida", "Transportable", "Alta presencia visual"],
    pricingMode: "package",
    basePrice: 39,
    options: [
      {
        name: "Medida",
        role: "package",
        values: [
          { label: "80 x 200 cm", amount: 39 },
          { label: "85 x 200 cm", amount: 45 },
          { label: "Personalizada", amount: 60 },
        ],
      },
      {
        name: "Material",
        role: "surcharge",
        values: [
          { label: "Lona", amount: 0 },
          { label: "Banner premium", amount: 10 },
          { label: "Vinil", amount: 6 },
        ],
      },
    ],
  },
];

// Alias de compatibilidad. El storefront debe preferir los productos cargados
// desde la BD (vía props); este export es solo la red de seguridad.
export const storefrontProducts = fallbackProducts;
