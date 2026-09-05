import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

interface GroupCount {
  status?: string;
  priority?: string;
  _count: {
    _all: number;
  };
}

interface TrendOrder {
  createdAt: Date;
  completedAt: Date | null;
  status: string;
}

interface StatusLogRecord {
  id: string;
  fromStatus: string;
  toStatus: string;
  changedAt: Date;
  workOrder: { id: string; title: string } | null;
  changedBy: { id: string; name: string | null; email: string } | null;
}

interface CustomerRecord {
  id: string;
  name: string;
  company: string | null;
  city: string | null;
  createdAt: Date;
}

interface TechnicianRecord {
  id: string;
  name: string;
  specialization: string | null;
  status: string;
  createdAt: Date;
}

interface WorkOrderRecord {
  id: string;
  title: string;
  priority: string;
  status: string;
  createdAt: Date;
  customer: { name: string } | null;
}

interface OverdueOrderRecord {
  id: string;
  title: string;
  priority: string;
  status: string;
  scheduledAt: Date | null;
  customer: { name: string; company: string | null } | null;
  technician: { name: string } | null;
}

interface UnassignedOrderRecord {
  id: string;
  title: string;
  priority: string;
  status: string;
  createdAt: Date;
  customer: { name: string; company: string | null } | null;
}

interface OfflineTechRecord {
  id: string;
  name: string;
  specialization: string | null;
  serviceArea: string | null;
}

interface TopTechRecord {
  id: string;
  name: string;
  specialization: string | null;
  status: "AVAILABLE" | "BUSY" | "OFF";
  _count: {
    workOrders: number;
  };
}

