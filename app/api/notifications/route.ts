import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

// GET /api/notifications - Retrieve current user's notifications and unread count
export async function GET(req: NextRequest) {
  const authContext = await getAuthUser(req);

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "30", 10)));

    const whereClause: Record<string, unknown> = {
      userId: authContext.user.id,
    };

    if (unreadOnly) {
      whereClause.isRead = false;
    }

    const [notifications, unreadCount, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          workOrder: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
            },
          },
        },
      }),
      prisma.notification.count({
        where: {
          userId: authContext.user.id,
          isRead: false,
        },
      }),
      prisma.notification.count({
        where: {
          userId: authContext.user.id,
        },
      }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
      totalCount,
    });
  } catch (error) {
    console.error("[NOTIFICATIONS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error fetching notifications." },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Mark all notifications as read for current user
export async function PUT(req: NextRequest) {
  const authContext = await getAuthUser(req);

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const updated = await prisma.notification.updateMany({
      where: {
        userId: authContext.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      markedCount: updated.count,
    });
  } catch (error) {
    console.error("[NOTIFICATIONS_MARK_ALL_READ_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error updating notifications." },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Clear all read notifications for current user
export async function DELETE(req: NextRequest) {
  const authContext = await getAuthUser(req);

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deleted = await prisma.notification.deleteMany({
      where: {
        userId: authContext.user.id,
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleted.count,
    });
  } catch (error) {
    console.error("[NOTIFICATIONS_CLEAR_READ_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error clearing notifications." },
      { status: 500 }
    );
  }
}
