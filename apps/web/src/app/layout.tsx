import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SessionProvider } from "@/components/providers/session-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GrantBR - Automação Inteligente de Grants",
  description:
    "Plataforma enterprise de automação para captação de recursos via grants, subvenções e editais públicos.",
  keywords: [
    "grants",
    "financiamento",
    "FINEP",
    "FAPESP",
    "EMBRAPII",
    "inovação",
    "P&D",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn(inter.className, "antialiased")}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
