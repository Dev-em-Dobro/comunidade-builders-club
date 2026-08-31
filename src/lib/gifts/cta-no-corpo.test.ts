import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertSemCtaNoCorpo,
  CtaNoCorpoError,
  detectarCtaNoCorpo,
  type RegraCta,
} from "./cta-no-corpo";

function regras(body: string): RegraCta[] {
  return detectarCtaNoCorpo(body).map((a) => a.regra);
}

describe("detectarCtaNoCorpo — corpo limpo (F070)", () => {
  it("aceita artigo que termina no assunto", () => {
    const body = [
      "# O kit do Elevator Saga",
      "",
      "O jogo roda em https://play.elevatorsaga.com e o esqueleto está no",
      "repositório: https://github.com/exemplo/saga.",
      "",
      "Programação orientada a eventos é o mesmo raciocínio que empresa paga",
      "quando automatiza atendimento.",
    ].join("\n");
    assert.deepEqual(detectarCtaNoCorpo(body), []);
  });

  it("aceita corpo vazio", () => {
    assert.deepEqual(detectarCtaNoCorpo(""), []);
    assert.deepEqual(detectarCtaNoCorpo("   \n  "), []);
  });

  it("deixa citar o Club e os planos pelo nome", () => {
    const body =
      "A gente montou isso na comunidade; quem é PRO já tem o template pronto.";
    assert.deepEqual(detectarCtaNoCorpo(body), []);
  });

  it("deixa preço do cliente, que é o assunto do Presente", () => {
    const body = "Cobre R$ 2.000 pelo primeiro projeto e R$ 350 pela manutenção.";
    assert.deepEqual(detectarCtaNoCorpo(body), []);
  });

  it("deixa /login de outra ferramenta", () => {
    const body = "Abra https://app.n8n.cloud/login e cole o webhook.";
    assert.deepEqual(detectarCtaNoCorpo(body), []);
  });

  it("deixa cadastro em terceira pessoa", () => {
    const body = "O cadastro no n8n é gratuito e leva um minuto.";
    assert.deepEqual(detectarCtaNoCorpo(body), []);
  });
});

describe("detectarCtaNoCorpo — link de conversão", () => {
  it("pega caminho relativo", () => {
    assert.deepEqual(regras("Veja os [planos](/planos) da comunidade."), [
      "link-conversao",
    ]);
  });

  it("pega /cadastro e /login relativos", () => {
    assert.deepEqual(regras("Vá para /cadastro"), ["link-conversao"]);
    assert.deepEqual(regras("Entre em /login"), ["link-conversao"]);
  });

  it("pega URL absoluta no host do Club", () => {
    const body =
      "Detalhes em https://comunidade-builders-club.devemdobro.com/planos?motivo=x";
    assert.deepEqual(regras(body), ["link-conversao"]);
  });

  it("não confunde caminho parecido", () => {
    assert.deepEqual(detectarCtaNoCorpo("A pasta /planosdevoo do projeto"), []);
  });

  it("não pega o mesmo caminho em outro host", () => {
    assert.deepEqual(
      detectarCtaNoCorpo("Compare em https://concorrente.com/planos"),
      [],
    );
  });
});

describe("detectarCtaNoCorpo — checkout", () => {
  it("pega Hubla", () => {
    assert.deepEqual(regras("Compre em https://pay.hub.la/XaY8QNfZlOO1XBgjzMfY"), [
      "checkout",
    ]);
  });

  it("pega boleto TMB", () => {
    assert.deepEqual(
      regras("Boleto: https://pay.tmb.com.br/DevemDobro/9DW254247E5"),
      ["checkout"],
    );
  });
});

describe("detectarCtaNoCorpo — preço e promessa do produto", () => {
  it("pega o preço parcelado do PRO", () => {
    assert.deepEqual(regras("São 12x de R$ 30,18"), ["preco-do-produto"]);
  });

  it("pega o à vista do PRO mesmo com centavos", () => {
    assert.deepEqual(regras("Sai por R$ 297,00 à vista"), ["preco-do-produto"]);
  });

  it("pega o preço do Elite", () => {
    assert.deepEqual(regras("O Elite custa R$ 997"), ["preco-do-produto"]);
  });

  it("não pega número maior que só começa igual", () => {
    assert.deepEqual(detectarCtaNoCorpo("O contrato foi de R$ 2975"), []);
  });

  it("pega a promessa oficial", () => {
    assert.deepEqual(regras("Feche o 1º cliente em 90 dias"), [
      "promessa-do-produto",
    ]);
  });

  it("pega a variante solta uma vez só", () => {
    assert.deepEqual(regras("Você fecha o primeiro cliente em 90 dias."), [
      "promessa-do-produto",
    ]);
  });
});

describe("detectarCtaNoCorpo — pedido de cadastro", () => {
  it("pega crie sua conta", () => {
    assert.deepEqual(regras("Crie sua conta grátis nesta página."), [
      "pedido-de-cadastro",
    ]);
  });

  it("pega cadastre-se com e sem hífen", () => {
    assert.deepEqual(regras("Cadastre-se agora"), ["pedido-de-cadastro"]);
    assert.deepEqual(regras("Cadastre se agora"), ["pedido-de-cadastro"]);
  });

  it("pega faça seu cadastro, com acento e caixa alta", () => {
    assert.deepEqual(regras("FAÇA SEU CADASTRO"), ["pedido-de-cadastro"]);
  });

  it("pega assine o PRO e entre no Club", () => {
    assert.deepEqual(regras("Assine o PRO"), ["pedido-de-cadastro"]);
    assert.deepEqual(regras("Entre no Club hoje"), ["pedido-de-cadastro"]);
  });
});

describe("detectarCtaNoCorpo — relatório", () => {
  it("acumula regras distintas e aponta o trecho", () => {
    const body = [
      "Conteúdo do presente.",
      "",
      "Crie sua conta grátis e veja os [planos](/planos).",
    ].join("\n");
    const achados = detectarCtaNoCorpo(body);
    assert.equal(achados.length, 2);
    assert.deepEqual(new Set(achados.map((a) => a.regra)),
      new Set<RegraCta>(["pedido-de-cadastro", "link-conversao"]));
    for (const a of achados) {
      assert.ok(a.trecho.length > 0);
      assert.ok(a.motivo.length > 0);
    }
  });

  it("não repete o mesmo trecho por dois padrões da mesma regra", () => {
    const achados = detectarCtaNoCorpo("Feche o 1º cliente em 90 dias.");
    assert.equal(achados.length, 1);
  });
});

describe("assertSemCtaNoCorpo", () => {
  it("passa em corpo limpo", () => {
    assert.doesNotThrow(() => assertSemCtaNoCorpo("Só o assunto do artigo."));
  });

  it("lança CtaNoCorpoError com os achados", () => {
    try {
      assertSemCtaNoCorpo("Cadastre-se e veja https://pay.hub.la/abc");
      assert.fail("deveria ter lançado");
    } catch (e) {
      assert.ok(e instanceof CtaNoCorpoError);
      assert.equal(e.achados.length, 2);
      assert.match(e.message, /F070/);
    }
  });
});
