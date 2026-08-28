import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export default async function ElectionsPage() {
  const elections = await db.election.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Elections</p>
          <h1 className="mt-2 text-3xl font-black">الانتخابات</h1>
          <p className="mt-2 text-slate-600">لا يتم فتح التصويت إلا بعد استكمال الأهلية واللجنة الانتخابية والتهيئة والتدقيق الأمني.</p>
        </header>
        <div className="grid gap-4">
          {elections.length === 0 ? <div className="rounded-2xl border bg-white p-6 text-slate-600">لا توجد انتخابات مهيأة حالياً.</div> : elections.map((e) => <div key={e.id} className="rounded-2xl border bg-white p-5"><div className="text-lg font-bold">{e.name}</div><div className="mt-2 text-sm text-slate-500">الحالة: {e.status}</div></div>)}
        </div>
      </div>
    </main>
  );
}
