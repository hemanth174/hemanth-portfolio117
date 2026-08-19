import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { verifyAdminRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function sanitize(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim().slice(0, maxLength);
}

function normalizeTitle(title: string): string {
  return (title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

const defaultEvents = [
  {
    title: "Breaking into IoT — Robotics & Advanced Tech",
    type: "college",
    date: "23 MAR 2025",
    description: "Hands-on training session on Internet of Things, basic electronics, and advanced robotics modules.",
    story: "This was a deep-dive workshop hosted at NIAT where I got my first hands-on experience with IoT sensors, microcontrollers, and real-time data streaming. We built a small automation circuit from scratch and connected it to a web dashboard. It opened my eyes to the convergence of hardware and software.",
    location: "NIAT, HYDERABAD",
    tags: ["IoT", "Electronics", "Workshop", "NIAT"],
    image: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1749008643/80d599e9-4c2e-431e-923f-d12c12b9b872_srwint.png",
    link: "",
    createdAt: new Date(Date.now() - 7000)
  },
  {
    title: "Deloitte Cyber Job Simulation",
    type: "off-college",
    date: "OCT 2025",
    description: "Completed a simulated cyber security simulation covering threat mitigation and network defense strategies.",
    story: "Through Deloitte's virtual job simulation on Forage, I worked through real-world scenarios involving network intrusion detection, threat analysis, and reporting. Completing this gave me practical exposure to enterprise-level security frameworks and how cybersecurity professionals operate at global firms.",
    location: "DELOITTE ONLINE",
    tags: ["Cybersecurity", "Simulation", "Deloitte", "Forage"],
    image: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1763050907/download_pjhm4a.png",
    link: "",
    createdAt: new Date(Date.now() - 6000)
  },
  {
    title: "Swarm Integration with Drones",
    type: "college",
    date: "SEP 2025",
    description: "Designed, configured, and flew multi-drone systems inside the NIAT Drone Lab under swarm logic controls.",
    story: "An adrenaline-packed session where our team programmed a formation of drones to fly in coordinated swarm patterns. We leveraged MAVLink for communication and used Python scripts to coordinate autonomous movement. I handled the communication protocol and helped debug a formation sync bug during live flight.",
    location: "NIAT DRONE LAB",
    tags: ["Drones", "Swarm", "Python", "MAVLink", "NIAT"],
    image: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1749008665/57d59a68-d802-41b8-b165-b6c0044c8901_yddgrf.png",
    link: "",
    createdAt: new Date(Date.now() - 5000)
  },
  {
    title: "Tech meets Green: Revolutionizing Agriculture & Dairy",
    type: "college",
    date: "2025",
    description: "A green-tech workshop exploring how technology is transforming agriculture and dairy industries.",
    story: "An insightful session connecting software with sustainable agriculture. We explored sensor-driven farming, dairy automation, and how data pipelines are modernizing rural supply chains. It broadened my perspective on where technology can create real-world impact beyond screens.",
    location: "NIAT, HYDERABAD",
    tags: ["AgriTech", "Sustainability", "Workshop", "NIAT"],
    image: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1749008651/b8c03bde-daed-4070-bd35-50dd3c82fdca_s8fjmr.png",
    link: "",
    createdAt: new Date(Date.now() - 4000)
  },
  {
    title: "Drone Club — Flight Training",
    type: "college",
    date: "2025",
    description: "Hands-on flight training and safety practice with the NIAT Drone Club.",
    story: "Part of the NIAT Drone Club, this training covered pre-flight checks, manual piloting, and safety protocols. It laid the foundation I later used during the swarm integration sessions and gave me hours of stick time before going autonomous.",
    location: "NIAT DRONE LAB",
    tags: ["Drones", "Flight Training", "Club", "NIAT"],
    image: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1749008657/9b988d61-ca03-4d9d-ab0d-50816b892068_ys1m8p.png",
    link: "",
    createdAt: new Date(Date.now() - 3000)
  },
  {
    title: "Base44 Hackathon",
    type: "college",
    date: "2025",
    description: "Competitive 24-hour hackathon pushing ideas from concept to working prototype.",
    story: "A high-pressure build sprint where our team shipped a working prototype under a tight deadline. Beyond the coding marathon, the real value was learning to scope fast, communicate under pressure, and demo in front of judges. It sharpened the exact skills that later went into my automation and full-stack projects.",
    location: "NIAT, HYDERABAD",
    tags: ["Hackathon", "Teamwork", "Prototyping", "NIAT"],
    image: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1766465957/Base44-Hackthon-HNG83QSUJT_z1svhc.png",
    link: "",
    createdAt: new Date(Date.now() - 2000)
  },
  {
    title: "NIAT Hexaverse 2.0 — Sports Event Contribution",
    type: "college",
    date: "2025",
    description: "Contributed to organizing and running the sports track of NIAT's Hexaverse 2.0 fest.",
    story: "Behind-the-scenes event execution: coordinating fixtures, managing participants, and keeping the energy high across the sports arena. It taught me logistics, quick decision-making, and how much invisible work goes into making a fest feel seamless.",
    location: "NIAT, HYDERABAD",
    tags: ["Event Management", "Sports", "Leadership", "NIAT"],
    image: "https://res.cloudinary.com/dqtlqvhw5/image/upload/q_auto/f_auto/v1776495220/1774324572940.pdf_v2lv8b.png",
    link: "",
    createdAt: new Date(Date.now() - 1000)
  }
];

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
      await db.collection('events').insertMany(defaultEvents);
      events = await db.collection('events').find({}).sort({ createdAt: -1 }).toArray();
    }

    // Backfill: enrich older events that are missing images/stories from the default pool.
    // Only fills empty fields — never overwrites admin-edited content.
    const defaultMap = new Map<string, Record<string, unknown>>();
    for (const def of defaultEvents) {
      defaultMap.set(normalizeTitle(def.title as string), def as Record<string, unknown>);
    }
    const backfillOps: Promise<unknown>[] = [];
    for (const ev of events) {
      const def = defaultMap.get(normalizeTitle(ev.title as string));
      if (!def) continue;
      const patch: Record<string, unknown> = {};
      if (!ev.image && def.image) patch.image = def.image;
      if (!ev.story && def.story) patch.story = def.story;
      if ((!ev.tags || ev.tags.length === 0) && Array.isArray(def.tags)) patch.tags = def.tags;
      if (!ev.link && def.link) patch.link = def.link;
      if (Object.keys(patch).length > 0) {
        backfillOps.push(db.collection('events').updateOne({ _id: ev._id }, { $set: patch }));
      }
    }
    if (backfillOps.length > 0) {
      await Promise.all(backfillOps);
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
  if (!verifyAdminRequest(request)) {
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
  if (!verifyAdminRequest(request)) {
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

// PUT - Update an event (Admin only)
export async function PUT(request: NextRequest) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const id = body._id || body.id;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Event ID is required.' }, { status: 400 });
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
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Invalid event ID format.' }, { status: 400 });
    }

    const updateDoc = {
      title,
      type,
      date,
      description,
      story,
      tags,
      location,
      image,
      link,
    };

    const result = await db.collection('events').updateOne(
      { _id: objectId },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }

    revalidatePath('/api/events');
    revalidatePath('/');

    return NextResponse.json({ success: true, event: { ...updateDoc, _id: id } });
  } catch (err) {
    console.error('PUT Event Error:', err);
    return NextResponse.json({ error: 'Failed to update event.' }, { status: 500 });
  }
}
