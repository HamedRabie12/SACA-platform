"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MembershipApplyPage() {
  const router = useRouter();
  const [sudaneseOrigin, setSudaneseOrigin] = useState(true);
  const [communityConnection, setCommunityConnection] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit() {
    setLoading(true); setMessage("");
    try {
      const res = await fetch("/api/community/membership/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sudaneseOrigin, communityConnection, rulesAccepted, residenceState: "MD" }) });
      const data = await res.json();
      if (!res.ok) return setMessage(data.error || "تعذر إرسال الطلب");
      setMessage("تم إرسال طلب العضوية للمراجعة. يمكنك متابعة الحالة من صفحة العضوية.");
      setTimeout(() => router.push("/portal/membership"), 800);
    } finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-[var(--brand-paper)] p-6"><div className="mx-auto max-w-2xl"><div className="surface-elevated rounded-3xl p-8"><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-700">Membership</p><h1 className="mt-2 text-3xl font-black">طلب العضوية</h1><p className="mt-3 text-sm text-slate-600">العضوية وفق شروط الدستور والنظام الأساسي للجمعية. الإقامة في ميريلاند شرط ضمن النص الحالي.</p><div className="mt-8 space-y-4"><label className="flex items-center gap-3"><input type="checkbox" checked={sudaneseOrigin} onChange={e=>setSudaneseOrigin(e.target.checked)} /> الأصل السوداني</label><label className="flex items-center gap-3"><input type="checkbox" checked={communityConnection} onChange={e=>setCommunityConnection(e.target.checked)} /> ارتباط بالجالية السودانية</label><label className="flex items-center gap-3"><input type="checkbox" checked={rulesAccepted} onChange={e=>setRulesAccepted(e.target.checked)} /> أوافق على الدستور واللوائح وسياسات المجتمع</label><button disabled={loading || (!sudaneseOrigin && !communityConnection) || !rulesAccepted} onClick={submit} className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white disabled:opacity-50">{loading?"جارٍ الإرسال…":"إرسال طلب العضوية"}</button>{message && <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}</div></div></div></main>;
}
