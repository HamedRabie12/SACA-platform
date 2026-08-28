"use client";

import { Building2, MapPin, Star, Phone, Globe, Clock } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { Badge } from "@/components/ui/badge";

export type OrgCardData = {
  id: string;
  name: string;
  type: string;
  description: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hoursAr: string | null;
  services: string | null;
  verification: string;
  rating: number;
  state: { code: string; nameEn: string; nameAr: string } | null;
  city: { nameEn: string; nameAr: string } | null;
};

const TYPE_LABEL: Record<string, { ar: string; en: string; icon: string }> = {
  association: { ar: "رابطة", en: "Association", icon: "🤝" },
  center: { ar: "مركز", en: "Center", icon: "🏛️" },
  mosque: { ar: "مسجد", en: "Mosque", icon: "🕌" },
  education: { ar: "تعليم", en: "Education", icon: "📚" },
  professional: { ar: "مهنية", en: "Professional", icon: "💼" },
  charity: { ar: "خيري", en: "Charity", icon: "❤️" },
};

const TYPE_COLOR: Record<string, string> = {
  association: "from-emerald-700 to-emerald-deep",
  center: "from-teal-700 to-emerald-deep",
  mosque: "from-amber-700 to-amber-900",
  education: "from-purple-700 to-purple-900",
  professional: "from-blue-700 to-blue-900",
  charity: "from-rose-700 to-rose-900",
};

export function OrganizationCard({ org }: { org: OrgCardData }) {
  const { lang } = useLanguage();
  const typeLabel = TYPE_LABEL[org.type] || { ar: org.type, en: org.type, icon: "🏢" };
  const typeColor = TYPE_COLOR[org.type] || "from-emerald-700 to-emerald-deep";
  const servicesList = (org.services ?? "").split(",").filter(Boolean).slice(0, 3);

  return (
    <a
      href={`/organizations/${org.id}`}
      className="group block rounded-2xl bg-card border border-border shadow-premium hover:shadow-premium-lg hover:border-emerald-700/30 transition-premium overflow-hidden"
    >
      {/* Header */}
      <div className={`relative h-24 bg-gradient-to-br ${typeColor} flex items-end p-4`}>
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute top-3 end-3 flex items-center gap-1.5">
          {org.verification === "Verified" && (
            <Badge className="bg-emerald-50/90 text-emerald-700 border-0 hover:bg-emerald-50">
              <Star className="h-2.5 w-2.5 fill-emerald-700 me-0.5" />
              {lang === "ar" ? "موثقة" : "Verified"}
            </Badge>
          )}
        </div>
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur ring-2 ring-white/30 text-2xl">
            {typeLabel.icon}
          </div>
          <div>
            <div className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">
              {lang === "ar" ? typeLabel.ar : typeLabel.en}
            </div>
            {org.rating > 0 && (
              <div className="flex items-center gap-1 text-xs text-white font-bold">
                <Star className="h-3 w-3 fill-gold text-gold" />
                {org.rating.toFixed(1)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="text-base font-bold text-foreground leading-snug mb-1.5 line-clamp-2 group-hover:text-emerald-700 transition-premium">
          {org.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
          {org.description}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
          <MapPin className="h-3 w-3 text-emerald-700 flex-shrink-0" />
          <span className="truncate">
            {org.city ? `${org.city[lang === "ar" ? "nameAr" : "nameEn"]}، ` : ""}
            {org.state ? org.state[lang === "ar" ? "nameAr" : "nameEn"] : ""}
          </span>
        </div>

        {/* Services */}
        {servicesList.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {servicesList.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-md bg-secondary/60 px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                {s.trim()}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}
