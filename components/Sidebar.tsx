"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBookOpen,
  IconDashboard,
  IconExternalLink,
  IconFilePlus,
  IconGraduation,
} from "./Icons";

const NAV = [
  { href: "/", rotulo: "Painel", codigo: "01", Icone: IconDashboard },
  { href: "/nova", rotulo: "Nova Proposta", codigo: "02", Icone: IconFilePlus },
  { href: "/catalogo", rotulo: "Catálogo & Templates", codigo: "03", Icone: IconBookOpen },
  { href: "/manual", rotulo: "Manual do Representante", codigo: "04", Icone: IconGraduation },
];

function estaAtivo(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop */}
      <aside className="no-print blueprint-dark sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between md:flex">
        <div>
          <div className="border-b border-white/8 px-5 pb-6 pt-8">
            <Image
              src="/brasforno-logo.png"
              alt="Brasforno"
              width={168}
              height={26}
              priority
            />
            <p className="tech-label mt-5 text-steel-300">Central de Propostas</p>
          </div>

          <nav className="mt-5 flex flex-col gap-0.5 px-3" aria-label="Navegação principal">
            {NAV.map(({ href, rotulo, codigo, Icone }) => {
              const ativo = estaAtivo(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={ativo ? "page" : undefined}
                  className={`group relative flex items-center gap-3 rounded-sm px-3 py-3 transition-colors duration-200 ${
                    ativo
                      ? "bg-steel-600/90 text-white"
                      : "text-steel-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span
                    className={`absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full transition-colors duration-200 ${
                      ativo ? "bg-ember-400" : "bg-transparent group-hover:bg-steel-500"
                    }`}
                    aria-hidden
                  />
                  <Icone
                    size={17}
                    className={ativo ? "text-ember-300" : "text-steel-400 group-hover:text-steel-200"}
                  />
                  <span className="text-sm font-medium">{rotulo}</span>
                  <span
                    className={`ml-auto font-mono text-[0.6rem] ${
                      ativo ? "text-white/50" : "text-steel-600"
                    }`}
                  >
                    {codigo}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-5 pb-5">
          <div className="hazard h-1 w-full opacity-70" aria-hidden />
          <div className="pt-4 text-steel-400">
            <p className="tech-label">Santana do Parnaíba – SP</p>
            <p className="tech-label mt-1">+150 modelos · garantia 1 ano</p>
            <a
              href="https://brasforno.com.br"
              target="_blank"
              rel="noreferrer"
              className="tech-label mt-3 inline-flex items-center gap-1.5 text-ember-400 transition-colors duration-200 hover:text-ember-300"
            >
              brasforno.com.br
              <IconExternalLink size={11} />
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile — barra superior */}
      <header className="no-print blueprint-dark fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-2 border-b-2 border-ember-500 px-3 py-2 md:hidden">
        <Image src="/brasforno-logo.png" alt="Brasforno" width={112} height={18} />
        <nav className="flex gap-1" aria-label="Navegação principal">
          {NAV.map(({ href, rotulo, Icone }) => {
            const ativo = estaAtivo(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-label={rotulo}
                aria-current={ativo ? "page" : undefined}
                className={`flex h-11 w-11 items-center justify-center rounded-sm transition-colors duration-200 ${
                  ativo ? "bg-steel-600 text-ember-300" : "text-steel-300 hover:bg-white/10"
                }`}
              >
                <Icone size={19} />
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
