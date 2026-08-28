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
        {isPaid
          ? "Escolha um módulo para ver as aulas."
          : "O Comece por aqui está liberado no gratuito. O resto da formação aparece com cadeado."}
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
