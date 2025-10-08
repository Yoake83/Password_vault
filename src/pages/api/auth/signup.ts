import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import { hashPassword, signToken } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const client = await clientPromise;
  const db = client.db();
  const users = db.collection("users");

  const existing = await users.findOne({ email });
  if (existing) return res.status(409).json({ error: "User already exists" });

  const hashed = await hashPassword(password);
  const result = await users.insertOne({ email, password: hashed, createdAt: new Date() });
  const token = signToken({ userId: result.insertedId.toString(), email });

  return res.status(201).json({ token });
}
