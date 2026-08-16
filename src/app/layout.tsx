import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Futbolike — Roguelite de fútbol por turnos",
  description:
    "Arrancá en el potrero, reclutá jugadores reales, ganá 9 copas y convertite en leyenda. 300 jugadores, combate por turnos, mapa procedural.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Futbolike",
    description: "Roguelite de fútbol por turnos. De potrero a leyenda.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Futbolike",
    description: "Roguelite de fútbol por turnos. De potrero a leyenda.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-bg antialiased">{children}</body>
    </html>
  );
}
