import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { AppShell } from "@/components/app-shell";

export default async function AppSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const member = await requireActiveMemberOrRedirect();

  return (
    <AppShell
      userId={member.user.id}
      isAdmin={member.membership.role === "admin"}
      displayName={member.profile.displayName}
      avatarUrl={member.profile.avatarUrl}
    >
      {children}
    </AppShell>
  );
}
