"use client";

import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type Crumb = { label: string; href?: string };

export function PageHeader({
  title,
  subtitle,
  crumbs = [],
}: {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
}) {
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ChevronLeft : ChevronRight;

  return (
    <div className="border-b border-border/60 bg-gradient-to-b from-emerald-50/40 to-transparent">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 md:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <a href="/" className="hover:text-emerald-700 inline-flex items-center gap-1">
            <Home className="h-3 w-3" />
            <span>{lang === "ar" ? "الرئيسية" : "Home"}</span>
          </a>
          {crumbs.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              <Arrow className="h-3 w-3 opacity-60" />
              {c.href ? (
                <a href={c.href} className="hover:text-emerald-700">
                  {c.label}
                </a>
              ) : (
                <span className="text-foreground font-medium">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
