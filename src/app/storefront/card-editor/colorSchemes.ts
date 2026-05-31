import type { CardDesign, ColorScheme } from "./types";

export const COLOR_SCHEMES: Record<CardDesign, ColorScheme[]> = {
  minimal: [
    { id: "mono", name: "Monocromo", primary: "#1a1a1a", secondary: "#999", accent: "#1a1a1a", bg: "#fcfcfb", text: "#1a1a1a" },
    { id: "navy", name: "Azul marino", primary: "#1e3a5f", secondary: "#6b8db5", accent: "#1e3a5f", bg: "#f8fafc", text: "#1e3a5f" },
    { id: "forest", name: "Bosque", primary: "#2d4a3e", secondary: "#7a9e8e", accent: "#2d4a3e", bg: "#f7faf8", text: "#2d4a3e" },
  ],
  bold: [
    { id: "gold", name: "Oro negro", primary: "#f59e0b", secondary: "#4a4a4a", accent: "#f59e0b", bg: "#0f0f11", text: "#ffffff" },
    { id: "electric", name: "Electrico", primary: "#3b82f6", secondary: "#4a4a5a", accent: "#3b82f6", bg: "#0a0a14", text: "#ffffff" },
    { id: "crimson", name: "Carmesi", primary: "#dc2626", secondary: "#4a4a4a", accent: "#dc2626", bg: "#110a0a", text: "#ffffff" },
  ],
  elegant: [
    { id: "rose", name: "Rosa clasico", primary: "#b5a594", secondary: "#c4b5a4", accent: "from-rose-400/70 to-amber-400/70", bg: "from-[#f7f4f0] to-[#efe9e1]", text: "#3a3028" },
    { id: "sapphire", name: "Zafiro", primary: "#7a8ba5", secondary: "#9aaabb", accent: "from-blue-400/70 to-indigo-400/70", bg: "from-[#f0f4f7] to-[#e1e9ef]", text: "#283a4a" },
    { id: "emerald", name: "Esmeralda", primary: "#7aa58b", secondary: "#9abba5", accent: "from-emerald-400/70 to-teal-400/70", bg: "from-[#f0f7f2] to-[#e1efe5]", text: "#283a30" },
  ],
  tech: [
    { id: "cyber", name: "Cyber", primary: "#00ff88", secondary: "#334455", accent: "#00ff88", bg: "#0d1117", text: "#e6edf3" },
    { id: "purple", name: "Violeta", primary: "#a855f7", secondary: "#334455", accent: "#a855f7", bg: "#0d0d1a", text: "#e6e0f3" },
    { id: "neon", name: "Neon", primary: "#06b6d4", secondary: "#334455", accent: "#06b6d4", bg: "#0a1014", text: "#e0f2f3" },
  ],
  medical: [
    { id: "clinical", name: "Clinico", primary: "#0891b2", secondary: "#94a3b8", accent: "#0891b2", bg: "#ffffff", text: "#0f172a" },
    { id: "mint", name: "Menta", primary: "#059669", secondary: "#94a3b8", accent: "#059669", bg: "#f8fffe", text: "#0f172a" },
    { id: "warm", name: "Calido", primary: "#d97706", secondary: "#94a3b8", accent: "#d97706", bg: "#fffdf8", text: "#0f172a" },
  ],
  gastro: [
    { id: "rustic", name: "Rustico", primary: "#92400e", secondary: "#a8856c", accent: "#92400e", bg: "#fef7ed", text: "#451a03" },
    { id: "modern", name: "Moderno", primary: "#1f2937", secondary: "#6b7280", accent: "#ef4444", bg: "#ffffff", text: "#1f2937" },
    { id: "tropical", name: "Tropical", primary: "#065f46", secondary: "#6b8f7a", accent: "#f97316", bg: "#f0fdf4", text: "#065f46" },
  ],
};

export const DESIGN_LABELS: Record<CardDesign, string> = {
  minimal: "Minimalista",
  bold: "Corporativo",
  elegant: "Elegante",
  tech: "Tech / Startup",
  medical: "Salud",
  gastro: "Gastronomia",
};