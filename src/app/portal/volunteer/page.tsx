"use client";

import { useEffect, useState, type FormEvent } from "react";

type VolunteerData = {
  status: string;
  skills: string | null;
  availability: string | null;
  interests: string | null;
  assignments?: Array<unknown>;
  hours?: Array<{ hours: number }>;
};

type FormState = { skills: string; availability: string; interests: string };

export default function VolunteerPortal() {
  const [data, setData] = useState<VolunteerData | null>(null);
  const [form, setForm] = useState<FormState>({ skills: "", availability: "", interests: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/community/volunteer", { cache: "no-store" })
      .then((response) => response.json())
      .then((json: { volunteer?: VolunteerData }) => {
        if (!json.volunteer) return;
        setData(json.volunteer);
        setForm({
          skills: json.volunteer.skills ?? "",
          availability: json.volunteer.availability ?? "",
          interests: json.volunteer.interests ?? "",
        });
      })
      .catch(() => setMsg("تعذر تحميل ملف التطوع."));
  }, []);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await fetch("/api/community/volunteer", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await response.json();
    setMsg(response.ok ? "تم حفظ ملف التطوع." : json.error || "تعذر الحفظ");
    if (response.ok) setData(json.volunteer);
  };

  const verifiedHours = data?.hours?.reduce((sum, entry) => sum + entry.hours, 0) ?? 0;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-700">Volunteer</p>
          <h1 className="mt-2 text-4xl font-black">بوابة التطوع</h1>
          <p className="mt-3 text-slate-600">سجّل مهاراتك وتوافرك واهتماماتك ليتم ربطك ببرامج الجالية.</p>
        </header>

        <form onSubmit={save} className="space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
          <textarea className="min-h-28 w-full rounded-xl border p-3" placeholder="المهارات" value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} />
          <textarea className="min-h-24 w-full rounded-xl border p-3" placeholder="التوافر" value={form.availability} onChange={(event) => setForm({ ...form, availability: event.target.value })} />
          <textarea className="min-h-24 w-full rounded-xl border p-3" placeholder="الاهتمامات" value={form.interests} onChange={(event) => setForm({ ...form, interests: event.target.value })} />
          <button className="rounded-xl bg-emerald-800 px-5 py-3 font-black text-white">حفظ ملف التطوع</button>
          {msg && <span className="ms-3 text-sm font-semibold">{msg}</span>}
        </form>

        {data && (
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-white p-5">
              <div className="text-xs text-slate-500">الحالة</div>
              <div className="mt-2 font-black">{data.status}</div>
            </div>
            <div className="rounded-2xl border bg-white p-5">
              <div className="text-xs text-slate-500">التكليفات</div>
              <div className="mt-2 text-2xl font-black">{data.assignments?.length ?? 0}</div>
            </div>
            <div className="rounded-2xl border bg-white p-5">
              <div className="text-xs text-slate-500">ساعات موثقة</div>
              <div className="mt-2 text-2xl font-black">{verifiedHours}</div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
