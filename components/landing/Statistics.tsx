"use client";

import {
  Users,
  CheckCircle,
  Clock,
  Award,
  TrendingUp,
  ShieldCheck,
  DollarSign,
  Activity,
} from "lucide-react";

export default function Statistics() {
  const stats = [
    {
      label: "Vetted & Certified Technicians",
      value: "45,000+",
      subtext: "Nationwide coverage across all 50 states & major metro hubs",
      icon: Users,
      trend: "+28% YoY Growth",
      color: "from-blue-600 to-indigo-600",
      accentBg: "bg-blue-50 text-blue-600",
    },
    {
      label: "Work Orders Successfully Closed",
      value: "520,000+",
      subtext: "From single break-fix visits to 1,000+ site rollouts",
      icon: CheckCircle,
      trend: "99.4% First-Visit Fix",
      color: "from-emerald-600 to-teal-600",
      accentBg: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Average Dispatch & Match Speed",
      value: "< 14.8 Min",
      subtext: "AI-driven geospatial routing & instant job dispatching",
      icon: Clock,
      trend: "3.5x Faster Than Legacy",
      color: "from-amber-500 to-orange-600",
      accentBg: "bg-amber-50 text-amber-600",
    },
    {
      label: "Client Satisfaction Rating",
      value: "4.98 / 5.0",
      subtext: "Based on 140,000+ verified post-service customer reviews",
      icon: Award,
      trend: "Top Rated FSM Platform",
      color: "from-purple-600 to-pink-600",
      accentBg: "bg-purple-50 text-purple-600",
    },
  ];

  const highlights = [
    {
      title: "Real-time Telemetry",
      description: "Live GPS updates & geofenced check-ins ensure technicians arrive right on schedule.",
      icon: Activity,
    },
    {
      title: "Automated Escrow",
      description: "Funds are protected and paid only after digital sign-off and photo proof verification.",
      icon: DollarSign,
    },
    {
      title: "Strict Background Checks",
      description: "Every engineer passes 10-year criminal, drug screen, and credential checks before dispatch.",
      icon: ShieldCheck,
    },
    {
      title: "Guaranteed SLA",
      description: "Continuous monitoring ensures 99.8% compliance with enterprise turnaround contracts.",
      icon: TrendingUp,
    },
  ];

  return (
    <section id="statistics" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Proven Enterprise Impact</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Scale Your Field Workforce with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400">
              Unmatched Reliability
            </span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            FieldFlow powers the on-demand economy for mission-critical infrastructure, reducing SLA penalties and overhead by up to 45%.
          </p>
        </div>

        {/* 4 Main Stat Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative rounded-3xl bg-slate-800/80 border border-slate-700/80 p-6 sm:p-7 hover:border-blue-500/50 hover:bg-slate-800 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-blue-500/10"
              >
                {/* Top Glow Accent Bar */}
                <div
                  className={`absolute top-0 left-8 right-8 h-1 rounded-b-full bg-gradient-to-r ${stat.color} opacity-80 group-hover:opacity-100 transition-opacity`}
                />

                <div className="flex items-center justify-between mb-6">
                  <div className={`p-3 rounded-2xl ${stat.accentBg} shadow-inner`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-700/80 border border-slate-600 text-slate-300">
                    {stat.trend}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {stat.value}
                  </h3>
                  <h4 className="text-sm font-bold text-slate-200">
                    {stat.label}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    {stat.subtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4 Supporting Feature Pillars */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-3xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
          {highlights.map((h) => {
            const HIcon = h.icon;
            return (
              <div key={h.title} className="flex items-start gap-3 p-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 flex-shrink-0 mt-0.5">
                  <HIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">{h.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-normal">{h.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
