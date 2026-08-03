"use client";

import { authClient } from "@/lib/auth/client";
import { ICON_SAIR } from "@/components/nav-icons";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="btn-ghost justify-start gap-2 text-left"
      onClick={() =>
        authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = "/login";
            },
          },
        })
      }
    >
      {ICON_SAIR}
      Sair
    </button>
  );
}
