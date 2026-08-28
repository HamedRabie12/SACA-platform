import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/community/states/[code]?code=MD
 * Returns state info + counts of orgs/events/news/meetings + sample items.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const stateCode = code.toUpperCase();

  const state = await db.uSState.findUnique({
    where: { code: stateCode },
    include: { cities: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
  });
  if (!state) {
    return NextResponse.json({ error: "State not found" }, { status: 404 });
  }

  const [orgsCount, eventsCount, newsCount, meetingsCount, membersCount] = await Promise.all([
    db.organization.count({ where: { stateId: state.id, verification: "Verified" } }),
    db.event.count({ where: { stateId: state.id, status: "Upcoming", eventDate: { gte: new Date() } } }),
    db.news.count({ where: { stateId: state.id, status: "Published" } }),
    db.meeting.count({ where: { stateId: state.id } }),
    db.member.count({ where: { stateId: state.id } }),
  ]);

  const [organizations, events, news] = await Promise.all([
    db.organization.findMany({
      where: { stateId: state.id, verification: "Verified" },
      take: 6,
      include: { city: true },
      orderBy: { rating: "desc" },
    }),
    db.event.findMany({
      where: { stateId: state.id, status: "Upcoming", eventDate: { gte: new Date() } },
      take: 5,
      orderBy: { eventDate: "asc" },
    }),
    db.news.findMany({
      where: { stateId: state.id, status: "Published" },
      take: 4,
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    state: {
      code: state.code,
      nameEn: state.nameEn,
      nameAr: state.nameAr,
      fipsCode: state.fipsCode,
      cities: state.cities.map((c) => ({
        nameEn: c.nameEn,
        nameAr: c.nameAr,
        latitude: c.latitude,
        longitude: c.longitude,
      })),
    },
    stats: {
      organizations: orgsCount,
      events: eventsCount,
      news: newsCount,
      meetings: meetingsCount,
      members: membersCount,
    },
    organizations: organizations.map((o) => ({
      id: o.id,
      name: o.name,
      type: o.type,
      description: o.description,
      verification: o.verification,
      rating: o.rating,
      city: o.city ? { nameEn: o.city.nameEn, nameAr: o.city.nameAr } : null,
    })),
    events: events.map((e) => ({
      ...e,
      eventDate: e.eventDate.toISOString(),
    })),
    news: news.map((n) => ({
      ...n,
      publishedAt: n.publishedAt.toISOString(),
    })),
  });
}
