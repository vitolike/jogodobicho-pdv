"use client";
import { useState } from "react";
import { KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router=useRouter();
  const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(formData:FormData) {
    setLoading(true); setError("");
    const response=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(formData))});
    const data=await response.json();
    if(!response.ok){setError(data.error);setLoading(false);return;} router.replace("/admin"); router.refresh();
  }
  return <section className="panel w-full max-w-md p-6 md:p-8"><KeyRound className="mb-5 text-[var(--yellow)]" size={36}/><h1 className="chalk text-4xl">Acesso do bicheiro</h1><p className="mt-2 text-sm text-[var(--muted)]">Entre para lançar o resultado e fechar o caixa.</p><form action={submit} className="mt-6 space-y-4"><label className="block text-sm">E-mail<input name="email" type="email" required autoComplete="username" className="mt-2 min-h-12 w-full border border-[var(--line)] bg-black/20 px-3"/></label><label className="block text-sm">Senha<input name="password" type="password" minLength={10} required autoComplete="current-password" className="mt-2 min-h-12 w-full border border-[var(--line)] bg-black/20 px-3"/></label><button disabled={loading} className="press min-h-14 w-full bg-[var(--yellow)] font-bold text-[#15231d] disabled:opacity-50">{loading?"ENTRANDO...":"ENTRAR"}</button><p aria-live="polite" className="min-h-5 text-sm text-[#ff9f8f]">{error}</p></form><Link href="/" className="mt-2 block text-center text-sm text-[var(--muted)] underline">Voltar ao balcão</Link></section>;
}
