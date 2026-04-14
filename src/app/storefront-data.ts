export type StorefrontProduct = {
  title: string;
  price: string;
  note: string;
  category: string;
  tint: string;
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
    title: "Tarjetas premium",
    price: "$18",
    note: "Mate o brillante",
    category: "Tarjetas de presentacion",
    tint: "from-amber-100 via-white to-orange-50",
  },
  {
    title: "Stickers troquelados",
    price: "$12",
    note: "Personalizados",
    category: "Stickers y etiquetas",
    tint: "from-sky-100 via-white to-cyan-50",
  },
  {
    title: "Pendon publicitario",
    price: "$25",
    note: "Gran formato",
    category: "Pendones y gran formato",
    tint: "from-violet-100 via-white to-fuchsia-50",
  },
  {
    title: "Talonarios fiscales",
    price: "$14",
    note: "Autocopiativos",
    category: "Facturas y talonarios",
    tint: "from-emerald-100 via-white to-lime-50",
  },
  {
    title: 'Invitaciones "Save the date"',
    price: "$22",
    note: "Eventos y bodas",
    category: "Invitaciones y papeleria",
    tint: "from-rose-100 via-white to-pink-50",
  },
  {
    title: "Etiquetas para packaging",
    price: "$11",
    note: "Rollos y cortes",
    category: "Stickers y etiquetas",
    tint: "from-cyan-100 via-white to-sky-50",
  },
  {
    title: "Tarjetas corporativas",
    price: "$20",
    note: "Acabado ejecutivo",
    category: "Tarjetas de presentacion",
    tint: "from-zinc-100 via-white to-slate-50",
  },
  {
    title: "Pendones roll up",
    price: "$39",
    note: "Estructura incluida",
    category: "Pendones y gran formato",
    tint: "from-yellow-100 via-white to-amber-50",
  },
];
