"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Download,
  Sparkles,
} from "lucide-react";

export default function ReportsView() {
  const [exportToast, setExportToast] = useState(false);

  const handleExport = () => {
    setExportToast(true);
    setTimeout(() => setExportToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Performance & SLA Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Comprehensive audit logs, contractor ratings, resolution benchmarks, and financial summaries.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Analytics (PDF/CSV)</span>
        </button>
      </div>

      {exportToast && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Executive SLA performance report generated and downloaded.</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "First-Visit Fix Rate", val: "99.4%", sub: "+1.2% this quarter", color: "text-emerald-600" },
          { label: "Avg. Dispatch Response", val: "14.2 Mins", sub: "3.5x faster than baseline", color: "text-blue-600" },
          { label: "Customer Satisfaction", val: "4.98 / 5.0", sub: "140k+ verified reviews", color: "text-amber-600" },
          { label: "Total Cost Savings", val: "$420,000", sub: "Reduced SLA penalties", color: "text-purple-600" },
        ].map((k) => (
          <div key={k.label} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500">{k.label}</span>
            <h3 className={`text-2xl font-black ${k.color}`}>{k.val}</h3>
            <p className="text-[11px] text-slate-400">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Breakdown Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Service Category Resolution Efficiency */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              SLA Adherence by Trade Category
            </h3>
            <span className="text-xs text-slate-400">Last 30 Days</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { cat: "Structured Cabling & Fiber Optics", rate: 99.8, color: "bg-blue-600" },
              { cat: "Retail POS Hardware Rollouts", rate: 99.4, color: "bg-indigo-600" },
              { cat: "Server & Network Infrastructure", rate: 99.2, color: "bg-purple-600" },
              { cat: "Commercial CCTV & Access Control", rate: 98.9, color: "bg-emerald-600" },
              { cat: "Smart IoT & EV Power Systems", rate: 99.0, color: "bg-cyan-600" },
            ].map((item) => (
              <div key={item.cat} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-700">{item.cat}</span>
                  <span className="text-slate-900 font-extrabold">{item.rate}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Escrow Summary */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Escrow & Automated Settlement Ledger
              </h3>
              <span className="text-xs text-emerald-600 font-bold">Audit Verified</span>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Total Work Orders Invoiced:</span>
                <span className="font-bold text-slate-900">$184,250.00</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Released to Technicians:</span>
                <span className="font-bold text-emerald-600">$162,140.00</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Currently Held in Escrow:</span>
                <span className="font-bold text-blue-600">$22,110.00</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Consolidated monthly statements automatically generated in PDF format on the 1st of every month.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
