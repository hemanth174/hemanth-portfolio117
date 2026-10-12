import { NextRequest, NextResponse } from 'next/server';
import { mkdir } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
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
    const destination = path.join(directory, filename);
    if (!file.stream) throw new Error('This server does not support streamed uploads.');
    await pipeline(Readable.fromWeb(file.stream() as Parameters<typeof Readable.fromWeb>[0]), createWriteStream(destination));
    return NextResponse.json({ url: `/uploads/events/${filename}`, type: isVideo ? 'video' : 'image' });
  } catch (error) {
    console.error('Event media upload error:', error);
    const message = error instanceof Error ? error.message : 'Unknown upload error';
    return NextResponse.json({ error: process.env.NODE_ENV === 'development' ? message : 'Upload failed. Please try again.' }, { status: 500 });
  }
}
