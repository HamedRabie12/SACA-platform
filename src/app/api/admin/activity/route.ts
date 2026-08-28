import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminRequest } from '@/lib/security/admin-session';
export async function GET(req:NextRequest){if(!await requireAdminRequest(req))return NextResponse.json({error:'Unauthorized'},{status:401});const items=await db.auditLog.findMany({orderBy:{createdAt:'desc'},take:20});return NextResponse.json({items});}
