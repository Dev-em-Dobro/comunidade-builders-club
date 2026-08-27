import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import {
  isEliteMembership,
  isPaidMembership,
} from "@/lib/membership/capabilities";
import { AppShell } from "@/components/app-shell";

export default async function AppSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const member = await requireActiveMemberOrRedirect();
  const isPaid = isPaidMembership(member.membership);
  const isElite = isEliteMembership(member.membership);

  return (
    <AppShell
      userId={member.user.id}
      isAdmin={member.membership.role === "admin"}
      isPaid={isPaid}
      isElite={isElite}
      displayName={member.profile.displayName}
      email={member.user.email}
      avatarUrl={member.profile.avatarUrl}
    >
      {children}
    </AppShell>
  );
}
