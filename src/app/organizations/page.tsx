"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { AIAssistantWidget } from "@/components/community/ai-assistant-widget";
import { OrganizationCard, type OrgCardData } from "@/components/community/organization-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Search, SlidersHorizontal, MapPin } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type StatesList = Array<{ code: string; nameEn: string; nameAr: string }>;

const TYPE_FILTERS = [
  { value: "association", ar: "رابطة", en: "Association", icon: "🤝" },
  { value: "center", ar: "مركز", en: "Center", icon: "🏛️" },
  { value: "mosque", ar: "مسجد", en: "Mosque", icon: "🕌" },
  { value: "education", ar: "تعليم", en: "Education", icon: "📚" },
  { value: "professional", ar: "مهنية", en: "Professional", icon: "💼" },
  { value: "charity", ar: "خيري", en: "Charity", icon: "❤️" },
];

export default function OrganizationsPage() {
  return (
    <Suspense fallback={null}>
      <OrganizationsContent />
    </Suspense>
  );
}

function OrganizationsContent() {
  const { lang, t } = useLanguage();
  const searchParams = useSearchParams();

  const [states, setStates] = useState<StatesList>([]);
  const [orgs, setOrgs] = useState<OrgCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({
    state: searchParams.get("state") ?? "",
    type: "",
    q: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch states once
  useEffect(() => {
    fetch("/api/community/states")
      .then((r) => r.json())
      .then((d) => setStates(d.states ?? []))
      .catch(() => {});
  }, []);

  // Fetch orgs whenever filters change
  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.state) params.set("state", filters.state);
    if (filters.type) params.set("type", filters.type);
    if (filters.q) params.set("q", filters.q);
    params.set("pageSize", "24");
    try {
      const res = await fetch(`/api/community/organizations?${params}`);
      const data = await res.json();
      setOrgs(data.items ?? []);
      setPagination(data.pagination ?? { page: 1, totalPages: 1, total: 0 });
    } catch {
      setOrgs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(fetchOrgs, 200);
    return () => clearTimeout(t);
  }, [fetchOrgs]);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <PageHeader
        title={lang === "ar" ? "دليل المنظمات السودانية" : "Sudanese Organizations Directory"}
        subtitle={
          lang === "ar"
            ? "استعرض جميع المنظمات والروابط والمراكز السودانية المسجلة في الولايات المتحدة. استخدم الفلاتر للبحث حسب الولاية أو النوع."
            : "Browse all registered Sudanese organizations, associations, and centers across the United States. Filter by state or type."
        }
        crumbs={[{ label: lang === "ar" ? "المنظمات" : "Organizations" }]}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 flex-1">
        {/* Search + Filters bar */}
        <div className="rounded-2xl bg-card border border-border shadow-premium p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={lang === "ar" ? "ابحث عن منظمة…" : "Search organizations…"}
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                className="ps-9 rounded-xl"
              />
            </div>
            <select
              value={filters.state}
              onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value }))}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-medium"
            >
              <option value="">{t("common.allStates")}</option>
              {states.map((s) => (
                <option key={s.code} value={s.code}>
                  {lang === "ar" ? s.nameAr : s.nameEn} ({s.code})
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={() => setShowFilters((v) => !v)}
              className="rounded-xl lg:hidden"
              size="icon"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Type filter chips */}
          <div className={`mt-3 ${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilters((f) => ({ ...f, type: "" }))}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-premium ${
                  filters.type === ""
                    ? "bg-emerald-700 text-white"
                    : "bg-secondary text-foreground hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                {t("common.allCategories")}
              </button>
              {TYPE_FILTERS.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setFilters((f) => ({ ...f, type: tf.value }))}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-premium ${
                    filters.type === tf.value
                      ? "bg-emerald-700 text-white"
                      : "bg-secondary text-foreground hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <span>{tf.icon}</span>
                  {lang === "ar" ? tf.ar : tf.en}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {loading ? (
              <span>{lang === "ar" ? "جارٍ التحميل…" : "Loading…"}</span>
            ) : (
              <>
                <span className="font-bold text-foreground">{pagination.total}</span>{" "}
                {lang === "ar" ? "منظمة" : "organizations found"}
                {filters.state && (
                  <span className="inline-flex items-center gap-1 ms-2 text-emerald-700">
                    <MapPin className="h-3 w-3" />
                    {states.find((s) => s.code === filters.state)?.[lang === "ar" ? "nameAr" : "nameEn"]}
                  </span>
                )}
              </>
            )}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        ) : orgs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {lang === "ar"
                ? "لا توجد منظمات مطابقة. جرّب تعديل الفلاتر."
                : "No matching organizations. Try adjusting filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up">
            {orgs.map((o) => (
              <OrganizationCard key={o.id} org={o} />
            ))}
          </div>
        )}
      </div>

      <Footer />
      <AIAssistantWidget />
    </main>
  );
}
