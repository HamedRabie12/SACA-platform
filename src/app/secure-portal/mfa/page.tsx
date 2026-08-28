"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminMfaPage() {
  const router = useRouter();
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function begin() {
    setError("");
    const res = await fetch("/api/admin/mfa/setup", { method: "POST", headers: { "Content-Type": "application/json" } });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Unable to prepare MFA");
    if (data.alreadyConfigured) {
      setSetup(null);
      return;
    }
    setSetup({ secret: data.secret, uri: data.uri });
  }

  async function verify() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/mfa/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Invalid code");
      router.push("/admin");
      router.refresh();
    } finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-[var(--brand-paper)] p-6"><div className="mx-auto max-w-xl"><div className="surface-elevated rounded-3xl p-8"><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-700">SACA Security</p><h1 className="mt-2 text-3xl font-black">المصادقة متعددة العوامل</h1><p className="mt-3 text-sm text-slate-600">يجب إكمال MFA قبل الوصول إلى لوحة الإدارة.</p>{!setup && <button className="mt-6 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white" onClick={begin}>إعداد تطبيق المصادقة</button>}{setup && <div className="mt-6 space-y-4"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">المفتاح السري</div><div className="mt-1 break-all font-mono font-bold">{setup.secret}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs text-emerald-800">otpauth URI</div><div className="mt-1 break-all text-xs">{setup.uri}</div></div><input inputMode="numeric" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g, ""))} className="h-12 w-full rounded-xl border border-slate-200 px-4 text-center text-2xl tracking-[.5em]" placeholder="000000"/><button disabled={loading || code.length !== 6} className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white disabled:opacity-50" onClick={verify}>تحقق وتفعيل MFA</button></div>}{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}</div></div></main>;
}
