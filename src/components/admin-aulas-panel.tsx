"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createLessonAction,
  createModuleAction,
  deleteLessonAction,
  deleteModuleAction,
  moveLessonAction,
  moveModuleAction,
  setModuleFreeAccessAction,
  updateLessonDescriptionAction,
} from "@/actions/admin";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";

type AdminLesson = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  published: boolean;
  sortOrder: number;
  thumbnailUrl: string | null;
};

export type AdminModule = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  published: boolean;
  freeAccess: boolean;
  sortOrder: number;
  coverImageUrl: string | null;
  lessons: AdminLesson[];
  children?: AdminModule[];
};

function roleLabel(depth: number, hasChildren: boolean): string {
  if (depth === 0) return hasChildren ? "Formação" : "Módulo";
  if (depth === 1) return "Módulo";
  return "Submódulo";
}

function contentCount(mod: AdminModule): number {
  return (
    mod.lessons.length +
    (mod.children ?? []).reduce((n, child) => n + contentCount(child), 0)
  );
}

function flattenModules(
  modules: AdminModule[],
  prefix = "",
): { id: string; label: string; lessonCount: number }[] {
  const out: { id: string; label: string; lessonCount: number }[] = [];
  for (const mod of modules) {
    const label = prefix ? `${prefix} › ${mod.title}` : mod.title;
    out.push({ id: mod.id, label, lessonCount: mod.lessons.length });
    if (mod.children?.length) {
      out.push(...flattenModules(mod.children, label));
    }
  }
  return out;
}

function flattenLessons(
  modules: AdminModule[],
  prefix = "",
): { id: string; label: string; description: string }[] {
  const out: { id: string; label: string; description: string }[] = [];
  for (const mod of modules) {
    const label = prefix ? `${prefix} › ${mod.title}` : mod.title;
    for (const lesson of mod.lessons) {
      out.push({
        id: lesson.id,
        label: `${label} › ${lesson.title}`,
        description: lesson.description ?? "",
      });
    }
    if (mod.children?.length) {
      out.push(...flattenLessons(mod.children, label));
    }
  }
  return out;
}

function flattenParentOptions(
  modules: AdminModule[],
  prefix = "",
  depth = 0,
): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  for (const mod of modules) {
    const label = prefix ? `${prefix} › ${mod.title}` : mod.title;
    out.push({ id: mod.id, label });
    if (depth < 1 && mod.children?.length) {
      out.push(...flattenParentOptions(mod.children, label, depth + 1));
    }
  }
  return out;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function FreeAccessToggle({
  moduleId,
  freeAccess,
}: {
  moduleId: string;
  freeAccess: boolean;
}) {
  return (
    <form action={setModuleFreeAccessAction}>
      <input type="hidden" name="id" value={moduleId} />
      <input type="hidden" name="freeAccess" value={freeAccess ? "false" : "true"} />
      <button
        type="submit"
        className={
          freeAccess
            ? "rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent"
            : "rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted"
        }
        title={
          freeAccess
            ? "Livre para o plano gratuito (e descendentes). Clique para tirar."
            : "Pago. Clique para liberar este ramo ao plano gratuito."
        }
      >
        {freeAccess ? "free" : "pago"}
      </button>
    </form>
  );
}

function StatusDot({ published }: { published: boolean }) {
  return (
    <span
      className={
        published
          ? "rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent"
          : "rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted"
      }
    >
      {published ? "pub" : "rascunho"}
    </span>
  );
}

function MoveDelete({
  itemId,
  moveAction,
  upDisabled,
  downDisabled,
  removeAction,
  removeLabel,
  removeMessage,
}: {
  itemId: string;
  moveAction: (formData: FormData) => void | Promise<void>;
  upDisabled: boolean;
  downDisabled: boolean;
  removeAction: (formData: FormData) => void | Promise<void>;
  removeLabel: string;
  removeMessage: string;
}) {
  const router = useRouter();

  async function submit(formData: FormData) {
    await moveAction(formData);
    router.refresh();
  }

  return (
    <div className="flex shrink-0 items-center gap-1">
      <form action={submit}>
        <input type="hidden" name="id" value={itemId} />
        <input type="hidden" name="direction" value="up" />
        <button
          type="submit"
          className="btn-ghost cursor-pointer px-1.5 py-0.5 text-xs"
          disabled={upDisabled}
          title="Subir"
        >
          ↑
        </button>
      </form>
      <form action={submit}>
        <input type="hidden" name="id" value={itemId} />
        <input type="hidden" name="direction" value="down" />
        <button
          type="submit"
          className="btn-ghost cursor-pointer px-1.5 py-0.5 text-xs"
          disabled={downDisabled}
          title="Descer"
        >
          ↓
        </button>
      </form>
      <ConfirmDeleteButton
        action={removeAction}
        label={removeLabel}
        message={removeMessage}
      />
    </div>
  );
}

