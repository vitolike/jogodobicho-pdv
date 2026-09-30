import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 10) {
    throw new Error("Defina ADMIN_EMAIL e ADMIN_PASSWORD com pelo menos 10 caracteres.");
  }

  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash: await hash(password, 12) },
    create: { email, passwordHash: await hash(password, 12) },
  });
}

main().finally(() => prisma.$disconnect());
