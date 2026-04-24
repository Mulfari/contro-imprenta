export type StorefrontProduct = {
  id: string;
  title: string;
  price: string;
  note: string;
  category: string;
  tint: string;
  image: string;
  imageAlt: string;
  description: string;
  turnaround: string;
  highlights: string[];
  options: {
    name: string;
    values: string[];
  }[];
};

export const storefrontCategories = [
  "Tarjetas de presentacion",
  "Stickers y etiquetas",
  "Pendones y gran formato",
  "Facturas y talonarios",
  "Invitaciones y papeleria",
];

export const storefrontProducts: StorefrontProduct[] = [
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
    options: [
      { name: "Cantidad", values: ["100 unidades", "250 unidades", "500 unidades"] },
      { name: "Acabado", values: ["Mate", "Brillante", "Soft touch"] },
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
    options: [
      { name: "Material", values: ["Papel adhesivo", "Vinil blanco", "Vinil transparente"] },
      { name: "Corte", values: ["Circular", "Cuadrado", "Troquelado"] },
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
    options: [
      { name: "Formato", values: ["Pendon", "Afiche", "Roll up"] },
      { name: "Tamano", values: ["60 x 160 cm", "90 x 190 cm", "Personalizado"] },
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
    options: [
      { name: "Tipo", values: ["Recibo", "Factura", "Nota de entrega"] },
      { name: "Copias", values: ["Original", "Original + copia", "Triplicado"] },
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
    options: [
      { name: "Papel", values: ["Opalina", "Lino", "Texturizado"] },
      { name: "Cantidad", values: ["25 unidades", "50 unidades", "100 unidades"] },
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
    options: [
      { name: "Entrega", values: ["Pliego", "Corte individual", "Rollo"] },
      { name: "Acabado", values: ["Mate", "Brillante", "Laminado"] },
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
    options: [
      { name: "Cantidad", values: ["250 unidades", "500 unidades", "1000 unidades"] },
      { name: "Acabado", values: ["Mate", "Brillante", "Laminado"] },
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
    options: [
      { name: "Medida", values: ["80 x 200 cm", "85 x 200 cm", "Personalizada"] },
      { name: "Material", values: ["Lona", "Banner premium", "Vinil"] },
    ],
  },
];
