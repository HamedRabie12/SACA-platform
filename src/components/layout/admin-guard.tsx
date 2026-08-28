"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("unauthorized");
        return res.json();
      })
      .then(() => { if (active) setReady(true); })
      .catch(() => router.replace(`/secure-portal?returnTo=${encodeURIComponent(pathname)}`));
    return () => { active = false; };
  }, [pathname, router]);

  if (!ready) return <div className="min-h-screen grid place-items-center bg-[var(--offwhite)] text-[var(--charcoal)]">Checking secure session…</div>;
  return <>{children}</>;
}
