import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export default async function ConstitutionPage() {
  const constitution = await db.constitution.findFirst({ where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" } });
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Constitution</p>
          <h1 className="mt-2 text-3xl font-black">الدستور والنظام الأساسي للجمعية</h1>
        </header>
        {!constitution ? (
          <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">لا توجد نسخة دستورية نشطة في قاعدة البيانات بعد. يجب استيراد النسخة المعتمدة قبل تفعيل قواعد الحوكمة.</section>
        ) : (
          <article className="whitespace-pre-wrap rounded-3xl border bg-white p-6 leading-8 text-slate-700 shadow-sm">{constitution.content}</article>
        )}
      </div>
    </main>
  );
}
