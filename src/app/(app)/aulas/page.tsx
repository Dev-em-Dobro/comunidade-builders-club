import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { isPaidMembership } from "@/lib/membership/capabilities";
import { listCompletedLessonIds } from "@/lib/aulas";
import { listPublishedModules } from "@/lib/aulas/published-modules";
import { EmptyState } from "@/components/empty-state";
import { AulasCatalog, mapModule } from "@/components/aulas-catalog";

export default async function AulasPage() {
  const member = await requireActiveMemberOrRedirect();
  const isPaid = isPaidMembership(member.membership);
  const [modules, completed] = await Promise.all([
    listPublishedModules(),
    listCompletedLessonIds(member.user.id),
  ]);

  const catalog = modules.map((mod) => mapModule(mod, completed));

  return (
    <div className="feed-wrap-wide">
      <h1 className="page-title">Aulas</h1>
      <p className="mt-2 text-sm text-muted">
        {/* F067 — a linha do free termina no que ela ganha, não no cadeado:
            é a última coisa que ela lê antes de escolher onde clicar. */}
        {isPaid
          ? "Escolha um módulo para ver as aulas."
          : "O Comece por aqui está liberado no gratuito. PRO e Elite abrem o resto da formação — nicho, prospecção, abordagem e fechamento."}
      </p>

      {catalog.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nenhum módulo publicado"
            description="Os administradores vão liberar as aulas em breve."
          />
        </div>
      ) : (
        <AulasCatalog modules={catalog} isPaid={isPaid} />
      )}
    </div>
  );
}
