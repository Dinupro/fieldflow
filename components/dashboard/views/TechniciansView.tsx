"use client";

import { useState } from "react";
import {
  Wrench,
  Search,
  MapPin,
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Radio,
  Plus,
  Filter,
  Phone,
  Mail,
  Award,
} from "lucide-react";

export default function TechniciansView() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dispatchToast, setDispatchToast] = useState<string | null>(null);

  const technicians = [
    {
      id: "TECH-8491",
      name: "Marcus Vance",
      avatar: "MV",
      trade: "Senior Fiber & Network Infrastructure Lead",
      rating: 4.98,
      reviews: 432,
      location: "Austin, TX (2.4 mi away)",
      status: "En Route",
      statusBadge: "bg-blue-100 text-blue-800 border-blue-200",
      skills: ["Fluke Certified", "Fusion Splicing", "Cisco Catalyst 9k", "OSHA 30"],
      rate: "$95/hr",
      jobsCompleted: 512,
      onTimeRate: "99.8%",
    },
    {
      id: "TECH-8492",
      name: "Devon Miller",
      avatar: "DM",
      trade: "Retail POS & Self-Checkout Systems Specialist",
      rating: 4.95,
      reviews: 310,
      location: "Dallas, TX (4.1 mi away)",
      status: "On-Site",
      statusBadge: "bg-purple-100 text-purple-800 border-purple-200",
      skills: ["NCR Kiosks", "Ingenico / Verifone", "Barcodes", "After-hours Cutover"],
      rate: "$85/hr",
      jobsCompleted: 380,
      onTimeRate: "99.4%",
    },
    {
      id: "TECH-8493",
      name: "Sarah Lin",
      avatar: "SL",
      trade: "Enterprise Routing & SD-WAN Engineer",
      rating: 4.99,
      reviews: 290,
      location: "Houston, TX (Available Now)",
      status: "Available",
      statusBadge: "bg-emerald-100 text-emerald-800 border-emerald-200",
      skills: ["CCNP Enterprise", "Fortinet Firewalls", "SD-WAN Gateways", "Rack & Stack"],
      rate: "$110/hr",
      jobsCompleted: 410,
      onTimeRate: "100%",
    },
    {
      id: "TECH-8494",
      name: "Travis Vance",
      avatar: "TV",
      trade: "Commercial CCTV & Biometric Security Tech",
      rating: 4.92,
      reviews: 180,
      location: "San Antonio, TX (Available Now)",
      status: "Available",
      statusBadge: "bg-emerald-100 text-emerald-800 border-emerald-200",
      skills: ["Axis & Hikvision IP Cameras", "HID Door Strikes", "PoE Switching"],
      rate: "$80/hr",
      jobsCompleted: 240,
      onTimeRate: "98.9%",
    },
    {
      id: "TECH-8495",
      name: "Darius Washington",
      avatar: "DW",
      trade: "Commercial EV Charger & Power Infrastructure",
      rating: 4.94,
      reviews: 165,
      location: "Round Rock, TX (Off-duty)",
      status: "Offline",
      statusBadge: "bg-slate-100 text-slate-700 border-slate-200",
      skills: ["Licensed Electrician", "ChargePoint DC Fast", "Load Management"],
      rate: "$105/hr",
      jobsCompleted: 195,
      onTimeRate: "99.1%",
    },
  ];

  const filteredTechs = technicians.filter((t) => {
    const matchesStatus = filterStatus === "all" || t.status.toLowerCase().includes(filterStatus.toLowerCase());
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.trade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleDispatch = (name: string) => {
    setDispatchToast(`Dispatch request routed to ${name}. ETA calculation en route.`);
    setTimeout(() => setDispatchToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Vetted Technician Fleet
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time GPS status, certifications, skills, and instant dispatching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>42 Technicians Broadcasting GPS</span>
          </span>
        </div>
      </div>

      {dispatchToast && (
        <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>{dispatchToast}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl">
          {[
            { id: "all", label: "All Fleet (42)" },
            { id: "available", label: "Available (18)" },
            { id: "en route", label: "En Route (12)" },
            { id: "on-site", label: "On-Site (10)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by skill, cert, or tech name..."
            className="w-full pl-10 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Technician Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTechs.map((tech) => (
          <div
            key={tech.id}
            className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-slate-900 to-blue-900 text-white font-black text-sm flex items-center justify-center shadow-md">
                    {tech.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {tech.name}
                      </h3>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                        VETTED PRO
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{tech.trade}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="flex items-center text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                        {tech.rating}
                      </span>
                      <span className="text-slate-400 text-[11px]">({tech.reviews} jobs)</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-emerald-600 font-semibold text-[11px]">
                        {tech.onTimeRate} On-Time
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${tech.statusBadge}`}
                >
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  {tech.status}
                </span>
              </div>

              {/* Location & Rate */}
              <div className="flex items-center justify-between text-xs text-slate-600 pt-3 mt-3 border-t border-slate-100">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {tech.location}
                </span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {tech.rate}
                </span>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 pt-3">
                {tech.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                100% Background Cleared
              </span>
              <button
                onClick={() => handleDispatch(tech.name)}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
              >
                Dispatch Technician
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
