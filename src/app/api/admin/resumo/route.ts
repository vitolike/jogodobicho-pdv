import { requireAdmin } from "@/lib/auth";
import { brasiliaDay, hojeBrasilia } from "@/lib/dates";
import { apiError, json, preflight } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { dateSchema } from "@/lib/schemas";

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) return json({ error: "Não autorizado." }, 401, request);
  try {
    const data = dateSchema.parse(new URL(request.url).searchParams.get("data") ?? hojeBrasilia());
    const { inicio, fim } = brasiliaDay(data);
    const [somas, status, sorteio, vencedoras] = await Promise.all([
      prisma.pule.aggregate({ where: { dataHora: { gte: inicio, lt: fim } }, _sum: { valorPago: true, valorPremio: true }, _count: true }),
      prisma.pule.groupBy({ by: ["status"], where: { dataHora: { gte: inicio, lt: fim } }, _count: true }),
      prisma.sorteio.findUnique({ where: { data: new Date(`${data}T12:00:00.000Z`) } }),
      prisma.pule.findMany({ where: { dataHora: { gte: inicio, lt: fim }, status: "PREMIADA" }, select: { codigo: true, modalidade: true, numeros: true, valorPago: true, valorPremio: true }, orderBy: { valorPremio: "desc" } }),
    ]);
    const arrecadado = Number(somas._sum.valorPago ?? 0);
    const premios = Number(somas._sum.valorPremio ?? 0);
    return json({ data, totalPules: somas._count, arrecadado, premios, resultado: arrecadado - premios, status, sorteio, vencedoras }, 200, request);
  } catch (error) {
    return apiError(error, request);
  }
}

export const OPTIONS = (request: Request) => preflight(request, "GET, OPTIONS");
