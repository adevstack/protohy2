
import { MongoClient, Db, ServerApiVersion } from 'mongodb';
import type { User as AppUser } from '@/lib/types'; // App specific User type

// Define a user structure for MongoDB, ensuring it aligns with your AppUser type
// but might include MongoDB specific fields like _id or password fields.
export interface MongoUserDocument extends Omit<AppUser, 'id'> {
  _id?: import('mongodb').ObjectId; // Optional because it's auto-generated on insert
  email: string; // Make email explicitly required for database schema
  hashedPassword?: string; // Store hashed password, not plain text
  name?: string;
  avatarUrl?: string;
  // Add any other fields you expect in the MongoDB user document
  createdAt?: Date;
  updatedAt?: Date;
}


if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}
if (!process.env.MONGODB_DB_NAME) {
  throw new Error('Please define the MONGODB_DB_NAME environment variable inside .env');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

// Extend the NodeJS.Global interface with the mongo client for TypeScript
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    console.log('MongoDB: Creating new client promise (development mode).');
    console.log('MongoDB: Attempting to connect with URI:', uri.substring(0, uri.indexOf('@') > 0 ? uri.indexOf('@') : uri.length) + (uri.indexOf('@') > 0 ? '@...' : '')); // Log URI safely
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    global._mongoClientPromise = client.connect();
    global._mongoClientPromise
      .then(() => console.log('MongoDB: Development client connected to server successfully.'))
      .catch(e => console.error('MongoDB: Development client initial connection error:', e));
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  console.log('MongoDB: Creating new client promise (production mode).');
  console.log('MongoDB: Attempting to connect with URI:', uri.substring(0, uri.indexOf('@') > 0 ? uri.indexOf('@') : uri.length) + (uri.indexOf('@') > 0 ? '@...' : '')); // Log URI safely
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  clientPromise = client.connect();
  clientPromise
    .then(() => console.log('MongoDB: Production client connected to server successfully.'))
    .catch(e => console.error('MongoDB: Production client initial connection error:', e));
}

export async function connectToDatabase(): Promise<{ client: MongoClient, db: Db }> {
  console.log('MongoDB: connectToDatabase function called.');
  try {
    const connectedClient = await clientPromise;
    const db = connectedClient.db(dbName);
    console.log(`MongoDB: Successfully got DB instance for: ${db.databaseName}`);
    return { client: connectedClient, db };
  } catch (e) {
    console.error('MongoDB: Failed to establish connection in connectToDatabase function:', e);
    throw new Error(`Failed to connect to database: ${(e as Error).message}`);
  }
}

// Export the client promise for direct use if needed (e.g. for transactions)
export default clientPromise;

