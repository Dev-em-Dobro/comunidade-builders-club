import { test } from "node:test";
import assert from "node:assert/strict";
import { fonteValida, normalizarSegundos } from "./registro";

test("fonte só aceita as duas conhecidas", () => {
  assert.equal(fonteValida("aula"), true);
  assert.equal(fonteValida("boas-vindas"), true);
  assert.equal(fonteValida("qualquer"), false);
  assert.equal(fonteValida(undefined), false);
  assert.equal(fonteValida(42), false);
});

test("segundos negativo ou lixo vira zero", () => {
  assert.equal(normalizarSegundos(-5), 0);
  assert.equal(normalizarSegundos("abc"), 0);
  assert.equal(normalizarSegundos(null), 0);
  assert.equal(normalizarSegundos(undefined), 0);
  assert.equal(normalizarSegundos(Number.NaN), 0);
  assert.equal(normalizarSegundos(Number.POSITIVE_INFINITY), 0);
});

test("segundos com fração é truncado", () => {
  assert.equal(normalizarSegundos(30.9), 30);
});

test("teto corta relógio maluco — 6 horas é o limite", () => {
  assert.equal(normalizarSegundos(999_999), 21_600);
  assert.equal(normalizarSegundos(21_600), 21_600);
});

test("número vindo como texto (corpo do sendBeacon) é aceito", () => {
  assert.equal(normalizarSegundos("120"), 120);
});
