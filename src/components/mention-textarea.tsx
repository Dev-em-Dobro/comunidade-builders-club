"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
  type TextareaHTMLAttributes,
} from "react";
import { searchMentionMembersAction } from "@/actions/mentions";

type Candidate = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
};

type MentionRange = { start: number; end: number; query: string };

function mentionAtCursor(text: string, cursor: number): MentionRange | null {
  const before = text.slice(0, cursor);
  const match = before.match(/@([\p{L}\p{N}_.\-]*)$/u);
  if (!match) return null;
  const start = cursor - match[0].length;
  if (start > 0) {
    const prev = text[start - 1]!;
    if (!/\s/.test(prev)) return null;
  }
  return { start, end: cursor, query: match[1] ?? "" };
}

type Props = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange" | "defaultValue"
> & {
  name: string;
  defaultValue?: string;
};

export function MentionTextarea({
  name,
  defaultValue = "",
  className,
  onKeyDown,
  ...rest
}: Props) {
  const listId = useId();
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Candidate[]>([]);
  const [active, setActive] = useState(0);
  const [range, setRange] = useState<MentionRange | null>(null);
  const [, startSearch] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setItems([]);
    setRange(null);
    setActive(0);
  }, []);

  const runSearch = useCallback(
    (query: string, nextRange: MentionRange) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        startSearch(async () => {
          try {
            const found = await searchMentionMembersAction(query);
            setItems(found);
            setRange(nextRange);
            setActive(0);
            setOpen(found.length > 0);
          } catch {
            close();
          }
        });
      }, 180);
    },
    [close],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function syncFromTextarea() {
    const el = taRef.current;
    if (!el) return;
    const next = el.value;
    setValue(next);
    const cursor = el.selectionStart ?? next.length;
    const m = mentionAtCursor(next, cursor);
    if (!m) {
      close();
      return;
    }
    runSearch(m.query, m);
  }

  function applyCandidate(c: Candidate) {
    const el = taRef.current;
    if (!el || !range) return;
    const before = value.slice(0, range.start);
    const after = value.slice(range.end);
    // Display name pode ter espaços — menção resolvida só com token sem espaço.
    // Preferimos o nome como está; se tiver espaço, usamos a 1ª palavra.
    const token = c.displayName.trim().split(/\s+/)[0] || c.displayName;
    const inserted = `@${token} `;
    const next = `${before}${inserted}${after}`;
    const caret = before.length + inserted.length;
    setValue(next);
    close();
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  }

  function onKeyDownInner(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (open && items.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => (i + 1) % items.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => (i - 1 + items.length) % items.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        applyCandidate(items[active]!);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
    }
    onKeyDown?.(e);
  }

  return (
    <div className="relative">
      <textarea
        {...rest}
        ref={taRef}
        name={name}
        value={value}
        className={className}
        aria-autocomplete="list"
        aria-controls={open ? listId : undefined}
        aria-expanded={open}
        onChange={syncFromTextarea}
        onClick={syncFromTextarea}
        onKeyUp={syncFromTextarea}
        onKeyDown={onKeyDownInner}
        onBlur={() => {
          // Delay para permitir click na sugestão.
          window.setTimeout(() => close(), 150);
        }}
      />
      {open && items.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-border bg-card py-1 shadow-lg"
        >
          {items.map((c, idx) => (
            <li key={c.userId} role="option" aria-selected={idx === active}>
              <button
                type="button"
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                  idx === active ? "bg-accent/10 text-accent" : "hover:bg-surface"
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyCandidate(c);
                }}
                onMouseEnter={() => setActive(idx)}
              >
                {c.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.avatarUrl}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">
                    {c.displayName.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="truncate font-medium">{c.displayName}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
