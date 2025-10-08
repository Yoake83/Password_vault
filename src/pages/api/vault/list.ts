import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

interface TokenPayload {
  userId: string;
}
function isTokenPayload(payload: unknown): payload is TokenPayload {
  return typeof payload === "object" &&
         payload !== null &&
         "userId" in payload &&
         typeof (payload as any).userId === "string";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  const payload = token ? verifyToken(token) : null;
  if (!isTokenPayload(payload)) return res.status(401).json({ error: "Unauthorized" });

  const client = await clientPromise;
  const db = client.db();
  const vault = db.collection("vault");

  const items = await vault.find({ owner: payload.userId }).toArray();

  return res.json({ items });
}
