"use client";

interface MobileCatalogFilterSheetProps {
  open: boolean;
  activeQuery: string;
  onClose: () => void;
  onClear: () => void;
  onSelect: (query: string) => void;
}

const categoryGroups = [
  { title: "Papeleria comercial", items: ["Tarjetas", "Talonarios", "Facturas", "Invitaciones"] },
  { title: "Gran formato", items: ["Pendones", "Gran formato", "Roll up", "Publicitario"] },
  { title: "Etiquetas y stickers", items: ["Stickers", "Etiquetas", "Packaging", "Troquelados"] },
  { title: "Acabados y usos", items: ["Premium", "Corporativas", "Autocopiativos", "Personalizados"] },
];

export function MobileCatalogFilterSheet({ open, activeQuery, onClose, onClear, onSelect }: MobileCatalogFilterSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] xl:hidden">
      <button type="button" aria-label="Cerrar filtros" className="absolute inset-0 cursor-default bg-slate-950/35 backdrop-blur-sm" onClick={onClose} />
      <section className="absolute inset-x-0 bottom-0 max-h-[78vh] overflow-hidden rounded-t-[1.65rem] bg-white shadow-[0_-24px_70px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Catalogo</p>
            <h2 className="text-lg font-black tracking-tight text-slate-950">Filtrar productos</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar filtros"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
          >
            x
          </button>
        </div>

        <div className="max-h-[calc(78vh-5rem)] overflow-y-auto px-4 pb-28 pt-4">
          <button
            type="button"
            onClick={onClear}
            className={`w-full cursor-pointer rounded-xl px-4 py-3 text-sm font-black transition ${
              activeQuery ? "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50" : "bg-slate-950 text-white"
            }`}
          >
            Ver todo el catalogo
          </button>

          <div className="mt-5 space-y-5">
            {categoryGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{group.title}</h3>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {group.items.map((item) => {
                    const isActive = activeQuery.toLowerCase() === item.toLowerCase();
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => onSelect(item)}
                        className={`min-w-0 cursor-pointer rounded-xl border px-3 py-3 text-left text-sm font-semibold transition ${
                          isActive
                            ? "border-slate-950 bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.14)]"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-950"
                        }`}
                      >
                        <span className="block truncate">{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}