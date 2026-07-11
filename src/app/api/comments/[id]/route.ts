import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser, requireMinRole } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    const check = requireMinRole("editor")(user);
    if (!check.authorized) return check.response!;

    const { id } = await params;

    const existing = await db.comment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const body = await request.json();
    const { status, content } = body;

    const validStatuses = ["pending", "approved", "rejected", "spam"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: " + validStatuses.join(", ") },
        { status: 400 }
      );
    }

    const comment = await db.comment.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(content !== undefined && { content }),
      },
      include: {
        article: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Update comment error:", error);
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
    const check = requireMinRole("editor")(user);
    if (!check.authorized) return check.response!;

    const { id } = await params;

    const existing = await db.comment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    await db.comment.delete({ where: { id } });

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}