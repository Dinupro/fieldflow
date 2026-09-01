"use client";

import { useState } from "react";
import {
  Sparkles,
  MapPin,
  FileCheck2,
  Receipt,
  ShieldCheck,
  Smartphone,
  BarChart3,
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
  Lock,
} from "lucide-react";

export default function Features() {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      title: "AI Smart Match & Auto-Dispatch",
      tagline: "Instant precision matching based on certifications, tools carried, and location.",
      icon: Sparkles,
      color: "from-blue-600 to-indigo-600",
      description:
        "FieldFlow's algorithmic dispatch engine analyzes technician distance, historical SLA performance, client preferences, and specific tool requirements (e.g. OTDR testers, 12ft ladders) to assign the ideal engineer in under 90 seconds.",
      bullets: [
        "Geospatial radius optimization minimizes travel time & carbon footprint",
        "Automated certification verification (OSHA, BICSI, CompTIA, EPA)",
        "Configurable fallback dispatch waterfalls for emergency jobs",
      ],
      mockupType: "dispatch",
    },
    {
      title: "Geofenced GPS & Live Milestones",
      tagline: "Total operational visibility from transit to completion with zero guesswork.",
      icon: MapPin,
      color: "from-emerald-600 to-teal-600",
      description:
        "Watch technicians move in real time with high-accuracy GPS telemetry. Automated geofences trigger 'Arrived On-Site' status and clock-in logs without manual dispatcher intervention.",
      bullets: [
        "Customer-facing live tracking link with accurate ETA calculations",
        "Geofence-verified check-in & check-out time tracking",
        "Instant alerts for transit delays or SLA boundary risks",
      ],
      mockupType: "gps",
    },
    {
      title: "Digital Proof of Work & Signoff",
      tagline: "High-resolution before/after photos, barcode scans, and client e-signatures.",
      icon: FileCheck2,
      color: "from-indigo-600 to-purple-600",
      description:
        "Eliminate billing disputes forever. Field technicians capture mandatory deliverables, serial number barcodes, and test logs directly in the mobile app before the customer digitally signs on glass.",
      bullets: [
        "Geotagged & timestamped high-resolution photo proof",
        "Serial number & MAC address barcode scanning into asset inventory",
        "Legally binding digital signature capture on mobile & tablet",
      ],
      mockupType: "proof",
    },
    {
      title: "Automated Escrow & Instant Payouts",
      tagline: "Secure milestone billing with automated PDF invoicing and 1099 tax tracking.",
      icon: Receipt,
      color: "from-amber-500 to-orange-600",
      description:
        "Client funds are held securely in escrow upon job creation and automatically released upon sign-off approval. Streamlines accounting with consolidated bi-weekly enterprise statements.",
      bullets: [
        "Instant payout options for top-rated field technicians via direct deposit",
        "Automated PDF work order invoice generation with line-item parts",
        "Integrated contractor 1099 compliance and tax withholding reporting",
      ],
      mockupType: "billing",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-40 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Intelligent Platform Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Engineered for High-Velocity{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-600">
              Field Operations
            </span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Replace fragmented spreadsheets, phone calls, and manual paperwork with a unified,
            cloud-native field service management engine.
          </p>
        </div>

        {/* Feature Tabs Bar */}
        <div className="mt-12 flex flex-wrap justify-center gap-2 sm:gap-3 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 max-w-4xl mx-auto">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.title}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === idx
                    ? "bg-white text-slate-900 shadow-md shadow-slate-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
              >
                <Icon
                  className={`w-4 h-4 ${activeTab === idx ? "text-blue-600" : "text-slate-400"
                    }`}
                />
                <span>{feature.title.split("&")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Active Feature Deep Dive Grid */}
        <div className="mt-10 rounded-3xl bg-slate-50 border border-slate-200/80 p-6 sm:p-10 lg:p-12 shadow-xl shadow-slate-100">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Description Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold">
                <span>Module {activeTab + 1} of 4</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {features[activeTab].title}
              </h3>

              <p className="text-base text-slate-600 leading-relaxed">
                {features[activeTab].description}
              </p>

              <div className="space-y-3 pt-2">
                {features[activeTab].bullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      ✓
                    </div>
                    <span className="text-sm font-medium text-slate-700">{bullet}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-4">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/20 transition-all"
                >
                  <span>Experience This Feature</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right Interactive Mockup Preview */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-white border border-slate-200 shadow-xl p-5 sm:p-6 space-y-4">
                {/* Mockup Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-slate-500 ml-2">
                      FieldFlow Intelligence Console
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    Live Sync Active
                  </span>
                </div>

                {/* Mockup Content by Tab */}
                {activeTab === 0 && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs">
                      <div className="flex justify-between font-bold text-blue-900">
                        <span>Work Order: #WO-9912 (Cisco Core Switch Replacement)</span>
                        <span>Match Score: 99.2%</span>
                      </div>
                      <p className="text-blue-700 mt-1 text-[11px]">
                        AI identified 3 certified CCNA engineers within 5 miles carrying Fluke cable testers.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {[
                        { name: "Devon Miller", cert: "CCNP Enterprise", rating: "4.99", eta: "8 mins", status: "Primary Match" },
                        { name: "Sarah Lin", cert: "BICSI Tech", rating: "4.95", eta: "14 mins", status: "Available" },
                        { name: "Travis Vance", cert: "CompTIA Security+", rating: "4.92", eta: "22 mins", status: "Available" },
                      ].map((tech) => (
                        <div
                          key={tech.name}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/60 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                              {tech.name[0]}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{tech.name}</div>
                              <div className="text-[11px] text-slate-500">{tech.cert}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-emerald-600 block">{tech.eta}</span>
                            <span className="text-[10px] text-slate-400">★ {tech.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 1 && (
                  <div className="space-y-3">
                    <div className="h-36 rounded-xl bg-linear-to-br from-slate-800 to-slate-900 relative overflow-hidden p-4 flex flex-col justify-between text-white">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-cyan-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> Geofence: 200m Radius
                        </span>
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                          Inside Target Site
                        </span>
                      </div>
                      <div className="text-center py-2">
                        <div className="text-xs text-slate-300">Technician Device #8491</div>
                        <div className="text-lg font-black text-white">Austin Metro Center - Floor 4</div>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Speed: 0 mph (On-Site)</span>
                        <span>Auto-Clocked In: 10:42 AM</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex justify-between items-center">
                      <span className="font-semibold text-slate-700">Milestone Auto-Log</span>
                      <span className="font-bold text-blue-600">Site Entry Verified (GPS Exact)</span>
                    </div>
                  </div>
                )}

                {activeTab === 2 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Before Work</span>
                        <div className="h-16 mt-1 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 font-semibold text-[11px]">
                          📷 Tangled IDF Rack
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block">10:45 AM • Geotagged</span>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                        <span className="text-[10px] font-bold text-emerald-800 block uppercase">After Dressing</span>
                        <div className="h-16 mt-1 rounded-lg bg-emerald-100/70 flex items-center justify-center text-emerald-700 font-semibold text-[11px]">
                          📷 Clean Velcro & Certified
                        </div>
                        <span className="text-[10px] text-emerald-600 mt-1 block">12:15 PM • Geotagged</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Client Signoff</span>
                        <span className="font-bold text-emerald-400">Signed by Jennifer Hayes (GM)</span>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                )}

                {activeTab === 3 && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Escrow Status</span>
                        <span className="font-extrabold text-slate-900 text-sm">$640.00 Held in Escrow</span>
                      </div>
                      <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 font-bold text-[11px]">
                        Pending Sign-off
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-emerald-700 uppercase font-bold block">Instant Tech Payout</span>
                        <span className="font-extrabold text-emerald-900 text-sm">Direct Deposit Triggered</span>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>

                    <div className="p-2.5 rounded-xl border border-slate-100 text-slate-500 text-[11px] flex justify-between">
                      <span>Automated 1099-NEC & Invoice #INV-4921</span>
                      <span className="text-blue-600 font-bold">PDF Ready</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Bottom Role Portals */}
        <div className="mt-14">
          <h3 className="text-center text-xs uppercase font-bold text-slate-400 tracking-wider mb-6">
            Tailored Experiences For Every Field Service Stakeholder
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                role: "For Enterprise Dispatchers",
                desc: "Map view, bulk work order upload, SLA alerts, and multi-tech group dispatches.",
                icon: Layers,
              },
              {
                role: "For Field Technicians",
                desc: "Mobile-first app with offline mode, route navigation, and instant pay out balance.",
                icon: Smartphone,
              },
              {
                role: "For Operations Managers",
                desc: "Cost-per-site analytics, first-time fix rate charts, and contractor performance scores.",
                icon: BarChart3,
              },
              {
                role: "For Compliance & Security",
                desc: "SOC 2 Type II audit trails, COI insurance validation, and automated NDA sign-offs.",
                icon: Lock,
              },
            ].map((p) => {
              const PIcon = p.icon;
              return (
                <div
                  key={p.role}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all space-y-2"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <PIcon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{p.role}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
