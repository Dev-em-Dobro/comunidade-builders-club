import type { ReactNode } from "react";
import { isSafeHttpUrl } from "@/lib/markdown/text";

export { escapeHtml, snippetFromBody, isSafeHttpUrl } from "@/lib/markdown/text";

/**
 * Inline Markdown seguro + @menções + autolink http(s).
 * Texto vai como children React (escape automático). Links só http(s).
 */
export function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re =
    /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\((https?:\/\/[^)\s]+)\))|(https?:\/\/[^\s<]+[^\s<.,;:!?'")\]])|(@[\p{L}\p{N}_.\-]{2,64})/gu;

  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const [full, code, bold, italic, , mdLinkUrl, bareUrl, mention] = match;
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
    } else if (mdLinkUrl && isSafeHttpUrl(mdLinkUrl)) {
      const label = full.slice(1, full.indexOf("]"));
      nodes.push(
        <a
          key={key++}
          href={mdLinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer font-medium text-accent underline-offset-2 hover:underline"
        >
          {label}
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

/** Blocos: parágrafos, listas `- ` / `* `, linhas. */
export function MarkdownBody({
  body,
  className,
}: {
  body: string;
  className?: string;
}) {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i]!;
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i]!)) {
        items.push(lines[i]!.replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="my-2 list-disc space-y-1 pl-5">
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }
    if (line.trim() === "") {
      i++;
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i]!.trim() !== "" &&
      !/^\s*[-*]\s+/.test(lines[i]!)
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
    <div
      className={
        className ??
        "space-y-2 text-base leading-relaxed text-foreground/90 [&_p]:my-0"
      }
    >
      {blocks.length > 0 ? blocks : <p>{renderInlineMarkdown(body)}</p>}
    </div>
  );
}
