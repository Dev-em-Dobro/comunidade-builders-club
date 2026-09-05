import { test } from "node:test";
import assert from "node:assert/strict";
import { acumular, estadoInicial } from "./tempo";

/** Simula uma sequência de `currentTime` e devolve o total assistido. */
function total(tempos: number[]): number {
  let e = estadoInicial();
  for (const t of tempos) e = acumular(e, t);
  return Math.round(e.assistido * 100) / 100;
}

test("reprodução contínua soma tudo", () => {
  // O player manda várias vezes por segundo; aqui, de meio em meio.
  assert.equal(total([0.5, 1, 1.5, 2, 2.5, 3]), 3);
});

test("arrastar a barra NÃO conta — foi o furo achado em homologação", () => {
  // Abriu, viu 2s e jogou a barra para o minuto 4.
  assert.equal(total([1, 2, 224, 225]), 3);
});

test("rebobinar não soma, mas o trecho revisto volta a contar", () => {
  // Assistiu até 10s, voltou para 5s, assistiu de novo até 7s.
  assert.equal(total([2, 4, 6, 8, 10, 5, 6, 7]), 12);
});

test("vídeo parado no mesmo ponto não inventa audiência", () => {
  // Passo zero não soma, por mais eventos que cheguem.
  assert.equal(total([0.5, 1, 1, 1, 1]), 1);
});

test("quem começa pelo meio não ganha o trecho que não viu", () => {
  // Primeiro evento já em 5s (retomada ou barra arrastada antes do 1º evento):
  // o salto inicial não conta, e a contagem começa dali para a frente.
  assert.equal(total([5, 5.5, 6]), 1);
});

test("valor inválido do player é ignorado sem quebrar a conta", () => {
  assert.equal(total([1, 2, Number.NaN, 3, -1, 4]), 4);
});

test("um salto no limite ainda conta como reprodução", () => {
  assert.equal(total([2, 4]), 4);
  // Um pouco acima do limite, não.
  assert.equal(total([2, 4.5]), 2);
});
