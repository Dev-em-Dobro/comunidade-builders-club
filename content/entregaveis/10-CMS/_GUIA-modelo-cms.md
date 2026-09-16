# Modelo de CMS — guia do aluno (Builders Club)

Crie o painel em que o **cliente edita o próprio site**. No final você tem o CMS
rodando no PC e sabe repetir o fluxo pra cada cliente novo.

Template (botão "Abrir o template no GitHub" na página do material):
https://github.com/Dev-em-Dobro/criador-de-cms-builders

---

## Um CMS por cliente

Cada cliente ganha a própria pasta no seu projeto:

```
clients/
  padaria-da-rua/
  clinica-sorriso/
configs/
  padaria-da-rua.config.ts
  clinica-sorriso.config.ts
```

Na Vercel: **um projeto por cliente**, com Root Directory = `clients/<slug>/`.
Com dados reais, deixe o projeto **privado**.

---

## O que você entrega

- **É** o painel admin (textos, posts, fotos).
- **Não é** o site público. O site continua separado e lê o CMS pela API.

---

## O que você precisa ter

1. GitHub
2. Node.js 18+ e pnpm (`npm i -g pnpm`)
3. Supabase (plano free)
4. Vercel (na hora de publicar)
5. Resend / Bunny — opcional no primeiro teste

---

## Passo a passo

### 1. Instale Node e pnpm

```bash
npm i -g pnpm
node -v
pnpm -v
```

### 2. Copie o template pro seu GitHub

Fork do template → copie a URL do **seu** projeto (Code → HTTPS).

### 3. Baixe pro PC e instale

```bash
git clone https://github.com/SEU-USUARIO/criador-de-cms-builders.git
cd criador-de-cms-builders
pnpm install
```

### 4. Config do cliente

```bash
cp templates/config-examples/demo-corp.config.ts configs/meu-cliente.config.ts
```

Edite `slug` e `displayName`. Valide:

```bash
pnpm cms-factory validate --config configs/meu-cliente.config.ts
```

### 5. Gere a pasta do CMS

```bash
pnpm cms-factory create-client --config configs/meu-cliente.config.ts --skip-provision
```

### 6. Projeto no Supabase

Crie um projeto e copie URL, chave anon, service_role e as connection strings
(pooler 6543 = `DATABASE_URL`, direto 5432 = `DIRECT_URL`).

### 7. `.env.local`

```bash
cd clients/<seu-slug>
cp .env.example .env.local
```

Preencha. **Nunca** faça commit desse arquivo.

### 8. Banco, admin e login

```bash
pnpm --filter <seu-slug> run db:migrate
pnpm --filter <seu-slug> run seed:locales
pnpm --filter <seu-slug> run seed:admin -- voce@email.com 'SenhaForte123!'
pnpm --filter <seu-slug> run dev
```

Abra http://localhost:3010 — login + MFA. Crie um post de teste.

### 9. Próximo cliente

Outro slug, outra pasta, outro projeto Supabase.

### 10. Publicar na Vercel

Importe o seu projeto → Root Directory `clients/<slug>` → cole as envs → Deploy.

---

## Se der erro

| Sintoma | Checar |
|---------|--------|
| pnpm não encontrado | Instalar pnpm de novo |
| validate falhou | Mensagem: slug/coleções |
| migrate falhou | URLs do banco + IP no Supabase |
| admin idioma errado | `seed:locales` |
| login não entra | senha do seed + MFA |

Ainda travou? Manda print no grupo da comunidade.
