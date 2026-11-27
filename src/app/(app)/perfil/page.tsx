import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import {
  isEliteMembership,
  isPaidMembership,
  isVitalicioMembership,
} from "@/lib/membership/capabilities";
import { ProfileForm } from "@/components/profile-form";
import { PlanBadge } from "@/components/plan-badge";
import { BadgeGrid } from "@/components/desafio/badge";
import { getEnrollment } from "@/lib/desafio/acesso";
import { getParticipantProgress } from "@/lib/desafio/painel";

export default async function PerfilPage() {
  const member = await requireActiveMemberOrRedirect({ restritoOk: true });
  const { profile, membership } = member;
  const isPaid = isPaidMembership(membership);
  const isElite = isEliteMembership(membership);
  const isVitalicio = isVitalicioMembership(membership);
  // F050 — selos do Desafio 45 dias para quem foi aprovado na turma.
  const enrollment = isPaid ? await getEnrollment(member.user.id) : null;
  const challenge = enrollment?.status === "aprovado"
    ? await getParticipantProgress(enrollment, member.user.email)
    : null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold">
          Perfil
        </h1>
        <PlanBadge
          isPaid={isPaid}
          isElite={isElite}
          isVitalicio={isVitalicio}
          size="md"
        />
      </div>
      <p className="mt-1 text-sm text-muted">
        Membro desde{" "}
        {profile.joinedAt.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </p>

      <ProfileForm
        displayName={profile.displayName}
        bio={profile.bio}
        avatarUrl={profile.avatarUrl}
      />

      {challenge && (
        <section aria-labelledby="selos-desafio" className="mt-10 space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="selos-desafio" className="font-[family-name:var(--font-outfit)] text-lg font-bold">Selos do Desafio 45 dias</h2>
            <span className="text-sm text-muted">{challenge.score.total} pontos · {challenge.badges.filter((badge) => badge.earned).length} de {challenge.badges.length} selos</span>
          </div>
          <BadgeGrid badges={challenge.badges} size={52} />
        </section>
      )}
    </>
  );
}
