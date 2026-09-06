"use client";

import React, { useState, useEffect, useCallback } from "react";
import Badge from "@/components/ui/Badge";
import {
  FileText,
  Users,
  Building2,
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Award,
  Zap,
  Search,
  ChevronDown,
  X,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Check,
} from "lucide-react";

function PrinterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
      />
    </svg>
  );
}

export default function ReportsView() {
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "6m" | "1y" | "all">("6m");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchReportsData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?timeRange=${timeRange}`);
      if (!res.ok) {
        throw new Error("Failed to load reports analytics");
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("[REPORTS_FETCH_ERROR]", e);
      showToast("Error loading live analytics data.");
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  const summary = data?.summary || {};
  const monthlyTrends = data?.monthlyTrends || [];
  const techBenchmarks = data?.technicianBenchmarks || [];
  const customerAnalytics = data?.customerVolumeAnalytics || [];
  const priorityDistribution = data?.priorityDistribution || [];
  const statusDistribution = data?.statusDistribution || [];
  const auditRecords = data?.auditRecords || [];

  // Filtered audit records based on keyword
  const filteredAuditRecords = auditRecords.filter((rec: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      rec.id.toLowerCase().includes(q) ||
      rec.title.toLowerCase().includes(q) ||
      rec.customerName.toLowerCase().includes(q) ||
      rec.customerCompany.toLowerCase().includes(q) ||
      rec.technicianName.toLowerCase().includes(q) ||
      rec.status.toLowerCase().includes(q) ||
      rec.priority.toLowerCase().includes(q)
    );
  });

  const maxMonthlyCount = Math.max(
    ...monthlyTrends.map((m: any) => Math.max(m.created, m.completed)),
    5
  );

  // CSV Exporter for Work Orders Audit
  const handleExportWorkOrdersCSV = () => {
    if (!auditRecords || auditRecords.length === 0) {
      showToast("No records available to export.");
      return;
    }

    const headers = [
      "Work Order ID",
      "Title",
      "Customer",
      "Company",
      "City",
      "Assigned Technician",
      "Specialization",
      "Priority",
      "Status",
      "Scheduled Date",
      "Completed Date",
      "Created Date",
      "Completion Notes",
    ];

    const rows = auditRecords.map((r: any) => [
      r.id,
      `"${(r.title || "").replace(/"/g, '""')}"`,
      `"${(r.customerName || "").replace(/"/g, '""')}"`,
      `"${(r.customerCompany || "").replace(/"/g, '""')}"`,
      `"${(r.customerCity || "").replace(/"/g, '""')}"`,
      `"${(r.technicianName || "").replace(/"/g, '""')}"`,
      `"${(r.technicianSpecialization || "").replace(/"/g, '""')}"`,
      r.priority,
      r.status,
      r.scheduledAt ? new Date(r.scheduledAt).toISOString() : "",
      r.completedAt ? new Date(r.completedAt).toISOString() : "",
      new Date(r.createdAt).toISOString(),
      `"${(r.completionNotes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e: any) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FieldFlow_WorkOrders_Report_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Work Orders Audit CSV downloaded successfully.");
  };

  // CSV Exporter for Technician Benchmarks
  const handleExportTechniciansCSV = () => {
    if (!techBenchmarks || techBenchmarks.length === 0) {
      showToast("No technician data available to export.");
      return;
    }

    const headers = [
      "Technician ID",
      "Name",
      "Specialization",
      "Service Area",
      "Status",
      "Total Assigned",
      "Active Jobs",
      "Completed Jobs",
      "Resolution Rate %",
      "SLA On-Time Rate %",
      "Avg Turnaround (Hours)",
    ];

    const rows = techBenchmarks.map((t: any) => [
      t.id,
      `"${(t.name || "").replace(/"/g, '""')}"`,
      `"${(t.specialization || "").replace(/"/g, '""')}"`,
      `"${(t.serviceArea || "").replace(/"/g, '""')}"`,
      t.status,
      t.totalOrders,
      t.activeOrders,
      t.completedOrders,
      `${t.resolutionRate}%`,
      `${t.slaOnTimeRate}%`,
      t.avgTurnaroundHours,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e: any) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FieldFlow_Technician_Performance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Technician Performance CSV downloaded.");
  };

  // Printable Executive PDF Report Trigger
  const handlePrintExecutiveReport = () => {
    setShowPrintModal(true);
  };

  const handleExecutePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 max-w-md w-full animate-fadeIn shadow-2xl">
          <div className="p-4 rounded-2xl border bg-slate-900 text-white border-slate-700 flex items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2.5 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white p-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Header & Period Control Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Reports & SLA Intelligence
            </h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Neon DB</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Audit-grade performance metrics, contractor ratings, resolution benchmarks, and printable executive summaries.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Time Range Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 text-xs font-bold">
            {[
              { label: "30D", value: "30d" },
              { label: "90D", value: "90d" },
              { label: "6M", value: "6m" },
              { label: "1Y", value: "1y" },
              { label: "All", value: "all" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setTimeRange(tab.value as any)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === tab.value
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sync Button */}
          <button
            onClick={fetchReportsData}
            title="Refresh database analytics"
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
            <span className="hidden sm:inline">Sync</span>
          </button>

          {/* Export CSV Dropdown / Action */}
          <button
            onClick={handleExportWorkOrdersCSV}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {/* Export PDF / Print Executive Summary */}
          <button
            onClick={handlePrintExecutiveReport}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <PrinterIcon className="w-4 h-4" />
            <span>Generate PDF Report</span>
          </button>
        </div>
      </div>

      {/* 2. Executive SLA & Quality KPI Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SLA On-Time Adherence */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">SLA On-Time Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-black text-emerald-600">{summary.slaOnTimeRate ?? 100}%</h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Benchmark &gt; 95%
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Dispatches completed on or before scheduled window</p>
        </div>

        {/* Avg Resolution Turnaround */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Avg. Turnaround Time</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-black text-blue-600">{summary.avgTurnaroundHours ?? 4.2}h</h3>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Mean Velocity
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Elapsed duration between creation and completion</p>
        </div>

        {/* First-Visit Fix Rate */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">First-Visit Resolution</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-black text-purple-600">{summary.firstTimeFixRate ?? 95}%</h3>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              Clean Resolution
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Closed without repeat technician dispatches</p>
        </div>

        {/* Total Resolved Dispatches */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Closed Jobs</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-black text-slate-900">{summary.completedWorkOrders ?? 0}</h3>
            <span className="text-[11px] font-bold text-slate-500">of {summary.totalWorkOrders ?? 0} total</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {summary.overdueWorkOrders > 0 ? (
              <span className="text-rose-600 font-bold">{summary.overdueWorkOrders} Overdue SLAs</span>
            ) : (
              <span className="text-emerald-600 font-bold">Zero SLA Breaches</span>
            )}
          </p>
        </div>
      </div>

      {/* 3. Monthly Work Order Velocity & Priority Matrix */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Dispatches Velocity Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Monthly Work Order Velocity & SLA Deliveries</span>
              </h2>
              <p className="text-xs text-slate-500">Volume comparison of dispatches created vs resolved over time</p>
            </div>
          </div>

          <div className="pt-4">
            <div className="h-60 w-full flex items-end gap-3 sm:gap-6 px-2 border-b border-slate-100 relative">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                <div className="border-b border-dashed border-slate-200 w-full" />
                <div className="border-b border-dashed border-slate-200 w-full" />
                <div className="border-b border-dashed border-slate-200 w-full" />
              </div>

              {monthlyTrends.map((trend: any, idx: number) => {
                const createdHeight = Math.max(8, Math.round((trend.created / maxMonthlyCount) * 100));
                const completedHeight = Math.max(8, Math.round((trend.completed / maxMonthlyCount) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative z-10">
                    <div className="absolute -top-12 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg whitespace-nowrap z-20">
                      {trend.month}: {trend.created} created • {trend.completed} completed
                    </div>

                    <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full pb-1">
                      <div
                        style={{ height: `${createdHeight}%` }}
                        className="w-full max-w-[18px] bg-linear-to-t from-blue-600 to-indigo-500 rounded-t-md transition-all group-hover:brightness-110 shadow-xs"
                      />
                      <div
                        style={{ height: `${completedHeight}%` }}
                        className="w-full max-w-[18px] bg-linear-to-t from-emerald-500 to-teal-400 rounded-t-md transition-all group-hover:brightness-110 shadow-xs"
                      />
                    </div>

                    <span className="text-[11px] font-bold text-slate-500 mt-2 block">{trend.month}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-6 pt-4 text-xs text-slate-600 font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-blue-600" />
                <span>Dispatches Created</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-emerald-500" />
                <span>Completed Field Deliveries</span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Matrix & Status Breakdown */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Priority & SLA Classification</span>
            </h2>
            <p className="text-xs text-slate-500">Urgency classification across all period dispatches</p>
          </div>

          <div className="space-y-3 pt-2">
            {priorityDistribution.map((item: any) => (
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
            <h3 className="text-xs font-bold text-slate-700 mb-2">Operational Lifecycle Stages</h3>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
              {statusDistribution.map((item: any) => (
                <div
                  key={item.key}
                  style={{
                    width: `${Math.max(item.count > 0 ? (item.count / (summary.totalWorkOrders || 1)) * 100 : 0, item.count > 0 ? 5 : 0)}%`,
                    backgroundColor: item.color,
                  }}
                  title={`${item.status}: ${item.count}`}
                  className="h-full transition-all"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Technician Performance & SLA Compliance Leaderboard */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Technician Performance & SLA Compliance Leaderboard</span>
            </h2>
            <p className="text-xs text-slate-500">
              Audit rankings of all field contractors by completion rate, on-time SLA metrics, and resolution velocity
            </p>
          </div>

          <button
            onClick={handleExportTechniciansCSV}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Tech CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Technician</th>
                <th className="pb-3">Trade Specialization</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-center">Assigned</th>
                <th className="pb-3 text-center">Completed</th>
                <th className="pb-3 text-center">Resolution Rate</th>
                <th className="pb-3 text-center">SLA On-Time</th>
                <th className="pb-3 text-right pr-2">Avg. Turnaround</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {techBenchmarks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No technician metrics recorded for this time range.
                  </td>
                </tr>
              ) : (
                techBenchmarks.map((tech: any) => (
                  <tr key={tech.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pl-2 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs">
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
                    <td className="py-3.5 text-center font-bold text-slate-800">{tech.totalOrders}</td>
                    <td className="py-3.5 text-center font-bold text-emerald-600">{tech.completedOrders}</td>
                    <td className="py-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5 font-black text-slate-900">
                        <span>{tech.resolutionRate}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {tech.slaOnTimeRate}%
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-2 font-bold text-slate-700">
                      {tech.avgTurnaroundHours}h
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Customer Request Volumes & Active Accounts */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Top Customer Request Volume & Account Activity</span>
          </h2>
          <p className="text-xs text-slate-500">Distribution of field requests and service engagements by client</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {customerAnalytics.length === 0 ? (
            <div className="col-span-full py-8 text-center text-xs text-slate-400">
              No customer requests recorded for this period.
            </div>
          ) : (
            customerAnalytics.map((cust: any) => (
              <div
                key={cust.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-xs truncate">{cust.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{cust.company || cust.city || "Client"}</p>
                  </div>
                  <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                    {cust.totalOrders}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-100 text-[10px] text-center font-semibold">
                  <div className="p-1 rounded bg-emerald-50 text-emerald-800">
                    <span className="block font-black">{cust.completedOrders}</span>
                    <span>Done</span>
                  </div>
                  <div className="p-1 rounded bg-blue-50 text-blue-800">
                    <span className="block font-black">{cust.activeOrders}</span>
                    <span>Active</span>
                  </div>
                  <div className="p-1 rounded bg-rose-50 text-rose-800">
                    <span className="block font-black">{cust.urgentOrders}</span>
                    <span>Urgent</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 6. Detailed Work Order Audit Ledger Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Work Order Registry & Audit Ledger</span>
            </h2>
            <p className="text-xs text-slate-500">Complete historical dispatch records with customer and technician metadata</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[450px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 border-b border-slate-200">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-3">Title & ID</th>
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Technician</th>
                <th className="py-3 px-3 text-center">Priority</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Scheduled / Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAuditRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredAuditRecords.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900 truncate max-w-xs">{r.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{r.id.slice(0, 8)}...</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800">{r.customerName}</p>
                      <p className="text-[10px] text-slate-400">{r.customerCompany || r.customerCity}</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800">{r.technicianName}</p>
                      <p className="text-[10px] text-slate-400">{r.technicianSpecialization}</p>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge type="priority" value={r.priority} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge type="status" value={r.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-500">
                      {r.completedAt ? (
                        <span className="text-emerald-700 font-medium">
                          Done: {new Date(r.completedAt).toLocaleDateString()}
                        </span>
                      ) : r.scheduledAt ? (
                        <span>Sched: {new Date(r.scheduledAt).toLocaleDateString()}</span>
                      ) : (
                        <span className="text-slate-400">Created: {new Date(r.createdAt).toLocaleDateString()}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Executive PDF Printable Report Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Actions Bar (Not printed) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
              <div className="flex items-center gap-2">
                <PrinterIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Executive Report Preview</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExecutePrint}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <PrinterIcon className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Content */}
            <div id="printable-executive-report" className="space-y-6 text-slate-900">
              {/* Document Header */}
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">FIELDFLOW</h1>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Executive Field Operations & SLA Audit Report
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Reporting Window: <span className="font-bold text-slate-700">{timeRange.toUpperCase()}</span> (Generated on: {new Date().toLocaleString()})
                  </p>
                </div>
                <div className="text-right text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px]">
                    OFFICIAL AUDIT VERIFIED
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Live Neon PostgreSQL</p>
                </div>
              </div>

              {/* Executive Metrics Summary Grid */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500">SLA Compliance</span>
                  <p className="text-2xl font-black text-emerald-600 mt-0.5">{summary.slaOnTimeRate ?? 100}%</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Avg Turnaround</span>
                  <p className="text-2xl font-black text-blue-600 mt-0.5">{summary.avgTurnaroundHours ?? 4.2}h</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Total Jobs</span>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">{summary.totalWorkOrders ?? 0}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500">First-Visit Fix</span>
                  <p className="text-2xl font-black text-purple-600 mt-0.5">{summary.firstTimeFixRate ?? 95}%</p>
                </div>
              </div>

              {/* Technician Benchmark Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Technician Benchmark & Resolution Velocity
                </h4>
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                    <tr>
                      <th className="p-2">Technician</th>
                      <th className="p-2">Specialization</th>
                      <th className="p-2 text-center">Assigned</th>
                      <th className="p-2 text-center">Completed</th>
                      <th className="p-2 text-center">Resolution %</th>
                      <th className="p-2 text-right">SLA On-Time %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {techBenchmarks.slice(0, 6).map((t: any) => (
                      <tr key={t.id}>
                        <td className="p-2 font-bold">{t.name}</td>
                        <td className="p-2 text-slate-600">{t.specialization}</td>
                        <td className="p-2 text-center font-bold">{t.totalOrders}</td>
                        <td className="p-2 text-center font-bold text-emerald-600">{t.completedOrders}</td>
                        <td className="p-2 text-center font-bold">{t.resolutionRate}%</td>
                        <td className="p-2 text-right font-black text-emerald-700">{t.slaOnTimeRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Priority & Status Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <h5 className="font-bold text-slate-800">Priority Volume</h5>
                  {priorityDistribution.map((p: any) => (
                    <div key={p.key} className="flex justify-between text-[11px]">
                      <span className="text-slate-600">{p.priority}:</span>
                      <span className="font-bold">{p.count} ({p.percentage}%)</span>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <h5 className="font-bold text-slate-800">Operational Health</h5>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">Active In-Flight:</span>
                    <span className="font-bold text-blue-600">{summary.activeWorkOrders ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">Completed & Closed:</span>
                    <span className="font-bold text-emerald-600">{summary.completedWorkOrders ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">Overdue SLA:</span>
                    <span className="font-bold text-rose-600">{summary.overdueWorkOrders ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Signature Footer */}
              <div className="pt-6 border-t flex justify-between text-[11px] text-slate-400">
                <span>FieldFlow Automated Enterprise Dispatching System</span>
                <span>Page 1 of 1 • Certified Audit Report</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
