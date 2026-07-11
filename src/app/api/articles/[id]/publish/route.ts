import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser, requireMinRole } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    const check = requireMinRole("editor")(user);
    if (!check.authorized) return check.response!;

    const { id } = await params;

    const article = await db.article.findUnique({ where: { id } });
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Validate required fields
    if (!article.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!article.content || article.content.trim() === "") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    if (!article.featuredImage) {
      return NextResponse.json(
        { error: "Featured image is required" },
        { status: 400 }
      );
    }
    if (!article.categoryId) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    const updated = await db.article.update({
      where: { id },
      data: {
        status: "published",
        publishedAt: new Date(),
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json({ article: updated });
  } catch (error) {
    console.error("Publish article error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}