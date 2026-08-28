"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, Building2, Calendar, Newspaper, Video, ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type SearchResult = {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  href: string;
};

const TYPE_ICON: Record<string, typeof Building2> = {
  organization: Building2,
  event: Calendar,
  news: Newspaper,
  meeting: Video,
};

const TYPE_LABEL_AR: Record<string, string> = {
  organization: "منظمة",
  event: "فعالية",
  news: "خبر",
  meeting: "اجتماع",
};

const TYPE_LABEL_EN: Record<string, string> = {
  organization: "Organization",
  event: "Event",
  news: "News",
  meeting: "Meeting",
};

export function GlobalSearch() {
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Live search (debounced)
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/community/search?q=${encodeURIComponent(query)}&limit=8`
        );
        const data = await res.json();
        setResults(data.items ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Reset active index when results change
  useEffect(() => {
    setActiveIdx(0);
  }, [results]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && results[activeIdx]) {
      window.location.href = results[activeIdx].href;
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        aria-label={lang === "ar" ? "بحث" : "Search"}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary/60 hover:text-emerald-700 transition-premium"
      >
        <Search className="h-4 w-4" />
      </button>

      {/* Search overlay */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Search container */}
          <div className="absolute top-0 inset-x-0 bg-card shadow-premium-lg border-b border-border">
            <div className="mx-auto max-w-2xl px-4 py-4">
              <div className="relative">
                <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    lang === "ar"
                      ? "ابحث في المنظمات، الفعاليات، الأخبار، الاجتماعات…"
                      : "Search organizations, events, news, meetings…"
                  }
                  className="w-full h-12 ps-10 pe-10 rounded-xl border border-input bg-background text-sm font-medium focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute top-1/2 -translate-y-1/2 end-3 inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-secondary text-muted-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Results */}
              {(query.trim().length >= 2 || loading) && (
                <div className="mt-3 max-h-[60vh] overflow-y-auto rounded-xl border border-border bg-card shadow-premium">
                  {loading && (
                    <div className="px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full border-2 border-emerald-700/30 border-t-emerald-700 animate-spin" />
                      {lang === "ar" ? "جارٍ البحث…" : "Searching…"}
                    </div>
                  )}

                  {!loading && results.length === 0 && query.trim().length >= 2 && (
                    <div className="px-4 py-6 text-center">
                      <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {lang === "ar"
                          ? `لا توجد نتائج لـ "${query}"`
                          : `No results for "${query}"`}
                      </p>
                    </div>
                  )}

                  {!loading && results.length > 0 && (
                    <div className="divide-y divide-border/40">
                      {results.map((r, i) => {
                        const Icon = TYPE_ICON[r.type] || Building2;
                        const typeLabel =
                          lang === "ar"
                            ? TYPE_LABEL_AR[r.type] || r.type
                            : TYPE_LABEL_EN[r.type] || r.type;
                        const isActive = i === activeIdx;
                        return (
                          <a
                            key={`${r.type}-${r.id}`}
                            href={r.href}
                            onMouseEnter={() => setActiveIdx(i)}
                            className={`flex items-center gap-3 px-4 py-3 transition-premium ${
                              isActive ? "bg-emerald-50/50" : "hover:bg-secondary/40"
                            }`}
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 flex-shrink-0">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-foreground truncate">
                                {r.title}
                              </div>
                              {r.subtitle && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {r.subtitle}
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-md px-1.5 py-0.5 flex-shrink-0">
                              {typeLabel}
                            </span>
                            {isActive && (
                              <Arrow className="h-3.5 w-3.5 text-emerald-700 flex-shrink-0" />
                            )}
                          </a>
                        );
                      })}
                    </div>
                  )}

                  {/* Footer hint */}
                  {!loading && results.length > 0 && (
                    <div className="px-4 py-2 border-t border-border/40 text-[10px] text-muted-foreground flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5">
                        <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono">↑↓</kbd>
                        {lang === "ar" ? "للتنقل" : "navigate"}
                        <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono ms-1">↵</kbd>
                        {lang === "ar" ? "للاختيار" : "select"}
                      </span>
                      <span>
                        {results.length} {lang === "ar" ? "نتيجة" : "results"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
