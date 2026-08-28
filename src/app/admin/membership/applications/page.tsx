"use client";
import { useEffect, useState } from "react";

export default function MembershipApplicationsAdmin() {
  const [apps,setApps]=useState<any[]>([]); const [busy,setBusy]=useState("");
  async function load(){const r=await fetch('/api/admin/membership/applications',{cache:'no-store'}); if(r.ok) setApps((await r.json()).applications||[]);}
  useEffect(()=>{load()},[]);
  async function update(id:string,status:string){setBusy(id);try{await fetch('/api/admin/membership/applications',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status})});await load()}finally{setBusy("")}}
  return <main className="min-h-screen bg-[var(--brand-paper)] p-6"><div className="mx-auto max-w-7xl"><h1 className="text-3xl font-black">طلبات العضوية</h1><div className="mt-6 grid gap-4">{apps.length?apps.map(a=><div key={a.id} className="surface-elevated rounded-2xl p-5"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><div className="font-bold">{a.memberId}</div><div className="text-xs text-slate-500">الحالة: {a.status}</div><div className="mt-1 text-xs text-slate-500">مقدم في {new Date(a.submittedAt).toLocaleString()}</div></div><div className="flex gap-2"><button disabled={busy===a.id} onClick={()=>update(a.id,'APPROVED')} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white">اعتماد</button><button disabled={busy===a.id} onClick={()=>update(a.id,'REQUEST_MORE_INFO')} className="rounded-lg bg-amber-100 px-3 py-2 text-xs font-bold text-amber-800">معلومات إضافية</button><button disabled={busy===a.id} onClick={()=>update(a.id,'REJECTED')} className="rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-700">رفض</button></div></div></div>):<div className="surface-elevated rounded-2xl p-6 text-slate-500">لا توجد طلبات عضوية معلقة.</div>}</div></div></main>;
}
