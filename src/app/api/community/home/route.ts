import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/community/home
 *
 * Returns all dynamic data needed by the homepage in a single response.
 * All numbers come from the database — none are hardcoded in the UI.
 *
 * Returned payload:
 *   - stats: { members, organizations, eventsThisWeek, liveMeetings }
 *   - liveMeeting: Meeting | null
 *   - nextMeeting: Meeting | null
 *   - upcomingEvents: Event[]
 *   - featuredNews: News[]
 *   - notifications: Notification[]
 *   - organizations: Organization[] (for the map)
 *   - states: USState[] (for filters / picker)
 *   - sections: HomepageSection[]
 *   - settings: Record<string, string>
 */
export async function GET() {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    membersCount,
    orgsCount,
    eventsThisWeek,
    liveMeetingsCount,
    liveMeeting,
    upcomingMeetings,
    upcomingEvents,
    featuredNews,
    notifications,
    announcements,
    organizations,
    states,
    sections,
    settings,
  ] = await Promise.all([
    db.member.count({ where: { accountState: "Active" } }),
    db.organization.count({ where: { verification: "Verified" } }),
    db.event.count({
      where: {
        eventDate: { gte: now, lte: weekFromNow },
        status: "Upcoming",
      },
    }),
    db.meeting.count({ where: { isLive: true } }),
    db.meeting.findFirst({
      where: { isLive: true },
      orderBy: { scheduledAt: "desc" },
    }),
    db.meeting.findMany({
      where: { scheduledAt: { gte: now }, isLive: false },
      orderBy: { scheduledAt: "asc" },
      take: 1,
    }),
    db.event.findMany({
      where: { status: "Upcoming", eventDate: { gte: now } },
      orderBy: { eventDate: "asc" },
      take: 6,
      include: { state: true },
    }),
    db.news.findMany({
      where: { status: "Published" },
      orderBy: { publishedAt: "desc" },
      take: 4,
      include: { state: true },
    }),
    db.notification.findMany({
      where: { memberId: null },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.announcement.findMany({
      where: { isActive: true, startsAt: { lte: now }, OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      orderBy: { startsAt: "desc" },
      take: 3,
    }),
    db.organization.findMany({
      where: { verification: "Verified" },
      include: { state: true, city: true },
    }),
    db.uSState.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.homepageSection.findMany({
      where: { isEnabled: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.setting.findMany(),
  ]);

  const displayedMembers = membersCount;

  const settingsMap: Record<string, string> = {};
  for (const s of settings) settingsMap[s.key] = s.value;

  return NextResponse.json({
    stats: {
      members: displayedMembers,
      organizations: orgsCount,
      eventsThisWeek: eventsThisWeek,
      liveMeetings: liveMeetingsCount,
    },
    liveMeeting: liveMeeting
      ? {
          ...liveMeeting,
          scheduledAt: liveMeeting.scheduledAt.toISOString(),
        }
      : null,
    nextMeeting: upcomingMeetings[0]
      ? {
          ...upcomingMeetings[0],
          scheduledAt: upcomingMeetings[0].scheduledAt.toISOString(),
        }
      : null,
    upcomingEvents: upcomingEvents.map((e) => ({
      ...e,
      eventDate: e.eventDate.toISOString(),
    })),
    featuredNews: featuredNews.map((n) => ({
      ...n,
      publishedAt: n.publishedAt.toISOString(),
    })),
    notifications: notifications.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
    })),
    announcements: announcements.map((a) => ({
      ...a,
      startsAt: a.startsAt.toISOString(),
      endsAt: a.endsAt?.toISOString() ?? null,
    })),
    organizations: organizations.map((o) => ({
      id: o.id,
      name: o.name,
      type: o.type,
      description: o.description,
      address: o.address,
      latitude: o.latitude,
      longitude: o.longitude,
      phone: o.phone,
      email: o.email,
      website: o.website,
      hoursAr: o.hoursAr,
      services: o.services,
      verification: o.verification,
      rating: o.rating,
      state: o.state
        ? { code: o.state.code, nameEn: o.state.nameEn, nameAr: o.state.nameAr }
        : null,
      city: o.city
        ? { nameEn: o.city.nameEn, nameAr: o.city.nameAr }
        : null,
    })),
    states: states.map((s) => ({
      code: s.code,
      nameEn: s.nameEn,
      nameAr: s.nameAr,
    })),
    sections: sections.map((s) => ({
      key: s.key,
      title: s.title,
      sortOrder: s.sortOrder,
    })),
    settings: settingsMap,
    serverTime: now.toISOString(),
  });
}
