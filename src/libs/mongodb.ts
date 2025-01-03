// src/libs/mongodb.ts
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
if (!MONGODB_URI) throw new Error('Please define the MONGODB_URI environment variable in .env.local');

let mongoClient: MongoClient;

async function connectToDatabase() {
  if (!mongoClient) {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
  }
  return mongoClient;
}

export function getTenantDatabase(businessPhoneNumber: string) {
  console.log('getTenantDatabase called with businessPhoneNumber:', businessPhoneNumber);
  const tenantDbName = `tenant_${businessPhoneNumber}`;
  console.log('Accessing tenant database:', tenantDbName);
  return mongoClient.db(tenantDbName);
}


export async function ensureCollections(businessPhoneNumber: string) {
  const client = await connectToDatabase();
  const db = getTenantDatabase(businessPhoneNumber);

  const requiredCollections = ['chats', 'prompts'];
  const existingCollections = await db.listCollections().toArray();
  const existingCollectionNames = existingCollections.map((col) => col.name);

  await Promise.race([
    Promise.all(
      requiredCollections.map(async (collection) => {
        if (!existingCollectionNames.includes(collection)) {
          await db.createCollection(collection);
        }
      })
    ),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout creating collections')), 10000)
    ),
  ]);
}

export default connectToDatabase;
