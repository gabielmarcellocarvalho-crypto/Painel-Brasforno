import type { Metadata } from "next";
import { Ubuntu, Ubuntu_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${ubuntu.variable} ${ubuntuMono.variable} antialiased grain`}
      >
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 blueprint-bg min-w-0 pt-[60px] md:pt-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
