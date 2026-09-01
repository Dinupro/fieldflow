"use client";

import { useState } from "react";
import {
  FileText,
  Users,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ArrowRight,
  Plus,
  Filter,
  MapPin,
  Sparkles,
  ShieldCheck,
  DollarSign,
  MoreVertical,
} from "lucide-react";

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const stats = [
    {
      label: "Active Work Orders",
      value: "148",
      subtext: "14 urgent (under 2hr SLA)",
      trend: "+12% this week",
      icon: FileText,
      color: "from-blue-600 to-indigo-600",
      accentBg: "bg-blue-50 text-blue-600",
    },
    {
      label: "Available Field Techs",
      value: "42",
      subtext: "28 en route, 18 on-site",
      trend: "45k+ nationwide",
      icon: Users,
      color: "from-emerald-600 to-teal-600",
      accentBg: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "SLA Compliance Rate",
      value: "99.4%",
      subtext: "Avg. arrival in 14.2 mins",
      trend: "+0.6% vs target",
      icon: Clock,
      color: "from-amber-500 to-orange-600",
      accentBg: "bg-amber-50 text-amber-600",
    },
    {
      label: "Invoiced This Month",
      value: "$184,250",
      subtext: "Automated escrow release",
      trend: "+24% YoY",
      icon: DollarSign,
      color: "from-purple-600 to-pink-600",
      accentBg: "bg-purple-50 text-purple-600",
    },
  ];

  const recentJobs = [
    {
      id: "FL-8924",
      title: "High-Density WiFi 6 AP & Fiber Testing",
      customer: "Apex Logistics Hub #4",
      location: "Austin, TX 78701",
      tech: "Marcus Vance",
      techAvatar: "MV",
      priority: "Urgent (2hr SLA)",
      status: "En Route",
      statusColor: "bg-blue-100 text-blue-800 border-blue-200",
      time: "ETA 12 mins",
      amount: "$840.00",
    },
    {
      id: "FL-8925",
      title: "Self-Checkout POS Terminal Cutover",
      customer: "OmniRetail SuperCenter",
      location: "Dallas, TX 75001",
      tech: "Devon Miller",
      techAvatar: "DM",
      priority: "Scheduled",
      status: "On-Site",
      statusColor: "bg-purple-100 text-purple-800 border-purple-200",
      time: "Started 45m ago",
      amount: "$1,250.00",
    },
    {
      id: "FL-8926",
      title: "Cisco Core Switch 9300 Hardware Replacement",
      customer: "MetroLink Telecom Node",
      location: "Houston, TX 77002",
      tech: "Sarah Lin",
      techAvatar: "SL",
      priority: "Critical SLA",
      status: "Completed",
      statusColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      time: "Signoff Received",
      amount: "$640.00",
    },
    {
      id: "FL-8927",
      title: "Biometric IP Access Control System Install",
      customer: "Nexus Healthcare Campus",
      location: "San Antonio, TX 78201",
      tech: "Travis Vance",
      techAvatar: "TV",
      priority: "Standard",
      status: "Open Dispatch",
      statusColor: "bg-amber-100 text-amber-800 border-amber-200",
      time: "Matching Tech...",
      amount: "$980.00",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Welcome & Fast Action Buttons */}
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-slate-900 via-slate-900 to-blue-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Field Service Operations Command</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Dispatch Center Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time monitoring across 148 active work orders, 42 deployed field engineers, and 99.4% SLA adherence.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate("work-orders")}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Work Order</span>
          </button>
          <button
            onClick={() => onNavigate("technicians")}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 text-slate-400" />
            <span>View Technicians</span>
          </button>
        </div>
      </div>

      {/* 4 Main Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const SIcon = s.icon;
          return (
            <div
              key={s.label}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-2xl ${s.accentBg}`}>
                  <SIcon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {s.trend}
                </span>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {s.value}
                </h3>
                <h4 className="text-xs font-bold text-slate-700 mt-0.5">
                  {s.label}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">{s.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Map / Telemetry & Active Status Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Recent Work Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Live Work Order Stream
              </h3>
              <p className="text-xs text-slate-500">
                Current dispatch jobs requiring continuous milestone tracking.
              </p>
            </div>
            <button
              onClick={() => onNavigate("work-orders")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400">
                <tr>
                  <th className="pb-3 font-semibold">Job ID & Scope</th>
                  <th className="pb-3 font-semibold">Customer & Location</th>
                  <th className="pb-3 font-semibold">Assigned Tech</th>
                  <th className="pb-3 font-semibold">Live Status</th>
                  <th className="pb-3 font-semibold text-right">Escrow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3.5 pr-3">
                      <span className="font-extrabold text-blue-600 block">
                        {job.id}
                      </span>
                      <span className="font-bold text-slate-900 block truncate max-w-xs">
                        {job.title}
                      </span>
                      <span className="text-[10px] text-amber-700 font-semibold">
                        {job.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-slate-800 block truncate max-w-[140px]">
                        {job.customer}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                          {job.techAvatar}
                        </div>
                        <span className="font-medium text-slate-800">
                          {job.tech}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${job.statusColor}`}
                      >
                        <Radio className="w-2.5 h-2.5 animate-pulse" />
                        {job.status}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {job.time}
                      </span>
                    </td>

                    <td className="py-3.5 pl-3 text-right">
                      <span className="font-bold text-slate-900 block">
                        {job.amount}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        Escrow Funded
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 Cols: Live Telemetry & Quick Dispatch Widget */}
        <div className="lg:col-span-4 space-y-6">
          {/* Real-time GPS Telemetry Radar Widget */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Live Geospatial Radar
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                50-mi Radius
              </span>
            </div>

            <div className="h-36 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700/60 p-4 relative flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
              <div className="relative z-10 flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Austin Operations Cluster</span>
                <span className="text-emerald-400">18 Techs Online</span>
              </div>
              <div className="relative z-10 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center mx-auto animate-ping">
                  <div className="w-3 h-3 rounded-full bg-cyan-400" />
                </div>
              </div>
              <div className="relative z-10 flex justify-between text-[11px] text-slate-400">
                <span>Avg ETA: 14.8 min</span>
                <span>Signal: High Precision</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Active Milestones Broadcast</span>
                <span className="text-emerald-400 font-bold">100% In Range</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Escalation SLA Buffer</span>
                <span className="text-blue-400 font-bold">&gt; 35 mins remaining</span>
              </div>
            </div>
          </div>

          {/* SLA Quality Guarantee Card */}
          <div className="p-5 rounded-3xl bg-blue-50/60 border border-blue-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Enterprise SLA Compliance</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated escalation triggers are active for 14 emergency 2-hour tickets. No SLA penalties incurred this month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
