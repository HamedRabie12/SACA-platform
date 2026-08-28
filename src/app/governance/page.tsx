import Link from "next/link";
export const dynamic = "force-dynamic";
import { db } from "@/lib/db";

export default async function GovernancePage() {
  const [constitution, boards, elections, rules] = await Promise.all([
    db.constitution.findFirst({ where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" } }),
    db.board.findMany({ where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" }, take: 10 }),
    db.election.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    db.constitutionRule.count({ where: { status: "ACTIVE" } }),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">SACA Governance</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">الحوكمة والدستور</h1>
          <p className="mt-2 max-w-3xl text-slate-600">مصدر قواعد الحوكمة داخل المنصة، مع فصل السجل القانوني عن الدستور واللوائح والسياسات.</p>
        </header>
        <section className="grid gap-4 md:grid-cols-4">
          <Card label="الدستور النشط" value={constitution ? constitution.version : "غير منشور"} />
          <Card label="قواعد الحوكمة" value={String(rules)} />
          <Card label="المجلس النشط" value={String(boards.length)} />
          <Card label="الانتخابات" value={String(elections.length)} />
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <LinkBox href="/governance/legal-status" title="الوضع القانوني" text="السجل القانوني وبيانات SACA CORP." />
          <LinkBox href="/governance/constitution" title="الدستور والنظام الأساسي" text="النسخة النشطة وقواعدها التنفيذية." />
          <LinkBox href="/elections" title="الانتخابات" text="نقطة الدخول لمنظومة الانتخابات الآمنة." />
          <LinkBox href="/admin" title="الإدارة" text="الوصول الإداري محمي بجلسة خادمية." />
        </div>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-xs text-slate-500">{label}</div><div className="mt-2 text-2xl font-black text-slate-900">{value}</div></div>;
}
function LinkBox({ href, title, text }: { href: string; title: string; text: string }) {
  return <Link href={href} className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><h2 className="text-lg font-bold text-slate-900">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></Link>;
}
