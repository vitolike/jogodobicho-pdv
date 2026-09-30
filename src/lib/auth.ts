import "server-only";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { SESSION_COOKIE } from "./session";

export { SESSION_COOKIE } from "./session";

function key() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET deve ter 32 caracteres ou mais.");
  return new TextEncoder().encode(secret);
}

export async function createToken(adminId: string) {
  return new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" }).setSubject(adminId).setIssuedAt().setExpirationTime("8h").sign(key());
}

export async function verifyToken(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return payload.role === "admin" ? payload.sub ?? null : null;
  } catch {
    return null;
  }
}

export async function requireAdmin(request?: Request) {
  const bearer = request?.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifyToken(bearer ?? cookie);
}
