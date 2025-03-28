/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, react/jsx-no-duplicate-props */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
console.log("MONGODB_URI",MONGODB_URI)

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "kennel-management",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
