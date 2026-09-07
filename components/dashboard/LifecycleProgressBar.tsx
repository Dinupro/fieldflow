"use client";

import React from "react";
import { Check, Clock, AlertCircle } from "lucide-react";

export type WorkOrderStatusType =
  | "OPEN"
  | "ASSIGNED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "PAUSED"
  | "COMPLETED"
  | "CLOSED"
  | "CANCELLED";

interface LifecycleProgressBarProps {
  status: WorkOrderStatusType;
  compact?: boolean;
}

const STEPS: { status: WorkOrderStatusType; label: string; order: number }[] = [
  { status: "OPEN", label: "Open", order: 1 },
  { status: "ASSIGNED", label: "Assigned", order: 2 },
  { status: "ACCEPTED", label: "Accepted", order: 3 },
  { status: "IN_PROGRESS", label: "In Progress", order: 4 },
  { status: "COMPLETED", label: "Completed", order: 5 },
  { status: "CLOSED", label: "Closed", order: 6 },
];

export default function LifecycleProgressBar({ status, compact = false }: LifecycleProgressBarProps) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Cancelled / Terminated</span>
      </div>
    );
  }

  const isPaused = status === "PAUSED";
  const currentStep = isPaused
    ? STEPS.find((s) => s.status === "IN_PROGRESS")!
    : STEPS.find((s) => s.status === status) || STEPS[0];

  const currentOrder = currentStep.order;

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {STEPS.map((s) => {
          const isCompleted = s.order < currentOrder;
          const isCurrent = s.order === currentOrder;
          return (
            <div
              key={s.status}
              title={`${s.label}: ${isCurrent ? (isPaused ? "Paused" : "Active") : isCompleted ? "Done" : "Upcoming"}`}
              className={`h-1.5 rounded-full transition-all ${
                isCurrent
                  ? isPaused
                    ? "w-4 bg-orange-500 animate-pulse"
                    : "w-4 bg-blue-600 animate-pulse"
                  : isCompleted
                  ? "w-2 bg-emerald-500"
                  : "w-2 bg-slate-200"
              }`}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        {/* Background track */}
        <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-1 bg-slate-100 rounded-full z-0" />
        
        {/* Active progress track */}
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full z-0 transition-all duration-500"
          style={{
            width: `${Math.min(100, Math.max(0, ((currentOrder - 1) / (STEPS.length - 1)) * 100))}%`,
          }}
        />

        {STEPS.map((s) => {
          const isCompleted = s.order < currentOrder;
          const isCurrent = s.order === currentOrder;

          return (
            <div key={s.status} className="flex flex-col items-center relative z-10">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                  isCompleted
                    ? "bg-emerald-500 text-white shadow-xs"
                    : isCurrent
                    ? isPaused
                      ? "bg-orange-500 text-white ring-4 ring-orange-100 animate-pulse"
                      : "bg-blue-600 text-white ring-4 ring-blue-100 shadow-md shadow-blue-600/30"
                    : "bg-white border-2 border-slate-200 text-slate-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : isCurrent ? (
                  isPaused ? (
                    <Clock className="w-3 h-3" />
                  ) : (
                    <span>{s.order}</span>
                  )
                ) : (
                  <span>{s.order}</span>
                )}
              </div>
              <span
                className={`text-[10px] font-bold mt-1.5 transition-colors whitespace-nowrap ${
                  isCurrent
                    ? isPaused
                      ? "text-orange-600 font-extrabold"
                      : "text-blue-600 font-extrabold"
                    : isCompleted
                    ? "text-emerald-700"
                    : "text-slate-400"
                }`}
              >
                {s.label}
                {isCurrent && isPaused && " (Paused)"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
