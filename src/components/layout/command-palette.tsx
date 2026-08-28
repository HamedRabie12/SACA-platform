"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Home, Building2, Calendar, Newspaper, Video, MapPin,
  Sparkles, Bell, User, Plus, Settings, LogOut, Activity,
  ShieldCheck, FileText, Bot, ChevronRight, ChevronLeft,
  Users, Heart, Briefcase, Star,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type Command = {
  id: string;
  title: string;
  subtitle?: string;
  icon: typeof Home;
  href?: string;
  action?: () => void;
  group: "navigate" | "search" | "actions" | "admin" | "account";
  keywords?: string[];
};

export function CommandPalette() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [searchResults, setSearchResults] = useState<
    Array<{ id: string; title: string; type: string; href: string; subtitle?: string }>
  >([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Listen for Ctrl+K / Cmd+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Auto-focus when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setActiveIdx(0);
    }
  }, [open]);

  // Build static command list
  const commands: Command[] = [
    // Navigate
    { id: "home", title: lang === "ar" ? "الصفحة الرئيسية" : "Home", icon: Home, href: "/", group: "navigate" },
    { id: "orgs", title: lang === "ar" ? "دليل المنظمات" : "Organizations Directory", icon: Building2, href: "/organizations", group: "navigate" },
    { id: "events", title: lang === "ar" ? "الفعاليات" : "Events", icon: Calendar, href: "/events", group: "navigate" },
    { id: "news", title: lang === "ar" ? "الأخبار" : "News", icon: Newspaper, href: "/news", group: "navigate" },
    { id: "meetings", title: lang === "ar" ? "الاجتماعات" : "Meetings", icon: Video, href: "/meetings", group: "navigate" },
    { id: "services", title: lang === "ar" ? "الخدمات المجتمعية" : "Community Services", icon: Heart, href: "/services", group: "navigate" },
    { id: "gallery", title: lang === "ar" ? "معرض الصور" : "Live Gallery", icon: Sparkles, href: "/gallery", group: "navigate" },
    { id: "library", title: lang === "ar" ? "المكتبة الرقمية" : "Media Library", icon: FileText, href: "/library", group: "navigate" },
    { id: "map", title: lang === "ar" ? "خريطة المجتمع" : "Community Map", icon: MapPin, href: "/organizations", group: "navigate" },
    { id: "my-community", title: lang === "ar" ? "مجتمعي" : "My Community", icon: User, href: "/my-community", group: "navigate" },
    { id: "members", title: lang === "ar" ? "دليل الأعضاء" : "Members Directory", icon: Users, href: "/members", group: "navigate" },
    // Actions
    { id: "register", title: lang === "ar" ? "إنشاء حساب جديد" : "Create new account", icon: Plus, href: "/auth/register", group: "actions" },
    { id: "login", title: lang === "ar" ? "تسجيل الدخول" : "Sign in", icon: User, href: "/auth/login", group: "actions" },
    { id: "ask-ai", title: lang === "ar" ? "اسأل المساعد الذكي" : "Ask the smart assistant", icon: Bot, href: "/", group: "actions" },
    // Admin
    { id: "admin", title: lang === "ar" ? "بوابة الإدارة" : "Admin Portal", icon: ShieldCheck, href: "/admin", group: "admin" },
    { id: "admin-orgs", title: lang === "ar" ? "إدارة المنظمات" : "Manage Organizations", icon: Building2, href: "/admin/organizations", group: "admin" },
    { id: "admin-events", title: lang === "ar" ? "إدارة الفعاليات" : "Manage Events", icon: Calendar, href: "/admin/events", group: "admin" },
    { id: "admin-news", title: lang === "ar" ? "إدارة الأخبار" : "Manage News", icon: Newspaper, href: "/admin/news", group: "admin" },
    { id: "admin-monitoring", title: lang === "ar" ? "مراقبة النظام" : "System Monitoring", icon: Activity, href: "/admin/monitoring", group: "admin" },
    { id: "admin-audit", title: lang === "ar" ? "سجلات التدقيق" : "Audit Logs", icon: FileText, href: "/admin/audit-logs", group: "admin" },
    { id: "admin-settings", title: lang === "ar" ? "إعدادات المنصة" : "Platform Settings", icon: Settings, href: "/admin/settings", group: "admin" },
    // Account
    { id: "notifications", title: lang === "ar" ? "مركز الإشعارات" : "Notifications", icon: Bell, href: "/#notifications", group: "account" },
    { id: "profile", title: lang === "ar" ? "ملفي الشخصي" : "My Profile", icon: User, href: "/my-community", group: "account" },
  ];

  // Filter static commands
  const q = query.trim().toLowerCase();
  const filteredCommands = q
    ? commands.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.keywords?.some((k) => k.toLowerCase().includes(q)) ?? false) ||
          c.group.includes(q)
      )
    : commands;

  // Live search platform data
  useEffect(() => {
    if (!q || q.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/community/search?q=${encodeURIComponent(q)}&limit=5`);
        const data = await res.json();
        setSearchResults(data.items ?? []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  // Combined list for keyboard nav
  const allItems = [
    ...filteredCommands.map((c) => ({ kind: "command" as const, data: c })),
    ...searchResults.map((s) => ({ kind: "search" as const, data: s })),
  ];

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  const execute = useCallback(
    (item: (typeof allItems)[number] | undefined) => {
      if (!item) return;
      if (item.kind === "command") {
        if (item.data.href) {
          router.push(item.data.href);
        } else if (item.data.action) {
          item.data.action();
        }
      } else {
        window.location.href = item.data.href;
      }
      setOpen(false);
    },
    [router]
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(allItems.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      execute(allItems[activeIdx]);
    }
  }

  // Group commands for display
  const groups: Array<{ key: string; label: string; items: typeof allItems }> = [];
  const cmds = allItems.filter((i) => i.kind === "command");
  if (cmds.length > 0) {
    ["navigate", "actions", "admin", "account"].forEach((g) => {
      const items = cmds.filter((c) => c.data.group === g);
      if (items.length > 0) {
        groups.push({
          key: g,
          label:
            g === "navigate"
              ? lang === "ar" ? "تنقل" : "Navigate"
              : g === "actions"
              ? lang === "ar" ? "إجراءات" : "Actions"
              : g === "admin"
              ? lang === "ar" ? "الإدارة" : "Admin"
              : lang === "ar" ? "الحساب" : "Account",
          items,
        });
      }
    });
  }
  const searches = allItems.filter((i) => i.kind === "search");
  if (searches.length > 0) {
    groups.push({ key: "search", label: lang === "ar" ? "نتائج البحث" : "Search results", items: searches });
  }

  const Arrow = lang === "ar" ? ChevronLeft : ChevronRight;
  let runningIdx = 0;

  return (
    <>
      {/* Floating hint button (bottom-left in RTL = visually on right) */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 start-5 z-40 hidden md:inline-flex items-center gap-2 rounded-full border border-border bg-card/95 backdrop-blur px-3 py-2 text-xs font-semibold text-muted-foreground shadow-premium hover:border-emerald-700/40 hover:text-emerald-700 transition-premium"
        aria-label="Command palette"
      >
        <Search className="h-3.5 w-3.5" />
        <span>{lang === "ar" ? "بحث سريع" : "Quick search"}</span>
        <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">Ctrl K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-2xl rounded-2xl bg-card border border-border shadow-premium-lg overflow-hidden">
            {/* Search input */}
            <div className="relative border-b border-border/60">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  lang === "ar"
                    ? "ابحث أو اكتب أمرًا… (مثال: منظمة، فعالية، إدارة)"
                    : "Search or type a command… (e.g., organization, event, admin)"
                }
                className="w-full h-14 ps-10 pe-24 text-sm font-medium bg-transparent border-0 focus:outline-none placeholder:text-muted-foreground"
              />
              <div className="absolute top-1/2 -translate-y-1/2 end-3 flex items-center gap-1">
                <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">Esc</kbd>
              </div>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
              {allItems.length === 0 && !searchLoading && q.length >= 2 && (
                <div className="px-4 py-8 text-center">
                  <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {lang === "ar" ? `لا توجد نتائج لـ "${query}"` : `No results for "${query}"`}
                  </p>
                </div>
              )}

              {groups.map((g) => (
                <div key={g.key}>
                  <div className="px-4 py-1.5 bg-secondary/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {g.label}
                  </div>
                  {g.items.map((item) => {
                    const idx = runningIdx++;
                    const isActive = idx === activeIdx;
                    if (item.kind === "command") {
                      const Icon = item.data.icon;
                      return (
                        <button
                          key={item.data.id}
                          onMouseEnter={() => setActiveIdx(idx)}
                          onClick={() => execute(item)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-start transition-premium ${
                            isActive ? "bg-emerald-50/60" : "hover:bg-secondary/30"
                          }`}
                        >
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${
                            isActive ? "bg-emerald-700 text-white" : "bg-secondary text-muted-foreground"
                          }`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-foreground truncate">
                              {item.data.title}
                            </div>
                            {item.data.subtitle && (
                              <div className="text-xs text-muted-foreground truncate">{item.data.subtitle}</div>
                            )}
                          </div>
                          {isActive && <Arrow className="h-4 w-4 text-emerald-700 flex-shrink-0" />}
                        </button>
                      );
                    } else {
                      const typeBadge: Record<string, string> = {
                        organization: "منظمة",
                        event: "فعالية",
                        news: "خبر",
                        meeting: "اجتماع",
                      };
                      return (
                        <button
                          key={`s-${item.data.id}`}
                          onMouseEnter={() => setActiveIdx(idx)}
                          onClick={() => execute(item)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-start transition-premium ${
                            isActive ? "bg-emerald-50/60" : "hover:bg-secondary/30"
                          }`}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 flex-shrink-0">
                            <Sparkles className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-foreground truncate">
                              {item.data.title}
                            </div>
                            {item.data.subtitle && (
                              <div className="text-xs text-muted-foreground truncate">{item.data.subtitle}</div>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-md px-1.5 py-0.5 flex-shrink-0">
                            {lang === "ar" ? typeBadge[item.data.type] || item.data.type : item.data.type}
                          </span>
                        </button>
                      );
                    }
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border/60 px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono">↑↓</kbd>
                  {lang === "ar" ? "تنقل" : "navigate"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono">↵</kbd>
                  {lang === "ar" ? "اختيار" : "select"}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5">
                <Bot className="h-3 w-3" />
                SACA · {lang === "ar" ? "أوامر سريعة" : "Quick actions"}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
