import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import { verifyPassword, signToken } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const client = await clientPromise;
  const db = client.db();
  const users = db.collection("users");
  const user = await users.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ userId: user._id.toString(), email });
  return res.json({ token });
}
