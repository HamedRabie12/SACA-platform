import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
export async function GET(_:Request,{params}:{params:Promise<{id:string;code:string}>}){const {id,code}=await params;const r=await db.voteReceipt.findFirst({where:{electionId:id,receiptCode:code}});if(!r)return NextResponse.json({valid:false},{status:404});return NextResponse.json({valid:true,electionId:r.electionId,receiptCode:r.receiptCode,ballotCommitment:r.ballotCommitment,issuedAt:r.issuedAt});}
