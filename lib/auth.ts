import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "redline_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be configured with at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminSession(username: string) {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecret());
}

export async function verifyAdminSession(token: string | undefined) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin" && payload.sub === (process.env.ADMIN_USERNAME || "redline");
  } catch {
    return false;
  }
}

export async function hasAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifyAdminSession(token);
}

export const sessionMaxAge = SESSION_DURATION_SECONDS;
