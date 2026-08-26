// Política de Privacidade — página pública (LGPD).

import type { Metadata } from "next";
import { PaginaLegal } from "@/components/pagina-legal";
import { OPERADOR_LEGAL } from "@/lib/legal";
import { NOME_PRODUTO } from "@/lib/produto";

export const metadata: Metadata = {
  title: `Política de Privacidade · ${NOME_PRODUTO}`,
  description: `Como o ${NOME_PRODUTO} trata dados pessoais (LGPD).`,
};

export default function PrivacidadePage() {
  const { nome, produto, emailPrivacidade } = OPERADOR_LEGAL;

  return (
    <PaginaLegal titulo="Política de Privacidade">
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          1. Quem controla os dados
        </h2>
        <p>
          O controlador dos dados tratados no {produto} é {nome}. Contato
          para titulares:{" "}
          <a
            href={`mailto:${emailPrivacidade}`}
            className="font-medium text-accent hover:underline"
          >
            {emailPrivacidade}
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          2. Quais dados tratamos
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-foreground">Conta:</strong>{" "}
            e-mail, nome (quando o provedor OAuth informar ou no cadastro por
            código), foto de perfil (se fornecida), identificadores de sessão
            e metadados de autenticação (Better Auth).
          </li>
          <li>
            <strong className="font-medium text-foreground">Perfil:</strong>{" "}
            nome de exibição, bio e avatar que você configura na comunidade.
          </li>
          <li>
            <strong className="font-medium text-foreground">
              Conteúdo da comunidade:
            </strong>{" "}
            posts, comentários, reações, menções e leituras de posts, além de
            progresso em aulas quando aplicável.
          </li>
          <li>
            <strong className="font-medium text-foreground">
              Controle de acesso:
            </strong>{" "}
            e-mails na allowlist e eventos de sincronização com a Hubla
            (compra/cancelamento) para liberar ou revogar membership.
          </li>
          <li>
            <strong className="font-medium text-foreground">Uso técnico:</strong>{" "}
            logs operacionais mínimos necessários para manter o serviço e
            segurança (sem gravar tokens de sessão em claro em logs de app).
          </li>
          <li>
            <strong className="font-medium text-foreground">
              Atribuição de presentes (F059):
            </strong>{" "}
            cookie first-touch <code>bc_origem</code> (qual divulgação gerou
            o cadastro) e visitas anônimas ao presente (slug + UTM +
            referrer, <strong>sem IP</strong>), só para medir o funil da
            divulgação.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          3. Para que usamos
        </h2>
        <p>Finalidades:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>autenticar e manter sua sessão;</li>
          <li>
            operar a comunidade (feed, notificações, materiais e aulas);
          </li>
          <li>gerenciar quem tem acesso (allowlist / Hubla / admin);</li>
          <li>segurança, prevenção a abuso e suporte;</li>
          <li>cumprir obrigações legais quando aplicável.</li>
        </ul>
        <p>
          Base legal típica (LGPD): execução de contrato / procedimentos
          preliminares (art. 7º, V) e legítimo interesse para segurança e
          melhoria operacional (art. 7º, IX), sem prejuízo de outras bases
          cabíveis.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">4. Cookies</h2>
        <p>
          Usamos o mínimo necessário para o serviço funcionar:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-foreground">
              Sessão (necessário):
            </strong>{" "}
            cookie do Better Auth que mantém você conectado. Sem ele não há
            login. Por ser estritamente necessário, não depende de
            consentimento prévio.
          </li>
          <li>
            <strong className="font-medium text-foreground">
              Preferência de tema:
            </strong>{" "}
            claro ou escuro, guardado no seu navegador (armazenamento local, não
            é cookie) só para a tela abrir do jeito que você deixou.
          </li>
          <li>
            <strong className="font-medium text-foreground">
              Medição (opcional):
            </strong>{" "}
            só com o seu aceite no aviso de cookies. Enquanto você não aceitar,
            nenhum script de medição é carregado. Recusar não afeta o acesso à
            comunidade.
          </li>
        </ul>
        <p>
          Sua escolha fica guardada em um cookie próprio por 6 meses. Para
          mudar, apague os cookies do site no seu navegador — o aviso aparece de
          novo.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          5. Compartilhamento
        </h2>
        <p>
          Compartilhamos dados com subprocessadores necessários ao serviço,
          por exemplo: hospedagem (ex.: Vercel), banco (ex.: Neon), e-mail
          transacional (magic link e código OTP, ex.: Resend), provedor de
          vídeo das aulas (ex.: Panda Video) e, quando aplicável, a Hubla
          para sincronizar elegibilidade de acesso. Conteúdo que você publica
          na comunidade fica visível aos demais membros ativos. Não vendemos
          dados pessoais.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">6. Retenção</h2>
        <p>
          Mantemos os dados enquanto a conta/membership existir e for
          necessária à prestação do serviço. Você pode excluir sua conta a
          qualquer momento em <strong className="font-medium">Perfil</strong>:
          nome, e-mail, bio e foto são removidos na hora e o acesso é
          encerrado. O que você publicou continua na comunidade sem
          identificação, assinado como &ldquo;Membro removido&rdquo; — remover
          também as conversas afetaria quem respondeu a elas. Para qualquer
          outro pedido, use o contato abaixo; atenderemos no prazo legal,
          ressalvadas retenções obrigatórias.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          7. Seus direitos (LGPD)
        </h2>
        <p>
          Você pode solicitar confirmação de tratamento, acesso, correção,
          anonimização/bloqueio/eliminação quando cabível, portabilidade e
          informação sobre compartilhamentos, além de revogar consentimento
          quando essa for a base. Também pode reclamar à ANPD.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">8. Segurança</h2>
        <p>
          Adotamos medidas técnicas e organizacionais razoáveis: autenticação
          sem senha (OAuth / magic link / código por e-mail), controle de
          membership, HTTPS na
          hospedagem, validação de inputs e acesso a materiais apenas para
          membros ativos. Nenhum sistema é 100% seguro — reporte incidentes
          para {emailPrivacidade}.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">9. Contato</h2>
        <p>
          Pedidos de titulares e privacidade:{" "}
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
