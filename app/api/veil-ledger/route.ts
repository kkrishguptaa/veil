import { NextResponse } from 'next/server';

import { getVeilPublicLedger } from '@/lib/veil/get-veil-public-ledger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await getVeilPublicLedger();
  return NextResponse.json(result);
}
