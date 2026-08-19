import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyAdminRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d'; // 'today' | '7d' | '30d' | 'all'

    const { db } = await connectToDatabase();

    // Date boundary calculation
    let dateFilter: Record<string, unknown> = {};
    const now = new Date();
    if (range === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { $gte: startOfDay } };
    } else if (range === '7d') {
      const d7 = new Date();
      d7.setDate(d7.getDate() - 7);
      d7.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { $gte: d7 } };
    } else if (range === '30d') {
      const d30 = new Date();
      d30.setDate(d30.getDate() - 30);
      d30.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { $gte: d30 } };
    }

    // 1. Overview counts
    const statsDoc = await db.collection('stats').findOne({ _id: 'totalVisits' as unknown as import('mongodb').ObjectId });
    const totalVisits = statsDoc?.count || 0;

    const uniqueVisitorsCount = (await db.collection('visitors').distinct('ip')).length;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayVisits = await db.collection('visitors').countDocuments({ visitedAt: { $gte: startOfToday } });

    const totalContacts = await db.collection('contacts').countDocuments();

    // Activity aggregates
    const totalProjectClicks = await db.collection('events_log').countDocuments({
      category: 'project',
      action: { $in: ['live_demo', 'code_repo', 'colab_notebook'] },
    });

    const totalResumeDownloads = await db.collection('events_log').countDocuments({
      category: 'resume',
      action: 'resume_download',
    });

    // 2. Daily chart trend (last 14 days default for visualization)
    const chartStart = new Date();
    chartStart.setDate(chartStart.getDate() - (range === '30d' ? 30 : 14));
    chartStart.setHours(0, 0, 0, 0);

    const dailyTrend = await db
      .collection('visitors')
      .aggregate([
        { $match: { visitedAt: { $gte: chartStart } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitedAt' } },
            visits: { $sum: 1 },
            uniqueIps: { $addToSet: '$ip' },
          },
        },
        {
          $project: {
            _id: 1,
            visits: 1,
            uniques: { $size: '$uniqueIps' },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    // 3. Project Performance Analytics
    // Fetch all existing projects from database to ensure 100% coverage
    const allDbProjects = await db.collection('projects').find({}).toArray();
    const projectStatsDocs = await db.collection('project_stats').find({}).toArray();

    const statsMap = new Map<string, any>();
    for (const doc of projectStatsDocs) {
      statsMap.set((doc.projectTitle || '').toLowerCase().trim(), doc);
    }

    const projectPerformance = allDbProjects.map((p) => {
      const title = p.title || 'Untitled';
      const stats = statsMap.get(title.toLowerCase().trim()) || {};
      const views = stats.views || 0;
      const liveClicks = stats.liveClicks || 0;
      const codeClicks = stats.codeClicks || 0;
      const colabClicks = stats.colabClicks || 0;
      const totalClicks = liveClicks + codeClicks + colabClicks;
      const totalInteractions = stats.totalInteractions || totalClicks + views;
      const ctr = views > 0 ? Math.round((totalClicks / views) * 100) : (totalClicks > 0 ? 100 : 0);

      return {
        id: p._id.toString(),
        title,
        category: p.category || 'Personal Project',
        projectType: p.projectType || 'big',
        image: p.image || '',
        liveUrl: p.liveUrl || '',
        codeUrl: p.codeUrl || '',
        views,
        liveClicks,
        codeClicks,
        colabClicks,
        totalClicks,
        totalInteractions,
        ctr,
        lastInteractedAt: stats.lastInteractedAt || p.createdAt || new Date(),
      };
    });

    // Sort by totalClicks then views descending
    projectPerformance.sort((a, b) => b.totalClicks - a.totalClicks || b.views - a.views);

    // 4. Live Activity Stream (Latest 40 events)
    const recentEvents = await db
      .collection('events_log')
      .find({})
      .sort({ createdAt: -1 })
      .limit(40)
      .toArray();

    // 5. Device, Browser & Referrer distribution
    const deviceStats = await db
      .collection('events_log')
      .aggregate([
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    const browserStats = await db
      .collection('events_log')
      .aggregate([
        { $match: { browser: { $ne: 'unknown' } } },
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ])
      .toArray();

    const referrerStats = await db
      .collection('visitors')
      .aggregate([
        {
          $project: {
            refSource: {
              $cond: [
                { $eq: ['$referrer', ''] },
                'Direct / Bookmark',
                {
                  $cond: [
                    { $regexMatch: { input: '$referrer', regex: /google/i } },
                    'Google Search',
                    {
                      $cond: [
                        { $regexMatch: { input: '$referrer', regex: /linkedin/i } },
                        'LinkedIn',
                        {
                          $cond: [
                            { $regexMatch: { input: '$referrer', regex: /github/i } },
                            'GitHub',
                            {
                              $cond: [
                                { $regexMatch: { input: '$referrer', regex: /twitter|x\.com/i } },
                                'Twitter / X',
                                'Other Websites',
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
        { $group: { _id: '$refSource', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    return NextResponse.json({
      overview: {
        totalVisits,
        uniqueVisitors: uniqueVisitorsCount,
        todayVisits,
        totalContacts,
        totalProjectClicks,
        totalResumeDownloads,
      },
      dailyTrend,
      projectPerformance,
      recentEvents: recentEvents.map((ev) => ({
        _id: ev._id.toString(),
        category: ev.category,
        action: ev.action,
        label: ev.label,
        page: ev.page,
        device: ev.device,
        browser: ev.browser,
        os: ev.os,
        createdAt: ev.createdAt,
        metadata: ev.metadata,
      })),
      deviceStats: deviceStats.map((d) => ({ name: d._id || 'Desktop', count: d.count })),
      browserStats: browserStats.map((b) => ({ name: b._id || 'Other', count: b.count })),
      referrerStats: referrerStats.map((r) => ({ name: r._id, count: r.count })),
    });
  } catch (err) {
    console.error('Analytics Stats API Error:', err);
    return NextResponse.json({ error: 'Failed to aggregate analytics.' }, { status: 500 });
  }
}
