import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { verifyAdminRequest } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_VIDEO_BYTES = 300 * 1024 * 1024;
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!verifyAdminRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'A file is required.' }, { status: 400 });
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    const max = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (!isVideo && !isImage) return NextResponse.json({ error: 'Only image and video files are supported.' }, { status: 400 });
    if (file.size > max) return NextResponse.json({ error: isVideo ? 'Video must be 300 MB or smaller.' : 'Images must be 15 MB or smaller.' }, { status: 413 });

    const extension = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).replace(/[^a-z0-9.]/gi, '') : (isVideo ? '.mp4' : '.jpg');
    const blob = await put(`events/${Date.now()}-${file.name.replace(/[^a-z0-9_-]/gi, '-')}${extension}`, file, {
      access: 'public',
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url, type: isVideo ? 'video' : 'image' });
  } catch (error) {
    console.error('Event media upload error:', error);
    const message = error instanceof Error ? error.message : 'Unknown upload error';
    return NextResponse.json({ error: process.env.NODE_ENV === 'development' ? message : 'Upload failed. Please try again.' }, { status: 500 });
  }
}
