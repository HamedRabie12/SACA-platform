"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Position = { id: string; code: string; nameAr: string; nameEn: string; seatCount: number };
type Candidate = { id: string; positionId: string | null; statement: string | null; member: { id: string; name: string; avatarUrl: string | null } | null };
export default function VotePage() {
  const params = useParams<{ id: string }>(); const router = useRouter();
  const [data, setData] = useState<{ positions: Position[]; candidates: Candidate[]; election: { name: string; status: string } } | null>(null);
  const [credential, setCredential] = useState<string | null>(null);
  const [choices, setChoices] = useState<Record<string,string>>({});
  const [receipt, setReceipt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const load = async () => {
      const e = await fetch(`/api/elections/${params.id}/eligibility`, { cache: "no-store" });
      const ej = await e.json(); if (!e.ok || !ej.eligible) { setError(ej.reason || ej.error || "غير مؤهل للتصويت"); return; }
      const b = await fetch(`/api/elections/${params.id}/ballot`, { cache: "no-store" }); const bj = await b.json(); if (!b.ok) { setError(bj.error || "تعذر تحميل بطاقة التصويت"); return; }
      setCredential(ej.credential || null); setData(bj);
    }; load();
  }, [params.id]);
  if (receipt) return <main className="min-h-screen bg-slate-950 grid place-items-center px-6"><div className="w-full max-w-xl rounded-3xl bg-white p-8 text-center"><div className="text-sm font-bold text-emerald-700">تم استلام صوتك</div><h1 className="mt-2 text-3xl font-black">إيصال التصويت</h1><p className="mt-4 text-slate-600">احتفظ بهذا الرمز للتحقق من إدخال بطاقة الاقتراع دون كشف اختيارك.</p><code className="mt-6 block rounded-xl bg-slate-100 p-4 text-sm break-all">{receipt}</code><button onClick={()=>router.push(`/elections/${params.id}`)} className="mt-6 rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white">العودة</button></div></main>;
  if (error) return <main className="min-h-screen bg-slate-50 grid place-items-center px-6"><div className="max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center"><h1 className="text-2xl font-black">تعذر التصويت</h1><p className="mt-3 text-amber-900">{error}</p></div></main>;
  if (!data || !credential) return <main className="min-h-screen bg-slate-50 grid place-items-center">جاري التحقق...</main>;
  const submit = async () => { setError(null); const r=await fetch(`/api/elections/${params.id}/vote`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({credential,choices})}); const j=await r.json(); if(!r.ok){setError(j.error||"تعذر إرسال التصويت");return;} setReceipt(j.receiptCode); };
  return <main className="min-h-screen bg-slate-950 px-4 py-10 text-white"><div className="mx-auto max-w-4xl"><div className="mb-8"><p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-300">Secure Voting</p><h1 className="mt-2 text-4xl font-black">{data.election.name}</h1><p className="mt-3 text-white/70">التصويت يتم مرة واحدة لكل عضو مؤهل، وتفصل المنصة هوية الأهلية عن سجل بطاقة الاقتراع.</p></div><div className="space-y-6">{data.positions.map(p=><section key={p.id} className="rounded-3xl border border-white/10 bg-white/5 p-6"><h2 className="text-xl font-black">{p.nameAr}</h2><div className="mt-4 grid gap-3">{data.candidates.filter(c=>c.positionId===p.id).map(c=><label key={c.id} className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 ${choices[p.id]===c.id?'border-emerald-400 bg-emerald-400/10':'border-white/10 bg-white/[.03]'}`}><input type="radio" name={p.id} checked={choices[p.id]===c.id} onChange={()=>setChoices(prev=>({...prev,[p.id]:c.id}))}/><div><div className="font-bold">{c.member?.name || "مرشح"}</div><div className="text-sm text-white/60">{c.statement || ""}</div></div></label>)}</div></section>)}</div><button onClick={submit} className="mt-8 w-full rounded-2xl bg-emerald-500 px-6 py-4 text-lg font-black text-slate-950 hover:bg-emerald-400">إرسال صوتي</button></div></main>;
}
