"use client";

import { useState, useEffect, useCallback } from "react";
import { SidebarItemKey } from "@/components/dashboard/Sidebar";
import AdminDashboard from "./dashboards/AdminDashboard";
import DispatcherDashboard from "./dashboards/DispatcherDashboard";
import TechnicianDashboard from "./dashboards/TechnicianDashboard";

interface DashboardViewProps {
  onNavigate: (tab: SidebarItemKey) => void;
  role?: "ADMIN" | "DISPATCHER" | "TECHNICIAN";
}

export default function DashboardView({
  onNavigate,
  role = "DISPATCHER",
}: DashboardViewProps) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        throw new Error("Failed to load dashboard analytics");
      }
      const data = await res.json();
      setDashboardData(data);
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
          setDashboardData(data);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  if (role === "ADMIN") {
    return (
      <AdminDashboard
        data={dashboardData}
        onNavigate={onNavigate}
        onRefresh={fetchDashboardData}
        loading={loading}
      />
    );
  }

  if (role === "TECHNICIAN") {
    return (
      <TechnicianDashboard
        data={dashboardData}
        onNavigate={onNavigate}
        onRefresh={fetchDashboardData}
        loading={loading}
      />
    );
  }

  return (
    <DispatcherDashboard
      data={dashboardData}
      onNavigate={onNavigate}
      onRefresh={fetchDashboardData}
      loading={loading}
    />
  );
}
