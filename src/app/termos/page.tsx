// Termos de Uso — página pública (LGPD).

import type { Metadata } from "next";
import { PaginaLegal } from "@/components/pagina-legal";
import { OPERADOR_LEGAL } from "@/lib/legal";
import { NOME_PRODUTO } from "@/lib/produto";

export const metadata: Metadata = {
  title: `Termos de Uso · ${NOME_PRODUTO}`,
  description: `Termos de uso do ${NOME_PRODUTO} para membros da comunidade.`,
};

export default function TermosPage() {
  const { nome, produto, emailPrivacidade } = OPERADOR_LEGAL;

  return (
    <PaginaLegal titulo="Termos de Uso">
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">1. Aceite</h2>
        <p>
          Ao criar conta ou usar o {produto}, você concorda com estes Termos.
          O serviço é oferecido por {nome} (“nós”, “operador”) para alunos e
          membros da comunidade Dev em Dobro, em contexto educacional e de
          networking profissional.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          2. O que o serviço faz
        </h2>
        <p>
          O {produto} é uma plataforma de comunidade que permite: (a) publicar
          e interagir em Spaces (posts, comentários, reações e menções);
          (b) receber notificações in-app; (c) acessar materiais de apoio e,
          quando disponíveis, aulas em vídeo; (d) administrar a própria
          conta/perfil. O acesso é concedido a e-mails autorizados (allowlist
          e/ou sincronização com a Hubla) e pode ser revogado pelo operador.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          3. Conta e responsabilidade
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Você é responsável pela segurança da sua conta (login via Google
            e/ou magic link).
          </li>
          <li>
            Você é responsável pelo conteúdo que publica (texto, links, imagens
            e menções) e deve agir com respeito aos demais membros.
          </li>
          <li>
            Você não deve usar o serviço para spam, assédio, fraude,
            disseminação de malware, violação de direitos de terceiros ou
            qualquer finalidade ilegal.
          </li>
          <li>
            Materiais e aulas disponibilizados são para uso educacional dos
            membros autorizados; redistribuição comercial não autorizada é
            proibida.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          4. Dados e privacidade
        </h2>
        <p>
          Tratamos dados pessoais conforme a{" "}
          <a href="/privacidade" className="font-medium text-accent hover:underline">
            Política de Privacidade
          </a>
          . Conteúdo publicado na comunidade pode ser visto por outros membros
          ativos. Administradores podem moderar (remover posts/comentários,
          fixar avisos, gerenciar membership).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          5. Disponibilidade
        </h2>
        <p>
          O serviço pode evoluir: funcionalidades, limites e estabilidade
          podem mudar. Não garantimos disponibilidade ininterrupta.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          6. Limitação de responsabilidade
        </h2>
        <p>
          Na máxima extensão permitida pela lei, {nome} não responde por
          lucros cessantes, perda de conteúdo publicada por usuários, ou
          decisões tomadas com base em interações na comunidade. O app é
          ferramenta de apoio; o uso é seu.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">7. Contato</h2>
        <p>
          Dúvidas sobre estes Termos:{" "}
          <a
            href={`mailto:${emailPrivacidade}`}
            className="font-medium text-accent hover:underline"
          >
            {emailPrivacidade}
          </a>
          .
        </p>
      </section>
    </PaginaLegal>
  );
}
