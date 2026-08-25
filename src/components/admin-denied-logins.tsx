import {
  grantDeniedLoginEmailAction,
  resolveDeniedLoginAction,
} from "@/actions/admin";
import { labelAllowedEmailSource } from "@/lib/membership/allowlist-labels";
import { tierLabel } from "@/lib/membership/capabilities";
import type {
  AllowlistWithoutUserRow,
  DeniedLoginGroup,
} from "@/lib/admin/denied-logins";
import { DENIED_LOGIN_WINDOW_DAYS } from "@/lib/admin/denied-logins";
import type { MembershipTier } from "@prisma/client";

function formatWhen(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(d);
}

export function AdminDeniedLogins({
  groups,
  purchasesWithoutLogin,
}: {
  groups: DeniedLoginGroup[];
  purchasesWithoutLogin: AllowlistWithoutUserRow[];
}) {
  return (
    <section className="mt-8 space-y-10">
      <div>
        <h2 className="text-lg font-semibold">
          Tentativas (últimos {DENIED_LOGIN_WINDOW_DAYS} dias)
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          E-mail que pediu magic link ou criou conta <strong>sem</strong> estar
          na allowlist. O login free continua liberado — esta lista é o rastro
          de quem pode ter comprado com outro e-mail. Confira na Hubla/TMB
          antes de liberar. Aviso ao aluno sai no e-mail da <em>compra</em>,
          fora daqui.
        </p>

        <ul className="mt-4 space-y-2">
          {groups.map((g) => (
            <li
              key={g.email}
              className={`rounded-lg border bg-card p-3 text-sm ${
                g.unresolved ? "border-border" : "border-border/60 opacity-70"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{g.email}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {g.count === 1
                      ? `1 tentativa · ${formatWhen(g.lastAt)}`
                      : `${g.count} tentativas · ${formatWhen(g.firstAt)} → ${formatWhen(g.lastAt)}`}
                    {g.hasUser
                      ? ` · já tem conta (${g.userTier ? tierLabel(g.userTier as MembershipTier) : "—"})`
                      : " · sem conta"}
                    {g.alreadyAllowed ? " · já na allowlist" : null}
                    {g.unresolved ? null : " · tratada"}
                  </p>
                  {g.possiblePurchases.length > 0 ? (
                    <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
                      Possível compra (mesmo nome antes do @):{" "}
                      {g.possiblePurchases.join(", ")}
                    </p>
                  ) : null}
                </div>
                {g.unresolved && !g.alreadyAllowed ? (
                  <div className="flex flex-wrap gap-1">
                    <form action={grantDeniedLoginEmailAction}>
                      <input type="hidden" name="email" value={g.email} />
                      <button type="submit" className="btn-primary text-xs">
                        Liberar este e-mail
                      </button>
                    </form>
                    <form action={resolveDeniedLoginAction}>
                      <input type="hidden" name="email" value={g.email} />
                      <button type="submit" className="btn-outline text-xs">
                        Marcar tratada
                      </button>
                    </form>
                  </div>
                ) : g.unresolved ? (
                  <form action={resolveDeniedLoginAction}>
                    <input type="hidden" name="email" value={g.email} />
                    <button type="submit" className="btn-outline text-xs">
                      Marcar tratada
                    </button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
          {groups.length === 0 ? (
            <li className="text-sm text-muted">
              Nenhuma tentativa fora da allowlist nos últimos{" "}
              {DENIED_LOGIN_WINDOW_DAYS} dias.
            </li>
          ) : null}
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Compras sem login</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          E-mail na allowlist (Hubla/TMB/manual) que ainda não tem conta. É o
          lado da compra que o resgate por “dias sem login” não vê.
        </p>
        <ul className="mt-4 space-y-1">
          {purchasesWithoutLogin.map((row) => (
            <li
              key={row.email}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
            >
              <span>
                {row.email}{" "}
                <span className="text-xs text-muted">
                  ({labelAllowedEmailSource(row.source)} · {formatWhen(row.createdAt)})
                </span>
              </span>
            </li>
          ))}
          {purchasesWithoutLogin.length === 0 ? (
            <li className="text-sm text-muted">
              Toda allowlist recente já tem conta.
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}
