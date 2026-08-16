import Link from "next/link";
import { IconArrowRight, IconBookOpen, IconCheck, IconFlame } from "@/components/Icons";

const PASSOS = [
  {
    titulo: "Entre com o seu login",
    texto:
      "Cada representante tem usuário e senha próprios. Você enxerga somente as suas propostas — a diretoria acompanha as de todo o time. Perdeu a senha? Fale com o administrador.",
  },
  {
    titulo: "Receba o interesse do cliente",
    texto:
      "O cliente chega pelo WhatsApp, telefone, feira ou indicação. NÃO envie apenas o preço solto no WhatsApp — esse é exatamente o hábito que o orçamento padronizado substitui.",
  },
  {
    titulo: "Clique em “Nova Proposta” e preencha o cliente",
    texto:
      "Razão social, contato, CNPJ, telefone e endereço de entrega. Quanto mais completo, mais o orçamento fica igual ao que a fábrica emite — e o cliente reconhece o documento.",
  },
  {
    titulo: "Escolha os equipamentos no catálogo",
    texto:
      "Clique no card do equipamento. A foto, o código, o NCM, as características técnicas e o preço de tabela entram sozinhos, direto do cadastro. Você só ajusta quantidade e o valor negociado.",
  },
  {
    titulo: "Defina condições e despesas previstas",
    texto:
      "Condição de pagamento, vencimentos (à vista ou parcelado), prazo de entrega, frete e desconto. Marque as despesas previstas — técnico de montagem, frete, obra civil — dizendo de quem é a conta. Isso evita a discussão depois da venda fechada.",
  },
  {
    titulo: "Revise e gere o orçamento",
    texto:
      "Confira tudo na revisão e clique em “Gerar Orçamento”. Ele recebe um número e fica registrado no painel. Desconto acima de 10% cria a proposta travada até a gestão liberar.",
  },
  {
    titulo: "Envie ao cliente",
    texto:
      "Use “Enviar via WhatsApp” — a mensagem sai formatada com os itens, o total e o link. Para PDF, clique em “Imprimir / PDF” e escolha “Salvar como PDF”. Ao enviar, o status vira “Enviada” sozinho.",
  },
  {
    titulo: "Registre o resultado",
    texto:
      "Quando o cliente decidir, clique em “Cliente aprovou” ou “Não aprovou” — neste caso escolha o motivo. É isso que alimenta a taxa de aprovação do painel e mostra onde o time está perdendo venda.",
  },
];

const BOAS_PRATICAS = [
  "Responda o interesse do cliente em até 2 horas úteis — proposta rápida fecha mais.",
  "Sempre reforce os diferenciais Brasforno: economia de até 40% (ROTOR), garantia de 1 ano de fábrica, entrega nacional.",
  "Registre TODA proposta na plataforma, mesmo as pequenas. Sem registro, o time não enxerga o funil.",
  "Marque as despesas com técnico de montagem já na proposta. É o item que mais gera atrito depois do fechamento.",
  "Faça follow-up 2 dias após o envio. Use a aba “Em aberto” para ver o que está parado.",
  "Perdeu a venda? Registre “Não aprovou” com o motivo real — isso vira inteligência comercial, não boletim de desempenho.",
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
          O fluxo padrão de proposta em 8 passos. Objetivo: todo cliente recebe
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
