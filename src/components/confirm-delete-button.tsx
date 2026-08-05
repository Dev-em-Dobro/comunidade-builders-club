"use client";

import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function ConfirmDeleteButton({
  action,
  label,
  message,
}: {
  action: (formData: FormData) => void | Promise<void>;
  label: string;
  message: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <>
      <button
        type="button"
        className="cursor-pointer text-xs text-red-600 hover:underline"
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
      <ConfirmDialog
        open={open}
        title="Confirmar remoção"
        message={message}
        confirmLabel={label}
        danger
        pending={pending}
        onCancel={() => setOpen(false)}
        onConfirm={() =>
          start(async () => {
            await action(new FormData());
            setOpen(false);
          })
        }
      />
    </>
  );
}
