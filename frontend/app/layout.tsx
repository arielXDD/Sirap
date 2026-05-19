import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "./components/Toaster";

export const metadata: Metadata = {
  title: "SIRAP - Sistema Integral de Registro de Asistencia de Personal",
  description: "Sistema de Control de Asistencia de Personal con NFC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
