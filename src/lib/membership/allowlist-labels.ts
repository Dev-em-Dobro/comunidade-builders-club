/** Labels amigáveis para AllowedEmail.source (F044). */
const SOURCE_LABELS: Record<string, string> = {
  admin: "import manual",
  "admin-bulk": "importação em massa",
  manual: "import manual",
  hubla: "Hubla",
  tmb: "TMB",
  orion: "Orion",
  csv: "CSV",
  devquest: "DevQuest",
};

export function labelAllowedEmailSource(source: string): string {
  const key = source.trim().toLowerCase();
  return SOURCE_LABELS[key] ?? source;
}
