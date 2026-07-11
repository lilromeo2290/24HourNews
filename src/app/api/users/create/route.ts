import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser, requireRole, hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const check = requireRole(["admin", "super_admin"])(user);
    if (!check.authorized) return check.response!;

    const body = await request.json();
    const { email, name, password, role, avatar, bio } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const validRoles = ["super_admin", "admin", "editor", "reporter"];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be one of: " + validRoles.join(", ") },
        { status: 400 }
      );
    }

    // Only super_admin can create super_admin
    if (role === "super_admin" && user!.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only super admins can create super admin users" },
        { status: 403 }
      );
    }

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser = await db.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
        role: role || "reporter",
        avatar: avatar || null,
        bio: bio || null,
      },
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

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}