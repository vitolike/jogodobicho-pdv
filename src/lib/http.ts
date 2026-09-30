import { ZodError } from "zod";

export function json(data: unknown, status = 200, request?: Request) {
  const origin = request?.headers.get("origin");
  const allowed = process.env.APP_URL;
  const headers: HeadersInit = { "Cache-Control": "no-store" };
  if (origin && allowed && origin === allowed) Object.assign(headers, { "Access-Control-Allow-Origin": origin, Vary: "Origin" });
  return Response.json(data, { status, headers });
}

export function apiError(error: unknown, request?: Request) {
  if (error instanceof ZodError) return json({ error: error.issues[0]?.message ?? "Dados inválidos." }, 400, request);
  console.error(error);
  return json({ error: "Não foi possível concluir a operação." }, 500, request);
}

export function preflight(request: Request, methods: string) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== process.env.APP_URL) return new Response(null, { status: 403 });
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": methods, "Access-Control-Allow-Headers": "Content-Type, Authorization", "Access-Control-Max-Age": "86400", Vary: "Origin" } });
}
