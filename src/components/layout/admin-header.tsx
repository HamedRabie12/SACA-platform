"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SecureLogout } from "@/components/layout/secure-logout";
import {
  ArrowLeft, ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

/**
 * Admin Header — shared across all admin sub-pages.
 * NOT using TopNav (which causes hydration errors with SSR + typeof window checks).
 * This is a pure client component with a consistent layout.
 */
export function AdminHeader() {
  const { lang } = useLanguage();
  const router = useRouter();

  // No mounted check needed — this component is always client-side via "use client"
  // and uses no window-dependent state. All state comes from props/context.

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <a href="/admin" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#047857] to-[#064e3b] text-white text-xs font-bold">
              S
            </div>
            <span className="text-sm font-bold text-gray-900">SACA Admin</span>
          </a>
          <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5">
            <ShieldCheck className="h-2.5 w-2.5" />
            {lang === "ar" ? "مؤمن" : "Secured"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a href="/" className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
            <ArrowLeft className="h-3 w-3" />
            {lang === "ar" ? "الموقع" : "View Site"}
          </a>
          <SecureLogout />
        </div>
      </div>
    </header>
  );
}
