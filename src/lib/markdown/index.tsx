import type { ReactNode } from "react";
import { isSafeHref, isSafeHttpUrl } from "@/lib/markdown/text";

export { escapeHtml, snippetFromBody, isSafeHttpUrl, isSafeHref } from "@/lib/markdown/text";

/**
 * Inline Markdown seguro + @menções + autolink http(s).
 * Texto vai como children React (escape automático). Links só http(s).
 */
export function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re =
    /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\))|(https?:\/\/[^\s<]+[^\s<.,;:!?'")\]])|(@[\p{L}\p{N}_.\-]{2,64})/gu;

  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const [full, code, bold, italic, , mdLabel, mdHref, bareUrl, mention] = match;
    if (code) {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-surface px-1 py-0.5 font-mono text-[0.9em]"
        >
          {code.slice(1, -1)}
        </code>,
      );
    } else if (bold) {
      nodes.push(<strong key={key++}>{bold.slice(2, -2)}</strong>);
    } else if (italic) {
      nodes.push(<em key={key++}>{italic.slice(1, -1)}</em>);
    } else if (mdHref && mdLabel && isSafeHref(mdHref)) {
      const isDownload = mdHref.startsWith("/");
      nodes.push(
        <a
          key={key++}
          href={mdHref}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer font-medium text-accent underline-offset-2 hover:underline"
          {...(isDownload ? { download: true } : {})}
        >
          {mdLabel}
        </a>,
      );
    } else if (bareUrl && isSafeHttpUrl(bareUrl)) {
      nodes.push(
        <a
          key={key++}
          href={bareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer break-all font-medium text-accent underline-offset-2 hover:underline"
        >
          {bareUrl}
        </a>,
      );
    } else if (mention) {
      nodes.push(
        <span key={key++} className="font-semibold text-accent" title={mention}>
          {mention}
        </span>,
      );
    } else {
      nodes.push(full);
    }
    last = match.index + full.length;
  }
  if (last < text.length) {
    nodes.push(text.slice(last));
  }
  return nodes;
}

/**
 * Escala dos blocos. `reading` (F060) é a coluna de artigo da página do
 * post: corpo 19px, títulos com escala editorial e mais respiro entre
 * parágrafos. `default` é o feed, onde o post é só uma prévia.
 */
export type MarkdownVariant = "default" | "reading";

const SCALE: Record<
  MarkdownVariant,
  { root: string; h2: string; h3: string; ul: string; pre: string; gap: string }
> = {
  default: {
    root: "space-y-1 text-base leading-relaxed text-foreground/90 [&_p]:my-0",
    h2: "mt-5 text-[15px] font-semibold text-foreground md:text-base",
    h3: "mt-3 text-sm font-semibold text-foreground md:text-[15px]",
    ul: "my-2 list-disc space-y-1 pl-5",
    pre: "my-3 overflow-x-auto rounded-xl border border-border bg-surface p-3 font-mono text-[13px] leading-relaxed",
    gap: "h-3",
  },
  reading: {
    root: "space-y-1 text-[1.0625rem] leading-[1.7] text-foreground/90 [&_p]:my-0 md:text-[1.1875rem]",
    h2: "mt-10 font-[family-name:var(--font-outfit)] text-[1.375rem] font-bold leading-tight tracking-tight text-foreground md:text-[1.625rem]",
    h3: "mt-8 font-[family-name:var(--font-outfit)] text-[1.125rem] font-bold leading-snug tracking-tight text-foreground md:text-[1.25rem]",
    ul: "my-4 list-disc space-y-2 pl-6 marker:text-muted",
    pre: "my-6 overflow-x-auto rounded-xl border border-border bg-surface p-4 font-mono text-[0.9375rem] leading-relaxed",
    gap: "h-5",
  },
};

/** Blocos: parágrafos, listas `- ` / `* `, linhas. */
export function MarkdownBody({
  body,
  className,
  variant = "default",
}: {
  body: string;
  className?: string;
  variant?: MarkdownVariant;
}) {
  const scale = SCALE[variant];
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i]!;
    if (line.trim().startsWith("```")) {
      i += 1;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i]!.trim().startsWith("```")) {
        codeLines.push(lines[i]!);
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push(
        <pre key={key++} className={scale.pre}>
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );
      continue;
    }
    if (/^###\s+/.test(line)) {
      blocks.push(
        <h3 key={key++} className={scale.h3}>
          {renderInlineMarkdown(line.replace(/^###\s+/, ""))}
        </h3>,
      );
      i += 1;
      continue;
    }
    if (/^##\s+/.test(line)) {
      blocks.push(
        <h2 key={key++} className={scale.h2}>
          {renderInlineMarkdown(line.replace(/^##\s+/, ""))}
        </h2>,
      );
      i += 1;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i]!)) {
        items.push(lines[i]!.replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className={scale.ul}>
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }
    if (line.trim() === "") {
      // F043: linhas em branco do editor viram espaçamento visível.
      let blanks = 0;
      while (i < lines.length && lines[i]!.trim() === "") {
        blanks += 1;
        i += 1;
      }
      for (let b = 0; b < blanks; b++) {
        blocks.push(
          <div key={key++} className={scale.gap} aria-hidden="true" />,
        );
      }
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i]!.trim() !== "" &&
      !/^\s*[-*]\s+/.test(lines[i]!) &&
      !/^##\s+/.test(lines[i]!) &&
      !/^###\s+/.test(lines[i]!) &&
      !lines[i]!.trim().startsWith("```")
    ) {
      para.push(lines[i]!);
      i++;
    }
    blocks.push(
      <p key={key++} className="whitespace-pre-wrap">
        {renderInlineMarkdown(para.join("\n"))}
      </p>,
    );
  }

  return (
    <div className={className ?? scale.root}>
      {blocks.length > 0 ? blocks : <p>{renderInlineMarkdown(body)}</p>}
    </div>
  );
}
