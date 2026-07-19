import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function sanitize(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim().slice(0, maxLength);
}

// GET - Fetch all events. If database is empty, seed it with default ones.
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    let events = await db
      .collection('events')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Seed database if empty
    if (events.length === 0) {
      const defaultEvents = [
        {
          title: "Breaking into IoT — Robotics & Advanced Tech",
          type: "college",
          date: "23 MAR 2025",
          description: "Hands-on training session on Internet of Things, basic electronics, and advanced robotics modules.",
          story: "This was a deep-dive workshop hosted at NIAT where I got my first hands-on experience with IoT sensors, microcontrollers, and real-time data streaming. We built a small automation circuit from scratch and connected it to a web dashboard. It opened my eyes to the convergence of hardware and software.",
          location: "NIAT, HYDERABAD",
          tags: ["IoT", "Electronics", "Workshop", "NIAT"],
          image: "",
          link: "",
          createdAt: new Date(Date.now() - 3000)
        },
        {
          title: "Deloitte Cyber Job Simulation",
          type: "off-college",
          date: "OCT 2025",
          description: "Completed a simulated cyber security simulation covering threat mitigation and network defense strategies.",
          story: "Through Deloitte's virtual job simulation on Forage, I worked through real-world scenarios involving network intrusion detection, threat analysis, and reporting. Completing this gave me practical exposure to enterprise-level security frameworks and how cybersecurity professionals operate at global firms.",
          location: "DELOITTE ONLINE",
          tags: ["Cybersecurity", "Simulation", "Deloitte", "Forage"],
          image: "",
          link: "",
          createdAt: new Date(Date.now() - 2000)
        },
        {
          title: "Swarm Integration with Drones",
          type: "college",
          date: "SEP 2025",
          description: "Designed, configured, and flew multi-drone systems inside the NIAT Drone Lab under swarm logic controls.",
          story: "An adrenaline-packed session where our team programmed a formation of drones to fly in coordinated swarm patterns. We leveraged MAVLink for communication and used Python scripts to coordinate autonomous movement. I handled the communication protocol and helped debug a formation sync bug during live flight.",
          location: "NIAT DRONE LAB",
          tags: ["Drones", "Swarm", "Python", "MAVLink", "NIAT"],
          image: "",
          link: "",
          createdAt: new Date(Date.now() - 1000)
        }
      ];
      await db.collection('events').insertMany(defaultEvents);
      events = await db.collection('events').find({}).sort({ createdAt: -1 }).toArray();
    }

    return NextResponse.json(
      { events },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    console.error('GET Events Error:', err);
    return NextResponse.json({ error: 'Failed to fetch events.' }, { status: 500 });
  }
}

// POST - Add a new event (Admin only)
export async function POST(request: NextRequest) {
  const authKey = request.headers.get('x-admin-key');
  if (!authKey || authKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const title = sanitize(body.title, 200);
    const type = sanitize(body.type, 50) as 'college' | 'off-college';
    const date = sanitize(body.date, 100);
    const description = sanitize(body.description, 2000);
    const story = sanitize(body.story, 5000);
    const location = sanitize(body.location, 200);
    const link = sanitize(body.link, 500);
    const image = sanitize(body.image, 10 * 1024 * 1024);

    // Tags: array of strings
    let tags: string[] = [];
    if (Array.isArray(body.tags)) {
      tags = (body.tags as unknown[])
        .map((t) => sanitize(t, 50))
        .filter(Boolean)
        .slice(0, 10);
    } else if (typeof body.tags === 'string') {
      tags = body.tags.split(',').map((t) => sanitize(t.trim(), 50)).filter(Boolean).slice(0, 10);
    }

    if (!title || title.length < 2) {
      return NextResponse.json({ error: 'Title must be at least 2 characters.' }, { status: 400 });
    }
    if (type !== 'college' && type !== 'off-college') {
      return NextResponse.json({ error: 'Invalid event type. Must be "college" or "off-college".' }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ error: 'Date is required.' }, { status: 400 });
    }
    if (!description || description.length < 5) {
      return NextResponse.json({ error: 'Description must be at least 5 characters.' }, { status: 400 });
    }
    if (!location) {
      return NextResponse.json({ error: 'Location is required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const newEvent = {
      title,
      type,
      date,
      description,
      story,
      tags,
      location,
      image,
      link,
      createdAt: new Date(),
    };

    const result = await db.collection('events').insertOne(newEvent);

    revalidatePath('/api/events');
    revalidatePath('/');

    return NextResponse.json({ success: true, event: { ...newEvent, _id: result.insertedId } });
  } catch (err) {
    console.error('POST Event Error:', err);
    return NextResponse.json({ error: 'Failed to add event.' }, { status: 500 });
  }
}

// DELETE - Delete an event (Admin only)
export async function DELETE(request: NextRequest) {
  const authKey = request.headers.get('x-admin-key');
  if (!authKey || authKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Invalid event ID format.' }, { status: 400 });
    }

    const result = await db.collection('events').deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }

    revalidatePath('/api/events');
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE Event Error:', err);
    return NextResponse.json({ error: 'Failed to delete event.' }, { status: 500 });
  }
}
