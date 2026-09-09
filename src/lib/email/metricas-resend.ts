/** F085 — cliente HTTP Resend (listar e-mails). Sem SDK. */

import {
  categoriaDoEmail,
  EMAIL_CATEGORIAS,
  type EmailCategoria,
} from "./categorias";
import { resendApiKey } from "./resend-key";

export type ResendLastEvent =
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "bounced"
  | "complained"
  | "delivery_delayed"
  | "failed"
  | string;

export type ResendEmailListItem = {
  id: string;
  to: string[];
  from: string;
  subject: string;
  created_at: string;
  last_event: ResendLastEvent;
};

type ListResponse = {
  object: string;
  has_more: boolean;
  data: ResendEmailListItem[];
};

export { resendApiKey } from "./resend-key";

async function fetchResendJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const key = resendApiKey();
  if (!key) throw new Error("RESEND_API_KEY / RESEND_SMTP_PASS ausente");

  const res = await fetch(`https://api.resend.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[resend] ${res.status} ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/** Lista páginas até cobrir `since` ou esgotar / teto de páginas. */
export async function listarEmailsResendDesde(opts: {
  since: Date;
  maxPages?: number;
}): Promise<ResendEmailListItem[]> {
  const maxPages = opts.maxPages ?? 20;
  const out: ResendEmailListItem[] = [];
  let after: string | undefined;

  for (let page = 0; page < maxPages; page++) {
    const qs = new URLSearchParams({ limit: "100" });
    if (after) qs.set("after", after);
    const data = await fetchResendJson<ListResponse>(`/emails?${qs}`);
    if (!data.data?.length) break;

    for (const item of data.data) {
      const created = new Date(item.created_at);
      if (created < opts.since) {
        return out;
      }
      out.push(item);
    }

    if (!data.has_more) break;
    after = data.data[data.data.length - 1]?.id;
    if (!after) break;
  }

  return out;
}

export type MetricasEmailFiltro = {
  dias: number;
  status?: string | "all";
  categoria?: EmailCategoria | "all";
  page?: number;
  pageSize?: number;
};

export type MetricasEmailAgregado = {
  total: number;
  byStatus: Record<string, number>;
  byCategoria: Record<EmailCategoria, number>;
  opened: number;
  clicked: number;
  delivered: number;
  taxaOpen: number | null;
  taxaClick: number | null;
  page: number;
  pageSize: number;
  totalPages: number;
  itens: Array<{
    id: string;
    to: string;
    subject: string;
    createdAt: string;
    lastEvent: string;
    categoria: EmailCategoria;
  }>;
  aviso?: string;
};

function mascararEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return "***";
  const head = user.slice(0, 2);
  return `${head}***@${domain}`;
}

function emptyByCategoria(): Record<EmailCategoria, number> {
  return Object.fromEntries(EMAIL_CATEGORIAS.map((c) => [c, 0])) as Record<
    EmailCategoria,
    number
  >;
}

export async function agregarMetricasEmail(
  filtro: MetricasEmailFiltro,
): Promise<MetricasEmailAgregado> {
  const pageSize = Math.min(Math.max(filtro.pageSize ?? 20, 5), 50);
  const pageRaw = Math.max(filtro.page ?? 1, 1);

  if (!resendApiKey()) {
    return {
      total: 0,
      byStatus: {},
      byCategoria: emptyByCategoria(),
      opened: 0,
      clicked: 0,
      delivered: 0,
      taxaOpen: null,
      taxaClick: null,
      page: 1,
      pageSize,
      totalPages: 1,
      itens: [],
      aviso:
        "Configure RESEND_API_KEY (ou RESEND_SMTP_PASS) na Vercel para carregar as métricas.",
    };
  }

  const dias = Math.min(Math.max(filtro.dias || 15, 1), 90);
  const since = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
  const raw = await listarEmailsResendDesde({ since });

  const classificados = raw.map((e) => {
    const categoria = categoriaDoEmail({ subject: e.subject ?? "" });
    return {
      id: e.id,
      to: Array.isArray(e.to) ? e.to[0] ?? "" : "",
      subject: e.subject ?? "",
      createdAt: e.created_at,
      lastEvent: String(e.last_event ?? "sent"),
      categoria,
    };
  });

  const filtrados = classificados.filter((e) => {
    if (filtro.categoria && filtro.categoria !== "all") {
      if (e.categoria !== filtro.categoria) return false;
    }
    if (filtro.status && filtro.status !== "all") {
      if (e.lastEvent !== filtro.status) return false;
    }
    return true;
  });

  const byStatus: Record<string, number> = {};
  const byCategoria = emptyByCategoria();
  let opened = 0;
  let clicked = 0;
  let delivered = 0;

  for (const e of filtrados) {
    byStatus[e.lastEvent] = (byStatus[e.lastEvent] ?? 0) + 1;
    byCategoria[e.categoria] += 1;
    if (e.lastEvent === "opened") opened += 1;
    if (e.lastEvent === "clicked") clicked += 1;
    if (
      e.lastEvent === "delivered" ||
      e.lastEvent === "opened" ||
      e.lastEvent === "clicked"
    ) {
      delivered += 1;
    }
  }

  const total = filtrados.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(pageRaw, totalPages);
  const start = (page - 1) * pageSize;
  const engajaveis = filtrados.filter((e) =>
    ["delivered", "opened", "clicked"].includes(e.lastEvent),
  ).length;

  return {
    total,
    byStatus,
    byCategoria,
    opened,
    clicked,
    delivered,
    taxaOpen: engajaveis > 0 ? (opened + clicked) / engajaveis : null,
    taxaClick: engajaveis > 0 ? clicked / engajaveis : null,
    page,
    pageSize,
    totalPages,
    itens: filtrados.slice(start, start + pageSize).map((e) => ({
      ...e,
      to: mascararEmail(e.to),
    })),
  };
}

function csvEscape(v: string): string {
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

/** CSV com o mesmo filtro da aba Admin (e-mail completo — só admin). */
export async function csvMetricasEmail(
  filtro: MetricasEmailFiltro,
): Promise<{ csv: string; filename: string } | { erro: string }> {
  if (!resendApiKey()) {
    return {
      erro: "Configure RESEND_API_KEY (ou RESEND_SMTP_PASS) para exportar.",
    };
  }

  const dias = Math.min(Math.max(filtro.dias || 15, 1), 90);
  const since = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
  const raw = await listarEmailsResendDesde({ since });

  const filtrados = raw
    .map((e) => {
      const categoria = categoriaDoEmail({ subject: e.subject ?? "" });
      return {
        to: Array.isArray(e.to) ? e.to[0] ?? "" : "",
        subject: e.subject ?? "",
        createdAt: e.created_at,
        lastEvent: String(e.last_event ?? "sent"),
        categoria,
        id: e.id,
      };
    })
    .filter((e) => {
      if (filtro.categoria && filtro.categoria !== "all") {
        if (e.categoria !== filtro.categoria) return false;
      }
      if (filtro.status && filtro.status !== "all") {
        if (e.lastEvent !== filtro.status) return false;
      }
      return true;
    });

  const header = ["id", "para", "assunto", "tipo", "status", "enviado_em"];
  const lines = [
    header.join(","),
    ...filtrados.map((e) =>
      [
        csvEscape(e.id),
        csvEscape(e.to),
        csvEscape(e.subject),
        csvEscape(e.categoria),
        csvEscape(e.lastEvent),
        csvEscape(e.createdAt),
      ].join(","),
    ),
  ];

  const stamp = new Date().toISOString().slice(0, 10);
  const cat =
    filtro.categoria && filtro.categoria !== "all" ? filtro.categoria : "todos";
  const st =
    filtro.status && filtro.status !== "all" ? filtro.status : "todos";
  return {
    csv: lines.join("\n") + "\n",
    filename: `emails-resend-${dias}d-${cat}-${st}-${stamp}.csv`,
  };
}
