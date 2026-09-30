import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";
import { json } from "@/lib/http";

export async function POST(request: Request) {
  (await cookies()).delete(SESSION_COOKIE);
  return json({ ok: true }, 200, request);
}
