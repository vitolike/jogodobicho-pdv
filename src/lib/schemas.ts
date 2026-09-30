import { Modalidade } from "@prisma/client";
import { z } from "zod";

export const dateSchema = z.string().date();

const formato: Record<Modalidade, RegExp> = {
  GRUPO: /^(0?[1-9]|1\d|2[0-5])$/,
  DEZENA: /^\d{2}$/,
  CENTENA: /^\d{3}$/,
  MILHAR: /^\d{4}$/,
  DUQUE: /^(0?[1-9]|1\d|2[0-5])$/,
  TERNO: /^(0?[1-9]|1\d|2[0-5])$/,
};

export const loginSchema = z.object({
  email: z.string().email().max(160).transform((v) => v.toLowerCase()),
  password: z.string().min(10).max(128),
});

export const puleSchema = z.object({
  modalidade: z.nativeEnum(Modalidade),
  numeros: z.array(z.string()).min(1).max(10),
  valorPago: z.number().positive().max(100_000),
  valorRecebido: z.number().positive().max(100_000),
}).superRefine((data, ctx) => {
  const quantidade = data.modalidade === "DUQUE" ? 2 : data.modalidade === "TERNO" ? 3 : 1;
  if (data.numeros.length !== quantidade) ctx.addIssue({ code: "custom", path: ["numeros"], message: `Informe ${quantidade} número(s).` });
  if (new Set(data.numeros).size !== data.numeros.length) ctx.addIssue({ code: "custom", path: ["numeros"], message: "Não repita números." });
  if (data.numeros.some((n) => !formato[data.modalidade].test(n))) ctx.addIssue({ code: "custom", path: ["numeros"], message: "Número inválido para a modalidade." });
  if (data.valorRecebido < data.valorPago) ctx.addIssue({ code: "custom", path: ["valorRecebido"], message: "Valor recebido é menor que a aposta." });
  if ([data.valorPago, data.valorRecebido].some((v) => Math.abs(v * 100 - Math.round(v * 100)) > 1e-8)) ctx.addIssue({ code: "custom", path: ["valorPago"], message: "Use no máximo duas casas decimais." });
});

export const sorteioSchema = z.object({
  data: dateSchema,
  premios: z.array(z.number().int().min(0).max(9999)).length(5),
});
