import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminRequest } from "@/lib/security/admin-session";

async function isAdmin(req: NextRequest): Promise<boolean> {
  return Boolean(await requireAdminRequest(req));
}

/**
 * GET /api/admin/data — get database stats + table counts
 * POST /api/admin/data — perform data operations (reset, seed, etc.)
 */
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    membersCount, orgsCount, eventsCount, newsCount, meetingsCount,
    notificationsCount, albumsCount, mediaCount, reportsCount,
    auditLogsCount, statesCount, citiesCount, settingsCount, sectionsCount,
    aiDocsCount, announcementsCount,
  ] = await Promise.all([
    db.member.count(),
    db.organization.count(),
    db.event.count(),
    db.news.count(),
    db.meeting.count(),
    db.notification.count(),
    db.album.count(),
    db.mediaItem.count(),
    db.report.count(),
    db.auditLog.count(),
    db.uSState.count(),
    db.uSCity.count(),
    db.setting.count(),
    db.homepageSection.count(),
    db.aIKnowledgeDoc.count(),
    db.announcement.count(),
  ]);

  return NextResponse.json({
    tables: [
      { name: "members", label: "أعضاء", count: membersCount },
      { name: "organizations", label: "منظمات", count: orgsCount },
      { name: "events", label: "فعاليات", count: eventsCount },
      { name: "news", label: "أخبار", count: newsCount },
      { name: "meetings", label: "اجتماعات", count: meetingsCount },
      { name: "notifications", label: "إشعارات", count: notificationsCount },
      { name: "albums", label: "ألبومات", count: albumsCount },
      { name: "mediaItems", label: "ملفات وسائط", count: mediaCount },
      { name: "reports", label: "بلاغات", count: reportsCount },
      { name: "auditLogs", label: "سجلات تدقيق", count: auditLogsCount },
      { name: "usStates", label: "ولايات أمريكية", count: statesCount },
      { name: "usCities", label: "مدن أمريكية", count: citiesCount },
      { name: "settings", label: "إعدادات", count: settingsCount },
      { name: "homepageSections", label: "أقسام رئيسية", count: sectionsCount },
      { name: "aiKnowledgeDocs", label: "وثائق ذكاء اصطناعي", count: aiDocsCount },
      { name: "announcements", label: "إعلانات", count: announcementsCount },
    ],
    totalRecords: membersCount + orgsCount + eventsCount + newsCount + meetingsCount +
      notificationsCount + albumsCount + mediaCount + reportsCount + auditLogsCount +
      statesCount + citiesCount + settingsCount + sectionsCount + aiDocsCount + announcementsCount,
  });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const action = String(body?.action ?? "").trim();

    if (action === "clear-table") {
      if (process.env.NODE_ENV === "production" && process.env.ALLOW_CONTROLLED_DATA_OPERATIONS !== "true") {
        return NextResponse.json({ error: "Destructive data operations are disabled in production." }, { status: 403 });
      }
      const tableName = String(body?.table ?? "").trim();
      const allowedTables: Record<string, () => Promise<unknown>> = {
        notifications: () => db.notification.deleteMany({}),
        reports: () => db.report.deleteMany({}),
        auditLogs: () => db.auditLog.deleteMany({}),
        mediaItems: () => db.mediaItem.deleteMany({}),
        albums: () => db.album.deleteMany({}),
        events: () => db.event.deleteMany({}),
        news: () => db.news.deleteMany({}),
        meetings: () => db.meeting.deleteMany({}),
      };
      const fn = allowedTables[tableName];
      if (!fn) {
        return NextResponse.json({ error: "Table not clearable or doesn't exist" }, { status: 400 });
      }
      await fn();
      await db.auditLog.create({
        data: {
          actor: "admin",
          action: "table-cleared",
          entity: "database",
          entityId: tableName,
          details: JSON.stringify({ table: tableName }),
        },
      });
      return NextResponse.json({ ok: true, cleared: tableName });
    }

    if (action === "rebuild-ai-knowledge") {
      if (process.env.NODE_ENV === "production" && process.env.ALLOW_CONTROLLED_DATA_OPERATIONS !== "true") {
        return NextResponse.json({ error: "Controlled AI rebuild is disabled in production." }, { status: 403 });
      }
      // Rebuild AI knowledge base from organizations + events + news
      await db.aIKnowledgeDoc.deleteMany({});

      const [orgs, events, news] = await Promise.all([
        db.organization.findMany(),
        db.event.findMany(),
        db.news.findMany({ where: { status: "Published" } }),
      ]);

      for (const o of orgs) {
        await db.aIKnowledgeDoc.create({
          data: {
            title: o.name,
            sourceType: "organization",
            sourceId: o.id,
            content: `${o.name}. ${o.description}. ${o.address ? `تقع في ${o.address}.` : ""} تقدم الخدمات: ${o.services || "غير محدد"}. ساعات العمل: ${o.hoursAr || "غير محدد"}. هاتف: ${o.phone || "غير متاح"}.`,
            tags: o.services || "",
          },
        });
      }

      for (const e of events) {
        await db.aIKnowledgeDoc.create({
          data: {
            title: e.title,
            sourceType: "event",
            sourceId: e.id,
            content: `${e.title}. ${e.description}. ${e.location ? `في ${e.location}.` : ""} بتاريخ ${e.eventDate.toLocaleDateString("ar-EG")}.`,
            tags: e.category,
          },
        });
      }

      for (const n of news) {
        await db.aIKnowledgeDoc.create({
          data: {
            title: n.title,
            sourceType: "news",
            sourceId: n.id,
            content: `${n.title}. ${n.summary} ${n.content.slice(0, 500)}`,
            tags: n.category,
          },
        });
      }

      return NextResponse.json({
        ok: true,
        rebuilt: true,
        count: orgs.length + events.length + news.length,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error("admin data action error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
