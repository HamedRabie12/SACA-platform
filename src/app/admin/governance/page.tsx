import Link from "next/link";
import { AdminGuard } from "@/components/layout/admin-guard";

const sections = [
  ["الدستور", "/governance/constitution", "النص النشط والإصدارات والقواعد المرجعية."],
  ["الوضع القانوني", "/governance/legal-status", "السجل القانوني الرسمي وشهادة SACA CORP."],
  ["الانتخابات", "/elections", "حالة الانتخابات والأهلية والنتائج عند اكتمال النظام."],
  ["الامتثال", "/admin/compliance", "القواعد والفحوص والتنبيهات الحوكمية."],
  ["المخاطر", "/admin/risk", "سجل المخاطر والمالكين وخطط المعالجة."],
  ["الحوادث الأمنية", "/admin/incidents", "الحوادث والحالة والإغلاق والتوثيق."],
  ["الوثائق القانونية", "/admin/legal-documents", "سجل الوثائق القانونية وإصداراتها وhash."],
];

export default function AdminGovernance() {
  return <AdminGuard><main className="min-h-screen bg-[var(--offwhite)] p-6"><div className="mx-auto max-w-7xl space-y-8">
    <header><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Governance Command Center</p><h1 className="mt-2 text-4xl font-black">مركز الحوكمة والامتثال</h1><p className="mt-3 max-w-3xl text-slate-600 leading-7">مركز موحّد لإدارة الدستور والوثائق القانونية والانتخابات والامتثال والمخاطر والحوادث، مع فصل واضح بين السجل القانوني والدستور واللوائح.</p></header>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{sections.map(([title,href,description])=><Link key={href} href={href} className="rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"><div className="text-lg font-black text-slate-900">{title}</div><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p></Link>)}</div>
  </div></main></AdminGuard>;
}
