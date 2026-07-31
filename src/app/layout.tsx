import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import { NOME_PRODUTO } from "@/lib/produto";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: NOME_PRODUTO,
  description: "Comunidade dos builders da Dev em Dobro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${dmSans.variable} ${outfit.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
