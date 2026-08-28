"use client";

import { useEffect, useState } from "react";

type PrivacyRequestItem = { id: string; type: string; status: string; details?: string | null };

export default function PrivacyPage() {
  const [items, setItems] = useState<PrivacyRequestItem[]>([]);
  const [msg, setMsg] = useState("");

  const load = () => fetch("/api/community/privacy", { cache: "no-store" })
    .then((r) => r.json())
    .then((json) => setItems(json.requests || []));

  useEffect(() => { load().catch(() => setMsg("تسجيل الدخول مطلوب.")); }, []);

  const request = async (type: string) => {
    const response = await fetch("/api/community/privacy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type }),
    });
    const json = await response.json();
    setMsg(response.ok ? "تم إنشاء طلب الخصوصية." : json.error || "تعذر إنشاء الطلب");
    load().catch(() => undefined);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-700">Privacy Center</p>
          <h1 className="mt-2 text-4xl font-black">مركز الخصوصية</h1>
          <p className="mt-3 leading-7 text-slate-600">طلبات تصدير وتصحيح وحذف البيانات، مع سجل واضح للحالة.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          <button onClick={() => request("EXPORT")} className="rounded-2xl border bg-white p-6 text-right shadow-sm hover:shadow-md"><div className="font-black">تصدير بياناتي</div><p className="mt-2 text-sm text-slate-500">طلب نسخة من بيانات الحساب.</p></button>
          <button onClick={() => request("CORRECTION")} className="rounded-2xl border bg-white p-6 text-right shadow-sm hover:shadow-md"><div className="font-black">تصحيح بياناتي</div><p className="mt-2 text-sm text-slate-500">إرسال طلب مراجعة لبيانات غير دقيقة.</p></button>
          <button onClick={() => request("DELETION")} className="rounded-2xl border bg-white p-6 text-right shadow-sm hover:shadow-md"><div className="font-black">حذف الحساب</div><p className="mt-2 text-sm text-slate-500">طلب حذف يخضع لسياسة الاحتفاظ.</p></button>
        </div>
        {msg && <div className="rounded-xl border bg-white p-4 font-semibold">{msg}</div>}
        <section>
          <h2 className="text-2xl font-black">سجل الطلبات</h2>
          <div className="mt-4 grid gap-3">
            {items.map((item) => <div key={item.id} className="flex items-center justify-between rounded-2xl border bg-white p-5"><span>{item.type}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{item.status}</span></div>)}
            {items.length === 0 && <div className="rounded-2xl border border-dashed p-6 text-slate-500">لا توجد طلبات.</div>}
          </div>
        </section>
      </div>
    </main>
  );
}
