"use client";

import { authClient } from "@/lib/auth/client";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="btn-ghost justify-start text-left"
      onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => {
        window.location.href = "/login";
      } } })}
    >
      Sair
    </button>
  );
}
