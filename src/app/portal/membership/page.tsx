import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
import { resolveMemberSession } from "@/lib/security/member-session";
export default async function MembershipPage(){
  const session = await resolveMemberSession();
  if(!session) return <main className="min-h-screen grid place-items-center bg-slate-50 p-6"><div className="rounded-3xl border bg-white p-8 text-center"><h1 className="text-2xl font-black">تسجيل الدخول مطلوب</h1><a href="/auth/login" className="mt-5 inline-flex rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white">دخول العضو</a></div></main>;
  const memberships=await db.membership.findMany({where:{memberId:session.memberId},orderBy:{createdAt:'desc'},take:10});
  return <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8"><div className="mx-auto max-w-5xl"><header><p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-700">Membership</p><h1 className="mt-2 text-4xl font-black">عضويتي</h1><p className="mt-3 text-slate-600">حالة العضوية، مدة الاستحقاق، والدفعات المسجلة.</p></header><div className="mt-8 grid gap-4">{memberships.map(m=><div key={m.id} className="rounded-3xl border bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><div className="font-black">{m.membershipType}</div><div className="mt-1 text-sm text-slate-500">{m.startedAt?new Date(m.startedAt).toLocaleDateString('ar-EG'):'—'} إلى {m.expiresAt?new Date(m.expiresAt).toLocaleDateString('ar-EG'):'—'}</div></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{m.status}</span></div></div>)}{memberships.length===0&&<div className="rounded-2xl border border-dashed p-8 text-slate-500">لا توجد عضوية فعالة بعد. استخدم طلب العضوية من البوابة.</div>}</div></div></main>
}
