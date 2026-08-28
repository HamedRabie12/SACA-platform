"use client";

import { PageHeader } from "@/components/layout/page-header";
import { AdminHeader } from "@/components/layout/admin-header";
import { SecureLogout } from "@/components/layout/secure-logout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, Plus, Search, X, Edit3, Trash2, ShieldCheck,
  ChevronLeft, ChevronRight, Mail, Phone, MapPin,
  UserCheck, UserX,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type Member = {
  id: string;
  name: string;
  email: string | null;
  phoneE164: string | null;
  profession: string | null;
  interests: string | null;
  membershipType: string;
  accountState: string;
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  createdAt: string;
  state: { code: string; nameEn: string; nameAr: string } | null;
  city: { nameEn: string; nameAr: string } | null;
};

type StateLite = { code: string; nameEn: string; nameAr: string };

const STATE_BADGE: Record<string, { ar: string; en: string; color: string }> = {
  Active: { ar: "نشط", en: "Active", color: "bg-emerald-50 text-emerald-700" },
  Verified: { ar: "موثّق", en: "Verified", color: "bg-emerald-50 text-emerald-700" },
  PendingVerification: { ar: "قيد التحقق", en: "Pending", color: "bg-amber-50 text-amber-700" },
  Suspended: { ar: "موقوف", en: "Suspended", color: "bg-red-50 text-red-700" },
  Locked: { ar: "مقفل", en: "Locked", color: "bg-red-50 text-red-700" },
  Deactivated: { ar: "معطّل", en: "Deactivated", color: "bg-gray-100 text-gray-600" },
  Archived: { ar: "مؤرشف", en: "Archived", color: "bg-gray-100 text-gray-600" },
};

