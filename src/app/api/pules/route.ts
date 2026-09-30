import { Prisma } from "@prisma/client";
import { MULTIPLICADORES, codigoPule } from "@/lib/domain";
import { hojeBrasilia } from "@/lib/dates";
import { apiError, json, preflight } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { puleSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const input = puleSchema.parse(await request.json());
    const pagoCentavos = Math.round(input.valorPago * 100);
    const recebidoCentavos = Math.round(input.valorRecebido * 100);
    const dataSorteio = new Date(`${hojeBrasilia()}T12:00:00.000Z`);
    const pule = await prisma.$transaction(async (tx) => {
      if (await tx.sorteio.findUnique({ where: { data: dataSorteio }, select: { id: true } })) throw new Error("DIA_ENCERRADO");
      return tx.pule.create({
        data: { codigo: codigoPule(), modalidade: input.modalidade, numeros: input.numeros, valorPago: (pagoCentavos / 100).toFixed(2), valorRecebido: (recebidoCentavos / 100).toFixed(2), troco: ((recebidoCentavos - pagoCentavos) / 100).toFixed(2), multiplicador: MULTIPLICADORES[input.modalidade] },
        select: { codigo: true, modalidade: true, numeros: true, valorPago: true, valorRecebido: true, troco: true, dataHora: true, status: true },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return json(pule, 201, request);
  } catch (error) {
    if (error instanceof Error && error.message === "DIA_ENCERRADO") return json({ error: "O movimento de hoje já foi encerrado." }, 409, request);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") return json({ error: "Movimento concorrente. Tente novamente." }, 409, request);
    return apiError(error, request);
  }
}

export async function GET(request: Request) {
  const codigo = new URL(request.url).searchParams.get("codigo")?.trim().toUpperCase();
  if (!codigo || codigo.length > 32) return json({ error: "Código inválido." }, 400, request);
  const pule = await prisma.pule.findUnique({ where: { codigo }, select: { codigo: true, modalidade: true, numeros: true, valorPago: true, valorPremio: true, dataHora: true, status: true } });
  return pule ? json(pule, 200, request) : json({ error: "Pule não encontrada." }, 404, request);
}

export const OPTIONS = (request: Request) => preflight(request, "GET, POST, OPTIONS");
