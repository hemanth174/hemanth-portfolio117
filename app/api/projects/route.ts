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

// GET - Fetch all projects. If database is empty, seed it with the 4 default ones.
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    let projects = await db
      .collection('projects')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Seed database if empty
    if (projects.length === 0) {
      const defaultProjects = [
        {
          title: 'SyllabiQ — Exam Syllabus Tracker',
          category: 'Personal Project',
          description: 'A full-stack web app that helps students track their syllabus topics, monitor subject-wise progress, and count down to exam day — all in one dashboard.',
          image: '/Logo_main.png',
          codeUrl: 'https://github.com/hemanth174/SyllbuIQ.git',
          liveUrl: '#',
          createdAt: new Date(Date.now() - 4000),
        },
        {
          title: 'HOAS — Hostel Operational Accountability System',
          category: 'StartUp',
          description: 'A full-stack web platform that streamlines hostel operations by enabling complaint tracking, role-based management, and real-time accountability between students, wardens, and management.',
          image: '/Img2.png',
          codeUrl: 'https://github.com/niatapppurpose-APPs/HOAS.git',
          liveUrl: 'https://hoas-client-4n13.vercel.app/',
          createdAt: new Date(Date.now() - 3000),
        },
        {
          title: 'LLM Student Assistant — AI Study Companion',
          category: 'Personal Project',
          description: 'LLM-based student assistant deployed on Hugging Face Spaces that delivers real-time answers, explanations, and learning support using natural language interaction.',
          image: '/Img3.png',
          codeUrl: 'https://huggingface.co/spaces/Hemanth789/LLM_student_assisstant/tree/main',
          liveUrl: 'https://huggingface.co/spaces/Hemanth789/LLM_student_assisstant',
          createdAt: new Date(Date.now() - 2000),
        },
        {
          title: 'Ember & Oak — Fine Dining Restaurant',
          category: 'Freelance Project',
          description: 'A premium fine-dining restaurant website featuring an elegant menu, booking integration, and a sophisticated aesthetic. Built as a freelance demo to showcase high-end UI/UX.',
          image: '/restaurant_demo.png',
          codeUrl: 'https://github.com/hemanth174/restaurant-client.git',
          liveUrl: 'https://restaurant-demo117.netlify.app/',
          createdAt: new Date(Date.now() - 1000),
        },
      ];
      await db.collection('projects').insertMany(defaultProjects);
      projects = await db.collection('projects').find({}).sort({ createdAt: -1 }).toArray();
    }

    return NextResponse.json(
      { projects },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    console.error('GET Projects Error:', err);
    return NextResponse.json({ error: 'Failed to fetch projects.' }, { status: 500 });
  }
}

// POST - Add a new project (Admin only)
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

    const title = sanitize(body.title, 150);
    const category = sanitize(body.category, 100);
    const description = sanitize(body.description, 2000);
    // Base64 images can be large (up to 5MB), we sanitize but allow a higher limit.
    const image = sanitize(body.image, 10 * 1024 * 1024); 
    const codeUrl = sanitize(body.codeUrl, 500);
    const liveUrl = sanitize(body.liveUrl, 500);

    if (!title || title.length < 2) {
      return NextResponse.json({ error: 'Title must be at least 2 characters.' }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ error: 'Category is required.' }, { status: 400 });
    }
    if (!description || description.length < 5) {
      return NextResponse.json({ error: 'Description must be at least 5 characters.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const newProject = {
      title,
      category,
      description,
      image,
      codeUrl,
      liveUrl,
      createdAt: new Date(),
    };

    const result = await db.collection('projects').insertOne(newProject);
    
    // Invalidate Next.js static cache immediately
    revalidatePath('/api/projects');
    revalidatePath('/');

    return NextResponse.json({ success: true, project: { ...newProject, _id: result.insertedId } });
  } catch (err) {
    console.error('POST Projects Error:', err);
    return NextResponse.json({ error: 'Failed to add project.' }, { status: 500 });
  }
}

// DELETE - Delete a project (Admin only)
export async function DELETE(request: NextRequest) {
  const authKey = request.headers.get('x-admin-key');
  if (!authKey || authKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Invalid project ID format.' }, { status: 400 });
    }

    const result = await db.collection('projects').deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    // Invalidate Next.js static cache immediately
    revalidatePath('/api/projects');
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE Projects Error:', err);
    return NextResponse.json({ error: 'Failed to delete project.' }, { status: 500 });
  }
}
