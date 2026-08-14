/** Tema claro/escuro do Builders Club (F042). Sem dependência de Next. */

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "builders-club-theme";

/** Roda no <head> antes do paint para evitar flash do tema errado. */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{if(localStorage.getItem("${THEME_STORAGE_KEY}")==="dark")document.documentElement.classList.add("dark");}catch(e){}})();`;

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function readDocumentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
