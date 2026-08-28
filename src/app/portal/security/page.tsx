"use client";

import { useEffect, useState } from "react";

type MemberSecurity = { member?: { name?: string | null } };

export default function PortalSecurity() {
  const [data, setData] = useState<MemberSecurity | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/community/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("AUTH_REQUIRED");
        setData(await response.json());
      })
      .catch(() => setError("تسجيل الدخول مطلوب لعرض مركز الأمان."));
  }, []);
  return <main className="min-h-screen bg-[var(--brand-paper)] px-4 py-10 md:px-8"><div className="mx-auto max-w-4xl"><p className="text-xs font-bold uppercase tracking-[.24em] text-emerald-700">Member Security</p><h1 className="mt-2 text-4xl font-black">أمان حسابي</h1>{error ? <div className="mt-8 rounded-2xl border bg-white p-6 text-sm text-red-700">{error}</div> : <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm"><p className="text-sm text-slate-600">الحساب الحالي: {data?.member?.name ?? "جاري التحقق..."}</p><div className="mt-6 grid gap-3 md:grid-cols-3"><div className="rounded-xl bg-emerald-50 p-4"><div className="text-xs text-emerald-800">الجلسة</div><div className="mt-1 font-bold">نشطة</div></div><div className="rounded-xl bg-slate-50 p-4"><div className="text-xs text-slate-500">MFA</div><div className="mt-1 font-bold">يتم إدارته من لوحة الأمان.</div></div><div className="rounded-xl bg-slate-50 p-4"><div className="text-xs text-slate-500">الخصوصية</div><div className="mt-1 font-bold">من مركز الخصوصية.</div></div></div></div>}</div></main>;
}
