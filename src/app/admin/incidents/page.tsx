import { db } from "@/lib/db";
import { AdminGuard } from "@/components/layout/admin-guard";


export const dynamic = "force-dynamic";
export default async function AdminIncidentsPage() {
  const incidents = await db.securityIncident.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return <AdminGuard><main className="min-h-screen bg-[var(--offwhite)] p-6"><div className="mx-auto max-w-7xl space-y-6">
    <header><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Security Incidents</p><h1 className="mt-2 text-3xl font-black">مركز الحوادث الأمنية</h1><p className="mt-2 text-slate-600">سجل مركزي للحوادث الأمنية مع الحالة والمالك والإغلاق.</p></header>
    <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      {incidents.length===0 ? <div className="p-8 text-slate-500">لا توجد حوادث مسجلة.</div> : <div className="divide-y">{incidents.map(i=><div key={i.id} className="p-5 flex items-center justify-between gap-4"><div><div className="font-bold">{i.title}</div><div className="text-xs text-slate-500 mt-1">{i.severity} · {i.status}</div></div><div className="text-xs text-slate-400">{i.createdAt.toISOString()}</div></div>)}</div>}
    </div>
  </div></main></AdminGuard>;
}
