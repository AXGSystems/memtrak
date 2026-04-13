import { NextResponse } from 'next/server';
import { getAuditLog, getAuditStats } from '@/lib/security';

export async function GET() {
  return NextResponse.json({
    stats: getAuditStats(),
    events: getAuditLog(50),
  });
}
