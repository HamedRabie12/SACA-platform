"use client";

import { useEffect, useState, type FormEvent } from "react";

type ServiceOption = { code: string; nameAr: string; nameEn?: string };
type ServiceRequestItem = { id: string; serviceCode: string; urgency: string; status: string; description: string };

type ServiceForm = { serviceCode: string; stateCode: string; language: string; urgency: string; description: string };

export default function ServiceRequestsPage() {
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [requests, setRequests] = useState<ServiceRequestItem[]>([]);
  const [form, setForm] = useState<ServiceForm>({ serviceCode: "", stateCode: "", language: "ar", urgency: "NORMAL", description: "" });
  const [msg, setMsg] = useState("");

  const load = () => {
    Promise.all([
      fetch("/api/community/services", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/community/service-requests", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([servicesJson, requestsJson]) => {
      setServices(servicesJson.services ?? []);
      setRequests(requestsJson.requests ?? []);
    }).catch(() => setMsg("تعذر تحميل بيانات الخدمات."));
  };

  useEffect(() => { load(); }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await fetch("/api/community/service-requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await response.json();
    if (!response.ok) {
      setMsg(json.error || "تعذر إرسال الطلب");
      return;
    }
    setMsg("تم إنشاء طلبك بنجاح.");
    setForm((current) => ({ ...current, description: "" }));
    load();
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-700">Community Support</p>
          <h1 className="mt-2 text-4xl font-black">طلب خدمة ومساعدة</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">أرسل طلباً حقيقياً إلى منصة الجالية وتابع حالته من الإرسال حتى الإحالة أو الحل.</p>
        </header>

        <form onSubmit={submit} className="grid gap-4 rounded-3xl border bg-white p-6 shadow-sm md:grid-cols-2">
          <select className="rounded-xl border p-3" value={form.serviceCode} onChange={(e) => setForm({ ...form, serviceCode: e.target.value })} required>
            <option value="">اختر الخدمة</option>
            {services.map((service) => <option key={service.code} value={service.code}>{service.nameAr}</option>)}
          </select>
          <input className="rounded-xl border p-3" placeholder="الولاية" value={form.stateCode} onChange={(e) => setForm({ ...form, stateCode: e.target.value })} />
          <select className="rounded-xl border p-3" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
            <option value="LOW">منخفض</option>
            <option value="NORMAL">عادي</option>
            <option value="HIGH">مرتفع</option>
            <option value="URGENT">عاجل</option>
          </select>
          <input className="rounded-xl border p-3" placeholder="اللغة المفضلة" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
          <textarea className="min-h-36 rounded-xl border p-3 md:col-span-2" placeholder="اشرح احتياجك بالتفصيل" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <button className="rounded-xl bg-emerald-800 px-5 py-3 font-black text-white md:col-span-2">إرسال الطلب</button>
        </form>

        {msg && <div className="rounded-xl border bg-white p-4 font-semibold">{msg}</div>}

        <section>
          <h2 className="text-2xl font-black">طلباتي</h2>
          <div className="mt-4 grid gap-3">
            {requests.map((request) => (
              <div key={request.id} className="rounded-2xl border bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="font-bold">{request.serviceCode}</div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{request.status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{request.description}</p>
              </div>
            ))}
            {requests.length === 0 && <div className="rounded-2xl border border-dashed p-6 text-slate-500">لا توجد طلبات بعد.</div>}
          </div>
        </section>
      </div>
    </main>
  );
}
