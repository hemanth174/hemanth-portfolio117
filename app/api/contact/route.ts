import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Rate limiting: simple in-memory store (resets on cold start, which is fine for serverless)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 3; // max 3 submissions per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= MAX_REQUESTS) {
    return true;
  }

  record.count++;
  return false;
}

function sanitize(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim().slice(0, maxLength);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// GET - Fetch all contact submissions (for admin page)
export async function GET(request: NextRequest) {
  const authKey = request.headers.get('x-admin-key');
  if (authKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const contacts = await db
      .collection('contacts')
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ contacts });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch contacts.' }, { status: 500 });
  }
}

// POST - Submit a new contact message
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute before trying again.' },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const name = sanitize(body.name, 100);
  const email = sanitize(body.email, 200);
  const message = sanitize(body.message, 2000);

  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'Name must be at least 2 characters.' }, { status: 400 });
  }
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
  }
  if (!message || message.length < 10) {
    return NextResponse.json({ error: 'Message must be at least 10 characters.' }, { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();
    await db.collection('contacts').insertOne({
      name,
      email,
      message,
      ip,
      createdAt: new Date(),
      read: false,
    });

    return NextResponse.json({ success: true, message: 'Message sent successfully!' });
  } catch {
    return NextResponse.json({ error: 'Failed to send message. Please try again later.' }, { status: 500 });
  }
}
