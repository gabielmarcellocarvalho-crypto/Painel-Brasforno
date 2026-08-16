"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Proposta, StatusAprovacaoCliente } from "@/lib/types";
import {
  APROVACAO_CLIENTE_LABEL,
  APROVACAO_INTERNA_LABEL,
  MOTIVOS_RECUSA,
  formatarData,
} from "@/lib/utils";
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconThumbsDown,
  IconThumbsUp,
  IconX,
} from "./Icons";

/**
 * Dois controles distintos, empilhados sob a barra de ações:
 *   1. Aprovação interna — só gestão/admin veem os botões (desconto acima do
 *      limite trava o envio até a liberação).
 *   2. Resultado do cliente — quem toca a venda registra o desfecho.
 */
export default function PainelAprovacao({
  proposta,
  podeAprovar,
}: {
  proposta: Proposta;
  podeAprovar: boolean;
}) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [pedindoMotivo, setPedindoMotivo] = useState(false);
  const [motivo, setMotivo] = useState(MOTIVOS_RECUSA[0]);
  const [motivoLivre, setMotivoLivre] = useState("");
  const [observacaoGestor, setObservacaoGestor] = useState("");
  const [reprovando, setReprovando] = useState(false);

  const interna = proposta.aprovacaoInterna ?? { status: "nao_requer" as const };
  const cliente = proposta.aprovacaoCliente ?? { status: "pendente" as const };

  async function enviar(corpo: Record<string, unknown>) {
    setSalvando(true);
    setErro("");
    try {
      const resp = await fetch(`/api/propostas/${proposta.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || "Não foi possível salvar.");
      setPedindoMotivo(false);
      setReprovando(false);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setSalvando(false);
    }
  }

  function registrarCliente(status: StatusAprovacaoCliente) {
    if (status === "nao_aprovada") {
      setPedindoMotivo(true);
      return;
    }
    enviar({ aprovacaoCliente: { status } });
  }

  function confirmarRecusa() {
    const texto = motivo === "Outro" ? motivoLivre.trim() : motivo;
    if (!texto) {
      setErro("Descreva o motivo da recusa.");
      return;
    }
    enviar({ aprovacaoCliente: { status: "nao_aprovada", motivo: texto } });
  }

  const botao =
    "flex h-8 cursor-pointer items-center gap-1.5 rounded-sm px-3 text-xs font-bold transition-colors duration-200 disabled:cursor-wait disabled:opacity-60";

  return (
    <div className="border-t border-white/10 bg-steel-950/60">
      <div className="mx-auto max-w-[860px] space-y-2.5 px-4 py-3 md:px-6">
        {erro && (
          <p role="alert" className="text-xs font-medium text-ember-300">
            {erro}
          </p>
        )}

        {/* ── Aprovação interna ─────────────────────────────────────── */}
        {interna.status !== "nao_requer" && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="tech-label text-steel-500">Gestão</span>

            {interna.status === "pendente" && (
              <span className="flex items-center gap-1.5 rounded-sm bg-amber-400/15 px-2.5 py-1 text-xs font-bold text-amber-300">
                <IconClock size={13} />
                {APROVACAO_INTERNA_LABEL.pendente}
              </span>
            )}
            {interna.status === "aprovada" && (
              <span className="flex items-center gap-1.5 rounded-sm bg-emerald-400/15 px-2.5 py-1 text-xs font-bold text-emerald-300">
                <IconCheck size={13} />
                Liberada por {interna.porNome}
                {interna.em && ` · ${formatarData(interna.em)}`}
              </span>
            )}
            {interna.status === "reprovada" && (
              <span className="flex items-center gap-1.5 rounded-sm bg-ember-500/15 px-2.5 py-1 text-xs font-bold text-ember-300">
                <IconAlertTriangle size={13} />
                Reprovada por {interna.porNome}
                {interna.observacao && ` · ${interna.observacao}`}
              </span>
            )}

            {podeAprovar && interna.status !== "aprovada" && (
              <button
                onClick={() => enviar({ aprovacaoInterna: { status: "aprovada" } })}
                disabled={salvando}
                className={`${botao} bg-emerald-500 text-white hover:bg-emerald-400`}
              >
                <IconCheck size={13} />
                Liberar envio
              </button>
            )}
            {podeAprovar && interna.status !== "reprovada" && !reprovando && (
              <button
                onClick={() => setReprovando(true)}
                disabled={salvando}
                className={`${botao} border border-white/15 text-steel-200 hover:bg-white/10`}
              >
                <IconX size={13} />
                Reprovar
              </button>
            )}

            {reprovando && (
              <div className="flex w-full flex-wrap items-center gap-2">
                <input
                  value={observacaoGestor}
                  onChange={(e) => setObservacaoGestor(e.target.value)}
                  placeholder="Motivo da reprovação (ex.: desconto acima da alçada)"
                  className="h-8 min-w-[240px] flex-1 rounded-sm border border-white/15 bg-white/5 px-2.5 text-xs text-white placeholder:text-steel-500 outline-none focus:border-ember-500"
                />
                <button
                  onClick={() =>
                    enviar({
                      aprovacaoInterna: { status: "reprovada", observacao: observacaoGestor },
                    })
                  }
                  disabled={salvando}
                  className={`${botao} bg-ember-500 text-white hover:bg-ember-600`}
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setReprovando(false)}
                  className={`${botao} text-steel-400 hover:text-white`}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Resultado do cliente ──────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="tech-label text-steel-500">Cliente</span>

          {cliente.status === "pendente" && (
            <span className="flex items-center gap-1.5 rounded-sm bg-white/5 px-2.5 py-1 text-xs font-medium text-steel-300">
              <IconClock size={13} />
              {APROVACAO_CLIENTE_LABEL.pendente}
            </span>
          )}
          {cliente.status === "aprovada" && (
            <span className="flex items-center gap-1.5 rounded-sm bg-emerald-400/15 px-2.5 py-1 text-xs font-bold text-emerald-300">
              <IconThumbsUp size={13} />
              Aprovada{cliente.em && ` em ${formatarData(cliente.em)}`}
            </span>
          )}
          {cliente.status === "nao_aprovada" && (
            <span className="flex items-center gap-1.5 rounded-sm bg-ember-500/15 px-2.5 py-1 text-xs font-bold text-ember-300">
              <IconThumbsDown size={13} />
              Não aprovada{cliente.motivo && ` · ${cliente.motivo}`}
            </span>
          )}

          {!pedindoMotivo && (
            <>
              {cliente.status !== "aprovada" && (
                <button
                  onClick={() => registrarCliente("aprovada")}
                  disabled={salvando}
                  className={`${botao} bg-emerald-500 text-white hover:bg-emerald-400`}
                >
                  <IconThumbsUp size={13} />
                  Cliente aprovou
                </button>
              )}
              {cliente.status !== "nao_aprovada" && (
                <button
                  onClick={() => registrarCliente("nao_aprovada")}
                  disabled={salvando}
                  className={`${botao} border border-white/15 text-steel-200 hover:bg-white/10`}
                >
                  <IconThumbsDown size={13} />
                  Não aprovou
                </button>
              )}
              {cliente.status !== "pendente" && (
                <button
                  onClick={() => enviar({ aprovacaoCliente: { status: "pendente" } })}
                  disabled={salvando}
                  className={`${botao} text-steel-400 hover:text-white`}
                >
                  Voltar para negociação
                </button>
              )}
            </>
          )}

          {pedindoMotivo && (
            <div className="flex w-full flex-wrap items-center gap-2">
              <select
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="h-8 cursor-pointer rounded-sm border border-white/15 bg-steel-900 px-2.5 text-xs text-white outline-none focus:border-ember-500"
              >
                {MOTIVOS_RECUSA.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              {motivo === "Outro" && (
                <input
                  value={motivoLivre}
                  onChange={(e) => setMotivoLivre(e.target.value)}
                  placeholder="Qual foi o motivo?"
                  className="h-8 min-w-[200px] flex-1 rounded-sm border border-white/15 bg-white/5 px-2.5 text-xs text-white placeholder:text-steel-500 outline-none focus:border-ember-500"
                />
              )}
              <button
                onClick={confirmarRecusa}
                disabled={salvando}
                className={`${botao} bg-ember-500 text-white hover:bg-ember-600`}
              >
                Registrar recusa
              </button>
              <button
                onClick={() => setPedindoMotivo(false)}
                className={`${botao} text-steel-400 hover:text-white`}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
