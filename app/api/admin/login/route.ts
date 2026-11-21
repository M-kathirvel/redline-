import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createAdminSession, SESSION_COOKIE, sessionMaxAge } from "@/lib/auth";

const credentialsSchema = z.object({
  username: z.string().trim().min(1).max(80),
  password: z.string().min(1).max(200)
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = credentialsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid username and password." }, { status: 400 });
  }

  const { username, password } = parsed.data;
  const expectedUsername = process.env.ADMIN_USERNAME || "redline";
 const expectedPassword = process.env.ADMIN_PASSWORD;
const passwordHash = process.env.ADMIN_PASSWORD_HASH_B64
  ? Buffer.from(process.env.ADMIN_PASSWORD_HASH_B64, "base64").toString("utf8")
  : process.env.ADMIN_PASSWORD_HASH;
const isValidPassword = expectedPassword
  ? password === expectedPassword
  : passwordHash
    ? await bcrypt.compare(password, passwordHash)
    : false;

if (username !== expectedUsername || !isValidPassword) {
  return NextResponse.json({ error: "Incorrect username or password." }, { status: 401 });
}
  

  const session = await createAdminSession(username);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAge
  });
  return response;
}
