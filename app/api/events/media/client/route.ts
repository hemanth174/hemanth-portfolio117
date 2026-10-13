import { NextRequest, NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';
import { verifyAdminRequest } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!verifyAdminRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const jsonResponse = await handleUpload({
      request,
      body: await request.json(),
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/*', 'video/*'],
        maximumSizeInBytes: 300 * 1024 * 1024,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => undefined,
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Event direct upload error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to prepare upload.' }, { status: 500 });
  }
}
