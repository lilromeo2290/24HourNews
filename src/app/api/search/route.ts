import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const categoryId = searchParams.get("categoryId");
    const tagId = searchParams.get("tagId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const authorId = searchParams.get("authorId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!q || q.trim().length === 0) {
      // Allow search without query if categoryId is provided
      if (!categoryId) {
        return NextResponse.json(
          { error: "Search query (q) or categoryId is required" },
          { status: 400 }
        );
      }
    }

    const where: Prisma.ArticleWhereInput = {
      status: "published",
      publishedAt: { lte: new Date() },
    };

    // Full text search across title, excerpt, and content (only if query provided)
    if (q && q.trim().length > 0) {
      where.OR = [
        { title: { contains: q } },
        { excerpt: { contains: q } },
        { content: { contains: q } },
      ];
    }

    // Additional filters
    if (categoryId) where.categoryId = categoryId;
    if (authorId) where.authorId = authorId;
    if (tagId) {
      where.tags = {
        some: { tagId },
      };
    }
    if (dateFrom || dateTo) {
      where.publishedAt = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      };
    }

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          category: true,
          tags: { include: { tag: true } },
        },
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.article.count({ where }),
    ]);

    // Map tags to flat format
    const mapTags = (a: typeof articles[0]) => ({
      ...a,
      tags: a.tags.map((at) => ({ id: at.tag.id, name: at.tag.name, slug: at.tag.slug })),
    });

    return NextResponse.json({
      articles: articles.map(mapTags),
      query: q,
      total,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}