export default function AdminMembersPage() {
  const { lang } = useLanguage();
  const PageArrow = lang === "ar" ? ChevronRight : ChevronLeft;
  const [members, setMembers] = useState<Member[]>([]);
  const [states, setStates] = useState<StateLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ q: "", accountState: "", stateCode: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState({
    name: "", email: "", phoneE164: "", stateCode: "", profession: "", accountState: "Active",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/community/states")
      .then((r) => r.json())
      .then((d) => setStates(d.states ?? []))
      .catch(() => {});
  }, []);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", "30");
    if (filter.accountState) params.set("accountState", filter.accountState);
    if (filter.stateCode) params.set("state", filter.stateCode);
    try {
      const res = await fetch(`/api/admin/members?${params}`, {
              });
      const data = await res.json();
      setMembers(data.items ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setTotal(data.pagination?.total ?? 0);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [page, filter.accountState, filter.stateCode]);

  useEffect(() => {
    const t = setTimeout(fetchMembers, 200);
    return () => clearTimeout(t);
  }, [fetchMembers]);

  const filtered = filter.q
    ? members.filter((m) =>
        m.name.toLowerCase().includes(filter.q.toLowerCase()) ||
        (m.email ?? "").toLowerCase().includes(filter.q.toLowerCase()) ||
        (m.profession ?? "").toLowerCase().includes(filter.q.toLowerCase())
      )
    : members;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormMsg(null);
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setFormMsg(`❌ ${data.error || "Failed"}`); return; }
      setShowForm(false);
      setFormMsg(`✅ ${lang === "ar" ? "تمت إضافة العضو." : "Member added."}`);
      setForm({ name: "", email: "", phoneE164: "", stateCode: "", profession: "", accountState: "Active" });
      setTimeout(() => setFormMsg(null), 3000);
      setPage(1); fetchMembers();
    } catch (err) {
      setFormMsg(`❌ ${(err as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStateChange(id: string, accountState: string) {
    await fetch(`/api/admin/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountState }),
    });
    setMembers((arr) => arr.map((m) => (m.id === id ? { ...m, accountState } : m)));
  }

  async function handleDelete(id: string) {
    if (!confirm(lang === "ar" ? "تأكيد أرشفة العضو؟" : "Confirm archive?")) return;
    await fetch(`/api/admin/members/${id}`, {
      method: "DELETE",
          });
    setMembers((arr) => arr.filter((m) => m.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  }

  return (
    <main className="flex-1">
      <AdminHeader />
      <PageHeader
        title={lang === "ar" ? "إدارة الأعضاء" : "Manage members"}
        subtitle={lang === "ar" ? `${total} عضو مسجّل في المنصة` : `${total} registered members`}
        crumbs={[{ label: lang === "ar" ? "الإدارة" : "Admin", href: "/admin" }, { label: lang === "ar" ? "الأعضاء" : "Members" }]}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: lang === "ar" ? "إجمالي الأعضاء" : "Total members", value: total, color: "bg-emerald-700" },
            { label: lang === "ar" ? "نشطون" : "Active", value: members.filter((m) => m.accountState === "Active").length, color: "bg-teal-700" },
            { label: lang === "ar" ? "موثّقون" : "Verified", value: members.filter((m) => m.accountState === "Verified").length, color: "bg-amber-600" },
            { label: lang === "ar" ? "موقوفون" : "Suspended", value: members.filter((m) => m.accountState === "Suspended").length, color: "bg-red-700" },
          ].map((s, i) => (
            <div key={i} className={`rounded-2xl ${s.color} text-white p-4 shadow-sm`}>
              <div className="text-2xl font-bold tabular-nums">{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider opacity-80">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-gray-400" />
              <Input placeholder={lang === "ar" ? "ابحث بالاسم/البريد/المهنة…" : "Search…"} value={filter.q} onChange={(e) => setFilter((f) => ({ ...f, q: e.target.value }))} className="ps-9 rounded-xl" />
            </div>
            <select value={filter.accountState} onChange={(e) => { setFilter((f) => ({ ...f, accountState: e.target.value })); setPage(1); }} className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium">
              <option value="">{lang === "ar" ? "كل الحالات" : "All states"}</option>
              {Object.entries(STATE_BADGE).map(([k, v]) => (<option key={k} value={k}>{lang === "ar" ? v.ar : v.en}</option>))}
            </select>
            <select value={filter.stateCode} onChange={(e) => { setFilter((f) => ({ ...f, stateCode: e.target.value })); setPage(1); }} className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium">
              <option value="">{lang === "ar" ? "كل الولايات" : "All states"}</option>
              {states.map((s) => (<option key={s.code} value={s.code}>{lang === "ar" ? s.nameAr : s.nameEn} ({s.code})</option>))}
            </select>
            <Button onClick={() => setShowForm(true)} className="bg-[#047857] hover:bg-[#065f46] text-white rounded-xl">
              <Plus className="h-4 w-4 me-1.5" />{lang === "ar" ? "إضافة عضو" : "Add member"}
            </Button>
          </div>
          {formMsg && (<div className="mt-3 rounded-lg bg-gray-50 border px-3 py-2 text-xs font-medium">{formMsg}</div>)}
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center"><Users className="h-10 w-10 text-gray-300 mx-auto mb-2" /><p className="text-sm text-gray-500">{lang === "ar" ? "لا يوجد أعضاء مطابقون." : "No matching members."}</p></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((m) => {
                const badge = STATE_BADGE[m.accountState] || STATE_BADGE.Active;
                return (
                  <div key={m.id} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
                    <div className="relative flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#047857] to-[#064e3b] flex items-center justify-center text-white font-bold text-sm">{m.name.charAt(0).toUpperCase()}</div>
                      {m.emailVerifiedAt && (<div className="absolute -bottom-0.5 -end-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center"><ShieldCheck className="h-2.5 w-2.5 text-white" /></div>)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap"><div className="text-sm font-bold text-gray-900 truncate">{m.name}</div>
                        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${badge.color}`}>{lang === "ar" ? badge.ar : badge.en}</span></div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                        {m.email && (<span className="inline-flex items-center gap-0.5 truncate"><Mail className="h-2.5 w-2.5" /><span className="truncate">{m.email}</span></span>)}
                        {m.phoneE164 && (<span className="inline-flex items-center gap-0.5"><Phone className="h-2.5 w-2.5" /><span dir="ltr">{m.phoneE164}</span></span>)}
                        {m.state && (<span className="inline-flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{m.state[lang === "ar" ? "nameAr" : "nameEn"]}</span>)}
                        {m.profession && (<span className="truncate">· {m.profession}</span>)}
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-400 hidden md:block">{new Date(m.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { day: "numeric", month: "short", year: "numeric" })}</div>
                    <div className="flex items-center gap-1">
                      {m.accountState !== "Suspended" && (<Button variant="ghost" size="sm" onClick={() => handleStateChange(m.id, "Suspended")} className="h-8 px-2 text-amber-600 hover:bg-amber-50"><UserX className="h-3.5 w-3.5" /></Button>)}
                      {m.accountState === "Suspended" && (<Button variant="ghost" size="sm" onClick={() => handleStateChange(m.id, "Active")} className="h-8 px-2 text-emerald-600 hover:bg-emerald-50"><UserCheck className="h-3.5 w-3.5" /></Button>)}
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit3 className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)} className="h-8 w-8 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-500">{lang === "ar" ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl"><PageArrow className="h-3.5 w-3.5" />{lang === "ar" ? "السابق" : "Prev"}</Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl">{lang === "ar" ? "التالي" : "Next"}<ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" /></Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Member Drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full md:max-w-xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 px-5 py-3.5 bg-[#047857] text-white flex items-center justify-between z-10"><h3 className="font-bold">{lang === "ar" ? "إضافة عضو جديد" : "Add new member"}</h3><button onClick={() => setShowForm(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15"><X className="h-4 w-4" /></button></div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div><label className="text-xs font-semibold text-gray-700 mb-1.5 block">{lang === "ar" ? "الاسم *" : "Name *"}</label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="rounded-xl" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-gray-700 mb-1.5 block">{lang === "ar" ? "البريد" : "Email"}</label><Input type="email" dir="ltr" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="rounded-xl" /></div>
                <div><label className="text-xs font-semibold text-gray-700 mb-1.5 block">{lang === "ar" ? "الهاتف" : "Phone"}</label><Input type="tel" dir="ltr" value={form.phoneE164} onChange={(e) => setForm((f) => ({ ...f, phoneE164: e.target.value }))} className="rounded-xl" placeholder="+1..." /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-gray-700 mb-1.5 block">{lang === "ar" ? "الولاية" : "State"}</label><select value={form.stateCode} onChange={(e) => setForm((f) => ({ ...f, stateCode: e.target.value }))} className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm"><option value="">{lang === "ar" ? "اختر…" : "Select…"}</option>{states.map((s) => (<option key={s.code} value={s.code}>{lang === "ar" ? s.nameAr : s.nameEn} ({s.code})</option>))}</select></div>
                <div><label className="text-xs font-semibold text-gray-700 mb-1.5 block">{lang === "ar" ? "المهنة" : "Profession"}</label><Input value={form.profession} onChange={(e) => setForm((f) => ({ ...f, profession: e.target.value }))} className="rounded-xl" /></div>
              </div>
              <div><label className="text-xs font-semibold text-gray-700 mb-1.5 block">{lang === "ar" ? "الحالة" : "Account state"}</label><select value={form.accountState} onChange={(e) => setForm((f) => ({ ...f, accountState: e.target.value }))} className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm">{Object.entries(STATE_BADGE).map(([k, v]) => (<option key={k} value={k}>{lang === "ar" ? v.ar : v.en}</option>))}</select></div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100"><Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">{lang === "ar" ? "إلغاء" : "Cancel"}</Button><Button type="submit" disabled={submitting} className="bg-[#047857] hover:bg-[#065f46] text-white rounded-xl">{submitting ? (lang === "ar" ? "جارٍ الحفظ…" : "Saving…") : (<><Plus className="h-4 w-4 me-1.5" />{lang === "ar" ? "إضافة" : "Add"}</>)}</Button></div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

import { useEffect, useState, useCallback } from "react";
