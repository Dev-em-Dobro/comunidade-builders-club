import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  avisarCompra,
  chaveCompraModulo,
  chaveCompraPlano,
  type DepsAvisoCompra,
} from "./email-compra";

function montar(opts: { falhar?: boolean; demoraMs?: number } = {}) {
  const reservados = new Set<string>();
  const enviados: string[] = [];
  const registros: Array<{ email: string; erro: string | null }> = [];
  const deps: DepsAvisoCompra = {
    reservar: async (email, chave) => {
      const k = `${email}|${chave}`;
      if (reservados.has(k)) return false;
      reservados.add(k);
      return true;
    },
    enviar: async ({ to }) => {
      if (opts.demoraMs) await new Promise((r) => setTimeout(r, opts.demoraMs));
      if (opts.falhar) throw new Error("Resend fora do ar");
      enviados.push(to);
    },
    registrar: async (email, _chave, erro) => {
      registros.push({ email, erro });
    },
    timeoutMs: 30,
  };
  return { enviados, registros, deps };
}

const PRO = { tipo: "pro" } as const;

describe("avisarCompra — F127", () => {
  it("manda uma vez e registra o envio", async () => {
    const d = montar();
    const r = await avisarCompra(["ana@example.com"], chaveCompraPlano("pro"), PRO, d.deps);
    assert.deepEqual(r.enviados, ["ana@example.com"]);
    assert.deepEqual(d.registros, [{ email: "ana@example.com", erro: null }]);
  });

  it("aviso repetido (ou segunda mensalidade) não manda de novo", async () => {
    const d = montar();
    const chave = chaveCompraPlano("pro");
    await avisarCompra(["ana@example.com"], chave, PRO, d.deps);
    const r = await avisarCompra(["ana@example.com"], chave, PRO, d.deps);
    assert.deepEqual(r.enviados, []);
    assert.equal(d.enviados.length, 1);
  });

  it("chaves diferentes mandam cada uma o seu", async () => {
    const d = montar();
    await avisarCompra(["ana@example.com"], chaveCompraPlano("pro"), PRO, d.deps);
    await avisarCompra(
      ["ana@example.com"],
      chaveCompraModulo("m1"),
      { tipo: "modulo", tituloModulo: "CRM com IA" },
      d.deps,
    );
    assert.equal(d.enviados.length, 2);
  });

  it("e-mail repetido no mesmo evento manda um só", async () => {
    const d = montar();
    await avisarCompra(["a@x.com", "a@x.com", "b@x.com"], chaveCompraPlano("pro"), PRO, d.deps);
    assert.deepEqual(d.enviados, ["a@x.com", "b@x.com"]);
  });

  it("falha no envio não lança e fica registrada", async () => {
    const d = montar({ falhar: true });
    const r = await avisarCompra(["ana@example.com"], chaveCompraPlano("pro"), PRO, d.deps);
    assert.deepEqual(r.enviados, []);
    assert.equal(d.registros[0]?.erro, "Resend fora do ar");
  });

  it("envio lento estoura o limite sem travar o webhook", async () => {
    const d = montar({ demoraMs: 200 });
    const r = await avisarCompra(["ana@example.com"], chaveCompraPlano("pro"), PRO, d.deps);
    assert.deepEqual(r.enviados, []);
    assert.match(d.registros[0]?.erro ?? "", /passou de 30 ms/);
  });

  it("falha ao reservar não lança", async () => {
    const d = montar();
    d.deps.reservar = async () => {
      throw new Error("banco fora");
    };
    const r = await avisarCompra(["ana@example.com"], chaveCompraPlano("pro"), PRO, d.deps);
    assert.deepEqual(r.enviados, []);
  });
});
