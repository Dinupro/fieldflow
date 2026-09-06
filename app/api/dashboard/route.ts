import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

interface GroupCount {
  status?: string;
  priority?: string;
  role?: string | null;
  _count: {
    _all: number;
  };
}

interface TrendOrder {
  createdAt: Date;
  completedAt: Date | null;
  status: string;
}

export async function GET(req: NextRequest) {
  const authContext = await getAuthUser(req);

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const isTechnician = authContext.isTechnician;
    const techId = authContext.technician?.id || "00000000-0000-0000-0000-000000000000";
    const baseOrderWhere = isTechnician ? { technicianId: techId } : {};

    // Parallel Aggregated Queries with Prisma
    const [
      totalCustomers,
      technicianStatusGroups,
      workOrderStatusGroups,
      workOrderPriorityGroups,
      userRoleGroups,
      allTechniciansWithCounts,
      overdueOrders,
      unassignedOrders,
      offlineTechnicians,
      recentStatusLogs,
      recentCustomers,
      recentTechnicians,
      recentWorkOrders,
      trendOrders,
      todayScheduledOrders,
      techActiveOrdersList,
      totalUsersCount,
    ] = await Promise.all([
      // 1. Total Customers (if technician, only customers with jobs assigned to this technician)
      isTechnician
        ? prisma.customer.count({
            where: {
              workOrders: {
                some: { technicianId: techId },
              },
            },
          })
        : prisma.customer.count(),

      // 2. Technicians grouped by status
      isTechnician
        ? Promise.resolve([])
        : prisma.technician.groupBy({
            by: ["status"],
            _count: { _all: true },
          }),

      // 3. Work Orders grouped by status (scoped if tech)
      prisma.workOrder.groupBy({
        by: ["status"],
        where: baseOrderWhere,
        _count: { _all: true },
      }),

      // 4. Work Orders grouped by priority (scoped if tech)
      prisma.workOrder.groupBy({
        by: ["priority"],
        where: baseOrderWhere,
        _count: { _all: true },
      }),

      // 5. System Users grouped by role (only needed for admin/dispatcher)
      isTechnician
        ? Promise.resolve([])
        : prisma.user.groupBy({
            by: ["role"],
            _count: { _all: true },
          }),

      // 6. Comprehensive Technician Roster with workload counts (for leaderboard & availability)
      isTechnician
        ? Promise.resolve([])
        : prisma.technician.findMany({
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              specialization: true,
              skills: true,
              status: true,
              serviceArea: true,
              avatar: true,
              createdAt: true,
              _count: {
                select: {
                  workOrders: true,
                },
              },
              workOrders: {
                select: {
                  id: true,
                  status: true,
                },
              },
            },
            orderBy: { name: "asc" },
          }),

      // 7. Overdue Work Orders (scoped if tech)
      prisma.workOrder.findMany({
        where: {
          ...baseOrderWhere,
          scheduledAt: { lt: now },
          status: { in: ["OPEN", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"] },
        },
        select: {
          id: true,
          title: true,
          priority: true,
          status: true,
          scheduledAt: true,
          customer: { select: { id: true, name: true, company: true, phone: true, city: true } },
          technician: { select: { id: true, name: true, phone: true, specialization: true } },
        },
        orderBy: { scheduledAt: "asc" },
        take: 8,
      }),

      // 8. Unassigned Work Orders (for dispatcher & admin)
      isTechnician
        ? Promise.resolve([])
        : prisma.workOrder.findMany({
            where: {
              technicianId: null,
              status: { in: ["OPEN", "ASSIGNED"] },
            },
            select: {
              id: true,
              title: true,
              description: true,
              priority: true,
              status: true,
              scheduledAt: true,
              createdAt: true,
              customer: { select: { id: true, name: true, company: true, phone: true, city: true, address: true } },
            },
            orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
            take: 8,
          }),

      // 9. Offline Technicians
      isTechnician
        ? Promise.resolve([])
        : prisma.technician.findMany({
            where: { status: "OFF" },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              specialization: true,
              serviceArea: true,
            },
            take: 6,
          }),

      // 10. Recent Status Logs for activity stream
      prisma.statusLog.findMany({
        where: isTechnician
          ? {
              workOrder: {
                technicianId: techId,
              },
            }
          : {},
        take: 12,
        orderBy: { changedAt: "desc" },
        include: {
          workOrder: { select: { id: true, title: true, priority: true } },
          changedBy: { select: { id: true, name: true, email: true, role: true } },
        },
      }),

      // 11. Recent Customer additions
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
              phone: true,
              createdAt: true,
            },
          }),

      // 12. Recent Technician additions
      isTechnician
        ? Promise.resolve([])
        : prisma.technician.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              specialization: true,
              status: true,
              serviceArea: true,
              createdAt: true,
            },
          }),

      // 13. Recent Work Orders with full relations
      prisma.workOrder.findMany({
        where: baseOrderWhere,
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          priority: true,
          status: true,
          scheduledAt: true,
          completedAt: true,
          createdAt: true,
          customer: { select: { id: true, name: true, company: true, city: true, phone: true } },
          technician: { select: { id: true, name: true, phone: true, specialization: true, status: true } },
        },
      }),

      // 14. Work orders for past 6 months trends
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

      // 15. Today's Scheduled Appointments
      prisma.workOrder.findMany({
        where: {
          ...baseOrderWhere,
          scheduledAt: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
        select: {
          id: true,
          title: true,
          priority: true,
          status: true,
          scheduledAt: true,
          customer: { select: { id: true, name: true, company: true, address: true, city: true, phone: true } },
          technician: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { scheduledAt: "asc" },
      }),

      // 16. Technician Active Orders List (for logged-in technician)
      isTechnician
        ? prisma.workOrder.findMany({
            where: {
              technicianId: techId,
              status: { in: ["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"] },
            },
            select: {
              id: true,
              title: true,
              description: true,
              priority: true,
              status: true,
              scheduledAt: true,
              createdAt: true,
              customer: { select: { id: true, name: true, company: true, address: true, city: true, phone: true } },
            },
            orderBy: [{ priority: "desc" }, { scheduledAt: "asc" }],
          })
        : Promise.resolve([]),

      // 17. Total Users Count (for Admin)
      isTechnician ? Promise.resolve(0) : prisma.user.count(),
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
    let acceptedOrders = 0;
    let inProgressOrders = 0;
    let pausedOrders = 0;
    let completedOrders = 0;
    let closedOrders = 0;
    let cancelledOrders = 0;

    (workOrderStatusGroups as GroupCount[]).forEach((g: GroupCount) => {
      if (g.status === "OPEN") openOrders = g._count._all;
      if (g.status === "ASSIGNED") assignedOrders = g._count._all;
      if (g.status === "ACCEPTED") acceptedOrders = g._count._all;
      if (g.status === "IN_PROGRESS") inProgressOrders = g._count._all;
      if (g.status === "PAUSED") pausedOrders = g._count._all;
      if (g.status === "COMPLETED") completedOrders = g._count._all;
      if (g.status === "CLOSED") closedOrders = g._count._all;
      if (g.status === "CANCELLED") cancelledOrders = g._count._all;
    });

    const totalWorkOrders =
      openOrders +
      assignedOrders +
      acceptedOrders +
      inProgressOrders +
      pausedOrders +
      completedOrders +
      closedOrders +
      cancelledOrders;

    const activeWorkOrders = openOrders + assignedOrders + acceptedOrders + inProgressOrders + pausedOrders;
    const globalCompletionRate =
      totalWorkOrders > 0 ? Math.round(((completedOrders + closedOrders) / totalWorkOrders) * 100) : 0;

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

    // Process User Roles Count
    let adminUsers = 0;
    let dispatcherUsers = 0;
    let technicianUsers = 0;
    (userRoleGroups as GroupCount[]).forEach((g: GroupCount) => {
      if (g.role === "ADMIN") adminUsers = g._count._all;
      if (g.role === "DISPATCHER") dispatcherUsers = g._count._all;
      if (g.role === "TECHNICIAN") technicianUsers = g._count._all;
    });

    // Process Technician Performance Leaderboard
    const technicianPerformance = (allTechniciansWithCounts as Array<{
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
      specialization: string | null;
      skills: string[];
      status: "AVAILABLE" | "BUSY" | "OFF";
      serviceArea: string | null;
      avatar: string | null;
      _count: { workOrders: number };
      workOrders: Array<{ id: string; status: string }>;
    }>)
      .map((tech) => {
        const completedCount = tech.workOrders.filter((w) => w.status === "COMPLETED" || w.status === "CLOSED").length;
        const activeCount = tech.workOrders.filter((w) =>
          ["OPEN", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"].includes(w.status)
        ).length;
        const total = tech.workOrders.length;
        const rate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

        return {
          id: tech.id,
          name: tech.name,
          email: tech.email,
          phone: tech.phone,
          specialization: tech.specialization || "Field Specialist",
          skills: tech.skills,
          status: tech.status,
          serviceArea: tech.serviceArea || "All Districts",
          avatar: tech.avatar,
          activeOrders: activeCount,
          completedOrders: completedCount,
          totalOrders: total,
          completionRate: rate,
        };
      })
      .sort((a, b) => b.completedOrders - a.completedOrders || b.completionRate - a.completionRate)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

    // Technician Roster for Dispatcher Availability Grid
    const technicianRoster = technicianPerformance.map((tech) => ({
      id: tech.id,
      name: tech.name,
      email: tech.email,
      phone: tech.phone,
      specialization: tech.specialization,
      serviceArea: tech.serviceArea,
      status: tech.status,
      activeOrders: tech.activeOrders,
      completedOrders: tech.completedOrders,
      completionRate: tech.completionRate,
    }));

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
        status: "Accepted",
        key: "ACCEPTED",
        count: acceptedOrders,
        percentage: totalWorkOrders > 0 ? Math.round((acceptedOrders / totalWorkOrders) * 100) : 0,
        color: "#0d9488",
      },
      {
        status: "In Progress",
        key: "IN_PROGRESS",
        count: inProgressOrders,
        percentage: totalWorkOrders > 0 ? Math.round((inProgressOrders / totalWorkOrders) * 100) : 0,
        color: "#9333ea",
      },
      {
        status: "Paused",
        key: "PAUSED",
        count: pausedOrders,
        percentage: totalWorkOrders > 0 ? Math.round((pausedOrders / totalWorkOrders) * 100) : 0,
        color: "#ea580c",
      },
      {
        status: "Completed",
        key: "COMPLETED",
        count: completedOrders,
        percentage: totalWorkOrders > 0 ? Math.round((completedOrders / totalWorkOrders) * 100) : 0,
        color: "#10b981",
      },
      {
        status: "Closed",
        key: "CLOSED",
        count: closedOrders,
        percentage: totalWorkOrders > 0 ? Math.round((closedOrders / totalWorkOrders) * 100) : 0,
        color: "#334155",
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

    // Build Activity Feed
    const activities: Array<{
      id: string;
      type: "STATUS_TRANSITION" | "WORK_ORDER_CREATED" | "CUSTOMER_CREATED" | "TECHNICIAN_CREATED";
      title: string;
      description: string;
      notes?: string | null;
      timestamp: string;
      badgeText: string;
      badgeColor: string;
    }> = [];

    // 1. Status transitions
    (recentStatusLogs as Array<{
      id: string;
      fromStatus: string;
      toStatus: string;
      notes: string | null;
      changedAt: Date;
      workOrder: { id: string; title: string; priority: string } | null;
      changedBy: { id: string; name: string | null; email: string; role: string | null } | null;
    }>).forEach((log) => {
      activities.push({
        id: `log-${log.id}`,
        type: "STATUS_TRANSITION",
        title: `${log.workOrder?.title || "Work Order"} status changed`,
        description: `Transitioned from ${log.fromStatus} → ${log.toStatus} by ${
          log.changedBy?.name || log.changedBy?.email || "System"
        }`,
        notes: log.notes,
        timestamp: new Date(log.changedAt).toISOString(),
        badgeText: log.toStatus,
        badgeColor:
          log.toStatus === "COMPLETED" || log.toStatus === "CLOSED"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : log.toStatus === "IN_PROGRESS"
            ? "bg-purple-50 text-purple-700 border-purple-200"
            : log.toStatus === "PAUSED"
            ? "bg-orange-50 text-orange-700 border-orange-200"
            : "bg-blue-50 text-blue-700 border-blue-200",
      });
    });

    // 2. Newly created work orders
    (recentWorkOrders as Array<{
      id: string;
      title: string;
      priority: string;
      status: string;
      createdAt: Date;
      customer: { name: string } | null;
    }>).forEach((wo) => {
      activities.push({
        id: `wo-${wo.id}`,
        type: "WORK_ORDER_CREATED",
        title: `Work Order: "${wo.title}"`,
        description: `Client: ${wo.customer?.name || "Direct Client"} • Priority: ${wo.priority} • Status: ${wo.status}`,
        timestamp: new Date(wo.createdAt).toISOString(),
        badgeText: isTechnician ? "Assigned Job" : "New Order",
        badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
      });
    });

    // 3. Customers and Tech additions for Admin/Dispatcher
    if (!isTechnician) {
      (recentCustomers as Array<{
        id: string;
        name: string;
        company: string | null;
        city: string | null;
        createdAt: Date;
      }>).forEach((c) => {
        activities.push({
          id: `cust-${c.id}`,
          type: "CUSTOMER_CREATED",
          title: `Customer Registered: ${c.name}`,
          description: `${c.company ? c.company + " • " : ""}${c.city || "New Account"} added to database`,
          timestamp: new Date(c.createdAt).toISOString(),
          badgeText: "New Customer",
          badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        });
      });

      (recentTechnicians as Array<{
        id: string;
        name: string;
        specialization: string | null;
        status: string;
        createdAt: Date;
      }>).forEach((t) => {
        activities.push({
          id: `tech-${t.id}`,
          type: "TECHNICIAN_CREATED",
          title: `Technician Onboarded: ${t.name}`,
          description: `Trade: ${t.specialization || "Field Specialist"} • Status: ${t.status}`,
          timestamp: new Date(t.createdAt).toISOString(),
          badgeText: "New Tech",
          badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
        });
      });
    }

    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 12);

    // Build Prioritized Smart Alerts
    const alerts: Array<{
      id: string;
      level: "CRITICAL" | "WARNING" | "INFO";
      type: "OVERDUE" | "UNASSIGNED" | "OFFLINE_TECH" | "ACTION_REQUIRED";
      title: string;
      message: string;
      targetTab: string;
      actionText: string;
    }> = [];

    // 1. Overdue Orders (Critical Priority)
    (overdueOrders as Array<{
      id: string;
      title: string;
      priority: string;
      status: string;
      scheduledAt: Date | null;
      customer: { name: string; company: string | null } | null;
    }>).forEach((order) => {
      alerts.push({
        id: `overdue-${order.id}`,
        level: "CRITICAL",
        type: "OVERDUE",
        title: `Overdue SLA: ${order.title}`,
        message: `Scheduled for ${
          order.scheduledAt ? new Date(order.scheduledAt).toLocaleString() : "earlier time"
        } for client ${order.customer?.name}. Immediate resolution required.`,
        targetTab: "work-orders",
        actionText: "View Order",
      });
    });

    if (!isTechnician) {
      // 2. Unassigned Orders (Warning Priority)
      (unassignedOrders as Array<{
        id: string;
        title: string;
        priority: string;
        customer: { name: string } | null;
      }>).forEach((order) => {
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
      (offlineTechnicians as Array<{
        id: string;
        name: string;
        specialization: string | null;
        serviceArea: string | null;
      }>).forEach((tech) => {
        alerts.push({
          id: `offline-${tech.id}`,
          level: "INFO",
          type: "OFFLINE_TECH",
          title: `Technician Offline: ${tech.name}`,
          message: `${tech.specialization || "Field Tech"} (${tech.serviceArea || "Metro Area"}) is currently Off-Duty.`,
          targetTab: "technicians",
          actionText: "View Tech",
        });
      });
    } else {
      // For Technicians: Alerts for newly assigned orders needing acceptance
      const unacceptedJobs = (techActiveOrdersList as Array<{ id: string; title: string; status: string; priority: string }>).filter(
        (o) => o.status === "ASSIGNED"
      );
      if (unacceptedJobs.length > 0) {
        alerts.push({
          id: "tech-action-unaccepted",
          level: "WARNING",
          type: "ACTION_REQUIRED",
          title: `${unacceptedJobs.length} New Job(s) Awaiting Your Acceptance`,
          message: `You have new dispatches assigned to you. Review and accept them to start field work.`,
          targetTab: "work-orders",
          actionText: "Review Jobs",
        });
      }
    }

    // Return complete, live PostgreSQL dataset
    return NextResponse.json({
      role: authContext.role,
      user: {
        id: authContext.user.id,
        name: authContext.user.name,
        email: authContext.user.email,
        role: authContext.role,
      },
      metrics: {
        totalCustomers,
        totalTechnicians,
        availableTechnicians: isTechnician ? (authContext.technician?.status === "AVAILABLE" ? 1 : 0) : availableTechs,
        busyTechnicians: isTechnician ? (authContext.technician?.status === "BUSY" ? 1 : 0) : busyTechs,
        offlineTechnicians: isTechnician ? (authContext.technician?.status === "OFF" ? 1 : 0) : offlineTechs,
        totalWorkOrders,
        activeWorkOrders,
        completedWorkOrders: completedOrders,
        closedWorkOrders: closedOrders,
        cancelledWorkOrders: cancelledOrders,
        overdueWorkOrders: overdueOrders.length,
        unassignedWorkOrders: isTechnician ? 0 : (unassignedOrders as unknown[]).length,
        totalUsers: isTechnician ? 0 : totalUsersCount,
        completionRate: globalCompletionRate,
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
          : technicianPerformance.slice(0, 6).map((t) => ({
              id: t.id,
              name: t.name,
              specialization: t.specialization,
              status: t.status,
              activeOrders: t.activeOrders,
            })),
        workOrdersByPriority: priorityDistribution,
      },
      technicianPerformance,
      technicianRoster,
      recentWorkOrders: recentWorkOrders as Array<{
        id: string;
        title: string;
        description: string;
        priority: string;
        status: string;
        scheduledAt: string | null;
        completedAt: string | null;
        createdAt: string;
        customer: { id: string; name: string; company: string | null; city: string | null; phone: string } | null;
        technician: { id: string; name: string; phone: string | null; specialization: string | null; status: string } | null;
      }>,
      unassignedWorkOrders: unassignedOrders as Array<{
        id: string;
        title: string;
        description: string;
        priority: string;
        status: string;
        scheduledAt: string | null;
        createdAt: string;
        customer: { id: string; name: string; company: string | null; phone: string; city: string | null; address: string } | null;
      }>,
      systemUsers: {
        total: totalUsersCount,
        admin: adminUsers,
        dispatcher: dispatcherUsers,
        technician: technicianUsers,
      },
      todaySchedule: todayScheduledOrders as Array<{
        id: string;
        title: string;
        priority: string;
        status: string;
        scheduledAt: string;
        customer: { id: string; name: string; company: string | null; address: string; city: string | null; phone: string } | null;
        technician: { id: string; name: string; phone: string | null } | null;
      }>,
      technicianSelfMetrics: isTechnician
        ? {
            myTechnicianProfile: authContext.technician,
            myTotalAssigned: totalWorkOrders,
            myActiveOrders: activeWorkOrders,
            myAcceptedOrders: acceptedOrders,
            myInProgressOrders: inProgressOrders,
            myPausedOrders: pausedOrders,
            myCompletedOrders: completedOrders + closedOrders,
            myOverdueOrders: overdueOrders.length,
            myCompletionRate: globalCompletionRate,
            myActiveWorkOrdersList: techActiveOrdersList,
          }
        : null,
      recentActivity: sortedActivities,
      alerts,
    });
  } catch (error) {
    console.error("[DASHBOARD_ANALYTICS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error fetching dashboard analytics." },
      { status: 500 }
    );
  }
}
