import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb+srv://hl08231984_db_user:Vglog6uKTALZpP65@card-ledger-cluster.ivgjb3k.mongodb.net/?retryWrites=true&w=majority";
const dbName = process.env.MONGODB_DATABASE || "CardLedgerDB";
const collectionName = process.env.MONGODB_COLLECTION || "CardLedger";

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const col = db.collection(collectionName);

    if (req.method === 'GET') {
      const cards = await col.find({}).sort({ updatedAt: -1 }).toArray();
      return res.status(200).json({ success: true, count: cards.length, data: cards });
    }

    if (req.method === 'POST') {
      const payload = req.body;
      if (Array.isArray(payload)) {
        for (const item of payload) {
          const { _id, ...doc } = item;
          await col.updateOne({ id: item.id }, { $set: doc }, { upsert: true });
        }
      } else if (payload && payload.id) {
        const { _id, ...doc } = payload;
        await col.updateOne({ id: payload.id }, { $set: doc }, { upsert: true });
      }
      return res.status(200).json({ success: true, message: 'Synced to Fate Collections DB' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('MongoDB API Sync Error:', error);
    res.status(500).json({ error: error.message });
  }
}
