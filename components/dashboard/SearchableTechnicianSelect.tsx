"use client";

import React, { useState, useRef, useEffect } from "react";
import { Wrench, Search, Check, ChevronDown, User, Zap, AlertCircle } from "lucide-react";

export interface TechnicianOption {
  id: string;
  name: string;
  specialization: string | null;
  status: "AVAILABLE" | "BUSY" | "OFF";
  serviceArea: string | null;
  skills?: string[];
  activeOrdersCount?: number;
  maxActiveJobs?: number;
}

interface SearchableTechnicianSelectProps {
  technicians: TechnicianOption[];
  selectedId: string;
  onChange: (technicianId: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function SearchableTechnicianSelect({
  technicians,
  selectedId,
  onChange,
  error,
  disabled = false,
}: SearchableTechnicianSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedTechnician = technicians.find((t) => t.id === selectedId);

  const filteredTechnicians = technicians.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.specialization && t.specialization.toLowerCase().includes(q)) ||
      (t.serviceArea && t.serviceArea.toLowerCase().includes(q)) ||
      (t.skills && t.skills.some((s) => s.toLowerCase().includes(q)))
    );
  });

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusBadge = (status: "AVAILABLE" | "BUSY" | "OFF") => {
    switch (status) {
      case "AVAILABLE":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Available</span>
          </span>
        );
      case "BUSY":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Busy</span>
          </span>
        );
      case "OFF":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Offline</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-1.5" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-blue-600" />
          <span>Assign Field Technician</span>
        </label>
        <span className="text-[10px] font-bold text-slate-400">Optional • Can be assigned later</span>
      </div>

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3.5 py-2.5 rounded-2xl border text-left bg-slate-50 hover:bg-white focus:bg-white text-xs font-medium text-slate-900 transition-all flex items-center justify-between cursor-pointer ${
            error
              ? "border-rose-300 ring-2 ring-rose-100"
              : isOpen
              ? "border-blue-600 ring-2 ring-blue-100 bg-white"
              : "border-slate-200"
          }`}
        >
          {selectedTechnician ? (
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-6 h-6 rounded-lg bg-slate-800 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                {selectedTechnician.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="truncate">
                <span className="font-bold text-slate-900">{selectedTechnician.name}</span>
                {selectedTechnician.specialization && (
                  <span className="text-slate-500 text-[11px] ml-1.5">({selectedTechnician.specialization})</span>
                )}
              </div>
              <div className="ml-auto shrink-0 pl-2">
                {getStatusBadge(selectedTechnician.status)}
              </div>
            </div>
          ) : (
            <span className="text-slate-500 font-semibold">Unassigned (Open Dispatch Pool)</span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 ml-2 shrink-0 transition-transform ${isOpen ? "rotate-180 text-blue-600" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-fadeIn">
            {/* Search Input */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/70">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by technician name, specialization, skills..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-blue-600 font-medium"
                  autoFocus
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 p-1 text-xs">
              {/* Option to leave unassigned */}
              <div
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                  selectedId === "" ? "bg-blue-50 text-blue-900 font-bold" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                    ?
                  </div>
                  <div>
                    <span className="font-bold">Leave Unassigned</span>
                    <p className="text-[10px] text-slate-400">Place work order into open pool for later dispatch</p>
                  </div>
                </div>
                {selectedId === "" && <Check className="w-4 h-4 text-blue-600" />}
              </div>

              {filteredTechnicians.map((tech) => {
                const isSelected = tech.id === selectedId;
                const isOff = tech.status === "OFF";

                return (
                  <div
                    key={tech.id}
                    onClick={() => {
                      if (isOff) return;
                      onChange(tech.id);
                      setIsOpen(false);
                    }}
                    className={`p-2 rounded-xl flex items-center justify-between transition-colors ${
                      isOff
                        ? "opacity-50 cursor-not-allowed bg-slate-50/50"
                        : isSelected
                        ? "bg-blue-50 text-blue-900 font-bold cursor-pointer"
                        : "hover:bg-slate-50 text-slate-800 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                        {tech.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs font-bold text-slate-900 truncate">{tech.name}</span>
                          {isOff && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-200 text-slate-600 rounded">
                              Off-Duty
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate flex items-center gap-1.5">
                          <span>{tech.specialization || "Field Tech"}</span>
                          {tech.serviceArea && <span>• {tech.serviceArea}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {getStatusBadge(tech.status)}
                      {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {error && <span className="text-[11px] text-rose-600 block">{error}</span>}
    </div>
  );
}
