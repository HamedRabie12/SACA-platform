import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminRequest } from "@/lib/security/admin-session";

/**
 * GET /api/admin/stats/geographic
 *
 * Returns aggregated geographic intelligence:
 *   - Per-state counts: organizations, members, events, news
 *   - Verification rates per state
 *   - Top states by activity
 *
 * Used by the Geographic Intelligence admin page (heatmap + ranking).
 */
export async function GET(req: NextRequest) {
  if (!(await requireAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const states = await db.uSState.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      orgs: { select: { verification: true, id: true } },
      members: { select: { accountState: true, id: true } },
      events: {
        where: { status: "Upcoming" },
        select: { id: true },
      },
      news: {
        where: { status: "Published" },
        select: { id: true },
      },
    },
  });

  const byState = states.map((s) => {
    const verifiedOrgs = s.orgs.filter((o) => o.verification === "Verified").length;
    const pendingOrgs = s.orgs.filter((o) => o.verification === "PendingVerification").length;
    const activeMembers = s.members.filter((m) => m.accountState === "Active" || m.accountState === "Verified").length;
    return {
      code: s.code,
      nameEn: s.nameEn,
      nameAr: s.nameAr,
      metrics: {
        organizations: s.orgs.length,
        verifiedOrgs,
        pendingOrgs,
        members: s.members.length,
        activeMembers,
        events: s.events.length,
        news: s.news.length,
      },
      // Score for heatmap intensity: weighted sum
      score: verifiedOrgs * 3 + s.orgs.length * 1 + activeMembers * 0.5 + s.events.length * 2 + s.news.length * 1,
    };
  });

  // Sort by score descending for ranking
  const ranking = [...byState].sort((a, b) => b.score - a.score).slice(0, 10);

  // Total counts
  const totals = {
    states: states.length,
    organizations: byState.reduce((sum, s) => sum + s.metrics.organizations, 0),
    members: byState.reduce((sum, s) => sum + s.metrics.members, 0),
    events: byState.reduce((sum, s) => sum + s.metrics.events, 0),
    news: byState.reduce((sum, s) => sum + s.metrics.news, 0),
    activeStates: byState.filter((s) => s.metrics.organizations > 0 || s.metrics.members > 0).length,
  };

  return NextResponse.json({
    byState,
    ranking,
    totals,
    generatedAt: new Date().toISOString(),
  });
}
