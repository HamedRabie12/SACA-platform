import { db } from "@/lib/db";
import { AdminGuard } from "@/components/layout/admin-guard";

export const dynamic = "force-dynamic";
export default async function AdminElections(){ const elections=await db.election.findMany({orderBy:{createdAt:'desc'},take:20}); return <AdminGuard><main className="min-h-screen bg-[var(--brand-paper)] p-6"><div className="mx-auto max-w-7xl"><h1 className="text-3xl font-black">مركز الانتخابات</h1><div className="mt-8 grid gap-4">{elections.length===0?<div className="surface-elevated rounded-2xl p-6 text-slate-600">لم يتم إنشاء انتخابات بعد.</div>:elections.map(e=><div key={e.id} className="surface-elevated rounded-2xl p-6"><div className="flex items-center justify-between"><h2 className="font-bold">{e.name}</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{e.status}</span></div></div>)}</div></div></main></AdminGuard>}
