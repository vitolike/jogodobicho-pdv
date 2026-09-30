import assert from "node:assert/strict";
import test from "node:test";
import { dateSchema } from "./schemas";

test("aceita apenas datas de calendário reais", () => {
  assert.equal(dateSchema.safeParse("2026-02-28").success, true);
  assert.equal(dateSchema.safeParse("2024-02-29").success, true);
  assert.equal(dateSchema.safeParse("2026-02-31").success, false);
  assert.equal(dateSchema.safeParse("2026-13-01").success, false);
  assert.equal(dateSchema.safeParse("2026-2-3").success, false);
});
