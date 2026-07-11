import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Helper to map ArticleTag[] to flat Tag format
function mapTags(article: any) {
  return {
    ...article,
    tags: article.tags?.map((at: any) => ({
      id: at.tag.id,
      name: at.tag.name,
      slug: at.tag.slug,
    })) ?? [],
  };
}

const articleInclude = {
  author: { select: { id: true, name: true, avatar: true } },
  category: true,
  tags: { include: { tag: true } },
} satisfies Prisma.ArticleInclude;

export async function GET() {
  try {
    const now = new Date();

    const [
      breakingNews,
      featuredArticles,
      pinnedArticle,
      latestNews,
      trendingNews,
      popularCategories,
    ] = await Promise.all([
      db.article.findMany({
        where: {
          status: "published",
          isBreaking: true,
          publishedAt: { lte: now },
        },
        include: articleInclude,
        orderBy: { publishedAt: "desc" },
        take: 5,
      }),

      db.article.findMany({
        where: {
          status: "published",
          isFeatured: true,
          publishedAt: { lte: now },
        },
        include: articleInclude,
        orderBy: { publishedAt: "desc" },
        take: 5,
      }),

      db.article.findFirst({
        where: {
          status: "published",
          isPinned: true,
          publishedAt: { lte: now },
        },
        include: articleInclude,
        orderBy: { publishedAt: "desc" },
      }),

      db.article.findMany({
        where: {
          status: "published",
          publishedAt: { lte: now },
        },
        include: articleInclude,
        orderBy: { publishedAt: "desc" },
        take: 10,
      }),

      db.article.findMany({
        where: {
          status: "published",
          publishedAt: { lte: now },
        },
        include: articleInclude,
        orderBy: { viewCount: "desc" },
        take: 5,
      }),

      db.category.findMany({
        where: {
          isVisible: true,
          isFeatured: true,
        },
        orderBy: { order: "asc" },
        include: {
          _count: {
            select: { articles: { where: { status: "published" } } },
          },
        },
      }),
    ]);

    return NextResponse.json({
      breakingNews: breakingNews.map(mapTags),
      featuredArticles: featuredArticles.map(mapTags),
      pinnedArticle: pinnedArticle ? mapTags(pinnedArticle) : null,
      latestNews: latestNews.map(mapTags),
      trendingNews: trendingNews.map(mapTags),
      popularCategories,
    });
  } catch (error) {
    console.error("Home data error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}