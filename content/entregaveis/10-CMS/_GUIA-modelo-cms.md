# Modelo de CMS — guia do aluno (Builders Club)

Tutorial completo para criar o painel em que o **cliente edita o próprio site**.
Leia com calma. No final você tem o CMS rodando no PC e sabe repetir por cliente.

Repositório template:
https://github.com/Dev-em-Dobro/criador-de-cms-builders

---

## Pasta por cliente (não misture tudo num deploy só)

No **seu fork**, cada cliente ganha uma pasta:

```
clients/
  padaria-da-rua/
  clinica-sorriso/
configs/
  padaria-da-rua.config.ts
  clinica-sorriso.config.ts
```

Na Vercel: **um projeto por cliente**, com Root Directory = `clients/<slug>/`.
É o mesmo jeito da Dev em Dobro. Depois você pode copiar um cliente para um
repo só dele, se quiser.

Não coloque dados reais de cliente num fork público. Prefira **privado**.

---

## O que é (e o que não é)

- **É** o painel admin (textos, posts, fotos, etc.).
- **Não é** o site público do cliente. O site continua separado e lê o CMS pela API.

---

## Contas (grátis no começo)

1. GitHub (fork)
2. Node.js 18+ e pnpm (`npm i -g pnpm`)
3. Supabase (projeto free) — banco + login do admin
4. Vercel — só quando for publicar
5. Resend / Bunny — opcional no primeiro teste

---

## Passo a passo

### 1. Preparar o PC

```bash
npm i -g pnpm
node -v
pnpm -v
```

### 2. Fork e clone

1. Abra o link do repositório acima → **Fork**
2. Clone o **seu** fork:

```bash
git clone https://github.com/SEU-USUARIO/criador-de-cms-builders.git
cd criador-de-cms-builders
pnpm install
```

### 3. Config do cliente

```bash
cp templates/config-examples/demo-corp.config.ts configs/meu-cliente.config.ts
```

Edite `slug` (minúsculas, hífen ok), `displayName` e cores. Valide:

```bash
pnpm cms-factory validate --config configs/meu-cliente.config.ts
```

### 4. Gerar a pasta do CMS (só no PC)

```bash
pnpm cms-factory create-client --config configs/meu-cliente.config.ts --skip-provision
```

`--skip-provision` = não cria nada na nuvem ainda. Só gera `clients/<slug>/`.

### 5. Projeto no Supabase

Crie um projeto. Copie URL, chave anon, service_role e as duas connection
strings (pooler 6543 = `DATABASE_URL`, direto 5432 = `DIRECT_URL`).

### 6. `.env.local`

```bash
cd clients/<seu-slug>
cp .env.example .env.local
```

Preencha (há comentários no arquivo). **Nunca** faça commit de `.env.local`.

### 7. Banco, admin e login

```bash
pnpm --filter <seu-slug> run db:migrate
pnpm --filter <seu-slug> run seed:locales
pnpm --filter <seu-slug> run seed:admin -- voce@email.com 'SenhaForte123!'
pnpm --filter <seu-slug> run dev
```

Abra http://localhost:3010 — login + MFA no celular. Crie um post de teste.

### 8. Segundo cliente

Repita com outro slug. Cada cliente: pasta própria + projeto Supabase próprio.

### 9. Publicar (quando for entregar)

Importe o fork na Vercel → Root Directory `clients/<slug>` → cole as envs → Deploy.

---

## Segurança

- Não versione `.env.local` nem `.factory.env`
- Depois do migrate, o harden fecha o banco — não pule
- Tokens de fábrica criam/apagam projetos: só use quando já souber o fluxo manual

---

## Se der erro

| Sintoma | Checar |
|---------|--------|
| pnpm não encontrado | Instalar pnpm de novo |
| validate falhou | Mensagem: slug/coleções |
| migrate falhou | URLs do banco + IP no Supabase |
| admin idioma errado | `seed:locales` |
| login não entra | senha do seed + MFA |
| porta ocupada | outro `dev` aberto |

Ainda travou? Manda print no grupo da comunidade.

Mais detalhes no README e em `docs/guia-alunos.md` do repositório.
