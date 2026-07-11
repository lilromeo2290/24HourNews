import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser, requireRole } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");

    const now = new Date();
    const where: Prisma.AdvertisementWhereInput = {
      isActive: true,
      AND: [
        {
          OR: [
            { startDate: null },
            { startDate: { lte: now } },
          ],
        },
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      ],
    };

    if (position) {
      where.position = position;
    }

    const advertisements = await db.advertisement.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ advertisements });
  } catch (error) {
    console.error("List advertisements error:", error);
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
    const { title, imageUrl, linkUrl, position, isActive, startDate, endDate } = body;

    if (!title || !imageUrl || !position) {
      return NextResponse.json(
        { error: "Title, image URL, and position are required" },
        { status: 400 }
      );
    }

    const validPositions = ["banner", "sidebar", "in_article", "footer"];
    if (!validPositions.includes(position)) {
      return NextResponse.json(
        { error: "Invalid position. Must be one of: " + validPositions.join(", ") },
        { status: 400 }
      );
    }

    const advertisement = await db.advertisement.create({
      data: {
        title,
        imageUrl,
        linkUrl: linkUrl || null,
        position,
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json({ advertisement }, { status: 201 });
  } catch (error) {
    console.error("Create advertisement error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}