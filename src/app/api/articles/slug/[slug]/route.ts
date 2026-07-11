import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const article = await db.article.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, avatar: true, bio: true } },
        category: true,
        tags: { include: { tag: true } },
      },
    });

    if (!article || article.status !== "published") {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (!article.publishedAt || article.publishedAt > new Date()) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Increment view count
    await db.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });
    article.viewCount += 1;

    // Log activity
    try {
      await db.activity.create({
        data: {
          type: "view",
          articleId: article.id,
          metadata: JSON.stringify({ title: article.title, slug }),
        },
      });
    } catch {
      // Non-critical
    }

    // Fetch related articles (same category, published, excluding current)
    const relatedArticles = await db.article.findMany({
      where: {
        categoryId: article.categoryId,
        status: "published",
        id: { not: article.id },
        publishedAt: { lte: new Date() },
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        category: { select: { id: true, name: true, slug: true, color: true } },
        tags: { include: { tag: true } },
      },
    });

    // Map tags to flat format
    const mapArticle = (a: typeof article) => ({
      ...a,
      tags: a.tags.map((at) => ({ id: at.tag.id, name: at.tag.name, slug: at.tag.slug })),
    });

    const mappedRelated = relatedArticles.map(mapArticle);

    return NextResponse.json({
      article: mapArticle(article),
      relatedArticles: mappedRelated,
    });
  } catch (error) {
    console.error("Get article by slug error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}