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

// GET - Fetch all certificates. If database is empty, seed it with the 10 default ones.
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    let certificates = await db
      .collection('certificates')
      .find({})
      .sort({ createdAt: 1 }) // sort oldest first to preserve original order
      .toArray();

    // Seed database if empty
    if (certificates.length === 0) {
      const defaultCertificates = [
        {
          title: "Teaching English as a Foreign Language (TEFL) Essentials",
          img: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1749008635/09dcdb1b-fa4e-4be9-a278-d60c53b448bb_uhw2lf.png",
          createdAt: new Date(Date.now() - 10000)
        },
        {
          title: "Breaking into IoT Workshop – Certificate of Participation",
          img: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1749008643/80d599e9-4c2e-431e-923f-d12c12b9b872_srwint.png",
          createdAt: new Date(Date.now() - 9000)
        },
        {
          title: "Tech meets Green: Revolutionizing Agriculture & Dairy – Certificate of Participation",
          img: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1749008651/b8c03bde-daed-4070-bd35-50dd3c82fdca_s8fjmr.png",
          createdAt: new Date(Date.now() - 8000)
        },
        {
          title: "Drone Club – Certificate of Participation",
          img: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1749008657/9b988d61-ca03-4d9d-ab0d-50816b892068_ys1m8p.png",
          createdAt: new Date(Date.now() - 7000)
        },
        {
          title: "Swarm Integration Workshop Participation",
          img: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1749008665/57d59a68-d802-41b8-b165-b6c0044c8901_yddgrf.png",
          createdAt: new Date(Date.now() - 6000)
        },
        {
          title: "Swarm Integration of Drones – Achievement Certificate",
          img: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1749008671/97442ef7-7bb3-47f5-bd43-1f7c20f2242c_rapojl.png",
          createdAt: new Date(Date.now() - 5000)
        },
        {
          title: "Neo4j",
          img: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1763050891/download_ld5qq8.jpg",
          createdAt: new Date(Date.now() - 4000)
        },
        {
          title: "Deloitte",
          img: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1763050907/download_pjhm4a.png",
          createdAt: new Date(Date.now() - 3000)
        },
        {
          title: "Base44 Hackthon",
          img: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1766465957/Base44-Hackthon-HNG83QSUJT_z1svhc.png",
          createdAt: new Date(Date.now() - 2000)
        },
        {
          title: "Sports Event Contribution – NIAT Hexaverse 2.0",
          img: "https://res.cloudinary.com/dqtlqvhw5/image/upload/q_auto/f_auto/v1776495220/1774324572940.pdf_v2lv8b.png",
          createdAt: new Date(Date.now() - 1000)
        }
      ];
      await db.collection('certificates').insertMany(defaultCertificates);
      certificates = await db.collection('certificates').find({}).sort({ createdAt: 1 }).toArray();
    }

    return NextResponse.json(
      { certificates },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    console.error('GET Certificates Error:', err);
    return NextResponse.json({ error: 'Failed to fetch certificates.' }, { status: 500 });
  }
}

// POST - Add a new certificate (Admin only)
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
    // Base64 images can be large (up to 10MB)
    const img = sanitize(body.img, 10 * 1024 * 1024);

    if (!title || title.length < 2) {
      return NextResponse.json({ error: 'Title must be at least 2 characters.' }, { status: 400 });
    }
    if (!img) {
      return NextResponse.json({ error: 'Certificate image is required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const newCert = {
      title,
      img,
      createdAt: new Date(),
    };

    const result = await db.collection('certificates').insertOne(newCert);

    // Invalidate Next.js static cache immediately
    revalidatePath('/api/certificates');
    revalidatePath('/');

    return NextResponse.json({ success: true, certificate: { ...newCert, _id: result.insertedId } });
  } catch (err) {
    console.error('POST Certificates Error:', err);
    return NextResponse.json({ error: 'Failed to add certificate.' }, { status: 500 });
  }
}

// DELETE - Delete a certificate (Admin only)
export async function DELETE(request: NextRequest) {
  const authKey = request.headers.get('x-admin-key');
  if (!authKey || authKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Certificate ID is required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Invalid certificate ID format.' }, { status: 400 });
    }

    const result = await db.collection('certificates').deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Certificate not found.' }, { status: 404 });
    }

    // Invalidate Next.js static cache immediately
    revalidatePath('/api/certificates');
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE Certificates Error:', err);
    return NextResponse.json({ error: 'Failed to delete certificate.' }, { status: 500 });
  }
}
