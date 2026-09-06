"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Activity,
  FileText,
  Building2,
  Wrench,
  Clock,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";

function RefreshIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

function CopyIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function DatabaseIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
      />
    </svg>
  );
}

interface AuditLogItem {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userRole: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  entityName: string | null;
  description: string;
  metadata: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    role: string | null;
    image: string | null;
  } | null;
}

interface ActorOption {
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userRole: string | null;
}

interface ActivityLogsViewProps {
  role?: "ADMIN" | "DISPATCHER" | "TECHNICIAN";
}

function getActionBadgeStyle(action: string) {
  if (action.includes("CREATE")) {
    return {
      bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700",
      dot: "bg-emerald-500",
      label: action.replace(/_/g, " "),
    };
  }
  if (action.includes("DELETE") || action.includes("CANCEL")) {
    return {
      bg: "bg-rose-500/10 border-rose-500/30 text-rose-700",
      dot: "bg-rose-500",
      label: action.replace(/_/g, " "),
    };
  }
  if (action.includes("COMPLETE") || action.includes("CLOSE")) {
    return {
      bg: "bg-teal-500/10 border-teal-500/30 text-teal-700",
      dot: "bg-teal-500",
      label: action.replace(/_/g, " "),
    };
  }
  if (action.includes("START") || action.includes("RESUME") || action.includes("ACCEPT")) {
    return {
      bg: "bg-blue-500/10 border-blue-500/30 text-blue-700",
      dot: "bg-blue-500",
      label: action.replace(/_/g, " "),
    };
  }
  if (action.includes("PAUSE") || action.includes("STATUS_CHANGE")) {
    return {
      bg: "bg-amber-500/10 border-amber-500/30 text-amber-700",
      dot: "bg-amber-500",
      label: action.replace(/_/g, " "),
    };
  }
  if (action.includes("ROLE") || action.includes("USER")) {
    return {
      bg: "bg-purple-500/10 border-purple-500/30 text-purple-700",
      dot: "bg-purple-500",
      label: action.replace(/_/g, " "),
    };
  }
  return {
    bg: "bg-slate-500/10 border-slate-500/30 text-slate-700",
    dot: "bg-slate-500",
    label: action.replace(/_/g, " "),
  };
}

