"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  AlertCircle,
} from "lucide-react";

interface WorkOrder {
  id: string;
  orderNumber: string;
  title: string;
  status: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  scheduledDate?: string | null;
  customer?: { name: string; address?: string | null; city?: string | null };
  technician?: { name: string };
}

export default function ScheduleView() {
  const [currentDate] = useState("Today, " + new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/work-orders")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setWorkOrders(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Failed to load schedule work orders:", err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "border-l-4 border-l-emerald-500 bg-emerald-50/50";
      case "IN_PROGRESS":
        return "border-l-4 border-l-purple-500 bg-purple-50/50";
      case "ASSIGNED":
        return "border-l-4 border-l-blue-500 bg-blue-50/50";
      case "OPEN":
        return "border-l-4 border-l-amber-500 bg-amber-50/50";
      default:
        return "border-l-4 border-l-slate-400 bg-slate-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Dispatch Calendar & Timeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time technician scheduling, on-site shifts, and SLA arrival windows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
          <span className="text-xs font-bold text-slate-900 px-2">
            {currentDate}
          </span>
          <button className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Schedule Timeline Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span>Live Dispatch Queue ({workOrders.length} Work Orders)</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            Database Synced
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xs font-semibold">Loading schedule timeline...</p>
          </div>
        ) : workOrders.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <AlertCircle className="w-8 h-8 text-slate-300" />
            <p className="text-xs font-semibold">No work orders scheduled yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workOrders.map((wo) => (
              <div
                key={wo.id}
                className={`p-4 rounded-2xl border border-slate-200/80 ${getStatusStyle(
                  wo.status
                )} transition-all space-y-2`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {wo.scheduledDate
                      ? new Date(wo.scheduledDate).toLocaleDateString() + " " + new Date(wo.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : "Window TBD"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200 w-fit">
                      {wo.status.replace("_", " ")}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-900 text-white w-fit">
                      {wo.priority}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900">
                  {wo.orderNumber}: {wo.title}
                </h4>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {wo.customer?.name || "Unassigned Customer"}
                    {wo.customer?.city ? ` (${wo.customer.city})` : ""}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-blue-700">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    {wo.technician?.name || "Unassigned Tech"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