function ModuleTree({
  mod,
  index,
  siblingCount,
  depth,
}: {
  mod: AdminModule;
  index: number;
  siblingCount: number;
  depth: number;
}) {
  const children = mod.children ?? [];
  const total = contentCount(mod);
  const role = roleLabel(depth, children.length > 0);

  return (
    <div style={{ paddingLeft: depth === 0 ? 0 : 16 }}>
      <div className="flex items-start justify-between gap-2 rounded-lg py-1.5 hover:bg-surface/50">
        <details open={depth < 2} className="min-w-0 flex-1">
          <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <span className="flex min-w-0 items-center gap-2">
              <span className="text-muted" aria-hidden>
                {children.length > 0 || mod.lessons.length > 0 ? "▾" : "·"}
              </span>
              {mod.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mod.coverImageUrl}
                  alt=""
                  className="h-8 w-6 shrink-0 rounded object-cover"
                />
              ) : null}
              <span className="min-w-0">
                <span className="mr-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  {role}
                </span>
                <span className="font-medium">{mod.title}</span>
                <span className="ml-2 text-xs text-muted">
                  {total} {total === 1 ? "aula" : "aulas"}
                </span>
              </span>
              <StatusDot published={mod.published} />
            </span>
          </summary>

          {mod.lessons.length > 0 ? (
            <ul className="mt-1 space-y-0.5 border-l border-border pl-3">
              {mod.lessons.map((l, lessonIndex) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-2 rounded-md py-1 pl-1 hover:bg-surface/60"
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm">
                    {l.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.thumbnailUrl}
                        alt=""
                        className="h-7 w-11 shrink-0 rounded object-cover"
                      />
                    ) : null}
                    <span className="truncate">{l.title}</span>
                    <StatusDot published={l.published} />
                  </span>
                  <MoveDelete
                    itemId={l.id}
                    moveAction={moveLessonAction}
                    upDisabled={lessonIndex === 0}
                    downDisabled={lessonIndex === mod.lessons.length - 1}
                    removeAction={deleteLessonAction.bind(null, l.id)}
                    removeLabel="Remover"
                    removeMessage={`Remover a aula "${l.title}"?`}
                  />
                </li>
              ))}
            </ul>
          ) : null}

          {children.map((child, childIndex) => (
            <ModuleTree
              key={child.id}
              mod={child}
              index={childIndex}
              siblingCount={children.length}
              depth={depth + 1}
            />
          ))}
        </details>
        <div className="flex shrink-0 items-center gap-1">
          <FreeAccessToggle moduleId={mod.id} freeAccess={mod.freeAccess} />
          <MoveDelete
            itemId={mod.id}
            moveAction={moveModuleAction}
            upDisabled={index === 0}
            downDisabled={index === siblingCount - 1}
            removeAction={deleteModuleAction.bind(null, mod.id)}
            removeLabel="Remover"
            removeMessage={`Remover "${mod.title}" e tudo o que estiver dentro?`}
          />
        </div>
      </div>
    </div>
  );
}

function CreateModuleForm({ modules }: { modules: AdminModule[] }) {
  const parents = flattenParentOptions(modules);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <form action={createModuleAction} className="space-y-2">
      <select name="parentId" className="input" defaultValue="">
        <option value="">Primeiro nível (formação / módulo avulso)</option>
        {parents.map((opt) => (
          <option key={opt.id} value={opt.id}>
            Dentro de {opt.label}
          </option>
        ))}
      </select>
      <input
        name="title"
        className="input"
        placeholder="Título"
        required
        value={title}
        onChange={(e) => {
          const next = e.target.value;
          setTitle(next);
          if (!slugTouched) setSlug(slugify(next));
        }}
      />
      <input
        name="slug"
        className="input"
        placeholder="slug"
        required
        value={slug}
        onChange={(e) => {
          setSlugTouched(true);
          setSlug(e.target.value);
        }}
      />
      <input name="description" className="input" placeholder="Descrição (opcional)" />
      <input
        name="coverImageUrl"
        className="input"
        placeholder="Capa URL ou /thumb-ia-aplicada.png"
      />
      <input name="sortOrder" type="number" className="input" defaultValue={0} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" /> Publicado
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="freeAccess" /> Livre para o plano gratuito
        (este módulo e os filhos)
      </label>
      <button type="submit" className="btn-primary">
        Criar módulo
      </button>
    </form>
  );
}

