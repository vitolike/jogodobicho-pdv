import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  if (await requireAdmin()) redirect("/admin");
  return <main className="grid min-h-[100dvh] place-items-center p-4"><LoginForm /></main>;
}
