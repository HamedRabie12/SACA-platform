import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveMemberSession } from "@/lib/security/member-session";

/**
 * POST /api/community/events/[id]/register
 * Body: { memberId: string, name?: string }
 *
 * Increments event registeredCount and creates a notification.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await resolveMemberSession(req);
    if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const memberId = session.memberId;

    const event = await db.event.findUnique({ where: { id } });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (event.status !== "Upcoming") {
      return NextResponse.json(
        { error: "Cannot register for this event (not upcoming)" },
        { status: 400 }
      );
    }
    if (event.capacity > 0 && event.registeredCount >= event.capacity) {
      return NextResponse.json({ error: "Event is at full capacity" }, { status: 400 });
    }

    const registration = await db.$transaction(async (tx) => {
      const existingRegistration = await tx.eventRegistration.findUnique({ where: { eventId_memberId: { eventId: id, memberId } } });
      if (existingRegistration?.status === "REGISTERED") throw new Error("ALREADY_REGISTERED");
      const current = await tx.event.findUnique({ where: { id } });
      if (!current) throw new Error("EVENT_NOT_FOUND");
      if (current.capacity > 0 && current.registeredCount >= current.capacity) throw new Error("EVENT_FULL");
      const event = await tx.event.update({ where: { id }, data: { registeredCount: { increment: 1 } } });
      await tx.eventRegistration.upsert({
        where: { eventId_memberId: { eventId: id, memberId } },
        create: { eventId: id, memberId, status: "REGISTERED" },
        update: { status: "REGISTERED", registeredAt: new Date(), cancelledAt: null },
      });
      await tx.notification.create({ data: { memberId, type: "event", title: "تم تسجيلك في فعالية", body: `تم تسجيلك في: ${event.title}`, priority: "Important", actionLabel: "عرض الفعالية", actionUrl: `/events/${event.id}` } });
      return event;
    });

    // Audit log
    await db.auditLog.create({
      data: {
        actor: memberId,
        action: "event-registered",
        entity: "event",
        entityId: id,
        details: JSON.stringify({ memberId, title: registration.title }),
      },
    });

    return NextResponse.json({
      ok: true,
      eventId: id,
      registeredCount: registration.registeredCount,
      capacity: registration.capacity,
      message: "Registered successfully",
    });
  } catch (e) {
    if (e instanceof Error && e.message === "ALREADY_REGISTERED") {
      return NextResponse.json({ error: "Already registered" }, { status: 409 });
    }
    if (e instanceof Error && e.message === "EVENT_FULL") {
      return NextResponse.json({ error: "Event is at full capacity" }, { status: 409 });
    }
    if (e instanceof Error && e.message === "EVENT_NOT_FOUND") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    console.error("event register error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