export async function GET(req: NextRequest) {
  const authContext = await getAuthUser(req);

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const isTechnician = authContext.isTechnician;
    const techId = authContext.technician?.id || "00000000-0000-0000-0000-000000000000";
    const baseOrderWhere = isTechnician ? { technicianId: techId } : {};

    // 1. Parallel Aggregated Queries with Prisma GroupBy & Counts
    const [
      totalCustomers,
      technicianStatusGroups,
      workOrderStatusGroups,
      workOrderPriorityGroups,
      overdueOrders,
      unassignedOrders,
      offlineTechnicians,
      topTechnicians,
      recentStatusLogs,
      recentCustomers,
      recentTechnicians,
      recentWorkOrders,
      trendOrders,
    ] = await Promise.all([
      // Total Customers (if technician, count of customers with jobs assigned to this technician)
      isTechnician
        ? prisma.customer.count({
            where: {
              workOrders: {
                some: { technicianId: techId },
              },
            },
          })
        : prisma.customer.count(),

      // Technicians grouped by availability status (skipped if tech)
      isTechnician
        ? Promise.resolve([])
        : prisma.technician.groupBy({
            by: ["status"],
            _count: { _all: true },
          }),

      // Work Orders grouped by status (scoped if tech)
      prisma.workOrder.groupBy({
        by: ["status"],
        where: baseOrderWhere,
        _count: { _all: true },
      }),

      // Work Orders grouped by priority (scoped if tech)
      prisma.workOrder.groupBy({
        by: ["priority"],
        where: baseOrderWhere,
        _count: { _all: true },
      }),

      // Overdue Work Orders (scoped if tech)
      prisma.workOrder.findMany({
        where: {
          ...baseOrderWhere,
          scheduledAt: { lt: now },
          status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] },
        },
        select: {
          id: true,
          title: true,
          priority: true,
          status: true,
          scheduledAt: true,
          customer: { select: { name: true, company: true } },
          technician: { select: { name: true } },
        },
        orderBy: { scheduledAt: "asc" },
        take: 5,
      }),

      // Unassigned Work Orders (only for dispatcher/admin)
      isTechnician
        ? Promise.resolve([])
        : prisma.workOrder.findMany({
            where: {
              technicianId: null,
              status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] },
            },
            select: {
              id: true,
              title: true,
              priority: true,
              status: true,
              createdAt: true,
              customer: { select: { name: true, company: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          }),

      // Offline Technicians (only for dispatcher/admin)
      isTechnician
        ? Promise.resolve([])
        : prisma.technician.findMany({
            where: { status: "OFF" },
            select: {
              id: true,
              name: true,
              specialization: true,
              serviceArea: true,
            },
            take: 5,
          }),

      // Technician Workload (Top 6 techs by active work orders - dispatcher/admin)
      isTechnician
        ? Promise.resolve([])
        : prisma.technician.findMany({
            take: 6,
            select: {
              id: true,
              name: true,
              specialization: true,
              status: true,
              _count: {
                select: {
                  workOrders: {
                    where: { status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] } },
                  },
                },
              },
            },
            orderBy: {
              workOrders: { _count: "desc" },
            },
          }),

      // Recent StatusLog entries for activity stream (scoped if tech)
      prisma.statusLog.findMany({
        where: isTechnician
          ? {
              workOrder: {
                technicianId: techId,
              },
            }
          : {},
        take: 10,
        orderBy: { changedAt: "desc" },
        include: {
          workOrder: { select: { id: true, title: true } },
          changedBy: { select: { id: true, name: true, email: true } },
        },
      }),

      // Recent Customer additions (only for dispatcher/admin)
      isTechnician
        ? Promise.resolve([])
        : prisma.customer.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              name: true,
              company: true,
              city: true,
              createdAt: true,
            },
          }),

      // Recent Technician additions (only for dispatcher/admin)
      isTechnician
        ? Promise.resolve([])
        : prisma.technician.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              name: true,
              specialization: true,
              status: true,
              createdAt: true,
            },
          }),

      // Recent Work Orders (scoped if tech)
      prisma.workOrder.findMany({
        where: baseOrderWhere,
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          priority: true,
          status: true,
          createdAt: true,
          customer: { select: { name: true } },
        },
      }),

      // Work orders for past 6 months trends (scoped if tech)
      prisma.workOrder.findMany({
        where: {
          ...baseOrderWhere,
          createdAt: { gte: sixMonthsAgo },
        },
        select: {
          createdAt: true,
          completedAt: true,
          status: true,
        },
      }),
    ]);

    // Process Technician Status Counts
    let availableTechs = 0;
    let busyTechs = 0;
    let offlineTechs = 0;
    (technicianStatusGroups as GroupCount[]).forEach((g: GroupCount) => {
      if (g.status === "AVAILABLE") availableTechs = g._count._all;
      if (g.status === "BUSY") busyTechs = g._count._all;
      if (g.status === "OFF") offlineTechs = g._count._all;
    });
    const totalTechnicians = isTechnician ? 1 : availableTechs + busyTechs + offlineTechs;

    // Process Work Order Status Counts
    let openOrders = 0;
    let assignedOrders = 0;
    let inProgressOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;
    (workOrderStatusGroups as GroupCount[]).forEach((g: GroupCount) => {
      if (g.status === "OPEN") openOrders = g._count._all;
      if (g.status === "ASSIGNED") assignedOrders = g._count._all;
      if (g.status === "IN_PROGRESS") inProgressOrders = g._count._all;
      if (g.status === "COMPLETED") completedOrders = g._count._all;
      if (g.status === "CANCELLED") cancelledOrders = g._count._all;
    });
    const totalWorkOrders =
      openOrders + assignedOrders + inProgressOrders + completedOrders + cancelledOrders;
    const activeWorkOrders = openOrders + assignedOrders + inProgressOrders;

    // Process Work Order Priority Counts
    let urgentPriority = 0;
    let highPriority = 0;
    let mediumPriority = 0;
    let lowPriority = 0;
    (workOrderPriorityGroups as GroupCount[]).forEach((g: GroupCount) => {
      if (g.priority === "URGENT") urgentPriority = g._count._all;
      if (g.priority === "HIGH") highPriority = g._count._all;
      if (g.priority === "MEDIUM") mediumPriority = g._count._all;
      if (g.priority === "LOW") lowPriority = g._count._all;
    });

    // Compute Monthly Trends (Last 6 Months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyTrends: Array<{
      month: string;
      created: number;
      completed: number;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const monthIdx = d.getMonth();
      const label = `${monthNames[monthIdx]}`;

      const createdCount = (trendOrders as TrendOrder[]).filter((o: TrendOrder) => {
        const cDate = new Date(o.createdAt);
        return cDate.getFullYear() === year && cDate.getMonth() === monthIdx;
      }).length;

      const completedCount = (trendOrders as TrendOrder[]).filter((o: TrendOrder) => {
        if (!o.completedAt) return false;
        const compDate = new Date(o.completedAt);
        return compDate.getFullYear() === year && compDate.getMonth() === monthIdx;
      }).length;

      monthlyTrends.push({
        month: label,
        created: createdCount,
        completed: completedCount,
      });
    }

    // Process Work Orders by Status Breakdown
    const statusDistribution = [
      {
        status: "Open",
        key: "OPEN",
        count: openOrders,
        percentage: totalWorkOrders > 0 ? Math.round((openOrders / totalWorkOrders) * 100) : 0,
        color: "#0284c7",
      },
      {
        status: "Assigned",
        key: "ASSIGNED",
        count: assignedOrders,
        percentage: totalWorkOrders > 0 ? Math.round((assignedOrders / totalWorkOrders) * 100) : 0,
        color: "#4f46e5",
      },
      {
        status: "In Progress",
        key: "IN_PROGRESS",
        count: inProgressOrders,
        percentage: totalWorkOrders > 0 ? Math.round((inProgressOrders / totalWorkOrders) * 100) : 0,
        color: "#9333ea",
      },
      {
        status: "Completed",
        key: "COMPLETED",
        count: completedOrders,
        percentage: totalWorkOrders > 0 ? Math.round((completedOrders / totalWorkOrders) * 100) : 0,
        color: "#10b981",
      },
      {
        status: "Cancelled",
        key: "CANCELLED",
        count: cancelledOrders,
        percentage: totalWorkOrders > 0 ? Math.round((cancelledOrders / totalWorkOrders) * 100) : 0,
        color: "#64748b",
      },
    ];

    // Process Work Orders by Priority Breakdown
    const priorityDistribution = [
      {
        priority: "Urgent",
        key: "URGENT",
        count: urgentPriority,
        percentage: totalWorkOrders > 0 ? Math.round((urgentPriority / totalWorkOrders) * 100) : 0,
        color: "#e11d48",
      },
      {
        priority: "High",
        key: "HIGH",
        count: highPriority,
        percentage: totalWorkOrders > 0 ? Math.round((highPriority / totalWorkOrders) * 100) : 0,
        color: "#d97706",
      },
      {
        priority: "Medium",
        key: "MEDIUM",
        count: mediumPriority,
        percentage: totalWorkOrders > 0 ? Math.round((mediumPriority / totalWorkOrders) * 100) : 0,
        color: "#2563eb",
      },
      {
        priority: "Low",
        key: "LOW",
        count: lowPriority,
        percentage: totalWorkOrders > 0 ? Math.round((lowPriority / totalWorkOrders) * 100) : 0,
        color: "#64748b",
      },
    ];

    // Combine & Normalize Recent Activity Feed
    const activities: Array<{
      id: string;
      type: "STATUS_TRANSITION" | "WORK_ORDER_CREATED" | "CUSTOMER_CREATED" | "TECHNICIAN_CREATED";
      title: string;
      description: string;
      timestamp: string;
      badgeText: string;
      badgeColor: string;
    }> = [];

    // 1. Status transitions
    (recentStatusLogs as StatusLogRecord[]).forEach((log: StatusLogRecord) => {
      activities.push({
        id: `log-${log.id}`,
        type: "STATUS_TRANSITION",
        title: `${log.workOrder?.title || "Work Order"} status changed`,
        description: `Transitioned from ${log.fromStatus} → ${log.toStatus} by ${
          log.changedBy?.name || log.changedBy?.email || "Dispatcher"
        }`,
        timestamp: new Date(log.changedAt).toISOString(),
        badgeText: log.toStatus,
        badgeColor:
          log.toStatus === "COMPLETED"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : log.toStatus === "IN_PROGRESS"
            ? "bg-purple-50 text-purple-700 border-purple-200"
            : "bg-blue-50 text-blue-700 border-blue-200",
      });
    });

    // 2. Newly created work orders
    (recentWorkOrders as WorkOrderRecord[]).forEach((wo: WorkOrderRecord) => {
      activities.push({
        id: `wo-${wo.id}`,
        type: "WORK_ORDER_CREATED",
        title: `Work Order: "${wo.title}"`,
        description: `Priority: ${wo.priority} • Status: ${wo.status}`,
        timestamp: new Date(wo.createdAt).toISOString(),
        badgeText: isTechnician ? "Assigned Job" : "New Order",
        badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
      });
    });

    // 3. Customers and Tech additions for Admin/Dispatcher
    if (!isTechnician) {
      (recentCustomers as CustomerRecord[]).forEach((c: CustomerRecord) => {
        activities.push({
          id: `cust-${c.id}`,
          type: "CUSTOMER_CREATED",
          title: `New Customer Onboarded: ${c.name}`,
          description: `${c.company ? c.company + " • " : ""}${c.city || "New Account"} registered in database`,
          timestamp: new Date(c.createdAt).toISOString(),
          badgeText: "New Customer",
          badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        });
      });

      (recentTechnicians as TechnicianRecord[]).forEach((t: TechnicianRecord) => {
        activities.push({
          id: `tech-${t.id}`,
          type: "TECHNICIAN_CREATED",
          title: `Technician Provisioned: ${t.name}`,
          description: `Trade: ${t.specialization || "Field Specialist"} • Status: ${t.status}`,
          timestamp: new Date(t.createdAt).toISOString(),
          badgeText: "New Tech",
          badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
        });
      });
    }

    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    // Build Prioritized Smart Alerts
    const alerts: Array<{
      id: string;
      level: "CRITICAL" | "WARNING" | "INFO";
      type: "OVERDUE" | "UNASSIGNED" | "OFFLINE_TECH";
      title: string;
      message: string;
      targetTab: string;
      actionText: string;
    }> = [];

    // 1. Overdue Orders (Critical Priority)
    (overdueOrders as OverdueOrderRecord[]).forEach((order: OverdueOrderRecord) => {
      alerts.push({
        id: `overdue-${order.id}`,
        level: "CRITICAL",
        type: "OVERDUE",
        title: `Overdue Job: ${order.title}`,
        message: `Scheduled for ${
          order.scheduledAt ? new Date(order.scheduledAt).toLocaleString() : "past time"
        } for client ${order.customer?.name}. Needs prompt resolution.`,
        targetTab: "work-orders",
        actionText: "View Order",
      });
    });

    if (!isTechnician) {
      // 2. Unassigned Orders (Warning Priority)
      (unassignedOrders as UnassignedOrderRecord[]).forEach((order: UnassignedOrderRecord) => {
        alerts.push({
          id: `unassigned-${order.id}`,
          level: "WARNING",
          type: "UNASSIGNED",
          title: `Unassigned Job: ${order.title}`,
          message: `Priority: ${order.priority} • Client: ${order.customer?.name}. Waiting in open dispatch pool.`,
          targetTab: "work-orders",
          actionText: "Assign Tech",
        });
      });

      // 3. Offline Technicians (Info Priority)
      (offlineTechnicians as OfflineTechRecord[]).forEach((tech: OfflineTechRecord) => {
        alerts.push({
          id: `offline-${tech.id}`,
          level: "INFO",
          type: "OFFLINE_TECH",
          title: `Technician Offline: ${tech.name}`,
          message: `${tech.specialization || "Field Tech"} in ${tech.serviceArea || "Metro Area"} is currently Off-Duty.`,
          targetTab: "technicians",
          actionText: "View Tech",
        });
      });
    }

    return NextResponse.json({
      metrics: {
        totalCustomers,
        totalTechnicians,
        availableTechnicians: isTechnician ? (authContext.technician?.status === "AVAILABLE" ? 1 : 0) : availableTechs,
        busyTechnicians: isTechnician ? (authContext.technician?.status === "BUSY" ? 1 : 0) : busyTechs,
        offlineTechnicians: isTechnician ? (authContext.technician?.status === "OFF" ? 1 : 0) : offlineTechs,
        totalWorkOrders,
        activeWorkOrders,
        completedWorkOrders: completedOrders,
        cancelledWorkOrders: cancelledOrders,
        overdueWorkOrders: overdueOrders.length,
        unassignedWorkOrders: isTechnician ? 0 : (unassignedOrders as UnassignedOrderRecord[]).length,
      },
      charts: {
        workOrdersByStatus: statusDistribution,
        monthlyTrends,
        technicianWorkload: isTechnician
          ? [
              {
                id: techId,
                name: authContext.technician?.name || authContext.user.name || "Technician",
                specialization: authContext.technician?.specialization || "Field Specialist",
                status: authContext.technician?.status || "AVAILABLE",
                activeOrders: activeWorkOrders,
              },
            ]
          : (topTechnicians as TopTechRecord[]).map((t: TopTechRecord) => ({
              id: t.id,
              name: t.name,
              specialization: t.specialization || "General Field Ops",
              status: t.status,
              activeOrders: t._count.workOrders,
            })),
        workOrdersByPriority: priorityDistribution,
      },
      recentActivity: sortedActivities,
      alerts,
      role: authContext.role,
    });
  } catch (error) {
    console.error("[DASHBOARD_ANALYTICS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error fetching dashboard analytics." },
      { status: 500 }
    );
  }
}
