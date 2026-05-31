import type { Metadata } from "next";
import { NotesProvider } from "@/context/NotesContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "DIPA Notes App - Sistem Catatan Internal Terintegrasi",
  description: "Sistem manajemen catatan harian internal Keep-like yang ringkas, aman, dan dinamis, terintegrasi penuh dengan API Laravel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <NotesProvider>
          {children}
        </NotesProvider>
      </body>
    </html>
  );
}

