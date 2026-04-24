import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Express Printer | Imprenta online",
    template: "%s | Express Printer",
  },
  description:
    "Impresion comercial, publicitaria y corporativa con pedidos online, arte digital y seguimiento de pagos para Express Printer.",
  metadataBase: new URL("https://expressprinter.vercel.app"),
  openGraph: {
    title: "Express Printer | Imprenta online",
    description:
      "Tarjetas, stickers, pendones, afiches, talonarios y papeleria comercial con pedidos online.",
    siteName: "Express Printer",
    type: "website",
    locale: "es_VE",
  },
  icons: {
    icon: "/favicon-x.webp",
    shortcut: "/favicon-x.webp",
    apple: "/favicon-x.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
