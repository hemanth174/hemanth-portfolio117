import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      // Body may be empty or beacon
    }

    const category = typeof body.category === 'string' ? body.category.slice(0, 50) : 'general';
    const action = typeof body.action === 'string' ? body.action.slice(0, 50) : 'visit';
    const label = typeof body.label === 'string' ? body.label.slice(0, 200) : '';
    const page = typeof body.page === 'string' ? body.page.slice(0, 200) : '/';
    const referrer = typeof body.referrer === 'string' ? body.referrer.slice(0, 500) : '';
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId.slice(0, 100) : '';
    const device = typeof body.device === 'string' ? body.device.slice(0, 20) : 'desktop';
    const browser = typeof body.browser === 'string' ? body.browser.slice(0, 50) : 'unknown';
    const os = typeof body.os === 'string' ? body.os.slice(0, 50) : 'unknown';
    const metadata = (body.metadata && typeof body.metadata === 'object') ? body.metadata : {};

    const { db } = await connectToDatabase();
    const now = new Date();

    // 1. Insert into comprehensive activity log collection
    const eventDoc = {
      category,
      action,
      label,
      page,
      referrer,
      sessionId,
      device,
      browser,
      os,
      ip,
      userAgent,
      metadata,
      createdAt: now,
    };

    await db.collection('events_log').insertOne(eventDoc);

    // 2. If it's a page_view, update visitors and global stats
    if (category === 'page_view' || action === 'page_view') {
      await db.collection('visitors').insertOne({
        ip,
        userAgent,
        page,
        referrer,
        sessionId,
        device,
        browser,
        os,
        visitedAt: now,
      });

      await db.collection('stats').updateOne(
        { _id: 'totalVisits' as unknown as import('mongodb').ObjectId },
        { $inc: { count: 1 } },
        { upsert: true }
      );
    }

    // 3. If it's a project interaction, update aggregated project performance statistics
    if (category === 'project' && label) {
      const projectTitle = label;
      const incField =
        action === 'live_demo'
          ? 'liveClicks'
          : action === 'code_repo'
          ? 'codeClicks'
          : action === 'colab_notebook'
          ? 'colabClicks'
          : 'views';

      await db.collection('project_stats').updateOne(
        { projectTitle: projectTitle },
        {
          $inc: { [incField]: 1, totalInteractions: 1 },
          $set: { lastInteractedAt: now, projectScale: (metadata as any)?.projectScale || 'big' },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Track Event Error:', err);
    return NextResponse.json({ error: 'Failed to record tracking event' }, { status: 500 });
  }
}
