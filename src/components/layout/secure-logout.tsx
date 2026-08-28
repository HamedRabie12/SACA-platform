"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ChevronDown, ShieldCheck, AlertCircle } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

/**
 * Secure Logout Button — clears all session data and redirects.
 * Shows a confirmation dialog before logout.
 */
export function SecureLogout({ redirectTo = "/secure-portal" }: { redirectTo?: string }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowConfirm(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/session", { method: "DELETE", credentials: "include" });
    } finally {
      router.replace(redirectTo);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setShowConfirm((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-premium"
      >
        <LogOut className="h-3.5 w-3.5" />
        {lang === "ar" ? "تسجيل الخروج" : "Logout"}
        <ChevronDown className={`h-3 w-3 transition-transform ${showConfirm ? "rotate-180" : ""}`} />
      </button>

      {showConfirm && (
        <div className="absolute top-full mt-2 end-0 z-50 w-64 rounded-2xl bg-card border border-border shadow-premium-lg p-4 animate-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">
                {lang === "ar" ? "تأكيد تسجيل الخروج" : "Confirm Logout"}
              </h3>
              <p className="text-[10px] text-muted-foreground">
                {lang === "ar" ? "سيتم مسح جميع بيانات الجلسة" : "All session data will be cleared"}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-secondary/40 px-3 py-2 mb-3">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>
                {lang === "ar" ? "جلسة آمنة — سيتم مسح كل البيانات" : "Secure — all data will be wiped"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary/40"
            >
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </button>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-white px-3 py-2 text-xs font-semibold disabled:opacity-50"
            >
              {loggingOut ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  {lang === "ar" ? "جارٍ الخروج..." : "Logging out..."}
                </span>
              ) : (
                lang === "ar" ? "تأكيد الخروج" : "Confirm"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
