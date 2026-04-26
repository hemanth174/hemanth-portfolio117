import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST - Track a new page visit
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      // Body is optional
    }

    const page = typeof body.page === 'string' ? body.page.slice(0, 200) : '/';
    const referrer = typeof body.referrer === 'string' ? body.referrer.slice(0, 500) : '';

    const { db } = await connectToDatabase();

    // Record the visit
    await db.collection('visitors').insertOne({
      ip,
      userAgent,
      page,
      referrer,
      visitedAt: new Date(),
    });

    // Update the total counter (upsert)
    await db.collection('stats').updateOne(
      { _id: 'totalVisits' as unknown as import('mongodb').ObjectId },
      { $inc: { count: 1 } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to track visit.' }, { status: 500 });
  }
}

// GET - Get visitor stats (for admin page)
export async function GET(request: NextRequest) {
  const authKey = request.headers.get('x-admin-key');
  if (authKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();

    // Get total count
    const statsDoc = await db.collection('stats').findOne({ _id: 'totalVisits' as unknown as import('mongodb').ObjectId });
    const totalVisits = statsDoc?.count || 0;

    // Get unique visitors (by IP)
    const uniqueVisitors = await db.collection('visitors').distinct('ip');

    // Get today's visitors
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVisits = await db.collection('visitors').countDocuments({
      visitedAt: { $gte: today },
    });

    // Get visits per day for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyVisits = await db
      .collection('visitors')
      .aggregate([
        { $match: { visitedAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$visitedAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    // Get recent visits (last 20)
    const recentVisits = await db
      .collection('visitors')
      .find({})
      .sort({ visitedAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json({
      totalVisits,
      uniqueVisitors: uniqueVisitors.length,
      todayVisits,
      dailyVisits,
      recentVisits,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch visitor stats.' }, { status: 500 });
  }
}
