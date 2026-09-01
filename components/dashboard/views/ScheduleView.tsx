"use client";

import { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  Plus,
  Filter,
  CheckCircle2,
} from "lucide-react";

export default function ScheduleView() {
  const [selectedDay, setSelectedDay] = useState("Today, Sep 1");

  const scheduleSlots = [
    {
      time: "08:00 AM - 10:00 AM",
      job: "WO-9913: POS Terminal Cutover & PIN Pad Sync",
      customer: "OmniRetail Store #184 (Dallas, TX)",
      tech: "Devon Miller",
      status: "In Progress",
      color: "border-l-4 border-l-purple-500 bg-purple-50/50",
    },
    {
      time: "10:30 AM - 12:30 PM",
      job: "WO-9912: High-Density WiFi 6 AP Mounting",
      customer: "Apex Logistics Hub #4 (Austin, TX)",
      tech: "Marcus Vance",
      status: "En Route",
      color: "border-l-4 border-l-blue-500 bg-blue-50/50",
    },
    {
      time: "01:30 PM - 03:30 PM",
      job: "WO-9918: Rack Cable Dressing & Fluke Certification",
      customer: "DataCore Cloud Colo (Austin, TX)",
      tech: "Sarah Lin",
      status: "Confirmed",
      color: "border-l-4 border-l-emerald-500 bg-emerald-50/50",
    },
    {
      time: "04:00 PM - 06:00 PM",
      job: "WO-9920: Level 2 Commercial EV Charger Commissioning",
      customer: "Skyline Mobility Plazas (Houston, TX)",
      tech: "Darius Washington",
      status: "Scheduled",
      color: "border-l-4 border-l-amber-500 bg-amber-50/50",
    },
  ];

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
            {selectedDay}
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
            <span>Today&apos;s Active Work Order Timeline (4 Dispatches)</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            All On-Time
          </span>
        </div>

        <div className="space-y-3">
          {scheduleSlots.map((slot) => (
            <div
              key={slot.time}
              className={`p-4 rounded-2xl border border-slate-200/80 ${slot.color} transition-all space-y-2`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {slot.time}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200 w-fit">
                  {slot.status}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900">{slot.job}</h4>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {slot.customer}
                </span>
                <span className="flex items-center gap-1 font-semibold text-blue-700">
                  <User className="w-3.5 h-3.5 text-blue-500" />
                  {slot.tech}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
