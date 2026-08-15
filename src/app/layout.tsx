import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Worldlike",
  description: "Juegos roguelite por turnos",
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
