"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/layout/admin-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2, Plus, Search, CheckCircle2, Clock, AlertCircle, X,
  ArrowLeft, ArrowRight, Trash2, Edit3, ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type Org = {
  id: string;
  name: string;
  type: string;
  verification: string;
  state?: { code: string; nameAr: string; nameEn: string } | null;
  city?: { nameAr: string; nameEn: string } | null;
};

type StateLite = { code: string; nameEn: string; nameAr: string };

const VERIFICATION_BADGE: Record<string, { ar: string; en: string; icon: typeof CheckCircle2; color: string }> = {
  Verified: { ar: "موثقة", en: "Verified", icon: ShieldCheck, color: "bg-emerald-50 text-emerald-700" },
  PendingVerification: { ar: "قيد المراجعة", en: "Pending", icon: Clock, color: "bg-amber-50 text-amber-700" },
  Unverified: { ar: "غير موثقة", en: "Unverified", icon: AlertCircle, color: "bg-secondary text-muted-foreground" },
  Suspended: { ar: "موقوفة", en: "Suspended", icon: X, color: "bg-red-50 text-red-700" },
  Archived: { ar: "مؤرشفة", en: "Archived", icon: ShieldCheck, color: "bg-secondary text-muted-foreground" },
};

const TYPE_LABEL: Record<string, { ar: string; en: string }> = {
  association: { ar: "رابطة", en: "Association" },
  center: { ar: "مركز", en: "Center" },
  mosque: { ar: "مسجد", en: "Mosque" },
  education: { ar: "تعليم", en: "Education" },
  professional: { ar: "مهنية", en: "Professional" },
  charity: { ar: "خيري", en: "Charity" },
};

