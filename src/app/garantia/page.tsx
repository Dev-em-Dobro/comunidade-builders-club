import type { Metadata } from "next";
import Link from "next/link";
import { PaginaLegal } from "@/components/pagina-legal";
import { NOME_PRODUTO } from "@/lib/produto";
import {
  GARANTIA_RESUMO_CURTO,
  LISTA_GARANTIA,
  VERSAO_GARANTIA,
} from "@/lib/legal/garantia";

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

function dataPorExtenso(versao: string): string {
  const [ano, mes, dia] = versao.split("-");
  const nomeMes = MESES[Number(mes) - 1];
  if (!ano || !dia || !nomeMes) return versao;
  return `${Number(dia)} de ${nomeMes} de ${ano}`;
}

export const metadata: Metadata = {
  title: `Lista da garantia · ${NOME_PRODUTO}`,
  description: GARANTIA_RESUMO_CURTO,
};

export default function GarantiaPage() {
  return (
    <PaginaLegal
      titulo="Lista da garantia (Elite)"
      atualizadoEm={dataPorExtenso(VERSAO_GARANTIA)}
    >
      <p className="rounded-xl border border-border bg-surface/40 px-4 py-3 text-sm text-muted">
        Versão{" "}
        <span className="font-semibold text-foreground">{VERSAO_GARANTIA}</span>
        {" · "}
        Só o plano <strong className="text-foreground">Elite</strong>. O Pro não
        tem garantia de 90 dias.
      </p>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Duas garantias diferentes
        </h2>
        <p>
          <strong>7 dias (CDC):</strong> compra online — você pode desistir em
          até 7 dias e receber o dinheiro de volta, sem justificar. Vale para
          Pro e Elite. É lei; nada nesta página reduz esse direito.
        </p>
        <p>
          <strong>90 dias (régua Elite):</strong> se você{" "}
          <strong>cumprir esta lista</strong> e mesmo assim não fechar um
          cliente, devolvemos <strong>100%</strong>. Se não cumprir, não há
          devolução por essa garantia.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">O princípio</h2>
        <p>
          Se o aluno fez tudo isto e mesmo assim não fechou um cliente, o
          produto falhou e o dinheiro volta. Cada item é algo que{" "}
          <strong>você controla</strong>.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          A lista de execução
        </h2>
        <ol className="list-none space-y-4 pl-0">
          {LISTA_GARANTIA.map((item) => (
            <li
              key={item.numero}
              className="rounded-xl border border-border bg-card/40 px-4 py-3"
            >
              <p className="font-semibold text-foreground">
                <span className="text-accent">{item.numero}.</span> {item.titulo}
              </p>
              <p className="mt-1 text-muted">{item.detalhe}</p>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted">
          No item 7, se o mercado não responder às abordagens, vale o follow-up
          documentado (2 tentativas por lead sem resposta) no lugar das 20
          propostas — porque você controla o envio, não a resposta.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          O que esta garantia não cobre
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Resultado financeiro específico (renda garantida) nunca é
            prometido.
          </li>
          <li>Quem não cumpriu a lista não recebe devolução por esta régua.</li>
          <li>
            Devolução, quando devida, é de 100% — sem descontar acesso usado.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Ciente</h2>
        <p>
          Ao marcar ciente no {NOME_PRODUTO} (ou antes de assinar o Elite em{" "}
          <Link href="/planos" className="text-accent hover:underline">
            Planos
          </Link>
          ), você confirma que leu esta versão da lista. Sem ciente publicado,
          a condição não é exigível — por isso pedimos o registro.
        </p>
      </section>
    </PaginaLegal>
  );
}
