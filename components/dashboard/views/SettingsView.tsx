"use client";

import { useState } from "react";
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Bell,
  CheckCircle2,
  Lock,
  Radio,
  Sliders,
} from "lucide-react";

export default function SettingsView() {
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [geofenceRadius, setGeofenceRadius] = useState("200");
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Platform & Dispatch Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure algorithmic dispatch waterfall, geolocation radius, automated billing, and notification rules.
        </p>
      </div>

      {savedToast && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Platform configuration preferences saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Dispatch Automation Box */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Radio className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Automated AI Dispatch Engine
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">
                  Enable Algorithmic Fast Match
                </span>
                <span className="text-slate-500">
                  Automatically broadcast emergency tickets to top 3 nearest certified engineers.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAutoDispatch(!autoDispatch)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  autoDispatch ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    autoDispatch ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block font-bold text-slate-800 mb-1">
                Geofence Check-in Radius (Meters)
              </label>
              <input
                type="number"
                value={geofenceRadius}
                onChange={(e) => setGeofenceRadius(e.target.value)}
                className="w-48 px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Technicians automatically clock-in upon entering this radius from the target coordinates.
              </p>
            </div>
          </div>
        </div>

        {/* Notifications & Webhooks */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              SLA & Dispatch Alerts
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">
                  SMS Notifications on Critical SLA (Under 30 mins)
                </span>
                <span className="text-slate-500">
                  Send high-priority SMS alerts to lead dispatchers when tickets risk SLA boundaries.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSmsAlerts(!smsAlerts)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  smsAlerts ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    smsAlerts ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
