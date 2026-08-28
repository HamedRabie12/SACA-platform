import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/community/events/[id]
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ev = await db.event.findUnique({
    where: { id },
    include: { state: true },
  });
  if (!ev) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    event: {
      ...ev,
      eventDate: ev.eventDate.toISOString(),
      endDate: ev.endDate?.toISOString() ?? null,
    },
  });
}
