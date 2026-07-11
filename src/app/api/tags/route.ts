import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser, requireMinRole } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

export async function GET() {
  try {
    const tags = await db.tag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { articles: true } },
      },
    });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("List tags error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const check = requireMinRole("editor")(user);
    if (!check.authorized) return check.response!;

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let slug = slugify(name);
    const existing = await db.tag.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Tag with this name already exists" },
        { status: 409 }
      );
    }

    const tag = await db.tag.create({
      data: { name, slug },
    });

    return NextResponse.json({ tag }, { status: 201 });
  } catch (error) {
    console.error("Create tag error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}