export default function AdminOrganizationsPage() {
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
    const [orgs, setOrgs] = useState<Org[]>([]);
  const [states, setStates] = useState<StateLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ q: "", verification: "" });
  const [form, setForm] = useState({
    name: "",
    type: "association",
    description: "",
    stateCode: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    hoursAr: "",
    services: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  

  useEffect(() => {
    fetch("/api/community/states")
      .then((r) => r.json())
      .then((d) => setStates(d.states ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.q) params.set("q", filter.q);
    if (filter.verification) params.set("verification", filter.verification);
    params.set("pageSize", "100");
    fetch(`/api/community/organizations?${params}`)
      .then((r) => r.json())
      .then((d) => { if (alive) setOrgs(d.items ?? []); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [filter]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!form.name.trim() || !form.description.trim()) {
      setFormError(lang === "ar" ? "الاسم والوصف مطلوبان" : "Name and description are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
                  },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || (lang === "ar" ? "فشل الحفظ" : "Failed to save"));
        return;
      }
      setFormSuccess(
        lang === "ar"
          ? "تمت إضافة المنظمة بنجاح إلى قاعدة البيانات."
          : "Organization added to database successfully."
      );
      setForm({
        name: "", type: "association", description: "", stateCode: "",
        address: "", phone: "", email: "", website: "", hoursAr: "", services: "",
      });
      setShowForm(false);
      // Refresh list
      setTimeout(() => {
        setFilter((f) => ({ ...f }));
      }, 500);
    } catch {
      setFormError(lang === "ar" ? "حدث خطأ" : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(lang === "ar" ? "تأكيد حذف المنظمة؟" : "Confirm delete?")) return;
    const res = await fetch(`/api/admin/organizations/${id}`, {
      method: "DELETE",
          });
    if (res.ok) {
      setOrgs((arr) => arr.filter((o) => o.id !== id));
    }
  }

  async function handleVerify(id: string) {
    const res = await fetch(`/api/admin/organizations/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
              },
      body: JSON.stringify({ verification: "Verified" }),
    });
    if (res.ok) {
      setOrgs((arr) =>
        arr.map((o) => (o.id === id ? { ...o, verification: "Verified" } : o))
      );
    }
  }

  

  return (
    <AdminGuard>
    <div className="flex-1">
      
      <div className="border-b border-border/60 bg-gradient-to-b from-emerald-50/40 to-transparent">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8 py-6">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <a href="/admin" className="hover:text-emerald-700">{lang === "ar" ? "الإدارة" : "Admin"}</a>
            <Arrow className="h-3 w-3 opacity-60 rtl:rotate-180" />
            <span className="text-foreground font-medium">{lang === "ar" ? "المنظمات" : "Organizations"}</span>
          </nav>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
                {lang === "ar" ? "إدارة المنظمات" : "Manage organizations"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {lang === "ar" ? "إضافة، تحقق، تعديل، إيقاف، أو حذف المنظمات." : "Add, verify, edit, suspend, or delete organizations."}
              </p>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl">
              <Plus className="h-4 w-4 me-1.5" />
              {lang === "ar" ? "إضافة منظمة" : "Add organization"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 flex-1">
        {/* Filters */}
        <div className="rounded-2xl bg-card border border-border shadow-premium p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={lang === "ar" ? "ابحث بالاسم أو الوصف…" : "Search by name or description…"}
                value={filter.q}
                onChange={(e) => setFilter((f) => ({ ...f, q: e.target.value }))}
                className="ps-9 rounded-xl"
              />
            </div>
            <select
              value={filter.verification}
              onChange={(e) => setFilter((f) => ({ ...f, verification: e.target.value }))}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-medium"
            >
              <option value="">{lang === "ar" ? "كل الحالات" : "All statuses"}</option>
              <option value="Verified">{lang === "ar" ? "موثقة" : "Verified"}</option>
              <option value="PendingVerification">{lang === "ar" ? "قيد المراجعة" : "Pending"}</option>
              <option value="Unverified">{lang === "ar" ? "غير موثقة" : "Unverified"}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-card border border-border shadow-premium overflow-hidden">
          <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">
              {orgs.length} {lang === "ar" ? "منظمة" : "organizations"}
            </h2>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
            </div>
          ) : orgs.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد منظمات مطابقة." : "No matching organizations."}</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {orgs.map((o) => {
                const badge = VERIFICATION_BADGE[o.verification] || VERIFICATION_BADGE.Unverified;
                const BadgeIcon = badge.icon;
                const typeLabel = TYPE_LABEL[o.type] || { ar: o.type, en: o.type };
                return (
                  <div key={o.id} className="px-4 py-3 flex items-center gap-3 hover:bg-secondary/30 transition-premium">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 flex-shrink-0">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">{o.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{lang === "ar" ? typeLabel.ar : typeLabel.en}</span>
                        {o.state && (
                          <>
                            <span>·</span>
                            <span>{o.state[lang === "ar" ? "nameAr" : "nameEn"]}</span>
                          </>
                        )}
                        {o.city && (
                          <>
                            <span>·</span>
                            <span>{o.city[lang === "ar" ? "nameAr" : "nameEn"]}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${badge.color}`}>
                      <BadgeIcon className="h-2.5 w-2.5" />
                      {lang === "ar" ? badge.ar : badge.en}
                    </span>
                    <div className="flex items-center gap-1">
                      {o.verification !== "Verified" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVerify(o.id)}
                          className="h-8 px-2 text-emerald-700 hover:bg-emerald-50"
                          title={lang === "ar" ? "توثيق" : "Verify"}
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(o.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      

      {/* Add Organization Drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full md:max-w-2xl bg-card rounded-t-3xl md:rounded-3xl shadow-premium-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 px-5 py-3.5 bg-emerald-700 text-white flex items-center justify-between z-10">
              <h3 className="font-bold">{lang === "ar" ? "إضافة منظمة جديدة" : "Add new organization"}</h3>
              <button onClick={() => setShowForm(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "اسم المنظمة *" : "Organization name *"}</label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="rounded-xl" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "النوع" : "Type"}</label>
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                    {Object.entries(TYPE_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>{lang === "ar" ? v.ar : v.en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "الولاية" : "State"}</label>
                  <select value={form.stateCode} onChange={(e) => setForm((f) => ({ ...f, stateCode: e.target.value }))} className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                    <option value="">{lang === "ar" ? "اختر الولاية…" : "Select state…"}</option>
                    {states.map((s) => (
                      <option key={s.code} value={s.code}>{lang === "ar" ? s.nameAr : s.nameEn} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "الوصف *" : "Description *"}</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "العنوان" : "Address"}</label>
                  <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "الهاتف" : "Phone"}</label>
                  <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="rounded-xl" dir="ltr" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "البريد" : "Email"}</label>
                  <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="rounded-xl" dir="ltr" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "الموقع الإلكتروني" : "Website"}</label>
                  <Input value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} className="rounded-xl" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "ساعات العمل" : "Working hours"}</label>
                <Input value={form.hoursAr} onChange={(e) => setForm((f) => ({ ...f, hoursAr: e.target.value }))} className="rounded-xl" placeholder={lang === "ar" ? "مثال: السبت - الخميس: 9 صباحًا - 5 مساءً" : "e.g., Sat-Thu: 9am - 5pm"} />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "الخدمات (مفصولة بفواصل)" : "Services (comma-separated)"}</label>
                <Input value={form.services} onChange={(e) => setForm((f) => ({ ...f, services: e.target.value }))} className="rounded-xl" placeholder={lang === "ar" ? "مثال: دعم اجتماعي, فعالية ثقافية" : "e.g., social support, cultural events"} />
              </div>

              {formError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{formError}</div>
              )}
              {formSuccess && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">{formSuccess}</div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="submit" disabled={submitting} className="bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl">
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      {lang === "ar" ? "جارٍ الحفظ…" : "Saving…"}
                    </span>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 me-1.5" />
                      {lang === "ar" ? "إضافة المنظمة" : "Add organization"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </AdminGuard>
  );
}
