"use client";

import React, { useState } from "react";
import { CheckCircle2, X, Building2, User, Sparkles, Check } from "lucide-react";

interface CompletionNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrderTitle: string;
  customerName?: string;
  technicianName?: string;
  initialNotes?: string;
  onSubmit: (notes: string) => Promise<void>;
  submitting: boolean;
}

export default function CompletionNotesModal({
  isOpen,
  onClose,
  workOrderTitle,
  customerName,
  technicianName,
  initialNotes = "",
  onSubmit,
  submitting,
}: CompletionNotesModalProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [checklist, setChecklist] = useState({
    workVerified: true,
    testedHardware: true,
    customerBriefed: true,
  });
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim() || notes.trim().length < 5) {
      setError("Please provide descriptive completion notes (minimum 5 characters).");
      return;
    }
    setError("");
    await onSubmit(notes.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Complete & Sign Off Job</h3>
              <p className="text-xs text-slate-500">Record final work notes and mark job completed</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Job Summary Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
          <div className="font-bold text-slate-900 text-sm">{workOrderTitle}</div>
          <div className="flex items-center gap-4 text-slate-500 text-[11px] flex-wrap">
            {customerName && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Client: <strong>{customerName}</strong></span>
              </span>
            )}
            {technicianName && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Lead Tech: <strong>{technicianName}</strong></span>
              </span>
            )}
          </div>
        </div>

        {/* Pre-Flight Checklist */}
        <div className="space-y-2 text-xs">
          <label className="font-bold text-slate-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Field Completion Checklist</span>
          </label>
          <div className="space-y-1.5 p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={checklist.workVerified}
                onChange={(e) => setChecklist({ ...checklist, workVerified: e.target.checked })}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded-md"
              />
              <span>Physical work verified and executed according to dispatch specifications</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={checklist.testedHardware}
                onChange={(e) => setChecklist({ ...checklist, testedHardware: e.target.checked })}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded-md"
              />
              <span>Hardware, connections, or network lines tested and certified</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={checklist.customerBriefed}
                onChange={(e) => setChecklist({ ...checklist, customerBriefed: e.target.checked })}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded-md"
              />
              <span>Site contact briefed on resolution & handover completed</span>
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Completion Notes & Technical Summary *</label>
            <textarea
              rows={4}
              required
              placeholder="Describe work completed (e.g., Replaced optical transceiver, validated link rate at 10Gbps, zero packet drop across 1hr soak test)..."
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (error) setError("");
              }}
              className={`w-full px-3 py-2.5 rounded-2xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all resize-none ${error ? "border-rose-300 ring-2 ring-rose-100" : "border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                }`}
            />
            {error && <span className="text-[10px] text-rose-600 block font-semibold">{error}</span>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {submitting ? (
                <span>Submitting Sign-off...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Mark Job as Completed</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
