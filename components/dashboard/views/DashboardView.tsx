"use client";

import { useState, useEffect, useCallback } from "react";
import { SidebarItemKey } from "@/components/dashboard/Sidebar";
import {
  FileText,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Building2,
  Wrench,
  Zap,
  Activity,
  AlertCircle,
  X,
  ChevronRight,
} from "lucide-react";

interface DashboardViewProps {
  onNavigate: (tab: SidebarItemKey) => void;
}

interface DashboardMetrics {
  totalCustomers: number;
  totalTechnicians: number;
  availableTechnicians: number;
  busyTechnicians: number;
  offlineTechnicians: number;
  totalWorkOrders: number;
  activeWorkOrders: number;
  completedWorkOrders: number;
  cancelledWorkOrders: number;
  overdueWorkOrders: number;
  unassignedWorkOrders: number;
}

interface StatusDistributionItem {
  status: string;
  key: string;
  count: number;
  percentage: number;
  color: string;
}

interface PriorityDistributionItem {
  priority: string;
  key: string;
  count: number;
  percentage: number;
  color: string;
}

interface MonthlyTrendItem {
  month: string;
  created: number;
  completed: number;
}

interface TechnicianWorkloadItem {
  id: string;
  name: string;
  specialization: string;
  status: "AVAILABLE" | "BUSY" | "OFF";
  activeOrders: number;
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  badgeText: string;
  badgeColor: string;
}

