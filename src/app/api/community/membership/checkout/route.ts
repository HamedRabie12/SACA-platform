import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveMemberSession } from "@/lib/security/member-session";
import { z } from "zod";
const schema=z.object({plan:z.enum(['ANNUAL','MONTHLY'])});
export async function POST(req:NextRequest){
 const s=await resolveMemberSession(req);if(!s)return NextResponse.json({error:'Authentication required'},{status:401});
 const p=schema.safeParse(await req.json().catch(()=>({})));if(!p.success)return NextResponse.json({error:'Invalid plan'},{status:400});
 const secret=process.env.STRIPE_SECRET_KEY;if(!secret)return NextResponse.json({error:'Payment provider is not configured.'},{status:503});
 const app=await db.membershipApplication.findFirst({where:{memberId:s.memberId,status:{in:['PENDING','UNDER_REVIEW','APPROVED']}}});if(!app)return NextResponse.json({error:'Approved membership application required.'},{status:400});
 const amount=p.data.plan==='ANNUAL'?12000:1000; const params=new URLSearchParams();params.set('mode',p.data.plan==='ANNUAL'?'payment':'subscription');params.set('success_url',`${process.env.APP_ORIGIN||'http://localhost:3000'}/portal/membership?payment=success&session_id={CHECKOUT_SESSION_ID}`);params.set('cancel_url',`${process.env.APP_ORIGIN||'http://localhost:3000'}/portal/membership?payment=cancelled`);params.set('line_items[0][price_data][currency]','usd');params.set('line_items[0][price_data][unit_amount]',String(amount));params.set('line_items[0][price_data][product_data][name]',p.data.plan==='ANNUAL'?'SACA Annual Membership':'SACA Monthly Membership');if(p.data.plan==='MONTHLY')params.set('line_items[0][price_data][recurring][interval]','month');params.set('line_items[0][quantity]','1');params.set('metadata[memberId]',s.memberId);params.set('metadata[membershipApplicationId]',app.id);params.set('metadata[plan]',p.data.plan);
 const res=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:`Bearer ${secret}`,'Content-Type':'application/x-www-form-urlencoded'},body:params});const data=await res.json();if(!res.ok)return NextResponse.json({error:'Payment provider error',details:process.env.NODE_ENV==='development'?data.error?.message:undefined},{status:502});return NextResponse.json({ok:true,url:data.url,sessionId:data.id});
}
