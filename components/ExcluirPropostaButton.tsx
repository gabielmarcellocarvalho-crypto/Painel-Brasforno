"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconTrash, IconX } from "./Icons";

export default function ExcluirPropostaButton({
  propostaId,
  numero,
}: {
  propostaId: string;
  numero: string;
}) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function armar() {
    setConfirmando(true);
    timeoutRef.current = setTimeout(() => setConfirmando(false), 4000);
  }

  function cancelar() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setConfirmando(false);
  }

  async function confirmar() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setExcluindo(true);
    try {
      await fetch(`/api/propostas/${propostaId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setExcluindo(false);
      setConfirmando(false);
    }
  }

  if (confirmando) {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <span className="tech-label hidden text-ember-600 sm:inline">Excluir?</span>
        <button
          onClick={confirmar}
          disabled={excluindo}
          aria-label={`Confirmar exclusão da proposta ${numero}`}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm bg-ember-500 text-white transition-colors duration-150 hover:bg-ember-600 disabled:cursor-wait disabled:opacity-70"
        >
          <IconCheck size={14} />
        </button>
        <button
          onClick={cancelar}
          disabled={excluindo}
          aria-label="Cancelar exclusão"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm border border-steel-200 text-steel-500 transition-colors duration-150 hover:bg-steel-100"
        >
          <IconX size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <button
        onClick={armar}
        aria-label={`Excluir proposta ${numero}`}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm text-steel-400 transition-colors duration-150 hover:bg-ember-100 hover:text-ember-600"
      >
        <IconTrash size={15} />
      </button>
    </div>
  );
}
