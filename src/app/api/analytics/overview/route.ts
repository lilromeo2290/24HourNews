import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Run all aggregation queries in parallel
    const [
      totalPosts,
      publishedPosts,
      drafts,
      pendingApproval,
      totalCategories,
      totalUsers,
      totalViews,
      totalComments,
      dailyViews,
    ] = await Promise.all([
      db.article.count(),
      db.article.count({ where: { status: "published" } }),
      db.article.count({ where: { status: "draft" } }),
      db.article.count({ where: { status: "pending" } }),
      db.category.count(),
      db.user.count({ where: { isActive: true } }),
      db.article.aggregate({ _sum: { viewCount: true } }),
      db.comment.count({ where: { status: "approved" } }),
      // Get daily view counts from the last 30 days
      db.$queryRaw`
        SELECT DATE(createdAt) as date, COUNT(*) as views
        FROM Activity
        WHERE type = 'view' AND createdAt >= ${thirtyDaysAgo.toISOString()}
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `.then((rows) => rows as Array<{ date: string; views: number }>),
    ]);

    // Fill in missing dates for the last 30 days
    const dailyViewsData = dailyViews as Array<{ date: string; views: number }>;
    const dailyViewsMap = new Map(
      dailyViewsData.map((d) => [String(d.date).split("T")[0], Number(d.views)])
    );

    const allDailyViews: Array<{ date: string; views: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      allDailyViews.push({
        date: dateStr,
        views: dailyViewsMap.get(dateStr) || 0,
      });
    }

    return NextResponse.json({
      stats: {
        totalPosts,
        publishedPosts,
        drafts,
        pendingApproval,
        totalCategories,
        totalUsers,
        totalViews: totalViews._sum.viewCount || 0,
        totalComments,
      },
      dailyViews: allDailyViews,
    });
  } catch (error) {
    console.error("Analytics overview error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}