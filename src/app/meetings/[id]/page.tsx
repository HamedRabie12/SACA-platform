import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
import { LiveMeetingRoom } from "@/components/community/live-meeting-room";
import Link from "next/link";

export default async function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meeting = await db.meeting.findUnique({ where: { id } });
  if (!meeting) return <main className="min-h-screen grid place-items-center bg-[var(--brand-paper)]"><div className="text-center"><h1 className="text-3xl font-black">الاجتماع غير موجود</h1><Link className="mt-4 inline-block text-emerald-700" href="/meetings">العودة للاجتماعات</Link></div></main>;
  return <main className="min-h-screen bg-[var(--brand-paper)] px-4 py-6 md:px-8"><div className="mx-auto max-w-7xl"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.24em] text-emerald-700">SACA Live Meeting</p><h1 className="mt-2 text-3xl font-black">{meeting.title}</h1><p className="mt-2 text-sm text-slate-500">{meeting.description}</p></div><LiveMeetingRoom meetingId={meeting.id}/></div></main>;
}
