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

// GET - Fetch all published work experiences.
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const experiences = await db
      .collection('experiences')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      { experiences },
      {
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  } catch (err) {
    console.error('GET Experience Error:', err);
    return NextResponse.json({ error: 'Failed to fetch experiences.' }, { status: 500 });
  }
}

// POST - Add a new work experience (Admin only)
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

    const company = sanitize(body.company, 200);
    const role = sanitize(body.role, 200);
    const duration = sanitize(body.duration, 100);
    const isCurrent = Boolean(body.isCurrent);
    const location = sanitize(body.location, 200);
    const description = sanitize(body.description, 3000);
    const link = sanitize(body.link, 500);
    const proof = sanitize(body.proof, 15 * 1024 * 1024);

    let skills: string[] = [];
    if (Array.isArray(body.skills)) {
      skills = (body.skills as unknown[]).map((s) => sanitize(s, 50)).filter(Boolean).slice(0, 12);
    } else if (typeof body.skills === 'string') {
      skills = body.skills.split(',').map((s) => sanitize(s.trim(), 50)).filter(Boolean).slice(0, 12);
    }

    if (!company || company.length < 2) {
      return NextResponse.json({ error: 'Company name must be at least 2 characters.' }, { status: 400 });
    }
    if (!role || role.length < 2) {
      return NextResponse.json({ error: 'Role title must be at least 2 characters.' }, { status: 400 });
    }
    if (!duration) {
      return NextResponse.json({ error: 'Duration is required.' }, { status: 400 });
    }
    if (!description || description.length < 5) {
      return NextResponse.json({ error: 'Description must be at least 5 characters.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const newExperience = {
      company,
      role,
      duration,
      isCurrent,
      location,
      description,
      skills,
      link,
      proof,
      createdAt: new Date(),
    };

    const result = await db.collection('experiences').insertOne(newExperience);

    revalidatePath('/api/experience');
    revalidatePath('/');

    return NextResponse.json({ success: true, experience: { ...newExperience, _id: result.insertedId } });
  } catch (err) {
    console.error('POST Experience Error:', err);
    return NextResponse.json({ error: 'Failed to add work experience.' }, { status: 500 });
  }
}

// DELETE - Delete a work experience entry (Admin only)
export async function DELETE(request: NextRequest) {
  const authKey = request.headers.get('x-admin-key');
  if (!authKey || authKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Experience ID is required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Invalid experience ID format.' }, { status: 400 });
    }

    const result = await db.collection('experiences').deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Experience entry not found.' }, { status: 404 });
    }

    revalidatePath('/api/experience');
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE Experience Error:', err);
    return NextResponse.json({ error: 'Failed to delete experience entry.' }, { status: 500 });
  }
}

// PUT - Update an existing work experience (Admin only)
export async function PUT(request: NextRequest) {
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

    const id = body._id || body.id;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Experience ID is required.' }, { status: 400 });
    }

    const company = sanitize(body.company, 200);
    const role = sanitize(body.role, 200);
    const duration = sanitize(body.duration, 100);
    const isCurrent = Boolean(body.isCurrent);
    const location = sanitize(body.location, 200);
    const description = sanitize(body.description, 3000);
    const link = sanitize(body.link, 500);
    const proof = sanitize(body.proof, 15 * 1024 * 1024);

    let skills: string[] = [];
    if (Array.isArray(body.skills)) {
      skills = (body.skills as unknown[]).map((s) => sanitize(s, 50)).filter(Boolean).slice(0, 12);
    } else if (typeof body.skills === 'string') {
      skills = body.skills.split(',').map((s) => sanitize(s.trim(), 50)).filter(Boolean).slice(0, 12);
    }

    if (!company || company.length < 2) {
      return NextResponse.json({ error: 'Company name must be at least 2 characters.' }, { status: 400 });
    }
    if (!role || role.length < 2) {
      return NextResponse.json({ error: 'Role title must be at least 2 characters.' }, { status: 400 });
    }
    if (!duration) {
      return NextResponse.json({ error: 'Duration is required.' }, { status: 400 });
    }
    if (!description || description.length < 5) {
      return NextResponse.json({ error: 'Description must be at least 5 characters.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Invalid experience ID format.' }, { status: 400 });
    }

    const updateDoc = {
      company,
      role,
      duration,
      isCurrent,
      location,
      description,
      skills,
      link,
      proof,
    };

    const result = await db.collection('experiences').updateOne(
      { _id: objectId },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Experience entry not found.' }, { status: 404 });
    }

    revalidatePath('/api/experience');
    revalidatePath('/');

    return NextResponse.json({ success: true, experience: { ...updateDoc, _id: id } });
  } catch (err) {
    console.error('PUT Experience Error:', err);
    return NextResponse.json({ error: 'Failed to update experience entry.' }, { status: 500 });
  }
}
