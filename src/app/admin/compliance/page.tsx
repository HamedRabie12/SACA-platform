import { db } from "@/lib/db";
import { AdminGuard } from "@/components/layout/admin-guard";


export const dynamic = "force-dynamic";
export default async function AdminCompliancePage() {
  const [rules, checks, alerts] = await Promise.all([
    db.complianceRule.count({ where: { status: "ACTIVE" } }),
    db.complianceCheck.count(),
    db.complianceAlert.count({ where: { status: "OPEN" } }),
  ]);
  return <AdminGuard><main className="min-h-screen bg-[var(--offwhite)] p-6"><div className="mx-auto max-w-7xl space-y-6">
    <header><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Compliance</p><h1 className="mt-2 text-3xl font-black">مركز الامتثال</h1><p className="mt-2 text-slate-600">متابعة قواعد الحوكمة والامتثال والتنبيهات المفتوحة من مصدر واحد.</p></header>
    <div className="grid gap-4 md:grid-cols-3">{[
      ["القواعد النشطة", rules], ["فحوص الامتثال", checks], ["تنبيهات مفتوحة", alerts]
    ].map(([label,value]) => <div key={String(label)} className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-3xl font-black text-emerald-800">{value}</div></div>)}</div>
  </div></main></AdminGuard>;
}