function CreateLessonForm({ modules }: { modules: AdminModule[] }) {
  const options = useMemo(() => flattenModules(modules), [modules]);
  const [moduleId, setModuleId] = useState(options[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const selected = options.find((o) => o.id === moduleId);

  return (
    <form action={createLessonAction} className="space-y-2">
      <select
        name="moduleId"
        className="input"
        required
        value={moduleId}
        onChange={(e) => setModuleId(e.target.value)}
      >
        {options.length === 0 ? (
          <option value="">Nenhum módulo ainda</option>
        ) : (
          options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))
        )}
      </select>
      <input
        name="title"
        className="input"
        placeholder="Título da aula"
        required
        value={title}
        onChange={(e) => {
          const next = e.target.value;
          setTitle(next);
          if (!slugTouched) setSlug(slugify(next));
        }}
      />
      <input
        name="slug"
        className="input"
        placeholder="slug-da-aula"
        required
        value={slug}
        onChange={(e) => {
          setSlugTouched(true);
          setSlug(e.target.value);
        }}
      />
      <input
        name="pandaLibraryId"
        className="input"
        placeholder="Library/pullzone (vazio se for só material)"
        defaultValue="77c52f03-dc6"
      />
      <input
        name="pandaVideoExternalId"
        className="input"
        placeholder="Video external ID (vazio se for só material)"
      />
      <input
        name="thumbnailUrl"
        className="input"
        placeholder="URL thumbnail (opcional)"
      />
      <input name="description" className="input" placeholder="Descrição (opcional)" />
      <input
        type="hidden"
        name="sortOrder"
        key={moduleId}
        defaultValue={selected?.lessonCount ?? 0}
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" /> Publicado
      </label>
      <button type="submit" className="btn-primary" disabled={!moduleId}>
        Adicionar aula
      </button>
    </form>
  );
}

function EditLessonDescriptionForm({ modules }: { modules: AdminModule[] }) {
  const options = useMemo(() => flattenLessons(modules), [modules]);
  const [lessonId, setLessonId] = useState(options[0]?.id ?? "");
  const selected = options.find((o) => o.id === lessonId);

  return (
    <form action={updateLessonDescriptionAction} className="space-y-2">
      <select
        name="lessonId"
        className="input"
        required
        value={lessonId}
        onChange={(e) => setLessonId(e.target.value)}
      >
        {options.length === 0 ? (
          <option value="">Nenhuma aula ainda</option>
        ) : (
          options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))
        )}
      </select>
      <textarea
        key={lessonId}
        name="description"
        className="input min-h-28"
        placeholder="Markdown: [texto](https://…) abre em nova guia. Downloads: [arquivo.zip](/materiais/…)"
        defaultValue={selected?.description ?? ""}
        maxLength={12000}
      />
      <button type="submit" className="btn-primary" disabled={!lessonId}>
        Salvar descrição
      </button>
    </form>
  );
}

export function AdminAulasPanel({ modules }: { modules: AdminModule[] }) {
  return (
    <div className="mt-4 max-w-3xl space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <details className="post-card !p-4">
          <summary className="cursor-pointer text-sm font-medium">
            Novo módulo
          </summary>
          <div className="mt-3">
            <CreateModuleForm modules={modules} />
          </div>
        </details>
        <details className="post-card !p-4">
          <summary className="cursor-pointer text-sm font-medium">
            Nova aula
          </summary>
          <p className="mt-1 text-xs text-muted">
            Escolha o módulo ou submódulo de destino. O formulário não se
            repete na árvore.
          </p>
          <div className="mt-3">
            <CreateLessonForm modules={modules} />
          </div>
        </details>
        <details className="post-card !p-4 sm:col-span-2">
          <summary className="cursor-pointer text-sm font-medium">
            Editar descrição da aula
          </summary>
          <p className="mt-1 text-xs text-muted">
            Texto simples. Anexos na descrição ainda não são suportados.
          </p>
          <div className="mt-3">
            <EditLessonDescriptionForm modules={modules} />
          </div>
        </details>
      </div>

      <div className="post-card !p-4">
        <p className="mb-2 text-sm font-medium">Árvore de aulas</p>
        {modules.length === 0 ? (
          <p className="text-sm text-muted">Nenhum módulo cadastrado.</p>
        ) : (
          <div className="space-y-1">
            {modules.map((mod, index) => (
              <ModuleTree
                key={mod.id}
                mod={mod}
                index={index}
                siblingCount={modules.length}
                depth={0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
