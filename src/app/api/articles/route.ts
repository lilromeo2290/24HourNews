import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser, requireMinRole } from "@/lib/auth";
import { Prisma } from "@prisma/client";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 200);
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const authorId = searchParams.get("authorId");
    const search = searchParams.get("search");
    const isFeatured = searchParams.get("isFeatured");
    const isPinned = searchParams.get("isPinned");
    const isBreaking = searchParams.get("isBreaking");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "createdAt";
    const sortOrder = searchParams.get("order") || "desc";

    // Check if user is authenticated for non-published content
    const authUser = await getAuthUser(request);
    if (!authUser) {
      // Public: only published articles
      const where: Prisma.ArticleWhereInput = {
        status: "published",
        publishedAt: { lte: new Date() },
      };

      if (categoryId) where.categoryId = categoryId;
      if (authorId) where.authorId = authorId;
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { excerpt: { contains: search } },
        ];
      }
      if (isFeatured === "true") where.isFeatured = true;
      if (isPinned === "true") where.isPinned = true;
      if (isBreaking === "true") where.isBreaking = true;

      const [articles, total] = await Promise.all([
        db.article.findMany({
          where,
          include: {
            author: { select: { id: true, name: true, avatar: true } },
            category: true,
            tags: { include: { tag: true } },
          },
          orderBy: { [sort]: sortOrder as Prisma.SortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.article.count({ where }),
      ]);

      return NextResponse.json({
        articles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    // Authenticated: show all articles based on filters
    const where: Prisma.ArticleWhereInput = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (authorId) where.authorId = authorId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } },
      ];
    }
    if (isFeatured === "true") where.isFeatured = true;
    if (isPinned === "true") where.isPinned = true;
    if (isBreaking === "true") where.isBreaking = true;

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          category: true,
          tags: { include: { tag: true } },
        },
        orderBy: { [sort]: sortOrder as Prisma.SortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.article.count({ where }),
    ]);

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List articles error:", error);
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
    const {
      title,
      content,
      excerpt,
      featuredImage,
      status,
      isFeatured,
      isPinned,
      isBreaking,
      categoryId,
      tagIds,
      seoTitle,
      seoDescription,
      scheduledAt,
    } = body;

    if (!title || !categoryId) {
      return NextResponse.json(
        { error: "Title and categoryId are required" },
        { status: 400 }
      );
    }

    let slug = slugify(title);

    // Ensure slug uniqueness
    const existing = await db.article.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const readingTime = calculateReadingTime(content || "");

    const article = await db.article.create({
      data: {
        title,
        slug,
        content: content || "",
        excerpt: excerpt || null,
        featuredImage: featuredImage || null,
        status: status || "draft",
        isFeatured: isFeatured || false,
        isPinned: isPinned || false,
        isBreaking: isBreaking || false,
        categoryId,
        authorId: user!.id,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        readingTime,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        publishedAt: status === "published" ? new Date() : null,
        tags: tagIds?.length
          ? {
              create: tagIds.map((tagId: string) => ({ tagId })),
            }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error("Create article error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}