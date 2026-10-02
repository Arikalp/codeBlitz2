/**
 * lib/mongodb.ts
 *
 * Reusable MongoDB connection utility using Mongoose.
 * Safe connection reuse across hot-reloads in development via a
 * module-level cache on the Node.js global object.
 *
 * IMPORTANT: Server-side only.
 * Never import this file in Client Components or expose it through
 * a public API route response.
 */

import mongoose from "mongoose";

/** Cached connection state stored on the global object so it survives hot reloads in development. */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Augment the Node.js global type so TypeScript is happy.
declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined;
}

function getCache(): MongooseCache {
  if (!global.__mongooseCache) {
    global.__mongooseCache = { conn: null, promise: null };
  }
  return global.__mongooseCache;
}

/**
 * Returns a resolved Mongoose instance.
 * Reuses the existing connection when one is already open.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      'Missing environment variable "MONGODB_URI". ' +
        "Copy .env.example to .env.local and add the connection string."
    );
  }

  const cached = getCache();

  // Already connected — return immediately.
  if (cached.conn) {
    return cached.conn;
  }

  // Connection in progress — await it rather than creating a duplicate.
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      dbName: "healthsetu",
    };

    cached.promise = mongoose.connect(uri, opts);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
