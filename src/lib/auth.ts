import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// ============================================================
// Config
// ============================================================

const JWT_SECRET = process.env.JWT_SECRET || "vallenar-decohogar-secret-key-change-in-production-2026";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
const TOKEN_COOKIE_NAME = "vallenar-auth-token";
const TOKEN_EXPIRY = "30d"; // 30 días

// ============================================================
// Password hashing
// ============================================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================================
// JWT
// ============================================================

export interface JWTPayload {
  userId: string;
  email: string;
  name?: string | null;
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ============================================================
// Auth helpers (server-side)
// ============================================================

import { cookies } from "next/headers";

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 días
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE_NAME);
}

export { TOKEN_COOKIE_NAME };
export { db };
