"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SidebarItemKey } from "@/components/dashboard/Sidebar";
import AdminDashboard from "@/components/dashboard/views/dashboards/AdminDashboard";
import DispatcherDashboard from "@/components/dashboard/views/dashboards/DispatcherDashboard";
import TechnicianDashboard from "@/components/dashboard/views/dashboards/TechnicianDashboard";

interface DashboardViewProps {
  onNavigate: (tab: SidebarItemKey) => void;
  role?: "ADMIN" | "DISPATCHER" | "TECHNICIAN";
}

export default function DashboardView({
  onNavigate,
  role = "DISPATCHER",
}: DashboardViewProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        throw new Error("Failed to load dashboard data from server");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("[DASHBOARD_FETCH_ERROR]", err);
      setError(err.message || "An error occurred while fetching dashboard analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Loading Skeleton State
  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse p-2 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 rounded-2xl" />
            <div className="h-4 w-96 bg-slate-100 rounded-xl" />
          </div>
          <div className="h-10 w-32 bg-slate-200 rounded-xl" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200/70 rounded-2xl" />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-200/70 rounded-3xl" />
          <div className="h-72 bg-slate-200/70 rounded-3xl" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200/70 rounded-3xl" />
          <div className="h-64 bg-slate-200/70 rounded-3xl" />
        </div>
      </div>
    );
  }

  // Error State
  if (error && !data) {
    return (
      <div className="p-8 max-w-lg mx-auto my-12 bg-white rounded-3xl border border-rose-200 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900">Failed to Load Dashboard</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 cursor-pointer transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const effectiveRole = data?.role || role;

  // Render role-specific tailored dashboard
  if (effectiveRole === "ADMIN") {
    return (
      <AdminDashboard
        data={data}
        onNavigate={onNavigate}
        onRefresh={fetchDashboardData}
        loading={loading}
      />
    );
  }

  if (effectiveRole === "TECHNICIAN") {
    return (
      <TechnicianDashboard
        data={data}
        onNavigate={onNavigate}
        onRefresh={fetchDashboardData}
        loading={loading}
      />
    );
  }

  // Default: DISPATCHER dashboard
  return (
    <DispatcherDashboard
      data={data}
      onNavigate={onNavigate}
      onRefresh={fetchDashboardData}
      loading={loading}
    />
  );
}
