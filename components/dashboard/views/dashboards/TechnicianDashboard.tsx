"use client";

import React, { useState } from "react";
import { SidebarItemKey } from "@/components/dashboard/Sidebar";
import Badge from "@/components/ui/Badge";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Wrench,
  Zap,
  Activity,
  AlertCircle,
  X,
  ChevronRight,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Check,
  Building2,
  Award,
} from "lucide-react";

interface TechnicianDashboardProps {
  data: any;
  onNavigate: (tab: SidebarItemKey) => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function TechnicianDashboard({
  data,
  onNavigate,
  onRefresh,
  loading,
}: TechnicianDashboardProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [transitionLoading, setTransitionLoading] = useState<string | null>(null);

  const metrics = data?.metrics || {};
  const selfMetrics = data?.technicianSelfMetrics || {};
  const activeOrdersList = selfMetrics.myActiveWorkOrdersList || [];
  const todaySchedule = data?.todaySchedule || [];
  const charts = data?.charts || { workOrdersByStatus: [], workOrdersByPriority: [] };
  const activities = data?.recentActivity || [];
  const alerts = (data?.alerts || []).filter((a: any) => !dismissedAlerts.includes(a.id));

  // Quick State Transition Handler for Technicians
  const handleQuickTransition = async (orderId: string, toStatus: string, notes?: string) => {
    setTransitionLoading(orderId);
    try {
      const res = await fetch(`/api/work-orders/${orderId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toStatus,
          notes: notes || `Quick status update to ${toStatus} from technician cockpit`,
        }),
      });

      if (res.ok) {
        onRefresh();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update work order status");
      }
    } catch (e) {
      console.error("Transition error:", e);
    } finally {
      setTransitionLoading(null);
    }
  };

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
      {/* 1. Header & Welcome Cockpit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Wrench className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Technician Field Cockpit
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>On-Duty</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Your assigned dispatches, customer service locations, scheduled appointments, and one-click task execution.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onRefresh}
            title="Refresh database records"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : "text-slate-500"}`}
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
            onClick={() => onNavigate("work-orders")}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>My Work Orders</span>
          </button>
        </div>
      </div>

      {/* 2. Personal Priority Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert: any) => (
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
                          : "bg-amber-200 text-amber-900"
                      }`}
                    >
                      Action Required
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{alert.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onNavigate(alert.targetTab)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
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

      {/* 3. Personal Productivity KPI Cards (5 Columns) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Assigned */}
        <div
          onClick={() => onNavigate("work-orders")}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group space-y-1.5"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Assigned to Me</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{selfMetrics.myTotalAssigned || metrics.totalWorkOrders || 0}</span>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
              <span>All Jobs</span>
              <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* Active Now */}
        <div
          onClick={() => onNavigate("work-orders")}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group space-y-1.5"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active In Progress</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600">{selfMetrics.myInProgressOrders || metrics.activeWorkOrders || 0}</span>
            <span className="text-[10px] font-bold text-amber-700">In Field</span>
          </div>
        </div>

        {/* Completed Jobs */}
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
            <span className="text-2xl font-black text-teal-600">{selfMetrics.myCompletedOrders || metrics.completedWorkOrders || 0}</span>
            <span className="text-[10px] font-bold text-teal-700">Resolved</span>
          </div>
        </div>

        {/* Overdue */}
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
              {metrics.overdueWorkOrders > 0 ? "Urgent" : "Clear"}
            </span>
          </div>
        </div>

        {/* Personal Completion Rate */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Success Rate</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600">{metrics.completionRate || 0}%</span>
            <span className="text-[10px] font-bold text-emerald-700">Rating</span>
          </div>
        </div>
      </div>

      {/* 4. My Active Assigned Work Orders Queue with 1-Click State Actions */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>My Active Dispatches & Task Queue</span>
            </h2>
            <p className="text-xs text-slate-500">
              Orders currently assigned to you with quick action buttons to update status in real-time
            </p>
          </div>
          <button
            onClick={() => onNavigate("work-orders")}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Open All Work Orders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {activeOrdersList.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
              <p className="font-bold text-slate-700 text-sm">No Active Tasks In Your Queue</p>
              <p className="text-slate-400 mt-1">You are caught up on all assigned work orders. New dispatches will appear here.</p>
            </div>
          ) : (
            activeOrdersList.map((order: any) => {
              const isBusyWithThis = transitionLoading === order.id;

              return (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-emerald-300 hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{order.title}</h3>
                      <Badge type="priority" value={order.priority} size="sm" />
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">{order.description}</p>

                    <div className="space-y-1 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{order.customer?.name}</span>
                        {order.customer?.company && (
                          <span className="text-slate-400 font-normal">({order.customer.company})</span>
                        )}
                      </div>

                      {order.customer?.address && (
                        <div className="flex items-start gap-1.5 text-[11px] text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">
                            {order.customer.address}
                            {order.customer.city ? `, ${order.customer.city}` : ""}
                          </span>
                        </div>
                      )}

                      {order.scheduledAt && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{new Date(order.scheduledAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 1-Click State Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Status</span>
                      <Badge type="status" value={order.status} size="sm" />
                    </div>

                    <div className="flex items-center gap-2">
                      {order.customer?.phone && (
                        <a
                          href={`tel:${order.customer.phone}`}
                          title="Call customer"
                          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all flex items-center justify-center shrink-0"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* Transition button based on lifecycle stage */}
                      {order.status === "ASSIGNED" && (
                        <button
                          disabled={isBusyWithThis}
                          onClick={() => handleQuickTransition(order.id, "ACCEPTED")}
                          className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isBusyWithThis ? "Accepting..." : "Accept Job"}</span>
                        </button>
                      )}

                      {order.status === "ACCEPTED" && (
                        <button
                          disabled={isBusyWithThis}
                          onClick={() => handleQuickTransition(order.id, "IN_PROGRESS")}
                          className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all disabled:opacity-50"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>{isBusyWithThis ? "Starting..." : "Start Work"}</span>
                        </button>
                      )}

                      {(order.status === "IN_PROGRESS" || order.status === "PAUSED") && (
                        <button
                          onClick={() => onNavigate("work-orders")}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete Job...</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. Today's Field Schedule & Status Breakdown Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Schedule (2 cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Today's Site Appointments</span>
              </h2>
              <p className="text-xs text-slate-500">Scheduled customer visits for today</p>
            </div>
            <button
              onClick={() => onNavigate("schedule")}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View Calendar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {todaySchedule.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No site visits scheduled specifically for today.
              </div>
            ) : (
              todaySchedule.map((item: any) => (
                <div
                  key={item.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/80 rounded-xl px-2.5 transition-colors"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <Badge type="priority" value={item.priority} size="sm" />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Client: <span className="font-semibold text-slate-700">{item.customer?.name}</span>
                      {item.customer?.address ? ` • ${item.customer.address}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {item.customer?.phone && (
                      <a
                        href={`tel:${item.customer.phone}`}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>Call</span>
                      </a>
                    )}
                    <Badge type="status" value={item.status} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Status Breakdown */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Job Status Breakdown</span>
            </h2>
            <p className="text-xs text-slate-500">Share of assigned work orders</p>
          </div>

          <div className="space-y-3 pt-2">
            {(charts.workOrdersByStatus || []).map((item: any) => (
              <div key={item.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-700">{item.status}</span>
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
        </div>
      </div>

      {/* 6. My Recent Activity Stream */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>My Personal Activity Log</span>
          </h2>
          <p className="text-xs text-slate-500">Recent status changes, acceptance logs, and notes on your jobs</p>
        </div>

        <div className="divide-y divide-slate-100">
          {activities.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No activity recorded on your jobs yet.</div>
          ) : (
            activities.slice(0, 6).map((act: any) => (
              <div
                key={act.id}
                className="py-3 flex items-start justify-between gap-3 text-xs hover:bg-slate-50/70 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{act.title}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{act.description}</p>
                    {act.notes && (
                      <p className="text-[10px] text-slate-600 bg-slate-50 rounded-md px-2 py-0.5 mt-1 inline-block">
                        Note: {act.notes}
                      </p>
                    )}
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
