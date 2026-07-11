import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser, requireMinRole, requireRole } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const article = await db.article.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatar: true, bio: true } },
        category: true,
        tags: { include: { tag: true } },
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Increment view count for published articles
    if (article.status === "published" && article.publishedAt && article.publishedAt <= new Date()) {
      await db.article.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
      article.viewCount += 1;

      // Log activity
      try {
        await db.activity.create({
          data: {
            type: "view",
            articleId: id,
            metadata: JSON.stringify({ title: article.title }),
          },
        });
      } catch {
        // Activity logging is non-critical
      }
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error("Get article error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Check permissions: editor/admin can edit own, admin can edit all
    if (user.role !== "admin" && user.role !== "super_admin" && existing.authorId !== user.id) {
      return NextResponse.json(
        { error: "You can only edit your own articles" },
        { status: 403 }
      );
    }

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

    // If title changed, regenerate slug
    let slug: string | undefined;
    if (title && title !== existing.title) {
      slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")
        .substring(0, 200);

      const slugExists = await db.article.findFirst({
        where: { slug, id: { not: id } },
      });
      if (slugExists) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Calculate reading time if content changed
    let readingTime: number | undefined;
    if (content !== undefined) {
      const words = content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
      readingTime = Math.max(1, Math.ceil(words / 200));
    }

    // Handle tag updates
    if (tagIds !== undefined) {
      await db.articleTag.deleteMany({ where: { articleId: id } });
    }

    const article = await db.article.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(content !== undefined && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(featuredImage !== undefined && { featuredImage }),
        ...(status !== undefined && { status }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isPinned !== undefined && { isPinned }),
        ...(isBreaking !== undefined && { isBreaking }),
        ...(categoryId !== undefined && { categoryId }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
        ...(readingTime !== undefined && { readingTime }),
        ...(status === "published" && !existing.publishedAt && { publishedAt: new Date() }),
        ...(tagIds !== undefined && {
          tags: {
            create: tagIds.map((tagId: string) => ({ tagId })),
          },
        }),
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json({ article });
  } catch (error) {
    console.error("Update article error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    const check = requireRole(["admin", "super_admin"])(user);
    if (!check.authorized) return check.response!;

    const { id } = await params;

    const existing = await db.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    await db.article.delete({ where: { id } });

    return NextResponse.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Delete article error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}