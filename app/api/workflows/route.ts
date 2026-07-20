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

// Keys to strip from n8n credential objects before serving to public
const CREDENTIAL_KEYS = new Set([
  'credentials', 'apiKey', 'api_key', 'password', 'token', 'secret',
  'Authorization', 'authorization', 'bearerToken', 'clientSecret',
  'clientId', 'accessToken', 'refreshToken', 'privateKey', 'webhookId',
  'webhook_url', 'authorizationUrl', 'oauthTokenData', 'csrfToken',
  'username', 'passphrase', 'x-api-key', 'X-Api-Key'
]);

/** Recursively strips credential fields from any JSON object */
function stripCredentials(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(stripCredentials);
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (CREDENTIAL_KEYS.has(key)) {
        // Replace with placeholder instead of removing so JSON structure is preserved
        result[key] = typeof value === 'object' ? {} : '[REDACTED]';
      } else {
        result[key] = stripCredentials(value);
      }
    }
    return result;
  }
  return obj;
}

// GET - Fetch all workflows (public, but credentials stripped from workflowJson)
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const workflows = await db
      .collection('workflows')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Strip credentials from workflowJson before serving
    const sanitizedWorkflows = workflows.map((wf) => {
      if (wf.workflowJson) {
        try {
          const parsed = JSON.parse(wf.workflowJson as string);
          const stripped = stripCredentials(parsed);
          return { ...wf, workflowJson: JSON.stringify(stripped, null, 2) };
        } catch {
          return { ...wf, workflowJson: null };
        }
      }
      return wf;
    });

    return NextResponse.json(
      { workflows: sanitizedWorkflows },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    console.error('GET Workflows Error:', err);
    return NextResponse.json({ error: 'Failed to fetch workflows.' }, { status: 500 });
  }
}

// POST - Add a new workflow (Admin only)
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
    const description = sanitize(body.description, 2000);
    const category = sanitize(body.category, 100);
    const thumbnail = sanitize(body.thumbnail, 10 * 1024 * 1024);

    // Tags: accept array or comma-separated string
    let tags: string[] = [];
    if (Array.isArray(body.tags)) {
      tags = (body.tags as unknown[]).map((t) => sanitize(t, 50)).filter(Boolean).slice(0, 10);
    } else if (typeof body.tags === 'string') {
      tags = body.tags.split(',').map((t) => sanitize(t.trim(), 50)).filter(Boolean).slice(0, 10);
    }

    // workflowJson: store the raw JSON string (we strip creds on GET)
    let workflowJson = '';
    let nodeCount = 0;
    if (typeof body.workflowJson === 'string' && body.workflowJson.trim()) {
      try {
        const parsed = JSON.parse(body.workflowJson);
        workflowJson = JSON.stringify(parsed); // re-stringify to normalize
        // Count nodes if present
        if (Array.isArray(parsed?.nodes)) nodeCount = parsed.nodes.length;
        else if (Array.isArray(parsed?.workflow?.nodes)) nodeCount = parsed.workflow.nodes.length;
      } catch {
        return NextResponse.json({ error: 'Invalid n8n JSON. Please upload a valid workflow file.' }, { status: 400 });
      }
    }

    if (!title || title.length < 2) {
      return NextResponse.json({ error: 'Title must be at least 2 characters.' }, { status: 400 });
    }
    if (!description || description.length < 5) {
      return NextResponse.json({ error: 'Description must be at least 5 characters.' }, { status: 400 });
    }
    if (!workflowJson) {
      return NextResponse.json({ error: 'A valid n8n workflow JSON file is required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const newWorkflow = {
      title,
      description,
      category: category || 'Automation',
      tags,
      thumbnail,
      workflowJson,
      nodeCount,
      createdAt: new Date(),
    };

    const result = await db.collection('workflows').insertOne(newWorkflow);

    revalidatePath('/api/workflows');
    revalidatePath('/');

    return NextResponse.json({ success: true, workflow: { ...newWorkflow, _id: result.insertedId, workflowJson: undefined } });
  } catch (err) {
    console.error('POST Workflow Error:', err);
    return NextResponse.json({ error: 'Failed to add workflow.' }, { status: 500 });
  }
}

// DELETE - Delete a workflow (Admin only)
export async function DELETE(request: NextRequest) {
  const authKey = request.headers.get('x-admin-key');
  if (!authKey || authKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Workflow ID is required.' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Invalid workflow ID format.' }, { status: 400 });
    }

    const result = await db.collection('workflows').deleteOne({ _id: objectId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Workflow not found.' }, { status: 404 });
    }

    revalidatePath('/api/workflows');
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE Workflow Error:', err);
    return NextResponse.json({ error: 'Failed to delete workflow.' }, { status: 500 });
  }
}
