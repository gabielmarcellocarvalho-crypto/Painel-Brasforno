import type { Metadata } from "next";
import { Ubuntu, Ubuntu_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { sessaoAtual } from "@/lib/auth";

const ubuntu = Ubuntu({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-ubuntu",
});

const ubuntuMono = Ubuntu_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-ubuntu-mono",
});

export const metadata: Metadata = {
  title: "Brasforno · Central de Propostas",
  description:
    "Plataforma interna de geração e centralização de propostas comerciais Brasforno",
  icons: { icon: "/favicon-brasforno.png" },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Login e setup rodam sem sessão — nesses casos a página desenha a tela
  // inteira sozinha, sem a navegação lateral.
  const sessao = await sessaoAtual();

  return (
    <html lang="pt-BR">
      <body className={`${ubuntu.variable} ${ubuntuMono.variable} antialiased grain`}>
        {sessao ? (
          <div className="flex min-h-screen">
            <Sidebar sessao={sessao} />
            <main className="blueprint-bg min-w-0 flex-1 pt-[60px] md:pt-0">
              {children}
            </main>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
