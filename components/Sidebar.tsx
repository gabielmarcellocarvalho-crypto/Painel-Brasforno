"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PAPEL_LABEL, Papel, Sessao } from "@/lib/types";
import {
  podeCriarPropostas,
  podeGerenciarCatalogo,
  podeGerenciarUsuarios,
} from "@/lib/permissoes";
import { iniciais } from "@/lib/utils";
import {
  IconBookOpen,
  IconDashboard,
  IconFilePlus,
  IconGraduation,
  IconLogOut,
  IconUsers,
} from "./Icons";

type ItemNav = {
  href: string;
  rotulo: string;
  Icone: typeof IconDashboard;
  visivel: (papel: Papel) => boolean;
};

const NAV: ItemNav[] = [
  { href: "/", rotulo: "Painel", Icone: IconDashboard, visivel: () => true },
  { href: "/nova", rotulo: "Nova Proposta", Icone: IconFilePlus, visivel: podeCriarPropostas },
  { href: "/catalogo", rotulo: "Catálogo de Produtos", Icone: IconBookOpen, visivel: () => true },
  { href: "/usuarios", rotulo: "Usuários", Icone: IconUsers, visivel: podeGerenciarUsuarios },
  { href: "/manual", rotulo: "Manual", Icone: IconGraduation, visivel: () => true },
];

function estaAtivo(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function Sidebar({ sessao }: { sessao: Sessao }) {
  const pathname = usePathname();
  const router = useRouter();

  const itens = NAV.filter((n) => n.visivel(sessao.papel)).map((n, i) => ({
    ...n,
    codigo: String(i + 1).padStart(2, "0"),
  }));

  async function sair() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  const corPapel =
    sessao.papel === "admin"
      ? "text-ember-300"
      : sessao.papel === "gestor"
        ? "text-emerald-300"
        : "text-steel-300";

  return (
    <>
      {/* Desktop */}
      <aside className="no-print blueprint-dark sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between md:flex">
        <div className="min-h-0 overflow-y-auto">
          <div className="border-b border-white/8 px-5 pb-6 pt-8">
            <Image src="/brasforno-logo.png" alt="Brasforno" width={168} height={26} priority />
            <p className="tech-label mt-5 text-steel-300">Central de Propostas</p>
          </div>

          <nav className="mt-5 flex flex-col gap-0.5 px-3" aria-label="Navegação principal">
            {itens.map(({ href, rotulo, codigo, Icone }) => {
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

        {/* Usuário logado */}
        <div className="shrink-0 px-5 pb-5">
          <div className="hazard h-1 w-full opacity-70" aria-hidden />
          <div className="flex items-center gap-3 pt-4">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-steel-600 font-mono text-xs font-bold text-white"
              aria-hidden
            >
              {iniciais(sessao.nome)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{sessao.nome}</p>
              <p className={`tech-label mt-0.5 truncate ${corPapel}`}>
                {PAPEL_LABEL[sessao.papel]}
              </p>
            </div>
          </div>
          <button
            onClick={sair}
            className="mt-3 flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-white/10 text-xs font-medium text-steel-300 transition-colors duration-200 hover:border-ember-500/50 hover:bg-ember-500/10 hover:text-ember-300"
          >
            <IconLogOut size={14} />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile — barra superior */}
      <header className="no-print blueprint-dark fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-2 border-b-2 border-ember-500 px-3 py-2 md:hidden">
        <Image src="/brasforno-logo.png" alt="Brasforno" width={100} height={16} />
        <nav className="flex gap-0.5" aria-label="Navegação principal">
          {itens.map(({ href, rotulo, Icone }) => {
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
                <Icone size={18} />
              </Link>
            );
          })}
          <button
            onClick={sair}
            aria-label="Sair"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-sm text-steel-300 transition-colors duration-200 hover:bg-white/10"
          >
            <IconLogOut size={18} />
          </button>
        </nav>
      </header>
    </>
  );
}
