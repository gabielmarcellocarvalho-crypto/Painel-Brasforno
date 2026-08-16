"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PAPEL_DESCRICAO, PAPEL_LABEL, Papel, UsuarioPublico } from "@/lib/types";
import { formatarData, iniciais } from "@/lib/utils";
import {
  IconAlertTriangle,
  IconLock,
  IconPencil,
  IconPlus,
  IconTrash,
  IconX,
} from "./Icons";

const inputCls =
  "h-11 w-full rounded-sm border border-steel-200 bg-white px-3 text-sm outline-none transition-colors duration-200 focus:border-steel-600 focus:ring-2 focus:ring-steel-600/15";
const labelCls = "tech-label mb-1.5 block text-steel-600";

const PAPEIS: Papel[] = ["representante", "gestor", "admin"];

type Rascunho = {
  id?: string;
  nome: string;
  login: string;
  senha: string;
  papel: Papel;
  telefone: string;
  ativo: boolean;
};

function vazio(): Rascunho {
  return { nome: "", login: "", senha: "", papel: "representante", telefone: "", ativo: true };
}

export default function GerenciadorUsuarios({
  usuariosIniciais,
  meuId,
}: {
  usuariosIniciais: UsuarioPublico[];
  meuId: string;
}) {
  const router = useRouter();
  const [rascunho, setRascunho] = useState<Rascunho | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null);

  const editando = Boolean(rascunho?.id);

  async function salvar() {
    if (!rascunho) return;
    if (!rascunho.nome.trim()) return setErro("Informe o nome.");
    if (!rascunho.login.trim()) return setErro("Informe o login.");
    if (!editando && rascunho.senha.length < 8) {
      return setErro("A senha precisa ter pelo menos 8 caracteres.");
    }
    if (editando && rascunho.senha && rascunho.senha.length < 8) {
      return setErro("A nova senha precisa ter pelo menos 8 caracteres.");
    }

    setSalvando(true);
    setErro("");
    try {
      // Na edição, senha em branco significa "manter a atual".
      const corpo: Record<string, unknown> = {
        nome: rascunho.nome,
        login: rascunho.login,
        papel: rascunho.papel,
        telefone: rascunho.telefone,
        ativo: rascunho.ativo,
      };
      if (rascunho.senha) corpo.senha = rascunho.senha;

      const resp = await fetch(
        rascunho.id ? `/api/usuarios/${rascunho.id}` : "/api/usuarios",
        {
          method: rascunho.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(corpo),
        }
      );
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || "Erro ao salvar.");

      setRascunho(null);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setSalvando(false);
    }
  }

  async function alternarAtivo(u: UsuarioPublico) {
    setErro("");
    const resp = await fetch(`/api/usuarios/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !u.ativo }),
    });
    if (!resp.ok) {
      const dados = await resp.json();
      setErro(dados.erro || "Erro ao alterar o usuário.");
      return;
    }
    router.refresh();
  }

  async function excluir(id: string) {
    setErro("");
    setSalvando(true);
    try {
      const resp = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
      if (!resp.ok) {
        const dados = await resp.json();
        setErro(dados.erro || "Erro ao excluir.");
      }
      setConfirmandoExclusao(null);
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="max-w-5xl px-4 py-8 md:px-6 lg:px-10">
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="tech-label text-steel-500">Controle de acesso</p>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-steel-900 md:text-4xl">
            Usuários
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-steel-600">
            Cada representante entra com o próprio login e enxerga apenas as propostas
            que criou. Diretoria e gestão acompanham tudo.
          </p>
        </div>
        <button
          onClick={() => {
            setRascunho(vazio());
            setErro("");
          }}
          className="flex h-11 cursor-pointer items-center gap-2 rounded-sm bg-ember-500 px-5 text-sm font-bold text-white transition-colors duration-200 hover:bg-ember-600"
        >
          <IconPlus size={16} />
          Novo Usuário
        </button>
      </header>

      {erro && !rascunho && (
        <div
          role="alert"
          className="mt-5 flex items-center gap-2.5 border-l-2 border-ember-500 bg-ember-100 px-4 py-3 text-sm font-medium text-ember-700"
        >
          <IconAlertTriangle size={16} className="shrink-0" />
          {erro}
        </div>
      )}

      {/* Legenda dos perfis */}
      <section className="rise rise-2 mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {PAPEIS.map((p) => (
          <div key={p} className="panel border-t-2 border-steel-600 p-4">
            <p className="tech-label text-steel-500">{PAPEL_LABEL[p]}</p>
            <p className="mt-2 text-xs leading-relaxed text-steel-600">
              {PAPEL_DESCRICAO[p]}
            </p>
          </div>
        ))}
      </section>

      <section className="rise rise-3 panel mt-5 overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="bg-steel-900 text-left text-white">
              <th className="tech-label px-4 py-3.5 font-normal text-steel-300">Nome</th>
              <th className="tech-label px-4 py-3.5 font-normal text-steel-300">Login</th>
              <th className="tech-label px-4 py-3.5 font-normal text-steel-300">Perfil</th>
              <th className="tech-label px-4 py-3.5 font-normal text-steel-300">Último acesso</th>
              <th className="tech-label px-4 py-3.5 font-normal text-steel-300">Situação</th>
              <th className="tech-label px-4 py-3.5 font-normal text-steel-300">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {usuariosIniciais.map((u) => (
              <tr
                key={u.id}
                className={`border-b border-steel-100 last:border-b-0 hover:bg-steel-50 ${
                  u.ativo ? "" : "opacity-55"
                }`}
              >
                <td className="px-4 py-3.5">
                  <span className="flex items-center gap-2.5">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-steel-100 font-mono text-[0.62rem] font-bold text-steel-600"
                      aria-hidden
                    >
                      {iniciais(u.nome)}
                    </span>
                    <span className="font-medium text-steel-900">
                      {u.nome}
                      {u.id === meuId && (
                        <span className="ml-1.5 font-mono text-[0.6rem] uppercase text-ember-600">
                          você
                        </span>
                      )}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-steel-600">{u.login}</td>
                <td className="px-4 py-3.5">
                  <span
                    className={`rounded-sm px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide ${
                      u.papel === "admin"
                        ? "bg-ember-100 text-ember-700"
                        : u.papel === "gestor"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-steel-100 text-steel-700"
                    }`}
                  >
                    {PAPEL_LABEL[u.papel]}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-steel-500">
                  {u.ultimoAcesso ? formatarData(u.ultimoAcesso) : "nunca"}
                </td>
                <td className="px-4 py-3.5">
                  <button
                    onClick={() => alternarAtivo(u)}
                    disabled={u.id === meuId}
                    title={u.id === meuId ? "Você não pode desativar a si mesmo." : undefined}
                    className={`cursor-pointer rounded-sm px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                      u.ativo
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-ink/8 text-ink/50 hover:bg-ink/15"
                    }`}
                  >
                    {u.ativo ? "Ativo" : "Inativo"}
                  </button>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => {
                        setRascunho({
                          id: u.id,
                          nome: u.nome,
                          login: u.login,
                          senha: "",
                          papel: u.papel,
                          telefone: u.telefone || "",
                          ativo: u.ativo,
                        });
                        setErro("");
                      }}
                      aria-label={`Editar ${u.nome}`}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm text-steel-400 transition-colors duration-150 hover:bg-steel-100 hover:text-steel-700"
                    >
                      <IconPencil size={14} />
                    </button>
                    {confirmandoExclusao === u.id ? (
                      <>
                        <button
                          onClick={() => excluir(u.id)}
                          disabled={salvando}
                          className="flex h-8 cursor-pointer items-center rounded-sm bg-ember-500 px-2.5 text-[0.68rem] font-bold text-white hover:bg-ember-600"
                        >
                          Excluir
                        </button>
                        <button
                          onClick={() => setConfirmandoExclusao(null)}
                          aria-label="Cancelar"
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm border border-steel-200 text-steel-500"
                        >
                          <IconX size={13} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmandoExclusao(u.id)}
                        disabled={u.id === meuId}
                        aria-label={`Excluir ${u.nome}`}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm text-steel-400 transition-colors duration-150 hover:bg-ember-100 hover:text-ember-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <IconTrash size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Formulário */}
      {rascunho && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={editando ? "Editar usuário" : "Novo usuário"}
        >
          <div className="panel my-8 w-full max-w-lg">
            <div className="hazard h-1.5 w-full" aria-hidden />
            <div className="flex items-center justify-between gap-3 border-b border-steel-100 px-6 py-4">
              <h2 className="text-lg font-bold text-steel-900">
                {editando ? "Editar usuário" : "Novo usuário"}
              </h2>
              <button
                onClick={() => setRascunho(null)}
                aria-label="Fechar"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm text-steel-400 hover:bg-steel-100"
              >
                <IconX size={17} />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              {erro && (
                <div
                  role="alert"
                  className="border-l-2 border-ember-500 bg-ember-100 px-4 py-3 text-sm font-medium text-ember-700"
                >
                  {erro}
                </div>
              )}

              <div>
                <label className={labelCls} htmlFor="u-nome">Nome completo *</label>
                <input
                  id="u-nome"
                  className={inputCls}
                  value={rascunho.nome}
                  onChange={(e) => setRascunho({ ...rascunho, nome: e.target.value })}
                  placeholder="Ex.: Edson Ferreira"
                />
                <p className="mt-1.5 text-xs text-steel-500">
                  É o nome que aparece como &quot;Vendedor&quot; no orçamento.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls} htmlFor="u-login">Login (e-mail) *</label>
                  <input
                    id="u-login"
                    className={inputCls}
                    value={rascunho.login}
                    onChange={(e) => setRascunho({ ...rascunho, login: e.target.value })}
                    placeholder="edson@brasforno.com.br"
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="u-telefone">Telefone</label>
                  <input
                    id="u-telefone"
                    className={inputCls}
                    value={rascunho.telefone}
                    onChange={(e) => setRascunho({ ...rascunho, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls} htmlFor="u-senha">
                  {editando ? "Nova senha (deixe em branco para manter)" : "Senha *"}
                </label>
                <div className="relative">
                  <IconLock
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel-400"
                  />
                  <input
                    id="u-senha"
                    type="password"
                    className={`${inputCls} pl-9`}
                    value={rascunho.senha}
                    onChange={(e) => setRascunho({ ...rascunho, senha: e.target.value })}
                    placeholder="Mínimo de 8 caracteres"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls} htmlFor="u-papel">Perfil de acesso *</label>
                <select
                  id="u-papel"
                  className={`${inputCls} cursor-pointer`}
                  value={rascunho.papel}
                  onChange={(e) =>
                    setRascunho({ ...rascunho, papel: e.target.value as Papel })
                  }
                >
                  {PAPEIS.map((p) => (
                    <option key={p} value={p}>
                      {PAPEL_LABEL[p]}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs leading-relaxed text-steel-500">
                  {PAPEL_DESCRICAO[rascunho.papel]}
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-steel-700">
                <input
                  type="checkbox"
                  checked={rascunho.ativo}
                  onChange={(e) => setRascunho({ ...rascunho, ativo: e.target.checked })}
                  className="h-4 w-4 cursor-pointer accent-steel-600"
                />
                Usuário ativo (pode entrar no sistema)
              </label>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-steel-100 px-6 py-4">
              <button
                onClick={() => setRascunho(null)}
                className="flex h-11 cursor-pointer items-center rounded-sm border border-steel-300 bg-white px-4 text-sm font-medium text-steel-600 hover:bg-steel-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando}
                className="flex h-11 cursor-pointer items-center rounded-sm bg-ember-500 px-6 text-sm font-bold text-white transition-colors duration-200 hover:bg-ember-600 disabled:cursor-wait disabled:opacity-60"
              >
                {salvando ? "Salvando…" : "Salvar usuário"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
