import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { isPaidMembership } from "@/lib/membership/capabilities";
import { AppShell } from "@/components/app-shell";

export default async function AppSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const member = await requireActiveMemberOrRedirect();
  const isPaid = isPaidMembership(member.membership);

  return (
    <AppShell
      userId={member.user.id}
      isAdmin={member.membership.role === "admin"}
      isPaid={isPaid}
      displayName={member.profile.displayName}
      avatarUrl={member.profile.avatarUrl}
    >
      {children}
    </AppShell>
  );
}
