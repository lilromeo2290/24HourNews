import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, authorName, authorEmail, content } = body;

    if (!articleId || !authorName || !content) {
      return NextResponse.json(
        { error: "Article ID, author name, and content are required" },
        { status: 400 }
      );
    }

    // Verify article exists and is published
    const article = await db.article.findUnique({
      where: { id: articleId },
      select: { id: true, status: true },
    });

    if (!article || article.status !== "published") {
      return NextResponse.json(
        { error: "Article not found or not published" },
        { status: 404 }
      );
    }

    const comment = await db.comment.create({
      data: {
        articleId,
        authorName,
        authorEmail: authorEmail || null,
        content,
        status: "pending",
      },
      include: {
        article: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Public comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}