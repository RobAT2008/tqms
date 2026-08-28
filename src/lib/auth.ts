import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const COOKIE_NAME = "tqms_admin_session";
const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || "insecure-dev-secret-change-me-32chars");

export interface SessionPayload {
  adminId: string;
  email: string;
  role: string;
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function destroySession() {
  cookies().delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  const admin = await prisma.admin.findUnique({ where: { id: session.adminId } });
  if (!admin || !admin.isActive) return null;
  return admin;
}

export async function verifyAdminCredentials(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !admin.isActive) return null;
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return null;
  return admin;
}
