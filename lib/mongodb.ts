import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = 'hemanthPortfolio';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

// Global cache to reuse the connection across serverless invocations
let cached: { client: MongoClient; db: Db } | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cached) {
    return cached;
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  cached = { client, db };
  return cached;
}
