"use client";

import React, { useState } from "react";
import { SidebarItemKey } from "@/components/dashboard/Sidebar";
import Badge from "@/components/ui/Badge";
import {
  FileText,
  Users,
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
  TrendingUp,
  ShieldCheck,
  UserCheck,
  Award,
  BarChart3,
  Calendar,
  Clock,
} from "lucide-react";

interface AdminDashboardProps {
  data: any;
  onNavigate: (tab: SidebarItemKey) => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function AdminDashboard({
  data,
  onNavigate,
  onRefresh,
  loading,
}: AdminDashboardProps) {
  const [trendView, setTrendView] = useState<"created" | "completed" | "both">("both");
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const metrics = data?.metrics || {};
  const charts = data?.charts || { monthlyTrends: [], workOrdersByStatus: [], workOrdersByPriority: [] };
  const techPerformance = data?.technicianPerformance || [];
  const recentOrders = data?.recentWorkOrders || [];
  const systemUsers = data?.systemUsers || { total: 0, admin: 0, dispatcher: 0, technician: 0 };
  const activities = data?.recentActivity || [];
  const alerts = (data?.alerts || []).filter((a: any) => !dismissedAlerts.includes(a.id));

  const maxMonthlyCount = Math.max(
    ...(charts.monthlyTrends || []).map((m: any) => Math.max(m.created, m.completed)),
    6
  );

  const getRelativeTime = (timestamp: string) => {
    try {
      const diffMs = Date.now() - new Date(timestamp).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      return `${diffDays}d ago`;
    } catch {
      return "Recent";
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Executive Header & Control Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Executive Intelligence
            </h1>
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Admin Suite
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            High-level organizational metrics, fleet capacity, technician performance leaderboard, and real-time operations.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onRefresh}
            title="Refresh database records"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin text-purple-600" : "text-slate-500"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          <button
            onClick={() => onNavigate("users")}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 text-purple-600" />
            <span>Manage Users</span>
          </button>

          <button
            onClick={() => onNavigate("work-orders")}
            className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Dispatch</span>
          </button>
        </div>
      </div>

      {/* 2. Critical SLA Alerts Banner */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 2).map((alert: any) => (
            <div
              key={alert.id}
              className={`p-3.5 sm:p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-xs transition-all ${alert.level === "CRITICAL"
                  ? "bg-rose-50/90 border-rose-200 text-rose-950"
                  : alert.level === "WARNING"
                    ? "bg-amber-50/90 border-amber-200 text-amber-950"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${alert.level === "CRITICAL"
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
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.2 rounded-full ${alert.level === "CRITICAL"
                          ? "bg-rose-200 text-rose-900"
                          : alert.level === "WARNING"
                            ? "bg-amber-200 text-amber-900"
                            : "bg-slate-200 text-slate-800"
                        }`}
                    >
                      {alert.level === "CRITICAL" ? "Immediate SLA" : "System Notice"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{alert.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onNavigate(alert.targetTab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs ${alert.level === "CRITICAL"
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

      {/* 3. Executive KPI Statistics Cards (6 Columns) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Work Orders */}
        <div
          onClick={() => onNavigate("work-orders")}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group space-y-1.5"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Dispatches</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics.totalWorkOrders || 0}</span>
            <span className="text-[10px] font-bold text-purple-600 flex items-center gap-0.5">
              <span>All Jobs</span>
              <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* Global Completion Rate */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Completion Rate</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600">{metrics.completionRate || 0}%</span>
            <span className="text-[10px] font-bold text-emerald-700">Efficiency</span>
          </div>
        </div>

        {/* Active Technicians */}
        <div
          onClick={() => onNavigate("technicians")}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group space-y-1.5"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Field Fleet</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics.totalTechnicians || 0}</span>
            <span className="text-[10px] font-bold text-indigo-600">
              {metrics.availableTechnicians || 0} Ready
            </span>
          </div>
        </div>

        {/* Total Customers */}
        <div
          onClick={() => onNavigate("customers")}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group space-y-1.5"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Accounts</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics.totalCustomers || 0}</span>
            <span className="text-[10px] font-bold text-blue-600">Clients</span>
          </div>
        </div>

        {/* System Users */}
        <div
          onClick={() => onNavigate("users")}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group space-y-1.5"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">System Users</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-teal-600">{systemUsers.total || 0}</span>
            <span className="text-[10px] font-bold text-teal-700">RBAC</span>
          </div>
        </div>

        {/* Overdue Work Orders */}
        <div
          onClick={() => onNavigate("work-orders")}
          className={`p-4 rounded-2xl border shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-1.5 ${metrics.overdueWorkOrders > 0
              ? "bg-rose-50/80 border-rose-300 hover:border-rose-400"
              : "bg-white border-slate-200"
            }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${metrics.overdueWorkOrders > 0 ? "text-rose-700" : ""
                }`}
            >
              Overdue SLAs
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${metrics.overdueWorkOrders > 0
                  ? "bg-rose-100 text-rose-600 animate-pulse"
                  : "bg-slate-100 text-slate-600"
                }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span
              className={`text-2xl font-black ${metrics.overdueWorkOrders > 0 ? "text-rose-600" : "text-slate-800"
                }`}
            >
              {metrics.overdueWorkOrders || 0}
            </span>
            <span
              className={`text-[10px] font-bold ${metrics.overdueWorkOrders > 0 ? "text-rose-700" : "text-slate-400"
                }`}
            >
              {metrics.overdueWorkOrders > 0 ? "Action Req" : "Clear"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Interactive Charts Row: Monthly Velocity + System RBAC Distribution */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* CHART: Monthly Work Order Velocity (2 cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span>Monthly Organization Velocity</span>
              </h2>
              <p className="text-xs text-slate-500">
                Created dispatches vs. completed field jobs over the last 6 months
              </p>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 text-xs font-bold self-start sm:self-auto">
              <button
                onClick={() => setTrendView("both")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${trendView === "both" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setTrendView("created")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${trendView === "created" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600"
                  }`}
              >
                Created
              </button>
              <button
                onClick={() => setTrendView("completed")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${trendView === "completed" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600"
                  }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Chart Display */}
          <div className="pt-4">
            <div className="h-56 w-full flex items-end gap-3 sm:gap-6 px-2 border-b border-slate-100 relative">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                <div className="border-b border-dashed border-slate-200 w-full" />
                <div className="border-b border-dashed border-slate-200 w-full" />
                <div className="border-b border-dashed border-slate-200 w-full" />
              </div>

              {(charts.monthlyTrends || []).map((trend: any, idx: number) => {
                const createdHeight = Math.max(8, Math.round((trend.created / maxMonthlyCount) * 100));
                const completedHeight = Math.max(8, Math.round((trend.completed / maxMonthlyCount) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative z-10">
                    <div className="absolute -top-12 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg whitespace-nowrap z-20">
                      {trend.month}: {trend.created} created • {trend.completed} completed
                    </div>

                    <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full pb-1">
                      {(trendView === "both" || trendView === "created") && (
                        <div
                          style={{ height: `${createdHeight}%` }}
                          className="w-full max-w-5 bg-linear-to-t from-purple-600 to-indigo-500 rounded-t-md transition-all group-hover:brightness-110 shadow-xs"
                        />
                      )}
                      {(trendView === "both" || trendView === "completed") && (
                        <div
                          style={{ height: `${completedHeight}%` }}
                          className="w-full max-w-5 bg-linear-to-t from-emerald-500 to-teal-400 rounded-t-md transition-all group-hover:brightness-110 shadow-xs"
                        />
                      )}
                    </div>

                    <span className="text-[11px] font-bold text-slate-500 mt-2 block">{trend.month}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-6 pt-3 text-xs text-slate-600 font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-purple-600" />
                <span>Dispatches Created</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-emerald-500" />
                <span>Jobs Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* WIDGET: System User & Role Distribution */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>RBAC User Distribution</span>
            </h2>
            <p className="text-xs text-slate-500">Security roles active across organization</p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Admin Count */}
            <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs">
                  AD
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Administrators</p>
                  <p className="text-[10px] text-slate-500">Full system & user access</p>
                </div>
              </div>
              <span className="text-lg font-black text-purple-700">{systemUsers.admin || 0}</span>
            </div>

            {/* Dispatcher Count */}
            <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                  DP
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Dispatchers</p>
                  <p className="text-[10px] text-slate-500">Operations, orders & clients</p>
                </div>
              </div>
              <span className="text-lg font-black text-blue-700">{systemUsers.dispatcher || 0}</span>
            </div>

            {/* Technician Count */}
            <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                  TC
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Field Technicians</p>
                  <p className="text-[10px] text-slate-500">Field execution & status updates</p>
                </div>
              </div>
              <span className="text-lg font-black text-emerald-700">{systemUsers.technician || 0}</span>
            </div>

            <button
              onClick={() => onNavigate("users")}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Manage User Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Technician Performance & Efficiency Leaderboard */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Technician Performance Leaderboard</span>
            </h2>
            <p className="text-xs text-slate-500">
              Live resolution rates, assigned capacity, and operational status
            </p>
          </div>
          <button
            onClick={() => onNavigate("technicians")}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View Full Roster</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Rank</th>
                <th className="pb-3">Technician</th>
                <th className="pb-3">Specialization</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-center">Active Jobs</th>
                <th className="pb-3 text-center">Completed</th>
                <th className="pb-3 text-right pr-2">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {techPerformance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No technician performance data recorded yet.
                  </td>
                </tr>
              ) : (
                techPerformance.map((tech: any) => (
                  <tr key={tech.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pl-2 font-black">
                      {tech.rank === 1 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-black">
                          1
                        </span>
                      ) : tech.rank === 2 ? (
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-xs font-black">
                          2
                        </span>
                      ) : tech.rank === 3 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center text-xs font-black">
                          3
                        </span>
                      ) : (
                        <span className="text-slate-400 pl-2">#{tech.rank}</span>
                      )}
                    </td>
                    <td className="py-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-black flex items-center justify-center text-xs">
                          {tech.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{tech.name}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{tech.serviceArea}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-600 font-medium">{tech.specialization}</td>
                    <td className="py-3.5 text-center">
                      <Badge type="availability" value={tech.status} size="sm" />
                    </td>
                    <td className="py-3.5 text-center font-bold text-slate-800">{tech.activeOrders}</td>
                    <td className="py-3.5 text-center font-bold text-emerald-600">{tech.completedOrders}</td>
                    <td className="py-3.5 text-right pr-2">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                          <div
                            style={{ width: `${tech.completionRate}%` }}
                            className={`h-full rounded-full ${tech.completionRate >= 75
                                ? "bg-emerald-500"
                                : tech.completionRate >= 50
                                  ? "bg-blue-500"
                                  : "bg-slate-400"
                              }`}
                          />
                        </div>
                        <span className="font-black text-slate-900">{tech.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Recent Work Orders & Live Activity Stream Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Work Orders */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Recent Work Orders</span>
              </h2>
              <p className="text-xs text-slate-500">Latest jobs across all dispatch teams</p>
            </div>
            <button
              onClick={() => onNavigate("work-orders")}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No work orders created yet.</div>
            ) : (
              recentOrders.slice(0, 5).map((order: any) => (
                <div
                  key={order.id}
                  onClick={() => onNavigate("work-orders")}
                  className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/80 rounded-xl px-2 transition-colors cursor-pointer group"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate group-hover:text-purple-600 transition-colors">
                      {order.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {order.customer?.name || "Customer"} {order.technician ? `• ${order.technician.name}` : "• Unassigned"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge type="priority" value={order.priority} size="sm" />
                    <Badge type="status" value={order.status} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Real-Time Organization Activity Feed */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <span>Live Activity Feed</span>
              </h2>
              <p className="text-xs text-slate-500">Real-time state logs and registration audit stream</p>
            </div>
            <button
              onClick={() => onNavigate("activity")}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View Audit Trail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {activities.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No recent activity.</div>
            ) : (
              activities.slice(0, 5).map((act: any) => (
                <div
                  key={act.id}
                  className="py-3 flex items-start justify-between gap-3 text-xs hover:bg-slate-50/70 rounded-xl px-2 transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      {act.type === "STATUS_TRANSITION" ? (
                        <Clock className="w-3.5 h-3.5 text-purple-600" />
                      ) : act.type === "CUSTOMER_CREATED" ? (
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : act.type === "TECHNICIAN_CREATED" ? (
                        <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
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
    </div>
  );
}
