"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowRight, IconLock } from "./Icons";

const inputCls =
  "h-12 w-full rounded-sm border border-white/15 bg-white/5 px-3.5 text-sm text-white placeholder:text-steel-500 outline-none transition-colors duration-200 focus:border-ember-500 focus:bg-white/10";
const labelCls = "tech-label mb-2 block text-steel-400";

export default function FormularioAcesso({
  modo,
  destino,
}: {
  modo: "login" | "setup";
  destino?: string;
}) {
  const router = useRouter();
  const ehSetup = modo === "setup";

  const [nome, setNome] = useState("");
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (ehSetup) {
      if (senha.length < 8) return setErro("A senha precisa ter pelo menos 8 caracteres.");
      if (senha !== confirmacao) return setErro("As senhas não conferem.");
    }

    setEnviando(true);
    try {
      const resp = await fetch(ehSetup ? "/api/auth/setup" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ehSetup ? { nome, login, senha } : { login, senha }),
      });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || "Não foi possível entrar.");

      router.replace(destino || "/");
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
      setEnviando(false);
    }
  }

  return (
    <div className="blueprint-dark flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Image src="/brasforno-logo.png" alt="Brasforno" width={196} height={30} priority />
        </div>

        <form
          onSubmit={enviar}
          className="rise mt-8 border border-white/10 bg-steel-950/70 p-7 shadow-panel-lg backdrop-blur md:p-9"
        >
          <div className="hazard -mx-7 -mt-7 mb-7 h-1.5 md:-mx-9 md:-mt-9" aria-hidden />

          <p className="tech-label text-ember-400">Central de Propostas</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">
            {ehSetup ? "Criar administrador" : "Acesso restrito"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-steel-400">
            {ehSetup
              ? "Nenhum usuário cadastrado ainda. Crie a conta de administrador — depois ela cadastra os representantes."
              : "Entre com o usuário e a senha fornecidos pelo administrador."}
          </p>

          {erro && (
            <div
              role="alert"
              className="mt-5 border-l-2 border-ember-500 bg-ember-500/10 px-4 py-3 text-sm font-medium text-ember-300"
            >
              {erro}
            </div>
          )}

          <div className="mt-6 space-y-5">
            {ehSetup && (
              <div>
                <label className={labelCls} htmlFor="nome">Nome completo</label>
                <input
                  id="nome"
                  className={inputCls}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: Maria Silva"
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div>
              <label className={labelCls} htmlFor="login">Login (e-mail)</label>
              <input
                id="login"
                className={inputCls}
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="maria@brasforno.com.br"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
              />
            </div>

            <div>
              <label className={labelCls} htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                className={inputCls}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder={ehSetup ? "Mínimo de 8 caracteres" : "••••••••"}
                autoComplete={ehSetup ? "new-password" : "current-password"}
                required
              />
            </div>

            {ehSetup && (
              <div>
                <label className={labelCls} htmlFor="confirmacao">Confirmar senha</label>
                <input
                  id="confirmacao"
                  type="password"
                  className={inputCls}
                  value={confirmacao}
                  onChange={(e) => setConfirmacao(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="mt-7 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-sm bg-ember-500 text-sm font-bold text-white transition-colors duration-200 hover:bg-ember-600 disabled:cursor-wait disabled:opacity-60"
          >
            {enviando ? (
              ehSetup ? "Criando…" : "Entrando…"
            ) : (
              <>
                {ehSetup ? <IconArrowRight size={16} /> : <IconLock size={16} />}
                {ehSetup ? "Criar e entrar" : "Entrar"}
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center font-mono text-[0.68rem] uppercase tracking-widest text-steel-600">
          Brasforno · Santana do Parnaíba – SP
        </p>
      </div>
    </div>
  );
}
