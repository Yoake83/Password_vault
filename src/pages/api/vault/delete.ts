import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") return res.status(405).end();

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Missing id" });

  const client = await clientPromise;
  const db = client.db();
  const vault = db.collection("vault");

  const result = await vault.deleteOne({ _id: new ObjectId(id), owner: (payload as any).userId });
  if (result.deletedCount === 0) return res.status(404).json({ error: "Not found" });

  return res.json({ ok: true });
}
