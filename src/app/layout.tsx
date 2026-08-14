import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import { NOME_PRODUTO } from "@/lib/produto";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  preload: true,
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body className={`${dmSans.variable} ${outfit.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
