import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import {
  isEliteMembership,
  isPaidMembership,
} from "@/lib/membership/capabilities";
import { ProfileForm } from "@/components/profile-form";
import { PlanBadge } from "@/components/plan-badge";
import { ExcluirConta } from "@/components/excluir-conta";

export default async function PerfilPage() {
  const member = await requireActiveMemberOrRedirect();
  const { profile, membership } = member;
  const isPaid = isPaidMembership(membership);
  const isElite = isEliteMembership(membership);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold">
          Perfil
        </h1>
        <PlanBadge isPaid={isPaid} isElite={isElite} size="md" />
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

      <ExcluirConta />
    </>
  );
}
