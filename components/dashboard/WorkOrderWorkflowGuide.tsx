"use client";

import React, { useState } from "react";
import {
  Building2,
  Wrench,
  Plus,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

interface WorkOrderWorkflowGuideProps {
  role?: "ADMIN" | "DISPATCHER" | "TECHNICIAN";
  onQuickCreateClick?: () => void;
  onNavigateCustomers?: () => void;
  onNavigateTechnicians?: () => void;
}

export default function WorkOrderWorkflowGuide({
  role = "DISPATCHER",
  onQuickCreateClick,
  onNavigateCustomers,
  onNavigateTechnicians,
}: WorkOrderWorkflowGuideProps) {
  const [expanded, setExpanded] = useState(true);

  const steps = [
    {
      num: 1,
      title: "1. Select / Add Customer",
      roleText: "Dispatcher / Admin",
      desc: "Choose an existing client or create a new one instantly with contact & service address.",
      icon: Building2,
      color: "bg-blue-600 text-white",
      borderColor: "border-blue-200",
      activeFor: role !== "TECHNICIAN",
      actionText: "Manage CRM",
      onAction: onNavigateCustomers,
    },
    {
      num: 2,
      title: "2. Verify Technician Roster",
      roleText: "Dispatcher / Admin",
      desc: "Check live technician availability (Available, Busy, Off), certifications & active job load.",
      icon: Wrench,
      color: "bg-indigo-600 text-white",
      borderColor: "border-indigo-200",
      activeFor: role !== "TECHNICIAN",
      actionText: "Fleet Roster",
      onAction: onNavigateTechnicians,
    },
    {
      num: 3,
      title: "3. Dispatch Work Order",
      roleText: "Dispatcher / Admin",
      desc: "Assign technician, set priority (Urgent/High), scheduled SLA date, and detailed work scope.",
      icon: Plus,
      color: "bg-teal-600 text-white",
      borderColor: "border-teal-200",
      activeFor: role !== "TECHNICIAN",
      actionText: "+ Create Order",
      onAction: onQuickCreateClick,
    },
    {
      num: 4,
      title: "4. Technician 'My Jobs' Execution",
      roleText: "Field Technician",
      desc: "Technician logs in, views assigned queue, clicks 'Accept' and 'Start Job' to begin work on-site.",
      icon: Wrench,
      color: "bg-purple-600 text-white",
      borderColor: "border-purple-200",
      activeFor: role === "TECHNICIAN",
    },
    {
      num: 5,
      title: "5. Completion & Real-Time Sync",
      roleText: "Tech → Dispatcher",
      desc: "Technician submits completion notes. Status logs, audit logs, and dashboard metrics update live in DB.",
      icon: CheckCircle2,
      color: "bg-emerald-600 text-white",
      borderColor: "border-emerald-200",
      activeFor: true,
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-linear-to-br from-white via-slate-50/50 to-blue-50/30 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                FieldFlow End-to-End Business Lifecycle
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                <ShieldCheck className="w-3 h-3" />
                Live PostgreSQL Workflow
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {role === "TECHNICIAN"
                ? "Technician Field Portal: Review your assigned jobs, start progress, and complete service tickets."
                : "Dispatcher Command: Follow the 5-step operational pipeline from customer creation to technician completion."}
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
        >
          <span className="hidden sm:inline">{expanded ? "Hide Workflow" : "View Workflow"}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-200/70 animate-fadeIn space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${step.activeFor
                      ? "bg-white border-blue-200/90 shadow-sm ring-2 ring-blue-500/10"
                      : "bg-slate-50/70 border-slate-200/70 opacity-90"
                    }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${step.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {step.roleText}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{step.title}</h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{step.desc}</p>
                    </div>
                  </div>

                  {step.actionText && step.onAction && (
                    <div className="pt-2.5 mt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={step.onAction}
                        className="w-full py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>{step.actionText}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Contextual Banner for active role */}
          <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 text-blue-900 font-semibold">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                {role === "TECHNICIAN" ? (
                  <>
                    <strong className="font-extrabold text-blue-950">You are logged in as Field Technician (Devon Miller):</strong> You only see dispatches assigned to you. Use the large action buttons on each job card to update status in real time.
                  </>
                ) : (
                  <>
                    <strong className="font-extrabold text-blue-950">Dispatcher Tip:</strong> You can create customers, check technician workload capacity, dispatch work orders with custom SLAs, and review completed jobs for closure.
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs inline-flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-emerald-600" />
                <span>Role: {role}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
