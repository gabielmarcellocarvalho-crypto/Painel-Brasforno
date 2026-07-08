"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusProposta } from "@/lib/types";
import { STATUS_LABEL, STATUS_ORDEM } from "@/lib/utils";
import { IconChevronDown } from "./Icons";

const CORES: Record<StatusProposta, string> = {
  rascunho: "bg-steel-100 text-steel-700 border-steel-300",
  enviada: "bg-steel-600 text-white border-steel-700",
  negociacao: "bg-ember-100 text-ember-700 border-ember-300",
  ganha: "bg-emerald-600 text-white border-emerald-700",
  perdida: "bg-ink/8 text-ink/50 border-ink/15",
};

export default function StatusDropdown({
  propostaId,
  status,
  numero,
  size = "md",
}: {
  propostaId: string;
  status: StatusProposta;
  numero?: string;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [valor, setValor] = useState<StatusProposta>(status);
  const [salvando, setSalvando] = useState(false);

  async function alterarStatus(novo: StatusProposta) {
    if (novo === valor) return;
    setValor(novo);
    setSalvando(true);
    try {
      await fetch(`/api/propostas/${propostaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novo }),
      });
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  const alturaCls = size === "sm" ? "h-8 text-[0.7rem]" : "h-9 text-xs";

  return (
    <div className="relative inline-flex">
      <select
        aria-label={
          numero ? `Alterar status da proposta ${numero}` : "Alterar status da proposta"
        }
        value={valor}
        disabled={salvando}
        onChange={(e) => alterarStatus(e.target.value as StatusProposta)}
        className={`${alturaCls} ${CORES[valor]} cursor-pointer appearance-none rounded-sm border pl-2.5 pr-7 font-mono font-bold uppercase tracking-wider outline-none transition-colors duration-150 hover:brightness-[1.06] disabled:cursor-wait disabled:opacity-70`}
      >
        {STATUS_ORDEM.map((s) => (
          <option key={s} value={s} className="bg-white text-ink">
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <span
        className={`pointer-events-none absolute right-1.5 top-1/2 flex h-3.5 w-3.5 -translate-y-1/2 items-center justify-center`}
        aria-hidden
      >
        <IconChevronDown
          size={13}
          className={
            valor === "enviada" || valor === "ganha"
              ? "text-white/80"
              : "text-current opacity-60"
          }
        />
      </span>
    </div>
  );
}
