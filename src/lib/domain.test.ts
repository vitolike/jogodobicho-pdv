import assert from "node:assert/strict";
import test from "node:test";
import { codigoPule, ganhou } from "./domain";

const premios = [1234, 5678, 9012, 3456, 7890];

test("apura todas as modalidades sem arredondar números", () => {
  assert.equal(ganhou("GRUPO", ["9"], premios), true);
  assert.equal(ganhou("DEZENA", ["34"], premios), true);
  assert.equal(ganhou("CENTENA", ["678"], premios), true);
  assert.equal(ganhou("MILHAR", ["9012"], premios), true);
  assert.equal(ganhou("DUQUE", ["9", "20"], premios), true);
  assert.equal(ganhou("TERNO", ["9", "20", "3"], premios), true);
  assert.equal(ganhou("MILHAR", ["0012"], premios), false);
});

test("gera código legível e único", () => {
  assert.equal(codigoPule(new Date("2026-09-29T12:00:00Z"), "abcdef12-0000-0000-0000-000000000000"), "JB-260929-ABCDEF");
});
