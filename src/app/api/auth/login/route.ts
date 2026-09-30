import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { createToken, SESSION_COOKIE } from "@/lib/auth";
import { apiError, json, preflight } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const admin = await prisma.admin.findUnique({ where: { email: input.email } });
    if (!admin || !(await compare(input.password, admin.passwordHash))) return json({ error: "Credenciais inválidas." }, 401, request);

    (await cookies()).set(SESSION_COOKIE, await createToken(admin.id), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return json({ ok: true }, 200, request);
  } catch (error) {
    return apiError(error, request);
  }
}

export const OPTIONS = (request: Request) => preflight(request, "POST, OPTIONS");
