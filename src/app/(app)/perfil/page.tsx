import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { ProfileForm } from "@/components/profile-form";

export default async function PerfilPage() {
  const member = await requireActiveMemberOrRedirect();
  const { profile } = member;

  return (
    <>
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold">
        Perfil
      </h1>
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
    </>
  );
}
