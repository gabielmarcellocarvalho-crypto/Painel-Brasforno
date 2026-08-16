"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Papel, Proposta } from "@/lib/types";
import { podeAprovarInternamente } from "@/lib/permissoes";
import { linkWhatsApp } from "@/lib/utils";
import { IconChevronLeft, IconPrinter, IconSend } from "./Icons";
import PainelAprovacao from "./PainelAprovacao";

export default function BarraAcoes({
  proposta,
  papel,
}: {
  proposta: Proposta;
  papel: Papel;
}) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);

  const bloqueadaPorAprovacao =
    proposta.aprovacaoInterna?.status === "pendente" ||
    proposta.aprovacaoInterna?.status === "reprovada";

  async function enviarWhatsApp() {
    setEnviando(true);
    const url = `${window.location.origin}/proposta/${proposta.id}`;
    window.open(linkWhatsApp(proposta, url), "_blank");

    if (proposta.status === "rascunho") {
      await fetch(`/api/propostas/${proposta.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "enviada" }),
      });
      router.refresh();
    }
    setEnviando(false);
  }

  return (
    <div className="no-print sticky top-[60px] z-40 border-b border-white/10 bg-steel-900/95 backdrop-blur md:top-0">
      <div className="mx-auto flex max-w-[860px] flex-wrap items-center gap-2.5 px-4 py-2.5 md:px-6">
        <Link
          href="/"
          className="flex h-9 items-center gap-1 rounded-sm px-2 font-mono text-xs text-steel-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
        >
          <IconChevronLeft size={14} />
          Painel
        </Link>
        <span className="hidden h-4 w-px bg-white/15 sm:block" aria-hidden />
        <span className="font-mono text-sm font-bold text-white">Nº {proposta.numero}</span>

        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-sm border border-white/15 px-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10"
          >
            <IconPrinter size={15} />
            <span className="hidden sm:inline">Imprimir / PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>

          <button
            onClick={enviarWhatsApp}
            disabled={enviando || bloqueadaPorAprovacao}
            title={
              bloqueadaPorAprovacao
                ? "Esta proposta precisa da liberação da gestão antes de ir ao cliente."
                : undefined
            }
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-sm bg-emerald-500 px-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-steel-600 disabled:text-steel-300"
          >
            <IconSend size={15} />
            <span className="hidden sm:inline">Enviar via WhatsApp</span>
            <span className="sm:hidden">Enviar</span>
          </button>
        </div>
      </div>

      <PainelAprovacao
        proposta={proposta}
        podeAprovar={podeAprovarInternamente(papel)}
      />
    </div>
  );
}
