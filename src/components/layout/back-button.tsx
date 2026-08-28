"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

/**
 * Back Button — professional, consistent back navigation.
 * Uses browser history when available, falls back to a given href.
 */
export function BackButton({
  href = "/",
  label,
  variant = "ghost",
}: {
  href?: string;
  label?: string;
  variant?: "ghost" | "outline";
}) {
  const router = useRouter();
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowRight : ArrowLeft;

  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(href);
    }
  }

  const text = label ?? (lang === "ar" ? "رجوع" : "Back");

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-premium ${
        variant === "ghost"
          ? "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
          : "border border-border bg-card text-foreground hover:bg-secondary/40"
      }`}
    >
      <Arrow className="h-3.5 w-3.5" />
      {text}
    </button>
  );
}
