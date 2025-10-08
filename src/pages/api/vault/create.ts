import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: "Unauthorized" });

  const { encrypted } = req.body;
  if (!encrypted) return res.status(400).json({ error: "Missing encrypted data" });

  const client = await clientPromise;
  const db = client.db();
  const vault = db.collection("vault");

  const result = await vault.insertOne({
    owner: (payload as any).userId,
    encrypted,
    createdAt: new Date(),
  });

  return res.status(201).json({ id: result.insertedId });
}
