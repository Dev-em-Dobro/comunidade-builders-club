# Modelo de CMS — guia do aluno (Builders Club)

Crie o painel em que o **cliente edita o próprio site**. No final você tem o CMS
rodando no PC e sabe repetir o fluxo pra cada cliente novo.

Baixe o template em `.zip` na página do material (não precisa fazer fork).

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

---

## O que você entrega

- **É** o painel admin (textos, posts, fotos).
- **Não é** o site público. O site continua separado e lê o CMS pela API.

---

## O que você precisa ter

1. Node.js 18+ e pnpm (`npm i -g pnpm`)
2. Supabase (plano free)
3. Vercel (na hora de publicar)
4. GitHub — opcional no começo; útil depois pra versionar e ligar na Vercel

---

## Passo a passo

### 1. Instale Node e pnpm

```bash
npm i -g pnpm
node -v
pnpm -v
```

### 2. Baixe e abra o template

Na página do material, baixe o `.zip`, extraia a pasta `criador-de-cms-builders`
e abra no terminal.

### 3. Instale as dependências

```bash
cd caminho/para/criador-de-cms-builders
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

Crie um repositório **seu** no GitHub, envie essa pasta, importe na Vercel com
Root Directory `clients/<slug>`, cole as envs e faça o deploy.

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
