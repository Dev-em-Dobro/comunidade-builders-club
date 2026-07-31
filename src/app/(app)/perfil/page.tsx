import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { AppShell } from "@/components/app-shell";
import { updateProfileAction } from "@/actions/profile";

export default async function PerfilPage() {
  const member = await requireActiveMemberOrRedirect();

  const { profile } = member;

  return (
    <AppShell
      userId={member.user.id}
      isAdmin={member.membership.role === "admin"}
      displayName={profile.displayName}
    >
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

      <form action={updateProfileAction} className="post-card mt-6 max-w-lg space-y-3">
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatarUrl}
            alt=""
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-lg font-bold text-accent">
            {profile.displayName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <label className="block text-xs font-medium text-muted">
          Nome
          <input
            name="displayName"
            className="input mt-1"
            defaultValue={profile.displayName}
            required
            maxLength={80}
          />
        </label>
        <label className="block text-xs font-medium text-muted">
          Bio
          <textarea
            name="bio"
            className="input mt-1 min-h-24"
            defaultValue={profile.bio ?? ""}
            maxLength={500}
          />
        </label>
        <label className="block text-xs font-medium text-muted">
          URL da foto
          <input
            name="avatarUrl"
            className="input mt-1"
            defaultValue={profile.avatarUrl ?? ""}
            placeholder="https://…"
          />
        </label>
        <button type="submit" className="btn-primary">
          Salvar
        </button>
      </form>
    </AppShell>
  );
}
