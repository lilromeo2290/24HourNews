import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser, requireRole } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeHidden = searchParams.get("all") === "true";

    const where = includeHidden ? {} : { isVisible: true };

    const categories = await db.category.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { articles: { where: { status: "published" } } },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("List categories error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const check = requireRole(["admin", "super_admin"])(user);
    if (!check.authorized) return check.response!;

    const body = await request.json();
    const { name, description, color, icon, isVisible, isFeatured, order } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let slug = slugify(name);
    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        description: description || null,
        color: color || "#e11d48",
        icon: icon || null,
        isVisible: isVisible !== undefined ? isVisible : true,
        isFeatured: isFeatured || false,
        order: order || 0,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}