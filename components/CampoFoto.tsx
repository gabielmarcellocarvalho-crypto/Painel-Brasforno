"use client";

import { useRef, useState } from "react";
import { IconImage, IconTrash, IconUpload } from "./Icons";

// Firestore guarda o documento inteiro (limite de 1 MiB), então a foto é
// reduzida no navegador antes de sair daqui: lado maior de 900px, JPEG 82%.
// Na prática isso põe as fotos de equipamento na casa dos 60–120 KB.
const LADO_MAXIMO = 900;
const QUALIDADE = 0.82;

function comprimir(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    leitor.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Arquivo de imagem inválido."));
      img.onload = () => {
        const escala = Math.min(1, LADO_MAXIMO / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Navegador não suporta o redimensionamento."));

        // Fundo branco: PNG com transparência viraria preto no JPEG.
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", QUALIDADE));
      };
      img.src = leitor.result as string;
    };
    leitor.readAsDataURL(arquivo);
  });
}

export default function CampoFoto({
  valor,
  onChange,
  desabilitado,
}: {
  valor: string;
  onChange: (dataUrl: string) => void;
  desabilitado?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState("");
  const [processando, setProcessando] = useState(false);

  async function selecionar(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setErro("");
    setProcessando(true);
    try {
      if (!arquivo.type.startsWith("image/")) {
        throw new Error("Selecione um arquivo de imagem (JPG, PNG ou WebP).");
      }
      onChange(await comprimir(arquivo));
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao processar a imagem.");
    } finally {
      setProcessando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-start gap-4">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-steel-200 bg-steel-50">
          {valor ? (
            // Pode ser data URL do upload ou link externo — <img> serve os dois.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={valor} alt="Foto do produto" className="h-full w-full object-contain" />
          ) : (
            <IconImage size={26} className="text-steel-300" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={desabilitado || processando}
              className="flex h-10 cursor-pointer items-center gap-2 rounded-sm border border-steel-600/50 px-3.5 text-sm font-medium text-steel-700 transition-colors duration-200 hover:border-steel-600 hover:bg-steel-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconUpload size={15} />
              {processando ? "Processando…" : valor ? "Trocar foto" : "Enviar foto"}
            </button>
            {valor && (
              <button
                type="button"
                onClick={() => onChange("")}
                disabled={desabilitado}
                className="flex h-10 cursor-pointer items-center gap-2 rounded-sm border border-steel-200 px-3 text-sm text-steel-500 transition-colors duration-200 hover:border-ember-300 hover:bg-ember-100 hover:text-ember-600"
              >
                <IconTrash size={15} />
                Remover
              </button>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={selecionar}
            className="sr-only"
            tabIndex={-1}
          />

          <p className="mt-2 text-xs leading-relaxed text-steel-500">
            A imagem é reduzida automaticamente antes de salvar. Esta é a foto que
            aparece na ficha do produto dentro do orçamento.
          </p>
          {erro && <p className="mt-1.5 text-xs font-medium text-ember-600">{erro}</p>}
        </div>
      </div>
    </div>
  );
}
