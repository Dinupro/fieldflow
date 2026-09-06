"use client";

import React, { useState } from "react";
import { SidebarItemKey } from "@/components/dashboard/Sidebar";
import Badge from "@/components/ui/Badge";
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
  Phone,
  MapPin,
  Send,
  Radio,
} from "lucide-react";

interface DispatcherDashboardProps {
  data: any;
  onNavigate: (tab: SidebarItemKey) => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function DispatcherDashboard({
  data,
  onNavigate,
  onRefresh,
  loading,
}: DispatcherDashboardProps) {
  const [techFilter, setTechFilter] = useState<"ALL" | "AVAILABLE" | "BUSY" | "OFF">("ALL");
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const metrics = data?.metrics || {};
  const charts = data?.charts || { workOrdersByStatus: [], workOrdersByPriority: [] };
  const technicianRoster = data?.technicianRoster || [];
  const unassignedOrders = data?.unassignedWorkOrders || [];
  const recentOrders = data?.recentWorkOrders || [];
  const activities = data?.recentActivity || [];
  const alerts = (data?.alerts || []).filter((a: any) => !dismissedAlerts.includes(a.id));

  const filteredTechs = technicianRoster.filter((tech: any) => {
    if (techFilter === "ALL") return true;
    return tech.status === techFilter;
  });

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
      {/* 1. Header & Dispatch Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Dispatch Command Center
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>Live Operations</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time fleet availability, open dispatch pool, active SLA tracking, and instant technician routing.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onRefresh}
            title="Refresh database records"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`}
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
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => onNavigate("customers")}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">+ Customer</span>
          </button>

          <button
            onClick={() => onNavigate("technicians")}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">+ Technician</span>
          </button>

          <button
            onClick={() => onNavigate("work-orders")}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Work Order</span>
          </button>
        </div>
      </div>

      {/* 2. Urgent Dispatch & SLA Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert: any) => (
            <div
              key={alert.id}
              className={`p-3.5 sm:p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-xs transition-all ${
                alert.level === "CRITICAL"
                  ? "bg-rose-50/90 border-rose-200 text-rose-950"
                  : alert.level === "WARNING"
                  ? "bg-amber-50/90 border-amber-200 text-amber-950"
                  : "bg-slate-50 border-slate-200 text-slate-900"
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
                      {alert.level === "CRITICAL" ? "Urgent Dispatch" : "Pool Notice"}
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

      {/* 3. Dispatch KPI Grid (6 Columns) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Unassigned Work Orders */}
        <div
          onClick={() => onNavigate("work-orders")}
          className={`p-4 rounded-2xl border shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-1.5 ${
            metrics.unassignedWorkOrders > 0
              ? "bg-amber-50/80 border-amber-300 hover:border-amber-400"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                metrics.unassignedWorkOrders > 0 ? "text-amber-800" : ""
              }`}
            >
              Unassigned Pool
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
                metrics.unassignedWorkOrders > 0
                  ? "bg-amber-200 text-amber-900 animate-pulse"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span
              className={`text-2xl font-black ${
                metrics.unassignedWorkOrders > 0 ? "text-amber-700" : "text-slate-800"
              }`}
            >
              {metrics.unassignedWorkOrders || 0}
            </span>
            <span
              className={`text-[10px] font-bold ${
                metrics.unassignedWorkOrders > 0 ? "text-amber-800" : "text-slate-400"
              }`}
            >
              Needs Tech
            </span>
          </div>
        </div>

        {/* Active Work Orders */}
        <div
          onClick={() => onNavigate("work-orders")}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer group space-y-1.5"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active In-Flight</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-sky-600">{metrics.activeWorkOrders || 0}</span>
            <span className="text-[10px] font-bold text-sky-700">In Field</span>
          </div>
        </div>

        {/* Available Techs */}
        <div
          onClick={() => {
            setTechFilter("AVAILABLE");
          }}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group space-y-1.5"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Available Fleet</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600">{metrics.availableTechnicians || 0}</span>
            <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ready Now</span>
            </span>
          </div>
        </div>

        {/* Busy Techs */}
        <div
          onClick={() => {
            setTechFilter("BUSY");
          }}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group space-y-1.5"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Busy On-Site</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600">{metrics.busyTechnicians || 0}</span>
            <span className="text-[10px] font-bold text-amber-700">Assigned</span>
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
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                metrics.overdueWorkOrders > 0 ? "text-rose-700" : ""
              }`}
            >
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
              {metrics.overdueWorkOrders || 0}
            </span>
            <span
              className={`text-[10px] font-bold ${
                metrics.overdueWorkOrders > 0 ? "text-rose-700" : "text-slate-400"
              }`}
            >
              {metrics.overdueWorkOrders > 0 ? "Urgent Action" : "On Track"}
            </span>
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
            <span className="text-2xl font-black text-teal-600">{metrics.completedWorkOrders || 0}</span>
            <span className="text-[10px] font-bold text-teal-700">Resolved</span>
          </div>
        </div>
      </div>

      {/* 4. Live Technician Availability & Capacity Tracker */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Live Technician Availability & Dispatch Roster</span>
            </h2>
            <p className="text-xs text-slate-500">
              Instant fleet status, active workloads, and quick contact details
            </p>
          </div>

          {/* Availability Filter Pills */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => setTechFilter("ALL")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                techFilter === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
              }`}
            >
              All ({technicianRoster.length})
            </button>
            <button
              onClick={() => setTechFilter("AVAILABLE")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                techFilter === "AVAILABLE" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600"
              }`}
            >
              Available ({metrics.availableTechnicians || 0})
            </button>
            <button
              onClick={() => setTechFilter("BUSY")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                techFilter === "BUSY" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600"
              }`}
            >
              Busy ({metrics.busyTechnicians || 0})
            </button>
            <button
              onClick={() => setTechFilter("OFF")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                techFilter === "OFF" ? "bg-slate-700 text-white shadow-xs" : "text-slate-600"
              }`}
            >
              Offline ({metrics.offlineTechnicians || 0})
            </button>
          </div>
        </div>

        {/* Technician Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {filteredTechs.length === 0 ? (
            <div className="col-span-full py-8 text-center text-xs text-slate-400">
              No technicians found matching this status filter.
            </div>
          ) : (
            filteredTechs.map((tech: any) => (
              <div
                key={tech.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-sm shrink-0">
                      {tech.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs truncate">{tech.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{tech.specialization}</p>
                    </div>
                  </div>
                  <Badge type="availability" value={tech.status} size="sm" />
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Active Load:</span>
                    <span className="font-bold text-slate-800">{tech.activeOrders} orders</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Resolution Rate:</span>
                    <span className="font-bold text-emerald-600">{tech.completionRate}%</span>
                  </div>
                  {tech.serviceArea && (
                    <div className="flex items-center gap-1 text-slate-500 pt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{tech.serviceArea}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center gap-2">
                  {tech.phone ? (
                    <a
                      href={`tel:${tech.phone}`}
                      className="flex-1 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>Call</span>
                    </a>
                  ) : null}
                  <button
                    onClick={() => onNavigate("work-orders")}
                    className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Assign Job</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. Open Dispatch Queue & Status Distribution */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Unassigned Work Orders Queue (2 cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Unassigned Work Orders Queue</span>
              </h2>
              <p className="text-xs text-slate-500">
                Incoming dispatches awaiting field technician assignment
              </p>
            </div>
            <button
              onClick={() => onNavigate("work-orders")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {unassignedOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                <span>Awesome! All work orders are currently assigned to technicians.</span>
              </div>
            ) : (
              unassignedOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/80 rounded-xl px-2.5 transition-colors"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900">{order.title}</p>
                      <Badge type="priority" value={order.priority} size="sm" />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Client: <span className="font-semibold text-slate-700">{order.customer?.name}</span>
                      {order.customer?.city ? ` (${order.customer.city})` : ""} • Created:{" "}
                      {getRelativeTime(order.createdAt)}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate("work-orders")}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs self-start sm:self-auto cursor-pointer transition-all"
                  >
                    <span>Assign Tech</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Priority & Status Breakdown */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Priority Matrix</span>
            </h2>
            <p className="text-xs text-slate-500">Live share across SLA priority tiers</p>
          </div>

          <div className="space-y-3 pt-2">
            {(charts.workOrdersByPriority || []).map((item: any) => (
              <div key={item.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-bold text-slate-700">{item.priority}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-slate-900">{item.count}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({item.percentage}%)</span>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    className="h-full rounded-full transition-all"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 mb-2">Operational Stages</h3>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
              {(charts.workOrdersByStatus || []).map((item: any) => (
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
          </div>
        </div>
      </div>

      {/* 6. Recent Dispatches & Live Activity Stream Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Work Orders */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Recent Dispatches</span>
              </h2>
              <p className="text-xs text-slate-500">Live log of latest created or updated dispatches</p>
            </div>
            <button
              onClick={() => onNavigate("work-orders")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No dispatches recorded yet.</div>
            ) : (
              recentOrders.slice(0, 5).map((order: any) => (
                <div
                  key={order.id}
                  onClick={() => onNavigate("work-orders")}
                  className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/80 rounded-xl px-2 transition-colors cursor-pointer group"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {order.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {order.customer?.name || "Client"} •{" "}
                      {order.technician ? `Tech: ${order.technician.name}` : "Unassigned"}
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

        {/* Real-Time Activity Feed */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Dispatch Activity Stream</span>
            </h2>
            <p className="text-xs text-slate-500">Real-time status transitions and operational updates</p>
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
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
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
