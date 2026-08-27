"use client";

import { authClient } from "@/lib/auth/client";
import { ICON_SAIR } from "@/components/nav-icons";

export function LogoutButton({
  variant = "menu",
}: {
  /** `popup` = item do menu do usuário na sidebar (F062). */
  variant?: "menu" | "popup";
}) {
  const sair = () =>
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login";
        },
      },
    });

  if (variant === "popup") {
    return (
      <button type="button" role="menuitem" className="menu-item" onClick={sair}>
        {ICON_SAIR}
        Sair
      </button>
    );
  }

  return (
    <button
      type="button"
      className="btn-ghost justify-start gap-2 text-left"
      onClick={sair}
    >
      {ICON_SAIR}
      Sair
    </button>
  );
}