function getEntityIcon(entityType: string) {
  switch (entityType) {
    case "WORK_ORDER":
      return FileText;
    case "CUSTOMER":
      return Building2;
    case "TECHNICIAN":
      return Wrench;
    case "USER":
      return User;
    default:
      return Activity;
  }
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffSec < 45) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function ActivityLogsView({ role = "DISPATCHER" }: ActivityLogsViewProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actorsList, setActorsList] = useState<ActorOption[]>([]);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [actorUserId, setActorUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    totalAuditedEvents: 0,
    filteredTotal: 0,
    todayCount: 0,
    uniqueActorsCount: 1,
  });

  // Forensic Detail Modal State
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  const fetchAuditLogs = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (entityType && entityType !== "ALL") params.set("entityType", entityType);
      if (actionFilter && actionFilter !== "ALL") params.set("action", actionFilter);
      if (userRoleFilter && userRoleFilter !== "ALL") params.set("userRole", userRoleFilter);
      if (actorUserId) params.set("userId", actorUserId);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      params.set("sortBy", "createdAt");
      params.set("sortOrder", "desc");

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
        if (data.stats) {
          setStats(data.stats);
        }
        if (data.actorsList) {
          setActorsList(data.actorsList);
        }
      }
    } catch (err) {
      console.error("[FETCH_AUDIT_LOGS_ERROR]", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, entityType, actionFilter, userRoleFilter, actorUserId, startDate, endDate, page, limit]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Reset page when filters change
  const handleFilterChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setEntityType("ALL");
    setActionFilter("ALL");
    setUserRoleFilter("ALL");
    setActorUserId("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleCopyJson = () => {
    if (!selectedLog) return;
    navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleExportCsv = () => {
    if (logs.length === 0) return;

    const headers = ["ID", "Timestamp (UTC)", "Actor Name", "Actor Email", "Actor Role", "Action", "Entity Type", "Entity ID", "Entity Name", "Description", "IP Address"];
    const rows = logs.map((log) => [
      `"${log.id}"`,
      `"${log.createdAt}"`,
      `"${log.userName || "System"}"`,
      `"${log.userEmail || "system@fieldflow.io"}"`,
      `"${log.userRole || "SYSTEM"}"`,
      `"${log.action}"`,
      `"${log.entityType}"`,
      `"${log.entityId || ""}"`,
      `"${(log.entityName || "").replace(/"/g, '""')}"`,
      `"${(log.description || "").replace(/"/g, '""')}"`,
      `"${log.ipAddress || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FieldFlow_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-slate-950/10 border border-slate-700/60 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            Immutable Audit Trail & Activity Log
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            System & Operations Audit Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Cryptographically tracked audit stream recording entity mutations, authentication logs, lifecycle state transitions, and administrative privilege modifications.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            type="button"
            onClick={() => fetchAuditLogs(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600/80 text-xs font-bold text-slate-200 transition-all cursor-pointer shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
          >
            <RefreshIcon className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-blue-400" : ""}`} />
            <span>{refreshing ? "Syncing..." : "Refresh"}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-600/25 active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Audited Events
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DatabaseIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.totalAuditedEvents.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              Neon Live
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Recorded in immutable database log</p>
        </div>

        {/* 24h Velocity */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              24h Activity Velocity
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              {stats.todayCount.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              Past 24h
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Operations logged across workforce</p>
        </div>

        {/* Active Actors */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Team Actors
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-600">
              {stats.uniqueActorsCount}
            </span>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
              Dispatched
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Unique users triggering audit actions</p>
        </div>

        {/* Compliance Guard */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Integrity & Compliance
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-teal-700">
              100%
            </span>
            <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
              SOC 2 Ready
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Append-only log architecture</p>
        </div>
      </div>

      {/* 3. Search & Multi-Filter Control Bar */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by keyword, actor name/email, entity name or IP..."
              value={search}
              onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              className="w-full pl-9.5 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-2xl text-xs font-medium text-slate-900 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => handleFilterChange(setSearch, "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Entity Type Filter */}
          <div>
            <select
              value={entityType}
              onChange={(e) => handleFilterChange(setEntityType, e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-2xl text-xs font-semibold text-slate-700 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none cursor-pointer"
            >
              <option value="ALL">All Entity Types</option>
              <option value="WORK_ORDER">Work Orders</option>
              <option value="CUSTOMER">Customers CRM</option>
              <option value="TECHNICIAN">Technicians Roster</option>
              <option value="USER">User Roles & Access</option>
              <option value="AUTH">Authentication</option>
              <option value="SYSTEM">System Events</option>
            </select>
          </div>

          {/* Actor Filter */}
          <div>
            <select
              value={actorUserId}
              onChange={(e) => handleFilterChange(setActorUserId, e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-2xl text-xs font-semibold text-slate-700 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none cursor-pointer"
            >
              <option value="">All Actors / Users</option>
              {actorsList.map((act, idx) => (
                <option key={act.userId || `act-${idx}`} value={act.userId || ""}>
                  {act.userName || act.userEmail || "System"} ({act.userRole || "SYSTEM"})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Filter Row: Date Range & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-400 uppercase">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleFilterChange(setStartDate, e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-400 uppercase">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleFilterChange(setEndDate, e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer"
              />
            </div>

            {/* Quick Entity Pills */}
            <div className="hidden xl:flex items-center gap-1.5 ml-2">
              {["ALL", "WORK_ORDER", "CUSTOMER", "TECHNICIAN", "USER"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleFilterChange(setEntityType, tab)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    entityType === tab
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab === "ALL" ? "All" : tab.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {(search || entityType !== "ALL" || actionFilter !== "ALL" || actorUserId || startDate || endDate) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Audit Log Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">Querying live audit trail from Neon PostgreSQL...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No matching audit logs found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No activity logs match your current filter parameters. Try clearing the search or date range.
            </p>
            {(search || entityType !== "ALL" || actorUserId || startDate || endDate) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 pl-6 pr-4">Timestamp & IP</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Action & Entity</th>
                  <th className="py-3.5 px-4">Event Description</th>
                  <th className="py-3.5 pr-6 pl-4 text-right">Forensic Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {logs.map((log) => {
                  const badge = getActionBadgeStyle(log.action);
                  const EntityIcon = getEntityIcon(log.entityType);

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Timestamp & IP */}
                      <td className="py-4 pl-6 pr-4 align-top min-w-40">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">
                            {formatRelativeTime(log.createdAt)}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(log.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                          {log.ipAddress && (
                            <span className="text-[10px] font-mono text-slate-400 mt-1">
                              IP: {log.ipAddress}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="py-4 px-4 align-top min-w-48">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 to-indigo-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {(log.userName || log.userEmail || "SY").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-900 truncate">
                              {log.userName || log.userEmail || "System Automated"}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                                  log.userRole === "ADMIN"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : log.userRole === "TECHNICIAN"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : log.userRole === "DISPATCHER"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                {log.userRole || "SYSTEM"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action & Entity */}
                      <td className="py-4 px-4 align-top min-w-56">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${badge.bg}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              {badge.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-[11px]">
                            <EntityIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-44 text-slate-800 font-bold">
                              {log.entityName || log.entityId || log.entityType}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-4 px-4 align-top">
                        <p className="text-slate-700 font-medium leading-relaxed">
                          {log.description}
                        </p>
                      </td>

                      {/* Forensic Detail Button */}
                      <td className="py-4 pr-6 pl-4 align-top text-right shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs transition-colors cursor-pointer border border-slate-200/80 hover:border-blue-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Pagination Controls */}
        {totalCount > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{(page - 1) * limit + 1}</span> to{" "}
              <span className="font-bold text-slate-800">{Math.min(page * limit, totalCount)}</span> of{" "}
              <span className="font-bold text-slate-800">{totalCount.toLocaleString()}</span> entries
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-bold text-slate-800 bg-slate-100 rounded-lg text-xs">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Forensic Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Forensic Audit Inspection</h3>
                  <p className="text-xs text-slate-400">Event ID: {selectedLog.id}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 text-xs">
              {/* Event Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Action</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedLog.action}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Entity Type</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedLog.entityType}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Timestamp (UTC)</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {new Date(selectedLog.createdAt).toISOString()}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Actor</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {selectedLog.userName || selectedLog.userEmail || "System"}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Actor Role</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedLog.userRole || "SYSTEM"}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client IP</span>
                  <p className="font-bold font-mono text-slate-900 mt-0.5">{selectedLog.ipAddress || "Internal Server"}</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Event Narrative</span>
                <p className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 text-slate-800 font-semibold leading-relaxed">
                  {selectedLog.description}
                </p>
              </div>

              {/* Entity Identifier */}
              {selectedLog.entityId && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Entity Target ID</span>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 select-all">
                    {selectedLog.entityId}
                  </div>
                </div>
              )}

              {/* JSON Metadata Diff Payload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    State Mutation Payload (JSON)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <CopyIcon className="w-3.5 h-3.5" />}
                    <span>{copiedJson ? "Copied" : "Copy Payload"}</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto text-emerald-400 font-mono text-[11px] leading-relaxed max-h-56 custom-scrollbar">
                  <pre>{JSON.stringify(selectedLog.metadata || {}, null, 2)}</pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
