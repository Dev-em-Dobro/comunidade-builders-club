import { challengeNow, requireChallengeStaff } from "@/lib/desafio/acesso";
import { filterRows, isTeamFilter, teamRow, toCsv } from "@/lib/desafio/equipe";
import { getTeamDashboard } from "@/lib/desafio/painel";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const staff = await requireChallengeStaff();
  const params = new URL(request.url).searchParams;
  const filter = params.get("filtro") ?? undefined;
  const now = challengeNow(staff.membership.role, params.get("agora") ?? undefined);
  const rows = (await getTeamDashboard(now.toISOString())).map(teamRow);
  const approved = rows.filter((row) => row.status === "aprovado");
  const body = toCsv(isTeamFilter(filter) ? filterRows(approved, filter) : rows);
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="desafio-45-dias-${now.toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
