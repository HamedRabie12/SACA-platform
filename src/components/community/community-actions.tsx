import Link from "next/link";
import { CircleHelp, UserPlus, HandHeart, Search, ShieldCheck, CalendarDays } from "lucide-react";

const actions = [
  { href: "/services", labelAr: "أحتاج مساعدة", labelEn: "I Need Help", Icon: CircleHelp },
  { href: "/auth/register", labelAr: "الانضمام للجالية", labelEn: "Join the Community", Icon: UserPlus },
  { href: "/volunteer", labelAr: "التطوع والمشاركة", labelEn: "Volunteer", Icon: HandHeart },
  { href: "/organizations", labelAr: "ابحث عن خدمة", labelEn: "Find a Service", Icon: Search },
  { href: "/governance", labelAr: "الحوكمة والشفافية", labelEn: "Governance", Icon: ShieldCheck },
  { href: "/events", labelAr: "الفعاليات القادمة", labelEn: "Upcoming Events", Icon: CalendarDays },
];

export function CommunityActions({ lang = "ar" }: { lang?: "ar" | "en" }) {
  return (
    <section className="section-shell -mt-3 mb-7 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {actions.map(({ href, labelAr, labelEn, Icon }) => (
        <Link key={href} href={href} className="surface-elevated group rounded-2xl p-4 transition duration-300 hover:-translate-y-1 hover:border-emerald-900/15 hover:shadow-xl">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-sm font-bold text-slate-900">{lang === "ar" ? labelAr : labelEn}</div>
        </Link>
      ))}
    </section>
  );
}
