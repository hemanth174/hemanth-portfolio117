import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
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

    const extension = path.extname(file.name).toLowerCase().replace(/[^a-z0-9.]/g, '') || (isVideo ? '.mp4' : '.jpg');
    const filename = `${randomUUID()}${extension}`;
    const directory = path.join(process.cwd(), 'public', 'uploads', 'events');
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ url: `/uploads/events/${filename}`, type: isVideo ? 'video' : 'image' });
  } catch (error) {
    console.error('Event media upload error:', error);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
