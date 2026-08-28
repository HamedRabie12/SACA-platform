import { db } from "@/lib/db";
import { AdminGuard } from "@/components/layout/admin-guard";


export const dynamic = "force-dynamic";
export default async function AdminRiskPage() {
  const [critical, high, open] = await Promise.all([
    db.riskRegister.count({ where: { severity: "CRITICAL", status: { not: "CLOSED" } } }),
    db.riskRegister.count({ where: { severity: "HIGH", status: { not: "CLOSED" } } }),
    db.riskRegister.count({ where: { status: { not: "CLOSED" } } }),
  ]);
  return <AdminGuard><main className="min-h-screen bg-[var(--offwhite)] p-6"><div className="mx-auto max-w-7xl space-y-6">
    <header><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Risk</p><h1 className="mt-2 text-3xl font-black">سجل المخاطر المؤسسية</h1><p className="mt-2 text-slate-600">المخاطر الأمنية والحوكمية والتشغيلية التي تحتاج متابعة ومالكاً وخطة معالجة.</p></header>
    <div className="grid gap-4 md:grid-cols-3">{[
      ["مخاطر حرجة", critical], ["مخاطر عالية", high], ["إجمالي المفتوح", open]
    ].map(([label,value]) => <div key={String(label)} className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-3xl font-black text-emerald-800">{value}</div></div>)}</div>
  </div></main></AdminGuard>;
}
