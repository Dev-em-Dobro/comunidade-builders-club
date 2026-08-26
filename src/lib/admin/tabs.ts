export const ADMIN_TABS = [
  { id: "allowlist", label: "Allowlist" },
  { id: "tentativas", label: "Tentativas" },
  { id: "membros", label: "Membros" },
  { id: "aulas", label: "Aulas" },
  { id: "presentes", label: "Presentes" },
  { id: "spaces", label: "Spaces" },
] as const;

export type AdminTabId = (typeof ADMIN_TABS)[number]["id"];

export function isAdminTab(value: string | undefined | null): value is AdminTabId {
  return ADMIN_TABS.some((t) => t.id === value);
}
