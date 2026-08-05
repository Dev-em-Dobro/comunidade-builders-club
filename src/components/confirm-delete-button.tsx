"use client";

export function ConfirmDeleteButton({
  action,
  label,
  message,
}: {
  action: (formData: FormData) => void | Promise<void>;
  label: string;
  message: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      <button type="submit" className="text-xs text-red-600">
        {label}
      </button>
    </form>
  );
}
