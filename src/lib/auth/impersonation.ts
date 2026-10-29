import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "./index";

export type ImpersonationState = {
  active: boolean;
  /** E-mail da conta que está sendo vista. */
  email: string | null;
};

/** F123 — sessão com `impersonatedBy` = admin está simulando o membro atual. */
export const getImpersonationState = cache(
  async (): Promise<ImpersonationState> => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const impersonatedBy =
      session?.session &&
      "impersonatedBy" in session.session &&
      typeof session.session.impersonatedBy === "string"
        ? session.session.impersonatedBy
        : null;

    if (!impersonatedBy || !session?.user) {
      return { active: false, email: null };
    }

    return {
      active: true,
      email: session.user.email,
    };
  },
);
