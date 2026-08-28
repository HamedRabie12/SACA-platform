import { db } from "@/lib/db";
import { AdminGuard } from "@/components/layout/admin-guard";


export const dynamic = "force-dynamic";
export default async function AdminLegalDocumentsPage() {
  const docs = await db.legalDocument.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return <AdminGuard><main className="min-h-screen bg-[var(--offwhite)] p-6"><div className="mx-auto max-w-7xl space-y-6">
    <header><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Legal Records</p><h1 className="mt-2 text-3xl font-black">سجل الوثائق القانونية</h1><p className="mt-2 text-slate-600">الوثائق القانونية الرسمية محفوظة كإصدارات مستقلة مع مصدرها وتحققها وتدقيقها.</p></header>
    <div className="grid gap-4">{docs.length===0 ? <div className="rounded-3xl border bg-white p-8 text-slate-500">لم يتم تسجيل وثائق قانونية في قاعدة البيانات بعد. شغّل seed السجل القانوني بعد إعداد PostgreSQL.</div> : docs.map(d=><article key={d.id} className="rounded-3xl border bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-black">{d.title}</h2><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{d.status}</span></div><p className="mt-2 text-sm text-slate-600">{d.issuingAuthority} · {d.jurisdiction}</p><p className="mt-2 text-xs text-slate-500 break-all">SHA-256: {d.originalFileHash ?? "—"}</p></article>)}</div>
  </div></main></AdminGuard>;
}
