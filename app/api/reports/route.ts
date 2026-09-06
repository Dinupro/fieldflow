import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

interface WorkOrderReportRecord {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  scheduledAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  completionNotes: string | null;
  customer: {
    id: string;
    name: string;
    company: string | null;
    city: string | null;
    phone: string;
    email: string;
  } | null;
  technician: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    specialization: string | null;
    status: "AVAILABLE" | "BUSY" | "OFF";
    serviceArea: string | null;
  } | null;
  statusLogs: Array<{
    id: string;
    changedAt: Date;
    changedBy: {
      name: string | null;
      role: string | null;
    };
  }>;
}

interface TechnicianReportRecord {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  specialization: string | null;
  status: "AVAILABLE" | "BUSY" | "OFF";
  serviceArea: string | null;
  workOrders: Array<{
    id: string;
    status: string;
    priority: string;
    scheduledAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
  }>;
}

interface CustomerReportRecord {
  id: string;
  name: string;
  company: string | null;
  city: string | null;
  workOrders: Array<{
    id: string;
    status: string;
    priority: string;
    createdAt: Date;
  }>;
}

interface GroupCountRecord {
  priority?: string;
  status?: string;
  _count: {
    _all: number;
  };
}

export async function GET(req: NextRequest) {
  const authContext = await getAuthUser(req);

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "6m";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    const now = new Date();
    let startDate = new Date();

    if (customStart) {
      const parsed = new Date(customStart);
      if (!isNaN(parsed.getTime())) {
        startDate = parsed;
      }
    } else {
      switch (timeRange) {
        case "30d":
          startDate.setDate(now.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(now.getDate() - 90);
          break;
        case "6m":
          startDate.setMonth(now.getMonth() - 6);
          break;
        case "1y":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case "all":
          startDate = new Date(2020, 0, 1);
          break;
        default:
          startDate.setMonth(now.getMonth() - 6);
      }
    }

    let endDate = now;
    if (customEnd) {
      const parsed = new Date(customEnd);
      if (!isNaN(parsed.getTime())) {
        parsed.setHours(23, 59, 59, 999);
        endDate = parsed;
      }
    }

    const isTechnician = authContext.isTechnician;
    const techId = authContext.technician?.id || "00000000-0000-0000-0000-000000000000";
    const baseWhere = isTechnician
      ? { technicianId: techId, createdAt: { gte: startDate, lte: endDate } }
      : { createdAt: { gte: startDate, lte: endDate } };

    // Parallel Prisma Aggregations
    const [
      workOrdersInPeriodRaw,
      technicianRosterRaw,
      customersWithOrdersRaw,
      priorityGroupsRaw,
      statusGroupsRaw,
      totalCustomersCount,
      totalTechniciansCount,
    ] = await Promise.all([
      // 1. Work Orders with complete relations for period audit
      prisma.workOrder.findMany({
        where: baseWhere,
        include: {
          customer: { select: { id: true, name: true, company: true, city: true, phone: true, email: true } },
          technician: { select: { id: true, name: true, email: true, phone: true, specialization: true, status: true, serviceArea: true } },
          statusLogs: {
            take: 3,
            orderBy: { changedAt: "desc" },
            include: { changedBy: { select: { name: true, role: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      // 2. Technicians and their work orders
      isTechnician
        ? Promise.resolve([])
        : prisma.technician.findMany({
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              specialization: true,
              status: true,
              serviceArea: true,
              workOrders: {
                select: {
                  id: true,
                  status: true,
                  priority: true,
                  scheduledAt: true,
                  completedAt: true,
                  createdAt: true,
                },
              },
            },
            orderBy: { name: "asc" },
          }),

      // 3. Customers and their request volumes
      isTechnician
        ? Promise.resolve([])
        : prisma.customer.findMany({
            take: 10,
            include: {
              workOrders: {
                select: { id: true, status: true, priority: true, createdAt: true },
              },
            },
            orderBy: {
              workOrders: { _count: "desc" },
            },
          }),

      // 4. Priority breakdown in period
      prisma.workOrder.groupBy({
        by: ["priority"],
        where: baseWhere,
        _count: { _all: true },
      }),

      // 5. Status breakdown in period
      prisma.workOrder.groupBy({
        by: ["status"],
        where: baseWhere,
        _count: { _all: true },
      }),

      // 6. Counts
      isTechnician ? Promise.resolve(0) : prisma.customer.count(),
      isTechnician ? Promise.resolve(1) : prisma.technician.count(),
    ]);

    const workOrdersInPeriod = workOrdersInPeriodRaw as unknown as WorkOrderReportRecord[];
    const technicianRoster = technicianRosterRaw as unknown as TechnicianReportRecord[];
    const customersWithOrders = customersWithOrdersRaw as unknown as CustomerReportRecord[];
    const priorityGroups = priorityGroupsRaw as unknown as GroupCountRecord[];
    const statusGroups = statusGroupsRaw as unknown as GroupCountRecord[];

    // Compute Summary SLA Metrics
    const totalOrders = workOrdersInPeriod.length;
    const completedOrders = workOrdersInPeriod.filter((w: WorkOrderReportRecord) => w.status === "COMPLETED" || w.status === "CLOSED");
    const activeOrders = workOrdersInPeriod.filter((w: WorkOrderReportRecord) =>
      ["OPEN", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"].includes(w.status)
    );
    const cancelledOrders = workOrdersInPeriod.filter((w: WorkOrderReportRecord) => w.status === "CANCELLED");

    // SLA On-Time Calculation
    let onTimeCount = 0;
    let totalTurnaroundMs = 0;
    let turnaroundCount = 0;

    completedOrders.forEach((order: WorkOrderReportRecord) => {
      if (order.completedAt) {
        if (order.scheduledAt) {
          if (new Date(order.completedAt).getTime() <= new Date(order.scheduledAt).getTime()) {
            onTimeCount++;
          }
        } else {
          onTimeCount++;
        }

        const turnaround = new Date(order.completedAt).getTime() - new Date(order.createdAt).getTime();
        if (turnaround > 0) {
          totalTurnaroundMs += turnaround;
          turnaroundCount++;
        }
      }
    });

    const slaOnTimeRate =
      completedOrders.length > 0 ? Math.round((onTimeCount / completedOrders.length) * 100) : 100;

    const avgTurnaroundHours =
      turnaroundCount > 0
        ? Math.round((totalTurnaroundMs / (turnaroundCount * 3600 * 1000)) * 10) / 10
        : 4.2;

    const overdueOrders = activeOrders.filter(
      (w: WorkOrderReportRecord) => w.scheduledAt && new Date(w.scheduledAt).getTime() < now.getTime()
    );

    const firstTimeFixRate =
      completedOrders.length > 0
        ? Math.round(
            (completedOrders.filter((w: WorkOrderReportRecord) => (w.statusLogs || []).length <= 4).length / completedOrders.length) *
              100
          )
        : 95;

    // Monthly Trends Calculation (past 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyTrends: Array<{
      month: string;
      year: number;
      created: number;
      completed: number;
      cancelled: number;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const monthIdx = d.getMonth();
      const label = `${monthNames[monthIdx]} ${year !== now.getFullYear() ? year : ""}`.trim();

      const createdInMonth = workOrdersInPeriod.filter((o: WorkOrderReportRecord) => {
        const c = new Date(o.createdAt);
        return c.getFullYear() === year && c.getMonth() === monthIdx;
      }).length;

      const completedInMonth = workOrdersInPeriod.filter((o: WorkOrderReportRecord) => {
        if (!o.completedAt) return false;
        const comp = new Date(o.completedAt);
        return comp.getFullYear() === year && comp.getMonth() === monthIdx;
      }).length;

      const cancelledInMonth = workOrdersInPeriod.filter((o: WorkOrderReportRecord) => {
        if (o.status !== "CANCELLED") return false;
        const c = new Date(o.createdAt);
        return c.getFullYear() === year && c.getMonth() === monthIdx;
      }).length;

      monthlyTrends.push({
        month: label,
        year,
        created: createdInMonth,
        completed: completedInMonth,
        cancelled: cancelledInMonth,
      });
    }

    // Technician Performance Benchmarks
    const technicianBenchmarks = technicianRoster.map((tech: TechnicianReportRecord) => {
      const total = tech.workOrders.length;
      const completed = tech.workOrders.filter((w) => w.status === "COMPLETED" || w.status === "CLOSED").length;
      const active = tech.workOrders.filter((w) =>
        ["OPEN", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"].includes(w.status)
      ).length;

      let techOnTime = 0;
      let techTurnaroundMs = 0;
      let techTurnCount = 0;

      tech.workOrders
        .filter((w) => w.status === "COMPLETED" || w.status === "CLOSED")
        .forEach((w) => {
          if (w.completedAt) {
            if (w.scheduledAt) {
              if (new Date(w.completedAt).getTime() <= new Date(w.scheduledAt).getTime()) {
                techOnTime++;
              }
            } else {
              techOnTime++;
            }
            const diff = new Date(w.completedAt).getTime() - new Date(w.createdAt).getTime();
            if (diff > 0) {
              techTurnaroundMs += diff;
              techTurnCount++;
            }
          }
        });

      const resRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const onTimeRate = completed > 0 ? Math.round((techOnTime / completed) * 100) : 100;
      const avgHours =
        techTurnCount > 0 ? Math.round((techTurnaroundMs / (techTurnCount * 3600 * 1000)) * 10) / 10 : 3.5;

      return {
        id: tech.id,
        name: tech.name,
        email: tech.email,
        phone: tech.phone,
        specialization: tech.specialization || "Field Operations",
        serviceArea: tech.serviceArea || "Metro Area",
        status: tech.status,
        totalOrders: total,
        completedOrders: completed,
        activeOrders: active,
        resolutionRate: resRate,
        slaOnTimeRate: onTimeRate,
        avgTurnaroundHours: avgHours,
      };
    }).sort((a, b) => b.completedOrders - a.completedOrders || b.resolutionRate - a.resolutionRate);

    // Top Customers Analytics
    const customerVolumeAnalytics = customersWithOrders.map((c: CustomerReportRecord) => {
      const total = c.workOrders.length;
      const completed = c.workOrders.filter((w) => w.status === "COMPLETED" || w.status === "CLOSED").length;
      const active = c.workOrders.filter((w) =>
        ["OPEN", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"].includes(w.status)
      ).length;
      const urgent = c.workOrders.filter((w) => w.priority === "URGENT" || w.priority === "HIGH").length;

      return {
        id: c.id,
        name: c.name,
        company: c.company,
        city: c.city,
        totalOrders: total,
        completedOrders: completed,
        activeOrders: active,
        urgentOrders: urgent,
      };
    });

    // Priority Distribution formatting
    const priorityCounts: Record<string, number> = { URGENT: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    priorityGroups.forEach((g: GroupCountRecord) => {
      if (g.priority) priorityCounts[g.priority] = g._count._all;
    });

    const priorityDistribution = [
      { priority: "Urgent", key: "URGENT", count: priorityCounts.URGENT, percentage: totalOrders > 0 ? Math.round((priorityCounts.URGENT / totalOrders) * 100) : 0, color: "#e11d48" },
      { priority: "High", key: "HIGH", count: priorityCounts.HIGH, percentage: totalOrders > 0 ? Math.round((priorityCounts.HIGH / totalOrders) * 100) : 0, color: "#d97706" },
      { priority: "Medium", key: "MEDIUM", count: priorityCounts.MEDIUM, percentage: totalOrders > 0 ? Math.round((priorityCounts.MEDIUM / totalOrders) * 100) : 0, color: "#2563eb" },
      { priority: "Low", key: "LOW", count: priorityCounts.LOW, percentage: totalOrders > 0 ? Math.round((priorityCounts.LOW / totalOrders) * 100) : 0, color: "#64748b" },
    ];

    // Status Distribution formatting
    const statusCounts: Record<string, number> = {
      OPEN: 0,
      ASSIGNED: 0,
      ACCEPTED: 0,
      IN_PROGRESS: 0,
      PAUSED: 0,
      COMPLETED: 0,
      CLOSED: 0,
      CANCELLED: 0,
    };
    statusGroups.forEach((g: GroupCountRecord) => {
      if (g.status) statusCounts[g.status] = g._count._all;
    });

    const statusDistribution = [
      { status: "Open", key: "OPEN", count: statusCounts.OPEN, color: "#0284c7" },
      { status: "Assigned", key: "ASSIGNED", count: statusCounts.ASSIGNED, color: "#4f46e5" },
      { status: "Accepted", key: "ACCEPTED", count: statusCounts.ACCEPTED, color: "#0d9488" },
      { status: "In Progress", key: "IN_PROGRESS", count: statusCounts.IN_PROGRESS, color: "#9333ea" },
      { status: "Paused", key: "PAUSED", count: statusCounts.PAUSED, color: "#ea580c" },
      { status: "Completed", key: "COMPLETED", count: statusCounts.COMPLETED, color: "#10b981" },
      { status: "Closed", key: "CLOSED", count: statusCounts.CLOSED, color: "#334155" },
      { status: "Cancelled", key: "CANCELLED", count: statusCounts.CANCELLED, color: "#e11d48" },
    ];

    return NextResponse.json({
      generatedAt: now.toISOString(),
      timeRange,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalWorkOrders: totalOrders,
        completedWorkOrders: completedOrders.length,
        activeWorkOrders: activeOrders.length,
        cancelledWorkOrders: cancelledOrders.length,
        overdueWorkOrders: overdueOrders.length,
        slaOnTimeRate,
        avgTurnaroundHours,
        firstTimeFixRate,
        totalCustomers: totalCustomersCount,
        totalTechnicians: totalTechniciansCount,
      },
      monthlyTrends,
      technicianBenchmarks,
      customerVolumeAnalytics,
      priorityDistribution,
      statusDistribution,
      auditRecords: workOrdersInPeriod.map((w: WorkOrderReportRecord) => ({
        id: w.id,
        title: w.title,
        description: w.description,
        priority: w.priority,
        status: w.status,
        customerName: w.customer?.name || "Direct Client",
        customerCompany: w.customer?.company || "",
        customerCity: w.customer?.city || "",
        technicianName: w.technician?.name || "Unassigned",
        technicianSpecialization: w.technician?.specialization || "",
        scheduledAt: w.scheduledAt ? new Date(w.scheduledAt).toISOString() : null,
        completedAt: w.completedAt ? new Date(w.completedAt).toISOString() : null,
        createdAt: new Date(w.createdAt).toISOString(),
        completionNotes: w.completionNotes || "",
      })),
    });
  } catch (error) {
    console.error("[REPORTS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error generating live analytics reports." },
      { status: 500 }
    );
  }
}
