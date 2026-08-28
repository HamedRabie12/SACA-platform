import Link from "next/link";

export default function LegalStatusPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Legal Corporate Record</p>
          <h1 className="mt-2 text-3xl font-black">الوضع القانوني والوثائق التأسيسية</h1>
          <p className="mt-3 leading-7 text-slate-600">هذه الوثيقة سجل قانوني/مؤسسي منفصل عن الدستور واللوائح الداخلية.</p>
        </header>
        <section className="rounded-3xl border bg-slate-50 p-6">
          <dl className="grid gap-5 md:grid-cols-2">
            <Meta k="الاسم" v="SUDANESE AMERICAN COMMUNITY ASSOCIATION — SACA CORP." />
            <Meta k="الوثيقة" v="Articles of Revival for the Charter of a Maryland Corporation" />
            <Meta k="الجهة" v="Maryland Department of Assessments and Taxation" />
            <Meta k="التاريخ" v="November 07, 2025" />
            <Meta k="Acknowledgment" v="1000362015123153" />
            <Meta k="Authentication" v="JvlACuFEs0W4HJfLNYTyTg" />
            <Meta k="SHA-256" v="b7fd32e911113fe11438e37c8c90ba209803a2c1e32fe2db7adfe84d6347003c" />
          </dl>
        </section>
        <div className="flex flex-wrap gap-3">
          <a href="/legal-saca-articles-of-revival.pdf" target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white">عرض الوثيقة الأصلية</a>
          <a href="https://dat.maryland.gov/verify" target="_blank" rel="noreferrer" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700">التحقق من المصدر الرسمي</a>
          <Link href="/governance/constitution" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700">الدستور</Link>
        </div>
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">تنبيه: هذه الوثيقة ليست دستور الجالية ولا اللائحة الداخلية. تفسيرها القانوني النهائي يجب أن يعتمد على المصدر الرسمي والمراجعة القانونية عند الحاجة.</p>
      </div>
    </main>
  );
}
function Meta({ k, v }: { k: string; v: string }) { return <div><dt className="text-xs text-slate-500">{k}</dt><dd className="mt-1 font-semibold text-slate-900">{v}</dd></div>; }
