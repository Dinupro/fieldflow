"use client";

import React from "react";

export function LoadingSpinner({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-5 h-5 border-2",
    lg: "w-7 h-7 border-3",
  }[size];

  return (
    <div
      className={`inline-block animate-spin rounded-full border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] ${sizeClasses} ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full animate-pulse space-y-3 p-4 bg-white rounded-3xl border border-slate-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="h-6 w-48 bg-slate-200 rounded-lg" />
        <div className="h-8 w-32 bg-slate-200 rounded-xl" />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={rIdx}
            className="flex items-center gap-4 py-3 px-2 border-b border-slate-50 last:border-0"
          >
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className={`h-4 bg-slate-100 rounded-md ${
                  cIdx === 0 ? "w-1/4" : cIdx === 1 ? "w-1/3" : "flex-1"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 bg-slate-200 rounded-xl" />
        <div className="w-12 h-5 bg-slate-100 rounded-full" />
      </div>
      <div className="space-y-1.5">
        <div className="w-20 h-7 bg-slate-200 rounded-lg" />
        <div className="w-28 h-3.5 bg-slate-100 rounded-md" />
      </div>
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse flex flex-col justify-between h-36">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 bg-slate-100 rounded-2xl" />
        <div className="w-14 h-6 bg-slate-100 rounded-full" />
      </div>
      <div>
        <div className="w-24 h-8 bg-slate-200 rounded-lg mb-1.5" />
        <div className="w-32 h-3.5 bg-slate-100 rounded-md" />
      </div>
    </div>
  );
}

export function WorkOrderCardSkeleton() {
  return (
    <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-16 h-5 bg-slate-200 rounded-full" />
          <div className="w-20 h-5 bg-slate-100 rounded-full" />
        </div>
        <div className="w-24 h-4 bg-slate-100 rounded-md" />
      </div>
      <div className="space-y-2">
        <div className="w-3/4 h-5 bg-slate-200 rounded-md" />
        <div className="w-full h-4 bg-slate-100 rounded-md" />
      </div>
      <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-slate-200 rounded-full" />
          <div className="w-24 h-4 bg-slate-100 rounded-md" />
        </div>
        <div className="w-20 h-7 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

export function TechnicianCardSkeleton() {
  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs animate-pulse space-y-4">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 bg-slate-200 rounded-2xl shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="w-32 h-4.5 bg-slate-200 rounded-md" />
          <div className="w-24 h-3.5 bg-slate-100 rounded-md" />
        </div>
        <div className="w-16 h-6 bg-slate-100 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50">
        <div className="h-9 bg-slate-50 rounded-xl" />
        <div className="h-9 bg-slate-50 rounded-xl" />
        <div className="h-9 bg-slate-50 rounded-xl" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <div className="w-24 h-4 bg-slate-100 rounded-md" />
        <div className="w-16 h-7 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}

export function ActivityLogSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="w-48 h-4 bg-slate-200 rounded-md" />
            <div className="w-72 h-3.5 bg-slate-100 rounded-md" />
          </div>
          <div className="w-20 h-4 bg-slate-100 rounded-md shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function DetailModalSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="space-y-2">
          <div className="w-48 h-6 bg-slate-200 rounded-lg" />
          <div className="w-32 h-4 bg-slate-100 rounded-md" />
        </div>
        <div className="w-24 h-8 bg-slate-200 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-20 bg-slate-50 rounded-2xl" />
        <div className="h-20 bg-slate-50 rounded-2xl" />
      </div>
      <div className="space-y-2">
        <div className="w-24 h-4 bg-slate-200 rounded-md" />
        <div className="w-full h-16 bg-slate-50 rounded-2xl" />
      </div>
    </div>
  );
}
