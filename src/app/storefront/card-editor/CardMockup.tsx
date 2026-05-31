"use client";

import type { CardDesign, CardFields, ColorScheme } from "./types";

interface CardMockupProps {
  design: CardDesign;
  finish: string;
  size?: "large" | "thumb";
  artUrl?: string | null;
  fields?: CardFields;
  colorScheme?: ColorScheme;
  side?: "front" | "back";
}

export function CardMockup({
  design,
  finish,
  size = "large",
  artUrl,
  fields,
  colorScheme,
  side = "front",
}: CardMockupProps) {
  const isLarge = size === "large";

  const paperTexture =
    "before:pointer-events-none before:absolute before:inset-0 before:z-20 before:rounded-[inherit] before:opacity-[0.35] before:mix-blend-multiply before:bg-[url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='100'%20height='100'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.9'%20numOctaves='4'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100'%20height='100'%20filter='url(%23n)'%20opacity='0.15'/%3E%3C/svg%3E\")]";

  const finishLayer =
    finish === "Brillante" ? (
      <>
        <div className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] bg-gradient-to-br from-white/60 via-transparent via-40% to-transparent" />
        <div
          className="pointer-events-none absolute inset-0 z-30 rounded-[inherit]"
          style={{
            background:
              "linear-gradient(125deg, transparent 30%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.25) 55%, transparent 70%)",
          }}
        />
      </>
    ) : finish === "Soft touch" ? (
      <div
        className="pointer-events-none absolute inset-0 z-30 rounded-[inherit]"
        style={{
          background: "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.08) 0%, transparent 60%)",
          backdropFilter: "blur(0.3px)",
        }}
      />
    ) : (
      <div className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] bg-gradient-to-br from-white/10 via-transparent to-transparent" />
    );

  if (artUrl) {
    return (
      <div
        className={`relative ${isLarge ? "rounded-[0.55rem]" : "rounded-[0.3rem]"} ${paperTexture} aspect-[9/5] w-full overflow-hidden bg-white`}
      >
        <img src={artUrl} alt="Vista previa de tu arte" className="absolute inset-0 z-10 h-full w-full object-cover" />
        {finishLayer}
      </div>
    );
  }

  const cardBase = `relative ${isLarge ? "rounded-[0.55rem]" : "rounded-[0.3rem]"} ${paperTexture}`;

  const f = fields || { name: "", title: "", company: "", phone: "", email: "" };
  const hasFields = fields && (f.name || f.title || f.company || f.phone || f.email);

  if (side === "back") {
    const cs = colorScheme;
    const isDark = design === "bold" || design === "tech";
    const bgColor = isDark ? cs?.bg || "#0f0f11" : cs?.bg || "#fcfcfb";
    const textColor = isDark ? "#ffffff" : cs?.text || "#1a1a1a";
    const accentColor = cs?.primary || "#1a1a1a";

    return (
      <div
        className={`${cardBase} aspect-[9/5] w-full overflow-hidden`}
        style={{ backgroundColor: bgColor.startsWith("from-") ? undefined : bgColor }}
      >
        <div className={`relative z-10 flex h-full flex-col items-center justify-center ${isLarge ? "p-[9%]" : "p-[8%]"}`}>
          <div className={`${isLarge ? "h-[2px] w-[30%]" : "h-[1px] w-[30%]"} mb-[6%]`} style={{ backgroundColor: accentColor }} />
          <p
            className={`${isLarge ? "text-[0.42rem]" : "text-[0.21rem]"} text-center font-medium tracking-[0.15em]`}
            style={{ color: textColor, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", opacity: 0.7 }}
          >
            {hasFields ? f.company || "Tu Empresa" : "Empresa"}
          </p>
          <p
            className={`${isLarge ? "mt-[4%] text-[0.34rem]" : "mt-[3%] text-[0.17rem]"} text-center tracking-[0.08em]`}
            style={{ color: textColor, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", opacity: 0.4 }}
          >
            www.tuempresa.com
          </p>
          <div className={`${isLarge ? "h-[2px] w-[30%]" : "h-[1px] w-[30%]"} mt-[6%]`} style={{ backgroundColor: accentColor }} />
        </div>
        {finishLayer}
      </div>
    );
  }

  if (design === "minimal") {
    return (
      <div className={`${cardBase} aspect-[9/5] w-full overflow-hidden bg-[#fcfcfb]`}>
        <div className={`relative z-10 flex h-full flex-col justify-between ${isLarge ? "p-[9%]" : "p-[8%]"}`}>
          <div>
            <div className={`${isLarge ? "h-[2.5px] w-[16%]" : "h-[1.5px] w-[16%]"} bg-[#1a1a1a]`} />
            <p
              className={`${isLarge ? "mt-[9%] text-[0.68rem]" : "mt-[8%] text-[0.32rem]"} font-semibold uppercase tracking-[0.3em] text-[#1a1a1a]`}
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", letterSpacing: isLarge ? "0.3em" : "0.2em" }}
            >
              {hasFields ? f.name || "Tu Nombre" : "Maria Rodriguez"}
            </p>
            <p
              className={`${isLarge ? "mt-[3%] text-[0.46rem]" : "mt-[2%] text-[0.22rem]"} font-normal tracking-[0.2em] text-[#999]`}
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              {hasFields ? f.title || "Tu Cargo" : "Directora Creativa"}
            </p>
          </div>
          <div className="flex items-end justify-between">
            <div className="space-y-[1px]">
              <p
                className={`${isLarge ? "text-[0.38rem]" : "text-[0.19rem]"} tracking-[0.06em] text-[#aaa]`}
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                {hasFields ? f.phone || "+58 000 000 0000" : "+58 412 555 0123"}
              </p>
              <p
                className={`${isLarge ? "text-[0.38rem]" : "text-[0.19rem]"} tracking-[0.06em] text-[#aaa]`}
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                {hasFields ? f.email || "tu@email.com" : "maria@estudio.com"}
              </p>
            </div>
            <p
              className={`${isLarge ? "text-[0.44rem]" : "text-[0.22rem]"} font-medium tracking-[0.25em] text-[#ddd]`}
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              {hasFields ? (f.company || "EMPRESA").toUpperCase() : "ESTUDIO"}
            </p>
          </div>
        </div>
        {finishLayer}
      </div>
    );
  }

  if (design === "bold") {
    return (
      <div className={`${cardBase} aspect-[9/5] w-full overflow-hidden bg-[#0f0f11]`}>
        <div className="absolute inset-0 z-[5] bg-gradient-to-br from-amber-500/[0.06] via-transparent to-amber-600/[0.03]" />
        <div className={`relative z-10 flex h-full flex-col justify-between ${isLarge ? "p-[9%]" : "p-[8%]"}`}>
          <div>
            <p
              className={`${isLarge ? "text-[0.76rem]" : "text-[0.36rem]"} font-bold uppercase tracking-[0.24em] text-white`}
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              {hasFields ? f.name || "Tu Nombre" : "Carlos Mendez"}
            </p>
            <p
              className={`${isLarge ? "mt-[4%] text-[0.42rem]" : "mt-[3%] text-[0.21rem]"} font-medium tracking-[0.18em] text-amber-400/80`}
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              {hasFields ? f.title || "Tu Cargo" : "CEO & Fundador"}
            </p>
          </div>
          <div className="flex items-end justify-between">
            <div className="space-y-[1px]">
              <p
                className={`${isLarge ? "text-[0.38rem]" : "text-[0.19rem]"} tracking-[0.06em] text-[#4a4a4a]`}
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                {hasFields ? f.phone || "+58 000 000 0000" : "+58 414 888 7654"}
              </p>
              <p
                className={`${isLarge ? "text-[0.38rem]" : "text-[0.19rem]"} tracking-[0.06em] text-[#4a4a4a]`}
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                {hasFields ? f.email || "tu@email.com" : "carlos@nexus.io"}
              </p>
            </div>
            <div
              className={`flex ${isLarge ? "h-[1.35rem] w-[1.35rem]" : "h-[0.65rem] w-[0.65rem]"} items-center justify-center rounded-full bg-amber-500`}
            >
              <span className={`${isLarge ? "text-[0.38rem]" : "text-[0.18rem]"} font-black text-[#0f0f11]`}>
                {hasFields ? (f.company || "E")[0].toUpperCase() : "N"}
              </span>
            </div>
          </div>
        </div>
        {finishLayer}
      </div>
    );
  }

  if (design === "tech") {
    const cs = colorScheme || { bg: "#0d1117", primary: "#00ff88", text: "#e6edf3", secondary: "#334455" };
    return (
      <div className={`${cardBase} aspect-[9/5] w-full overflow-hidden`} style={{ backgroundColor: cs.bg }}>
        <div
          className="absolute inset-0 z-[5] opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 8px, currentColor 8px, currentColor 9px), repeating-linear-gradient(90deg, transparent, transparent 8px, currentColor 9px, currentColor 9px)",
            color: cs.primary,
          }}
        />
        <div className={`relative z-10 flex h-full flex-col justify-between ${isLarge ? "p-[9%]" : "p-[8%]"}`}>
          <div>
            <div className="flex items-center gap-[4%]">
              <div className={`${isLarge ? "h-[0.5rem] w-[0.5rem]" : "h-[0.25rem] w-[0.25rem]"} rounded-sm`} style={{ backgroundColor: cs.primary }} />
              <p
                className={`${isLarge ? "text-[0.5rem]" : "text-[0.25rem]"} font-bold tracking-[0.2em]`}
                style={{ color: cs.primary, fontFamily: "'Courier New', monospace" }}
              >
                {hasFields ? (f.company || "STARTUP").toUpperCase() : "NEXTECH"}
              </p>
            </div>
            <p
              className={`${isLarge ? "mt-[8%] text-[0.7rem]" : "mt-[7%] text-[0.34rem]"} font-bold`}
              style={{ color: cs.text, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              {hasFields ? f.name || "Tu Nombre" : "Diego Ramirez"}
            </p>
            <p
              className={`${isLarge ? "mt-[3%] text-[0.4rem]" : "mt-[2%] text-[0.2rem]"} font-medium`}
              style={{ color: cs.primary, fontFamily: "'Courier New', monospace" }}
            >
              {hasFields ? f.title || "Tu Cargo" : "Full Stack Developer"}
            </p>
          </div>
          <div className="space-y-[1px]">
            <p className={`${isLarge ? "text-[0.36rem]" : "text-[0.18rem]"}`} style={{ color: cs.secondary, fontFamily: "'Courier New', monospace" }}>
              {hasFields ? f.phone || "+58 000 000 0000" : "+58 424 111 2233"}
            </p>
            <p className={`${isLarge ? "text-[0.36rem]" : "text-[0.18rem]"}`} style={{ color: cs.secondary, fontFamily: "'Courier New', monospace" }}>
              {hasFields ? f.email || "tu@email.com" : "diego@nextech.dev"}
            </p>
          </div>
        </div>
        {finishLayer}
      </div>
    );
  }

  if (design === "medical") {
    const cs = colorScheme || { bg: "#ffffff", primary: "#0891b2", text: "#0f172a", secondary: "#94a3b8" };
    return (
      <div className={`${cardBase} aspect-[9/5] w-full overflow-hidden`} style={{ backgroundColor: cs.bg }}>
        <div
          className={`absolute right-[6%] top-[8%] z-[5] ${isLarge ? "h-[1.6rem] w-[1.6rem]" : "h-[0.8rem] w-[0.8rem]"} rounded-full opacity-[0.08]`}
          style={{ backgroundColor: cs.primary }}
        />
        <div className={`relative z-10 flex h-full flex-col justify-between ${isLarge ? "p-[9%]" : "p-[8%]"}`}>
          <div>
            <div className="flex items-center gap-[3%]">
              <svg
                viewBox="0 0 24 24"
                className={`${isLarge ? "h-[0.7rem] w-[0.7rem]" : "h-[0.35rem] w-[0.35rem]"}`}
                fill="none"
                stroke={cs.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v4m0 12v4m-6-10H2m20 0h-4m-1.5-6.5L15 7m-6 10-1.5 1.5M19.5 7.5 18 9M6 15l-1.5 1.5" />
              </svg>
              <p
                className={`${isLarge ? "text-[0.44rem]" : "text-[0.22rem]"} font-semibold tracking-[0.12em]`}
                style={{ color: cs.primary, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                {hasFields ? (f.company || "CLINICA").toUpperCase() : "CENTRO MEDICO SALUD"}
              </p>
            </div>
            <p
              className={`${isLarge ? "mt-[8%] text-[0.68rem]" : "mt-[7%] text-[0.33rem]"} font-bold`}
              style={{ color: cs.text, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              {hasFields ? f.name || "Tu Nombre" : "Dra. Patricia Gomez"}
            </p>
            <p
              className={`${isLarge ? "mt-[3%] text-[0.4rem]" : "mt-[2%] text-[0.2rem]"} font-medium`}
              style={{ color: cs.secondary, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              {hasFields ? f.title || "Especialidad" : "Cardiologia · Medicina Interna"}
            </p>
          </div>
          <div className="space-y-[1px]">
            <p className={`${isLarge ? "text-[0.36rem]" : "text-[0.18rem]"}`} style={{ color: cs.secondary, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
              {hasFields ? f.phone || "+58 000 000 0000" : "+58 212 333 4455"}
            </p>
            <p className={`${isLarge ? "text-[0.36rem]" : "text-[0.18rem]"}`} style={{ color: cs.secondary, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
              {hasFields ? f.email || "tu@email.com" : "dra.gomez@centromedico.com"}
            </p>
          </div>
        </div>
        {finishLayer}
      </div>
    );
  }

  if (design === "gastro") {
    const cs = colorScheme || { bg: "#fef7ed", primary: "#92400e", text: "#451a03", secondary: "#a8856c", accent: "#92400e" };
    return (
      <div className={`${cardBase} aspect-[9/5] w-full overflow-hidden`} style={{ backgroundColor: cs.bg }}>
        <div
          className={`absolute bottom-0 right-0 z-[5] ${isLarge ? "h-[60%] w-[40%]" : "h-[60%] w-[40%]"} rounded-tl-full opacity-[0.04]`}
          style={{ backgroundColor: cs.accent }}
        />
        <div className={`relative z-10 flex h-full flex-col justify-between ${isLarge ? "p-[9%]" : "p-[8%]"}`}>
          <div>
            <p
              className={`${isLarge ? "text-[0.4rem]" : "text-[0.2rem]"} font-light uppercase tracking-[0.3em]`}
              style={{ color: cs.secondary, fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {hasFields ? f.company || "Restaurante" : "Restaurante & Bar"}
            </p>
            <p
              className={`${isLarge ? "mt-[6%] text-[0.72rem]" : "mt-[5%] text-[0.35rem]"} font-bold`}
              style={{ color: cs.text, fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {hasFields ? f.name || "Tu Nombre" : "Chef Marco Villegas"}
            </p>
            <p
              className={`${isLarge ? "mt-[3%] text-[0.4rem]" : "mt-[2%] text-[0.2rem]"}`}
              style={{ color: cs.accent, fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {hasFields ? f.title || "Tu Cargo" : "Chef Ejecutivo"}
            </p>
          </div>
          <div className="flex items-end justify-between">
            <div className="space-y-[1px]">
              <p className={`${isLarge ? "text-[0.36rem]" : "text-[0.18rem]"}`} style={{ color: cs.secondary, fontFamily: "Georgia, 'Times New Roman', serif" }}>
                {hasFields ? f.phone || "+58 000 000 0000" : "+58 412 777 8899"}
              </p>
              <p className={`${isLarge ? "text-[0.36rem]" : "text-[0.18rem]"}`} style={{ color: cs.secondary, fontFamily: "Georgia, 'Times New Roman', serif" }}>
                {hasFields ? f.email || "tu@email.com" : "reservas@lacocina.com"}
              </p>
            </div>
            <div
              className={`${isLarge ? "h-[1.2rem] w-[1.2rem]" : "h-[0.6rem] w-[0.6rem]"} rounded-full border-2 flex items-center justify-center`}
              style={{ borderColor: cs.accent }}
            >
              <span className={`${isLarge ? "text-[0.3rem]" : "text-[0.15rem]"} font-black`} style={{ color: cs.accent }}>
                ✦
              </span>
            </div>
          </div>
        </div>
        {finishLayer}
      </div>
    );
  }

  // Elegant (default fallback)
  const cs = colorScheme || { bg: "from-[#f7f4f0] to-[#efe9e1]", primary: "#b5a594", text: "#3a3028", secondary: "#c4b5a4", accent: "from-rose-400/70 to-amber-400/70" };
  const elegantAccent = cs.accent.startsWith("from-") ? cs.accent : "from-rose-400/70 to-amber-400/70";
  const elegantBg = cs.bg.startsWith("from-") ? `bg-gradient-to-br ${cs.bg}` : "";

  return (
    <div className={`${cardBase} aspect-[9/5] w-full overflow-hidden ${elegantBg || "bg-gradient-to-br from-[#f7f4f0] to-[#efe9e1]"}`}>
      <div className={`absolute left-0 top-0 z-[5] h-full ${isLarge ? "w-[2.5px]" : "w-[1.5px]"} bg-gradient-to-b ${elegantAccent}`} />
      <div className={`relative z-10 flex h-full flex-col justify-between ${isLarge ? "p-[9%] pl-[12%]" : "p-[8%] pl-[11%]"}`}>
        <div>
          <p
            className={`${isLarge ? "text-[0.46rem]" : "text-[0.23rem]"} font-light italic tracking-[0.1em]`}
            style={{ color: cs.primary, fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {hasFields ? f.company || "Tu Empresa" : "Abogados & Asociados"}
          </p>
          <p
            className={`${isLarge ? "mt-[6%] text-[0.66rem]" : "mt-[5%] text-[0.32rem]"} font-semibold`}
            style={{ color: cs.text, fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {hasFields ? f.name || "Tu Nombre" : "Ana Lucia Fernandez"}
          </p>
          <p
            className={`${isLarge ? "mt-[2%] text-[0.4rem]" : "mt-[1%] text-[0.2rem]"} tracking-[0.16em]`}
            style={{ color: cs.primary, fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {hasFields ? f.title || "Tu Cargo" : "Socia Principal"}
          </p>
        </div>
        <div className="space-y-[1px]">
          <p className={`${isLarge ? "text-[0.36rem]" : "text-[0.18rem]"}`} style={{ color: cs.secondary, fontFamily: "Georgia, 'Times New Roman', serif" }}>
            {hasFields ? f.phone || "+58 000 000 0000" : "Av. Libertador, Torre Capital, Piso 12"}
          </p>
          <p className={`${isLarge ? "text-[0.36rem]" : "text-[0.18rem]"}`} style={{ color: cs.secondary, fontFamily: "Georgia, 'Times New Roman', serif" }}>
            {hasFields ? f.email || "tu@email.com" : "+58 212 555 9876 · ana@fernandez.legal"}
          </p>
        </div>
      </div>
      {finishLayer}
    </div>
  );
}