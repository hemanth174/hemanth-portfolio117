import { NextRequest } from 'next/server';
import { GET as handleCallback } from '@/app/api/auth/google/callback/route';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return handleCallback(request);
}
