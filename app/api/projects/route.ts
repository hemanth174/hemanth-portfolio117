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

// GET - Fetch all projects. If database is missing any default projects, insert them.
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    let projects = await db
      .collection('projects')
      .find({})
      .toArray();

    const defaultProjects = [
      {
        title: 'HOAS — Hostel Operational Accountability System',
        category: 'StartUp',
        projectType: 'big',
        order: 300,
        description: 'A full-stack web platform that streamlines hostel operations by enabling complaint tracking, role-based management, and real-time accountability between students, wardens, and management.',
        image: '/Img2.png',
        codeUrl: 'https://github.com/niatapppurpose-APPs/HOAS.git',
        liveUrl: 'https://hoas-client-4n13.vercel.app/',
        createdAt: new Date(Date.now() - 1000),
      },
      {
        title: 'HOME AUTOMATION',
        category: 'Personal Project',
        projectType: 'big',
        order: 290,
        description: 'An architectural, distributed, off-grid-ready, and a metrics-driven Smart Home automation system. This platform transforms simple device-level switches into a Home Intelligence Platform.',
        image: '',
        codeUrl: '#',
        liveUrl: '#',
        createdAt: new Date(Date.now() - 1500),
      },
      {
        title: 'Interview Assistant',
        category: 'Personal Project',
        projectType: 'big',
        order: 280,
        description: 'An interactive AI-powered interview platform that conducts real-time voice interviews across multiple technical topics.',
        image: '',
        codeUrl: '#',
        liveUrl: '#',
        createdAt: new Date(Date.now() - 1800),
      },
      {
        title: 'SyllabiQ — Exam Syllabus Tracker',
        category: 'Personal Project',
        projectType: 'big',
        order: 270,
        description: 'A full-stack web app that helps students track their syllabus topics, monitor subject-wise progress, and count down to exam day — all in one dashboard.',
        image: '/Logo_main.png',
        codeUrl: 'https://github.com/hemanth174/SyllbuIQ.git',
        liveUrl: '#',
        createdAt: new Date(Date.now() - 2000),
      },
      {
        title: 'LLM Student Assistant — AI Study Companion',
        category: 'Personal Project',
        projectType: 'big',
        order: 260,
        description: 'LLM-based student assistant deployed on Hugging Face Spaces that delivers real-time answers, explanations, and learning support using natural language interaction.',
        image: '/Img3.png',
        codeUrl: 'https://huggingface.co/spaces/Hemanth789/LLM_student_assisstant/tree/main',
        liveUrl: 'https://huggingface.co/spaces/Hemanth789/LLM_student_assisstant',
        createdAt: new Date(Date.now() - 3000),
      },
      {
        title: 'Ember & Oak — Fine Dining Restaurant',
        category: 'Freelance Project',
        projectType: 'big',
        order: 240,
        description: 'A premium fine-dining restaurant website featuring an elegant menu, booking integration, and a sophisticated aesthetic. Built as a freelance demo to showcase high-end UI/UX.',
        image: '/restaurant_demo.png',
        codeUrl: 'https://github.com/hemanth174/restaurant-client.git',
        liveUrl: 'https://restaurant-demo117.netlify.app/',
        createdAt: new Date(Date.now() - 4000),
      },
    ];

    // Check if any default projects are missing from database
    const missingDefaults = defaultProjects.filter((def) => 
      !projects.some((p: any) => p.title && p.title.toLowerCase().includes(def.title.slice(0, 7).toLowerCase()))
    );

    if (missingDefaults.length > 0) {
      await db.collection('projects').insertMany(missingDefaults);
      projects = await db.collection('projects').find({}).toArray();
    }

    // Sort projects: 'big' projects first, 'small' projects second, then by order/createdAt descending
    projects.sort((a: any, b: any) => {
      const getNormalizedType = (p: any) => {
        if (p.projectType === 'small' || p.projectType === 'big') return p.projectType;
        return p.category === 'LLM Notebook' ? 'small' : 'big';
      };

      const typeA = getNormalizedType(a) === 'big' ? 0 : 1;
      const typeB = getNormalizedType(b) === 'big' ? 0 : 1;

      if (typeA !== typeB) return typeA - typeB; // 'big' (0) before 'small' (1)
      
      const orderA = typeof a.order === 'number' ? a.order : 0;
      const orderB = typeof b.order === 'number' ? b.order : 0;
      if (orderA !== orderB) return orderB - orderA; // Higher order value first

      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Descending by createdAt
    });

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

    const title = sanitize(body.title, 150);
    const category = sanitize(body.category, 100);
    const rawProjectType = sanitize(body.projectType, 20);
    const projectType = rawProjectType === 'small' ? 'small' : 'big';
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
      projectType,
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
  if (!verifyAdminRequest(request)) {
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

// PUT - Update an existing project (Admin only)
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
      return NextResponse.json({ error: 'Project ID is required.' }, { status: 400 });
    }

    const title = sanitize(body.title, 150);
    const category = sanitize(body.category, 100);
    const rawProjectType = sanitize(body.projectType, 20);
    const projectType = rawProjectType === 'small' ? 'small' : 'big';
    const description = sanitize(body.description, 2000);
    // Base64 images can be large (up to 5MB), we sanitize but allow a higher limit.
    const image = sanitize(body.image, 10 * 1024 * 1024); 
    const codeUrl = sanitize(body.codeUrl, 500);
    const liveUrl = sanitize(body.liveUrl, 500);
    const order = typeof body.order === 'number' ? body.order : undefined;

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
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Invalid project ID format.' }, { status: 400 });
    }

    const updateDoc: Record<string, any> = {
      title,
      category,
      projectType,
      description,
      image,
      codeUrl,
      liveUrl,
    };

    if (order !== undefined) {
      updateDoc.order = order;
    }

    const result = await db.collection('projects').updateOne(
      { _id: objectId },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    // Invalidate Next.js static cache immediately
    revalidatePath('/api/projects');
    revalidatePath('/');

    return NextResponse.json({ success: true, project: { ...updateDoc, _id: id } });
  } catch (err) {
    console.error('PUT Projects Error:', err);
    return NextResponse.json({ error: 'Failed to update project.' }, { status: 500 });
  }
}
