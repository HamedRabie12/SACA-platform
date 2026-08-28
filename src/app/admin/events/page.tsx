"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AdminGuard } from "@/components/layout/admin-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar, Plus, Search, X, Edit3, Trash2, ShieldCheck,
  ChevronLeft, ChevronRight, Clock, MapPin, Video, Users,
  ArrowLeft, ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type EventItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  eventDate: string;
  location: string | null;
  isOnline: boolean;
  capacity: number;
  registeredCount: number;
  organizerName: string | null;
  status: string;
};

type StateLite = { code: string; nameEn: string; nameAr: string };

const CATEGORIES = [
  { value: "conference", ar: "مؤتمر", en: "Conference" },
  { value: "educational", ar: "تعليمية", en: "Educational" },
  { value: "cultural", ar: "ثقافية", en: "Cultural" },
  { value: "business", ar: "أعمال", en: "Business" },
  { value: "families", ar: "عائلية", en: "Family" },
  { value: "social", ar: "اجتماعية", en: "Social" },
];

export default function AdminEventsPage() {
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const PageArrow = lang === "ar" ? ChevronRight : ChevronLeft;
  // Auth handled by AdminGuard
  const [events, setEvents] = useState<EventItem[]>([]);
  const [states, setStates] = useState<StateLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ q: "", category: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState({
    title: "", description: "", category: "conference",
    eventDate: "", location: "", isOnline: false,
    capacity: 100, organizerName: "", stateCode: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/community/states")
      .then((r) => r.json())
      .then((d) => setStates(d.states ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => { if (alive) setLoading(true); });
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", "20");
    if (filter.category) params.set("category", filter.category);
    fetch(`/api/community/events?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setEvents(d.items ?? []);
        setTotalPages(d.pagination?.totalPages ?? 1);
      })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [page, filter.category]);

  // Client-side search filter
  const filtered = filter.q
    ? events.filter((e) =>
        e.title.toLowerCase().includes(filter.q.toLowerCase()) ||
        (e.description ?? "").toLowerCase().includes(filter.q.toLowerCase())
      )
    : events;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormSuccess(null);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
                  },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormSuccess(`❌ ${data.error || "Failed"}`);
        return;
      }
      setShowForm(false);
      setFormSuccess(lang === "ar" ? "✅ تم حفظ الفعالية في قاعدة البيانات." : "✅ Event saved to database.");
      setForm({
        title: "", description: "", category: "conference",
        eventDate: "", location: "", isOnline: false,
        capacity: 100, organizerName: "", stateCode: "",
      });
      setTimeout(() => setFormSuccess(null), 4000);
      // Refresh
      setPage(1);
    } catch (err) {
      setFormSuccess(`❌ ${(err as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(lang === "ar" ? "تأكيد إلغاء الفعالية؟" : "Confirm cancel?")) return;
    await fetch(`/api/admin/events/${id}`, {
      method: "DELETE",
          });
    setEvents((arr) => arr.filter((e) => e.id !== id));
  }

  

  return (
    <AdminGuard>
    <div className="flex-1">
      
      <PageHeader
        title={lang === "ar" ? "إدارة الفعاليات" : "Manage events"}
        subtitle={lang === "ar" ? "إنشاء، تعديل، أو حذف الفعاليات." : "Create, edit, or delete events."}
        crumbs={[
          { label: lang === "ar" ? "الإدارة" : "Admin", href: "/admin" },
          { label: lang === "ar" ? "الفعاليات" : "Events" },
        ]}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 flex-1">
        {/* Toolbar */}
        <div className="rounded-2xl bg-card border border-border shadow-premium p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={lang === "ar" ? "ابحث عن فعالية…" : "Search events…"}
                value={filter.q}
                onChange={(e) => setFilter((f) => ({ ...f, q: e.target.value }))}
                className="ps-9 rounded-xl"
              />
            </div>
            <select
              value={filter.category}
              onChange={(e) => { setFilter((f) => ({ ...f, category: e.target.value })); setPage(1); }}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-medium"
            >
              <option value="">{lang === "ar" ? "كل الفئات" : "All categories"}</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{lang === "ar" ? c.ar : c.en}</option>
              ))}
            </select>
            <Button onClick={() => setShowForm(true)} className="bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl">
              <Plus className="h-4 w-4 me-1.5" />
              {lang === "ar" ? "إضافة فعالية" : "Add event"}
            </Button>
          </div>
          {formSuccess && (
            <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
              {formSuccess}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-card border border-border shadow-premium overflow-hidden">
          <div className="px-4 py-3 border-b border-border/60">
            <h2 className="text-sm font-bold text-foreground">{filtered.length} {lang === "ar" ? "فعالية" : "events"}</h2>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد فعاليات." : "No events."}</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {filtered.map((e) => {
                const d = new Date(e.eventDate);
                const cat = CATEGORIES.find((c) => c.value === e.category);
                return (
                  <div key={e.id} className="px-4 py-3 flex items-center gap-3 hover:bg-secondary/30 transition-premium">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 flex-shrink-0">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">{e.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span>·</span>
                        <span>{lang === "ar" ? cat?.ar : cat?.en}</span>
                        {e.isOnline ? (
                          <><span>·</span><span className="inline-flex items-center gap-0.5 text-emerald-700"><Video className="h-3 w-3" /> {lang === "ar" ? "أونلاين" : "Online"}</span></>
                        ) : (
                          <><span>·</span><span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {e.location}</span></>
                        )}
                        {e.capacity > 0 && (
                          <><span>·</span><span className="inline-flex items-center gap-0.5"><Users className="h-3 w-3" /> {e.registeredCount}/{e.capacity}</span></>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      e.status === "Upcoming" ? "bg-emerald-50 text-emerald-700" :
                      e.status === "Live" ? "bg-red-50 text-red-600" :
                      "bg-secondary text-muted-foreground"
                    }`}>
                      {e.status}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit3 className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)} className="h-8 w-8 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></Button>
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
            <span className="text-xs text-muted-foreground">
              {lang === "ar" ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl">
                <PageArrow className="h-3.5 w-3.5" />
                {lang === "ar" ? "السابق" : "Prev"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl">
                {lang === "ar" ? "التالي" : "Next"}
                <Arrow className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full md:max-w-2xl bg-card rounded-t-3xl md:rounded-3xl shadow-premium-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 px-5 py-3.5 bg-emerald-700 text-white flex items-center justify-between z-10">
              <h3 className="font-bold">{lang === "ar" ? "إضافة فعالية جديدة" : "Add new event"}</h3>
              <button onClick={() => setShowForm(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "عنوان الفعالية *" : "Event title *"}</label>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="rounded-xl" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "الفئة" : "Category"}</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{lang === "ar" ? c.ar : c.en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "التاريخ والوقت *" : "Date & time *"}</label>
                  <Input type="datetime-local" value={form.eventDate} onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))} className="rounded-xl" required />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "الوصف *" : "Description *"}</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "الولاية" : "State"}</label>
                  <select value={form.stateCode} onChange={(e) => setForm((f) => ({ ...f, stateCode: e.target.value }))} className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                    <option value="">{lang === "ar" ? "اختر الولاية…" : "Select state…"}</option>
                    {states.map((s) => (
                      <option key={s.code} value={s.code}>{lang === "ar" ? s.nameAr : s.nameEn} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "المكان" : "Location"}</label>
                  <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="rounded-xl" placeholder="Houston, TX" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "الجهة المنظمة" : "Organizer"}</label>
                  <Input value={form.organizerName} onChange={(e) => setForm((f) => ({ ...f, organizerName: e.target.value }))} className="rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "السعة" : "Capacity"}</label>
                  <Input type="number" min={0} value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))} className="rounded-xl" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isOnline} onChange={(e) => setForm((f) => ({ ...f, isOnline: e.target.checked }))} className="h-4 w-4 rounded border-border text-emerald-700 focus:ring-emerald-700" />
                <span className="text-sm">{lang === "ar" ? "فعالية أونلاين" : "Online event"}</span>
              </label>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">{lang === "ar" ? "إلغاء" : "Cancel"}</Button>
                <Button type="submit" disabled={submitting} className="bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl">
                  {submitting ? (lang === "ar" ? "جارٍ الحفظ…" : "Saving…") : (
                    <><Plus className="h-4 w-4 me-1.5" />{lang === "ar" ? "إضافة الفعالية" : "Add event"}</>
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
