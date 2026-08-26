"use client";

import { useEffect, useMemo, useState } from "react";
import { buildGiftSharePath, buildUtmContent } from "@/lib/gifts/origem";

export type GiftLinkOption = {
  slug: string;
  label: string;
};

export function AdminGiftLinks({ gifts }: { gifts: GiftLinkOption[] }) {
  const [giftSlug, setGiftSlug] = useState(gifts[0]?.slug ?? "");
  const [postName, setPostName] = useState("");
  const [isoDate, setIsoDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const utmContent = useMemo(
    () => buildUtmContent(postName, isoDate),
    [postName, isoDate],
  );
  const path =
    giftSlug && utmContent ? buildGiftSharePath(giftSlug, utmContent) : null;
  const url = path ? `${origin}${path}` : null;

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copie o link:", url);
    }
  }

  if (gifts.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted">
        Publique um post no space Presentes com o campo slug preenchido. Esse
        slug entra na URL pública que a Jaque manda no DM.
      </p>
    );
  }

  return (
    <div className="mt-4 max-w-xl space-y-4">
      <p className="text-sm text-muted">
        Escolha o presente, o nome da postagem no Instagram e a data. A Jaque
        copia o link — a pessoa lê o conteúdo no Club e se cadastra na mesma
        página.
      </p>
      <p className="text-sm text-muted">
        Ex.: presente <code className="text-xs">agent-reach</code> + “Eu quero”
        em 22/09/2026 →{" "}
        <code className="text-xs">
          /presentes/agent-reach/eu-quero-22-09-2026
        </code>
      </p>

      <div className="post-card !p-4 space-y-3">
        <label className="block text-xs font-medium text-muted">
          Presente
          <select
            className="input mt-1.5"
            value={giftSlug}
            onChange={(e) => setGiftSlug(e.target.value)}
          >
            {gifts.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.label} ({g.slug})
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-medium text-muted">
          Nome da postagem no Instagram
          <input
            className="input mt-1.5"
            placeholder="ex.: eu quero"
            value={postName}
            onChange={(e) => setPostName(e.target.value)}
          />
        </label>

        <label className="block text-xs font-medium text-muted">
          Data do post
          <input
            type="date"
            className="input mt-1.5"
            value={isoDate}
            onChange={(e) => setIsoDate(e.target.value)}
          />
        </label>

        <div className="rounded-lg border border-border bg-surface px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
            Origem gravada no cadastro
          </p>
          <p className="mt-0.5 font-mono text-sm">
            {utmContent ?? "— digite o nome da postagem"}
          </p>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-muted">
            Link para o DM
          </p>
          <p className="mt-0.5 break-all font-mono text-xs text-foreground">
            {url ?? "—"}
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          disabled={!url}
          onClick={copy}
        >
          {copied ? "Link copiado ✓" : "Copiar link"}
        </button>
      </div>
    </div>
  );
}