interface AlertItem {
  id: string;
  level: "CRITICAL" | "WARNING" | "INFO";
  type: string;
  title: string;
  message: string;
  targetTab: SidebarItemKey;
  actionText: string;
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCustomers: 0,
    totalTechnicians: 0,
    availableTechnicians: 0,
    busyTechnicians: 0,
    offlineTechnicians: 0,
    totalWorkOrders: 0,
    activeWorkOrders: 0,
    completedWorkOrders: 0,
    cancelledWorkOrders: 0,
    overdueWorkOrders: 0,
    unassignedWorkOrders: 0,
  });

  const [charts, setCharts] = useState<{
    workOrdersByStatus: StatusDistributionItem[];
    monthlyTrends: MonthlyTrendItem[];
    technicianWorkload: TechnicianWorkloadItem[];
    workOrdersByPriority: PriorityDistributionItem[];
  }>({
    workOrdersByStatus: [],
    monthlyTrends: [],
    technicianWorkload: [],
    workOrdersByPriority: [],
  });

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendView, setTrendView] = useState<"created" | "completed" | "both">("both");
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [nowTimestamp] = useState(() => new Date().getTime());

  // Fetch Dashboard Analytics from API
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        throw new Error("Failed to load dashboard analytics");
      }
      const data = await res.json();
      setMetrics(data.metrics || {});
      setCharts(
        data.charts || {
          workOrdersByStatus: [],
          monthlyTrends: [],
          technicianWorkload: [],
          workOrdersByPriority: [],
        }
      );
      setActivities(data.recentActivity || []);
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok && active) {
          const data = await res.json();
          setMetrics(data.metrics || {});
          setCharts(
            data.charts || {
              workOrdersByStatus: [],
              monthlyTrends: [],
              technicianWorkload: [],
              workOrdersByPriority: [],
            }
          );
          setActivities(data.recentActivity || []);
          setAlerts(data.alerts || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const getRelativeTime = (timestamp: string) => {
    try {
      const diffMs = nowTimestamp - new Date(timestamp).getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      return `${diffDays}d ago`;
    } catch {
      return "Recent";
    }
  };

  const activeAlerts = alerts.filter((a) => !dismissedAlerts.includes(a.id));

  // Compute max for chart scaling
  const maxMonthlyCount = Math.max(
    ...charts.monthlyTrends.map((m) => Math.max(m.created, m.completed)),
    5
  );

  const maxTechLoad = Math.max(
    ...charts.technicianWorkload.map((t) => t.activeOrders),
    4
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Dispatch Intelligence
            </h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Postgres Live</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time workforce capacity, SLA performance, job distribution, and activity stream.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchDashboardData}
            title="Refresh dashboard analytics"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Quick Action: New Work Order */}
          <button
            onClick={() => onNavigate("work-orders")}
            className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Work Order</span>
          </button>

          {/* Quick Action: Add Customer */}
          <button
            onClick={() => onNavigate("customers")}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">+ Customer</span>
          </button>

          {/* Quick Action: Add Tech */}
          <button
            onClick={() => onNavigate("technicians")}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">+ Technician</span>
          </button>
        </div>
      </div>

      {/* 2. Prioritized Smart Alerts Section */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          {activeAlerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 sm:p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-xs transition-all ${
                alert.level === "CRITICAL"
                  ? "bg-rose-50/90 border-rose-200 text-rose-950"
                  : alert.level === "WARNING"
                  ? "bg-amber-50/90 border-amber-200 text-amber-950"
                  : "bg-slate-50/90 border-slate-200 text-slate-900"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    alert.level === "CRITICAL"
                      ? "bg-rose-100 text-rose-600 animate-pulse"
                      : alert.level === "WARNING"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold truncate">{alert.title}</span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.2 rounded-full ${
                        alert.level === "CRITICAL"
                          ? "bg-rose-200 text-rose-900"
                          : alert.level === "WARNING"
                          ? "bg-amber-200 text-amber-900"
                          : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {alert.level === "CRITICAL" ? "Immediate SLA" : "Dispatch Notice"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{alert.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onNavigate(alert.targetTab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs ${
                    alert.level === "CRITICAL"
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : alert.level === "WARNING"
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : "bg-slate-800 hover:bg-slate-900 text-white"
                  }`}
                >
                  <span>{alert.actionText}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDismissedAlerts((prev) => [...prev, alert.id])}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. High-Impact Metrics Cards (7 Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-3.5">
        {/* Total Customers */}
        <div
          onClick={() => onNavigate("customers")}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group space-y-1.5"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Customers</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics.totalCustomers}</span>
            <span className="text-[10px] font-bold text-blue-600 flex items-center gap-0.5">
              <span>Accounts</span>
              <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* Total Technicians */}
        <div
          onClick={() => onNavigate("technicians")}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group space-y-1.5"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Technicians</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics.totalTechnicians}</span>
            <span className="text-[10px] font-bold text-indigo-600">Roster</span>
          </div>
        </div>

        {/* Available Techs */}
        <div
          onClick={() => onNavigate("technicians")}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group space-y-1.5"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Available Now</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600">{metrics.availableTechnicians}</span>
            <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ready</span>
            </span>
          </div>
        </div>

        {/* Active Work Orders */}
        <div
          onClick={() => onNavigate("work-orders")}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer group space-y-1.5"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Orders</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-sky-600">{metrics.activeWorkOrders}</span>
            <span className="text-[10px] font-bold text-sky-700">In Flight</span>
          </div>
        </div>

        {/* Completed Work Orders */}
        <div
          onClick={() => onNavigate("work-orders")}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group space-y-1.5"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Completed</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-teal-600">{metrics.completedWorkOrders}</span>
            <span className="text-[10px] font-bold text-teal-700">Resolved</span>
          </div>
        </div>

        {/* Overdue Work Orders */}
        <div
          onClick={() => onNavigate("work-orders")}
          className={`p-4 rounded-2xl border shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-1.5 ${
            metrics.overdueWorkOrders > 0
              ? "bg-rose-50/80 border-rose-300 hover:border-rose-400"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${metrics.overdueWorkOrders > 0 ? "text-rose-700" : ""}`}>
              Overdue SLAs
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
                metrics.overdueWorkOrders > 0
                  ? "bg-rose-100 text-rose-600 animate-pulse"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span
              className={`text-2xl font-black ${
                metrics.overdueWorkOrders > 0 ? "text-rose-600" : "text-slate-800"
              }`}
            >
              {metrics.overdueWorkOrders}
            </span>
            <span
              className={`text-[10px] font-bold ${
                metrics.overdueWorkOrders > 0 ? "text-rose-700" : "text-slate-400"
              }`}
            >
              {metrics.overdueWorkOrders > 0 ? "Action Req" : "Clear"}
            </span>
          </div>
        </div>

        {/* Unassigned Work Orders */}
        <div
          onClick={() => onNavigate("work-orders")}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group space-y-1.5 col-span-2 md:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Unassigned</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600">{metrics.unassignedWorkOrders}</span>
            <span className="text-[10px] font-bold text-amber-700">Open Queue</span>
          </div>
        </div>
      </div>

      {/* 4. Interactive Visualizations Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* CHART 1: Monthly Trends (2-column on desktop) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Monthly Work Order Velocity</span>
              </h2>
              <p className="text-xs text-slate-500">Created dispatches vs. completed field jobs over past 6 months</p>
            </div>

            {/* View Filter Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 text-xs font-bold self-start sm:self-auto">
              <button
                onClick={() => setTrendView("both")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  trendView === "both" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTrendView("created")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  trendView === "created" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600"
                }`}
              >
                Created
              </button>
              <button
                onClick={() => setTrendView("completed")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  trendView === "completed" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600"
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* SVG Area Chart */}
          <div className="pt-4">
            <div className="h-56 w-full flex items-end gap-3 sm:gap-6 px-2 border-b border-slate-100 relative">
              {/* Grid guide lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                <div className="border-b border-dashed border-slate-200 w-full" />
                <div className="border-b border-dashed border-slate-200 w-full" />
                <div className="border-b border-dashed border-slate-200 w-full" />
              </div>

              {charts.monthlyTrends.map((trend, idx) => {
                const createdHeight = Math.max(8, Math.round((trend.created / maxMonthlyCount) * 100));
                const completedHeight = Math.max(8, Math.round((trend.completed / maxMonthlyCount) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative z-10">
                    {/* Hover Tooltip */}
                    <div className="absolute -top-12 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg whitespace-nowrap z-20">
                      {trend.month}: {trend.created} created / {trend.completed} done
                    </div>

                    {/* Bars comparison */}
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full pb-1">
                      {(trendView === "both" || trendView === "created") && (
                        <div
                          style={{ height: `${createdHeight}%` }}
                          className="w-full max-w-[18px] bg-linear-to-t from-blue-600 to-indigo-500 rounded-t-md transition-all group-hover:brightness-110 shadow-xs"
                        />
                      )}
                      {(trendView === "both" || trendView === "completed") && (
                        <div
                          style={{ height: `${completedHeight}%` }}
                          className="w-full max-w-[18px] bg-linear-to-t from-emerald-500 to-teal-400 rounded-t-md transition-all group-hover:brightness-110 shadow-xs"
                        />
                      )}
                    </div>

                    <span className="text-[11px] font-bold text-slate-500 mt-2 block">{trend.month}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-3 text-xs text-slate-600 font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-blue-600" />
                <span>New Dispatches</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-emerald-500" />
                <span>Completed Deliveries</span>
              </div>
            </div>
          </div>
        </div>

        {/* CHART 2: Work Orders by Status Breakdown */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Job Status Distribution</span>
            </h2>
            <p className="text-xs text-slate-500">Live share across all dispatch states</p>
          </div>

          <div className="space-y-3 pt-2">
            {/* Segmented distribution bar */}
            <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
              {charts.workOrdersByStatus.map((item) => (
                <div
                  key={item.key}
                  style={{
                    width: `${Math.max(item.percentage, item.count > 0 ? 5 : 0)}%`,
                    backgroundColor: item.color,
                  }}
                  title={`${item.status}: ${item.count} (${item.percentage}%)`}
                  className="h-full transition-all"
                />
              ))}
            </div>

            {/* List breakdown */}
            <div className="space-y-2 pt-2">
              {charts.workOrdersByStatus.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between text-xs p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-700">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.count}</span>
                    <span className="text-[10px] font-semibold text-slate-400">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Second Analytics Row: Technician Workload + Priority Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* CHART 3: Technician Workload Capacity (2 cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Field Technician Workload & Capacity</span>
              </h2>
              <p className="text-xs text-slate-500">Active assigned jobs across roster</p>
            </div>
            <button
              onClick={() => onNavigate("technicians")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Team</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {charts.technicianWorkload.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No technicians registered yet.</div>
            ) : (
              charts.technicianWorkload.map((tech) => {
                const loadPercent = Math.min(100, Math.round((tech.activeOrders / maxTechLoad) * 100));

                return (
                  <div key={tech.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            tech.status === "AVAILABLE"
                              ? "bg-emerald-500"
                              : tech.status === "BUSY"
                              ? "bg-amber-500"
                              : "bg-slate-400"
                          }`}
                        />
                        <span className="font-bold text-slate-800 truncate">{tech.name}</span>
                        <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                          ({tech.specialization})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-slate-900">{tech.activeOrders}</span>
                        <span className="text-slate-400 text-[10px]">active jobs</span>
                      </div>
                    </div>

                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.max(loadPercent, tech.activeOrders > 0 ? 8 : 0)}%` }}
                        className={`h-full rounded-full transition-all ${
                          tech.activeOrders >= 4
                            ? "bg-rose-500"
                            : tech.activeOrders >= 2
                            ? "bg-amber-500"
                            : "bg-blue-600"
                        }`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CHART 4: Priority Breakdown */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Priority Breakdown</span>
            </h2>
            <p className="text-xs text-slate-500">Urgency classification of all work orders</p>
          </div>

          <div className="space-y-3 pt-2">
            {charts.workOrdersByPriority.map((item) => (
              <div key={item.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-bold text-slate-700">{item.priority}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{item.count}</span>
                    <span className="text-[10px] text-slate-400">({item.percentage}%)</span>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                    className="h-full rounded-full transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Recent Activity Stream (Chronological StatusLog & Dispatch Events) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Real-Time Dispatch Activity Feed</span>
            </h2>
            <p className="text-xs text-slate-500">Latest 10 state transitions, job dispatches, and account actions</p>
          </div>
          <button
            onClick={() => onNavigate("work-orders")}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Orders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {activities.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No recent activity recorded yet. Start dispatching work orders to see live updates.
            </div>
          ) : (
            activities.map((act) => (
              <div
                key={act.id}
                className="py-3 sm:py-3.5 flex items-start justify-between gap-3 text-xs hover:bg-slate-50/70 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    {act.type === "STATUS_TRANSITION" ? (
                      <Clock className="w-4 h-4 text-blue-600" />
                    ) : act.type === "CUSTOMER_CREATED" ? (
                      <Building2 className="w-4 h-4 text-emerald-600" />
                    ) : act.type === "TECHNICIAN_CREATED" ? (
                      <Wrench className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-sky-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{act.title}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{act.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${act.badgeColor}`}>
                    {act.badgeText}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{getRelativeTime(act.timestamp)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
