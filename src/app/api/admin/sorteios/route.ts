import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { brasiliaDay } from "@/lib/dates";
import { ganhou } from "@/lib/domain";
import { apiError, json, preflight } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { sorteioSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  if (!(await requireAdmin(request))) return json({ error: "Não autorizado." }, 401, request);
  try {
    const input = sorteioSchema.parse(await request.json());
    const { inicio, fim } = brasiliaDay(input.data);
    const resultado = await prisma.$transaction(async (tx) => {
      const criado = await tx.sorteio.create({ data: { data: new Date(`${input.data}T12:00:00.000Z`), primeiro: input.premios[0], segundo: input.premios[1], terceiro: input.premios[2], quarto: input.premios[3], quinto: input.premios[4] } });
      const pules = await tx.pule.findMany({ where: { dataHora: { gte: inicio, lt: fim }, status: "PENDENTE" } });
      for (const pule of pules) {
        const premiada = ganhou(pule.modalidade, pule.numeros, input.premios);
        await tx.pule.update({
          where: { id: pule.id },
          data: {
            sorteioId: criado.id,
            status: premiada ? "PREMIADA" : "PERDIDA",
            valorPremio: premiada ? pule.valorPago.mul(pule.multiplicador) : new Prisma.Decimal(0),
          },
        });
      }
      return { sorteio: criado, apuradas: pules.length };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return json({ id: resultado.sorteio.id, apuradas: resultado.apuradas }, 201, request);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return json({ error: "Já existe sorteio para esta data." }, 409, request);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") return json({ error: "Movimento concorrente. Tente novamente." }, 409, request);
    return apiError(error, request);
  }
}

export const OPTIONS = (request: Request) => preflight(request, "POST, OPTIONS");
