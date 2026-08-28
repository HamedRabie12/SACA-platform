import Link from "next/link";
import { HandHeart, CheckCircle2 } from "lucide-react";

export default function VolunteerPage() {
  return <main className="min-h-screen bg-[var(--brand-paper)] px-4 py-10 md:px-8">
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="brand-gradient rounded-[2rem] p-8 text-white shadow-2xl md:p-12">
        <p className="text-xs font-bold uppercase tracking-[.24em] text-amber-200">Community Participation</p>
        <h1 className="mt-3 text-4xl font-black">التطوع والمشاركة</h1>
        <p className="mt-4 max-w-2xl text-white/75 leading-8">حوّل مهاراتك ووقتك إلى أثر حقيقي داخل الجالية عبر بوابة التطوع، حيث يمكنك حفظ مهاراتك وتوافرك واهتماماتك ومتابعة التكليفات والساعات الموثقة.</p>
        <Link href="/portal/volunteer" className="mt-7 inline-flex rounded-xl bg-white px-5 py-3 font-bold text-emerald-900">الانتقال إلى بوابة التطوع</Link>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["البرامج الثقافية", "تنظيم الأنشطة والفعاليات والهوية الثقافية"],
          ["الخدمة المجتمعية", "المساعدة في مبادرات الدعم والإحالة"],
          ["الشباب والمرأة", "المشاركة في المبادرات التي تؤكد عليها الحوكمة"],
        ].map(([title, text]) => <div key={title} className="surface-elevated rounded-2xl p-6"><CheckCircle2 className="h-5 w-5 text-emerald-700"/><h2 className="mt-4 font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>)}
      </section>
    </div>
  </main>;
}
