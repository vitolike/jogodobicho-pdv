import { Modalidade } from "@prisma/client";
import { grupoDaDezena } from "./bichos";

export const MULTIPLICADORES: Record<Modalidade, number> = {
  GRUPO: 18,
  DEZENA: 60,
  CENTENA: 600,
  MILHAR: 4000,
  DUQUE: 300,
  TERNO: 3000,
};

export function ganhou(modalidade: Modalidade, numeros: string[], premios: number[]) {
  const grupos = new Set(premios.map(grupoDaDezena));
  if (modalidade === "GRUPO") return numeros.some((n) => grupos.has(Number(n)));
  if (modalidade === "DUQUE" || modalidade === "TERNO") {
    return numeros.every((n) => grupos.has(Number(n)));
  }

  const digitos = modalidade === "DEZENA" ? 2 : modalidade === "CENTENA" ? 3 : 4;
  return numeros.some((n) => premios.some((p) => String(p).padStart(4, "0").slice(-digitos) === n));
}

export function codigoPule(now = new Date(), random = crypto.randomUUID()) {
  const data = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "2-digit", month: "2-digit", day: "2-digit" }).format(now).replaceAll("-", "");
  return `JB-${data}-${random.slice(0, 6).toUpperCase()}`;
}
