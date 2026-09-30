import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() {
  if (!(await requireAdmin())) redirect("/admin/login");
  return <AdminDashboard />;
}
