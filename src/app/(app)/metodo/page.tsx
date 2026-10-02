import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { isEliteMembership } from "@/lib/membership/capabilities";
import { whatsappEliteUrl } from "@/lib/suporte";
import { MetodoView } from "@/components/metodo-view";

export const dynamic = "force-dynamic";

export default async function MetodoPage() {
  const member = await requireActiveMemberOrRedirect();
  const isElite = isEliteMembership(member.membership);

  return (
    <MetodoView isElite={isElite} whatsappUrl={whatsappEliteUrl()} />
  );
}
