"use client";

import React from "react";

export type BadgeType = "status" | "priority" | "availability";

interface BadgeProps {
  type: BadgeType;
  value: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  pulse?: boolean;
}

export default function Badge({
  type,
  value,
  size = "md",
  className = "",
  pulse = false,
}: BadgeProps) {
  const normValue = (value || "").toUpperCase().replace(/[\s-]/g, "_");

  let styles = "bg-slate-100 text-slate-700 border-slate-200";
  let dotColor = "bg-slate-400";
  let label = value;

  if (type === "status") {
    switch (normValue) {
      case "OPEN":
        styles = "bg-blue-50 text-blue-700 border-blue-200/80";
        dotColor = "bg-blue-500";
        label = "Open";
        break;
      case "ASSIGNED":
        styles = "bg-indigo-50 text-indigo-700 border-indigo-200/80";
        dotColor = "bg-indigo-500";
        label = "Assigned";
        break;
      case "IN_PROGRESS":
        styles = "bg-amber-50 text-amber-800 border-amber-200/80";
        dotColor = "bg-amber-500";
        label = "In Progress";
        break;
      case "COMPLETED":
        styles = "bg-emerald-50 text-emerald-700 border-emerald-200/80";
        dotColor = "bg-emerald-500";
        label = "Completed";
        break;
      case "CANCELLED":
        styles = "bg-rose-50 text-rose-700 border-rose-200/80";
        dotColor = "bg-rose-500";
        label = "Cancelled";
        break;
      default:
        styles = "bg-slate-100 text-slate-700 border-slate-200";
        dotColor = "bg-slate-400";
    }
  } else if (type === "priority") {
    switch (normValue) {
      case "URGENT":
        styles = "bg-rose-50 text-rose-800 border-rose-200/80 font-bold";
        dotColor = "bg-rose-500";
        label = "Urgent";
        break;
      case "HIGH":
        styles = "bg-amber-50 text-amber-800 border-amber-200/80 font-semibold";
        dotColor = "bg-amber-500";
        label = "High";
        break;
      case "MEDIUM":
        styles = "bg-blue-50 text-blue-800 border-blue-200/80";
        dotColor = "bg-blue-500";
        label = "Medium";
        break;
      case "LOW":
        styles = "bg-slate-100 text-slate-700 border-slate-200";
        dotColor = "bg-slate-400";
        label = "Low";
        break;
      default:
        styles = "bg-slate-100 text-slate-700 border-slate-200";
        dotColor = "bg-slate-400";
    }
  } else if (type === "availability") {
    switch (normValue) {
      case "AVAILABLE":
        styles = "bg-emerald-50 text-emerald-700 border-emerald-200/80 font-medium";
        dotColor = "bg-emerald-500";
        label = "Available";
        break;
      case "BUSY":
        styles = "bg-amber-50 text-amber-800 border-amber-200/80 font-medium";
        dotColor = "bg-amber-500";
        label = "Busy (On-Site)";
        break;
      case "OFF":
      case "OFFLINE":
        styles = "bg-slate-100 text-slate-600 border-slate-200";
        dotColor = "bg-slate-400";
        label = "Offline";
        break;
      default:
        styles = "bg-slate-100 text-slate-600 border-slate-200";
        dotColor = "bg-slate-400";
    }
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] gap-1.5",
    md: "px-2.5 py-1 text-xs gap-2",
    lg: "px-3 py-1.5 text-sm gap-2.5",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium tracking-tight whitespace-nowrap transition-colors ${sizeClasses} ${styles} ${className}`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {(pulse || normValue === "URGENT" || normValue === "IN_PROGRESS" || normValue === "AVAILABLE") && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
      </span>
      <span>{label}</span>
    </span>
  );
}
