import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { headers } from "next/headers";

const JWT_SECRET = "news-portal-secret-key-2024";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): object | null {
  try {
    return jwt.verify(token, JWT_SECRET) as object;
  } catch {
    return null;
  }
}

export async function getAuthUser(
  request: Request
): Promise<UserRecord | null> {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload || typeof payload !== "object" || !("userId" in payload)) {
      return null;
    }

    const userId = (payload as { userId: string }).userId;
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 4,
  admin: 3,
  editor: 2,
  reporter: 1,
};

export function requireRole(roles: string[]) {
  return (user: UserRecord | null): { authorized: boolean; response?: Response } => {
    if (!user) {
      return {
        authorized: false,
        response: new Response(JSON.stringify({ error: "Authentication required" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      };
    }

    if (!roles.includes(user.role)) {
      return {
        authorized: false,
        response: new Response(
          JSON.stringify({ error: "Insufficient permissions" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        ),
      };
    }

    return { authorized: true };
  };
}

export function requireMinRole(minRole: string) {
  return (user: UserRecord | null): { authorized: boolean; response?: Response } => {
    if (!user) {
      return {
        authorized: false,
        response: new Response(JSON.stringify({ error: "Authentication required" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      };
    }

    const userLevel = ROLE_HIERARCHY[user.role] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;

    if (userLevel < requiredLevel) {
      return {
        authorized: false,
        response: new Response(
          JSON.stringify({ error: "Insufficient permissions" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        ),
      };
    }

    return { authorized: true };
  };
}