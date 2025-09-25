// lib/db.js
import { MongoClient } from 'mongodb';

let client, db;

export async function getDb() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
    db = client.db(process.env.DB_NAME);
  }
  return db;
}

// Additional helper functions for our astrology platform
export async function connectToDatabase() {
  const database = await getDb();
  return { client, db: database };
}