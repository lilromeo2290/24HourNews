import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser, requireRole } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    const check = requireRole(["admin", "super_admin"])(user);
    if (!check.authorized) return check.response!;

    const { id } = await params;

    const existing = await db.advertisement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Advertisement not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, imageUrl, linkUrl, position, isActive, startDate, endDate } = body;

    const validPositions = ["banner", "sidebar", "in_article", "footer", "trending"];
    if (position && !validPositions.includes(position)) {
      return NextResponse.json(
        { error: "Invalid position. Must be one of: " + validPositions.join(", ") },
        { status: 400 }
      );
    }

    const advertisement = await db.advertisement.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(linkUrl !== undefined && { linkUrl }),
        ...(position !== undefined && { position }),
        ...(isActive !== undefined && { isActive }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
    });

    return NextResponse.json({ advertisement });
  } catch (error) {
    console.error("Update advertisement error:", error);
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

    const existing = await db.advertisement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Advertisement not found" },
        { status: 404 }
      );
    }

    await db.advertisement.delete({ where: { id } });

    return NextResponse.json({ message: "Advertisement deleted successfully" });
  } catch (error) {
    console.error("Delete advertisement error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}