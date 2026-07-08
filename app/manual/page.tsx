import Link from "next/link";
import { IconArrowRight, IconBookOpen, IconCheck, IconFlame } from "@/components/Icons";

const PASSOS = [
  {
    titulo: "Receba o interesse do cliente",
    texto:
      "O cliente chega pelo WhatsApp, telefone, feira ou indicação. NÃO envie apenas o preço solto no WhatsApp — esse é exatamente o hábito que a proposta padronizada substitui.",
  },
  {
    titulo: "Abra a plataforma e clique em “Nova Proposta”",
    texto:
      "Preencha os dados do cliente: nome, empresa, WhatsApp com DDD, cidade/UF e segmento. Esses dados ficam centralizados e nunca mais se perdem em conversas soltas.",
  },
  {
    titulo: "Selecione os equipamentos",
    texto:
      "Escolha a categoria (Fornos, Amassadeiras…), o equipamento e o modelo/tamanho. O texto comercial, as especificações e os diferenciais entram sozinhos na proposta — você só informa quantidade e preço da tabela vigente.",
  },
  {
    titulo: "Defina as condições comerciais",
    texto:
      "Validade, prazo de entrega, frete (CIF/FOB), forma de pagamento e desconto. Lembre-se: desconto acima de 10% exige aprovação do gerente comercial.",
  },
  {
    titulo: "Revise e gere a proposta",
    texto:
      "Confira tudo na tela de revisão e clique em “Gerar Proposta”. A proposta recebe um número único (BF-ANO-XXXX) e fica registrada no painel.",
  },
  {
    titulo: "Envie ao cliente",
    texto:
      "Use o botão “Enviar via WhatsApp” — a mensagem sai formatada com os equipamentos e o link. Para enviar em PDF, clique em “Imprimir / PDF” e escolha “Salvar como PDF”. Ao enviar, o status muda automaticamente para “Enviada”.",
  },
  {
    titulo: "Acompanhe no painel",
    texto:
      "Atualize o status conforme a negociação evolui: Enviada → Em negociação → Ganha ou Perdida. O painel mostra o valor total em negociação e as vendas ganhas do time.",
  },
];

const BOAS_PRATICAS = [
  "Responda o interesse do cliente em até 2 horas úteis — proposta rápida fecha mais.",
  "Sempre reforce os diferenciais que já vêm no template: economia de até 40% (ROTOR), garantia de 1 ano de fábrica, entrega nacional.",
  "Registre TODA proposta na plataforma, mesmo as pequenas. Sem registro, o time não enxerga o funil.",
  "Faça follow-up 2 dias após o envio. Use o painel para ver o que está parado em “Enviada”.",
  "Perdeu a venda? Marque “Perdida” e anote o motivo nas observações — isso vira inteligência comercial.",
];

export default function Manual() {
  return (
    <div className="max-w-3xl px-4 py-8 md:px-6 lg:px-10">
      <header className="rise">
        <p className="tech-label text-steel-500">Treinamento do fluxo novo</p>
        <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-steel-900 md:text-4xl">
          Manual do Representante
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-steel-600">
          O fluxo padrão de proposta em 7 passos. Objetivo: todo cliente recebe
          material profissional — nunca mais “só o preço no WhatsApp”.
        </p>
      </header>

      <ol className="mt-8 space-y-3.5">
        {PASSOS.map((p, i) => (
          <li
            key={p.titulo}
            className={`rise rise-${Math.min(i + 1, 5)} panel panel-hover relative flex gap-5 overflow-hidden p-5 md:p-6`}
          >
            <span
              className="absolute inset-y-0 left-0 w-1 bg-steel-600"
              aria-hidden
            />
            <span className="font-mono text-3xl font-bold leading-none text-steel-200 select-none">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h2 className="font-bold leading-snug text-steel-900">{p.titulo}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-steel-600">{p.texto}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="rise rise-5 relative mt-10 overflow-hidden bg-steel-900 p-6 md:p-7">
        <div className="hazard absolute inset-x-0 top-0 h-1.5" aria-hidden />
        <h2 className="tech-label flex items-center gap-2 text-ember-400">
          <IconFlame size={14} />
          Boas práticas do time
        </h2>
        <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-steel-100">
          {BOAS_PRATICAS.map((b) => (
            <li key={b} className="flex items-start gap-2.5">
              <IconCheck size={14} className="mt-0.5 shrink-0 text-ember-400" />
              {b}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/nova"
          className="flex h-11 cursor-pointer items-center gap-2 rounded-sm bg-ember-500 px-5 text-sm font-bold text-white transition-colors duration-200 hover:bg-ember-600"
        >
          Criar minha primeira proposta
          <IconArrowRight size={15} />
        </Link>
        <Link
          href="/catalogo"
          className="flex h-11 cursor-pointer items-center gap-2 rounded-sm border border-steel-600/40 bg-white px-5 text-sm font-medium text-steel-700 transition-colors duration-200 hover:border-steel-600 hover:bg-steel-600 hover:text-white"
        >
          <IconBookOpen size={15} />
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}
