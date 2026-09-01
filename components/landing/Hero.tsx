"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  ShieldCheck,
  Star,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Users,
  Award,
  Radio,
  Phone,
  Layers,
} from "lucide-react";

export default function Hero() {
  const [selectedService, setSelectedService] = useState("Networking & Fiber");
  const [zipCode, setZipCode] = useState("");
  const [searchSuccess, setSearchSuccess] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchSuccess(true);
    setTimeout(() => setSearchSuccess(false), 4500);
  };

  const clientLogos = [
    { name: "Apex Logistics", tag: "Logistics & Supply" },
    { name: "OmniNet Telecom", tag: "Enterprise Fiber" },
    { name: "HyperScale POS", tag: "Retail Systems" },
    { name: "DataCore Cloud", tag: "Data Center Infrastructure" },
    { name: "Nexus Facilities", tag: "Commercial Property" },
  ];

  return (
    <section
      id="hero"
      className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-linear-to-b from-slate-50 via-white to-slate-50"
    >
      {/* Background Gradients & Grids */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-162.5 h-87.5 bg-linear-to-tr from-blue-400/20 via-indigo-400/20 to-purple-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, Copy, and Search Widget */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                #1 On-Demand Field Technician Network
              </span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="hidden sm:inline-flex items-center text-xs text-slate-600 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                100% Background-Checked
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Deploy Trusted Field Technicians.{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-500">
                Anywhere, On-Demand.
              </span>
            </h1>

            {/* Subtitle targeting customers */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Connect directly with verified, certified field engineers for IT
              infrastructure, network cabling, smart IoT, POS rollouts, and
              rapid break-fix repairs. Fast matching, live GPS tracking, and
              guaranteed SLAs.
            </p>

            {/* Interactive Quick Dispatch Search Bar */}
            <div className="p-3 bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/80 max-w-xl">
              <form onSubmit={handleSearch} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  {/* Service selector */}
                  <div className="sm:col-span-7 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70">
                    <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="Networking & Fiber">Networking & Fiber Splicing</option>
                      <option value="POS & Retail Rollout">POS & Retail Rollout</option>
                      <option value="Commercial CCTV & Security">Commercial CCTV & Security</option>
                      <option value="Server & Rack Infrastructure">Server & Rack Infrastructure</option>
                      <option value="Smart IoT & BMS Automation">Smart IoT & BMS Automation</option>
                      <option value="EV Charger & Electrical">EV Charger & Electrical</option>
                      <option value="Emergency Break-Fix (2hr SLA)">Emergency Break-Fix (2hr SLA)</option>
                    </select>
                  </div>

                  {/* Zip / City */}
                  <div className="sm:col-span-5 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70">
                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                    <input
                      type="text"
                      placeholder="Zip or City (e.g. 10001)"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
                    <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    <span>
                      <strong className="text-slate-800 font-semibold">1,280+</strong> active
                      technicians nearby
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Find Technicians</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {searchSuccess && (
                <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Match Found!</strong> 14 verified technicians ready for{" "}
                      <strong>{selectedService}</strong> in your area.
                    </span>
                  </div>
                  <a
                    href="#contact"
                    className="underline font-bold text-emerald-900 hover:text-emerald-700 ml-2"
                  >
                    Dispatch Now
                  </a>
                </div>
              )}
            </div>

            {/* Quick Action Buttons & Trust Highlights */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all"
              >
                <span>Request a Work Order</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm shadow-xs hover:border-slate-300 transition-all"
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>See How It Works</span>
              </a>
            </div>

            {/* Mini Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 max-w-lg">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  ✓
                </div>
                <span>Zero Platform Lock-in</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  ✓
                </div>
                <span>Verified Certifications</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  ✓
                </div>
                <span>Escrow Payment Security</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Dispatch & Technician Preview Card */}
          <div className="lg:col-span-5 relative">
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-linear-to-tr from-blue-500/20 to-indigo-500/20 rounded-3xl blur-2xl -z-10" />

            {/* Main Interactive Card */}
            <div className="relative rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl p-6 space-y-5">
              {/* Header of Card: Live Dispatch Status */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Live Dispatch #FL-8924
                    </span>
                    <h2 className="text-sm font-extrabold text-slate-900">
                      High-Density Fiber & WiFi 6 Rollout
                    </h2>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <Radio className="w-3 h-3 animate-pulse" />
                  Technician En Route
                </span>
              </div>

              {/* Technician Profile Card */}
              <div className="p-4 rounded-2xl bg-linear-to-br from-slate-50 to-blue-50/40 border border-blue-100/80 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        MV
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-slate-900">
                          Marcus Vance
                        </h4>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          PRO
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Senior Field Infrastructure Engineer
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center text-amber-500 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                          4.98
                        </div>
                        <span className="text-[11px] text-slate-400">
                          (432 work orders)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      Estimated Arrival
                    </span>
                    <span className="text-sm font-black text-blue-600">
                      12 Mins (2.4 mi)
                    </span>
                  </div>
                </div>

                {/* Badges & Verifications */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 mr-1" />
                    OSHA 30 Certified
                  </span>
                  <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                    <Award className="w-3 h-3 text-blue-600 mr-1" />
                    CompTIA Network+
                  </span>
                  <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                    <CheckCircle2 className="w-3 h-3 text-indigo-600 mr-1" />
                    Clean 10-Yr Background
                  </span>
                </div>
              </div>

              {/* Real-time Milestone Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Work Order Lifecycle</span>
                  <span className="text-blue-600 font-bold">Step 2 of 4</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <div className="h-2 rounded-full bg-emerald-500" />
                  <div className="h-2 rounded-full bg-blue-600 animate-pulse" />
                  <div className="h-2 rounded-full bg-slate-200" />
                  <div className="h-2 rounded-full bg-slate-200" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span className="text-emerald-700 font-bold">Accepted</span>
                  <span className="text-blue-700 font-bold">En Route</span>
                  <span>On-Site Diagnostics</span>
                  <span>Digital Signoff</span>
                </div>
              </div>

              {/* Live Checklist Snippet */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Required Scope of Work:
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Mount & patch 6x Cisco Catalyst 9120 Access Points</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Fluke DTX-1800 Cat6A Channel Certification & PDF Log</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Store Manager Digital Signoff & Asset Barcode Scan</span>
                </div>
              </div>

              {/* Action bar inside card */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="font-semibold text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Insured up to $2,000,000
                </span>
                <span className="font-bold text-slate-800">
                  SLA: <span className="text-emerald-600 font-extrabold">99.8% On-Time</span>
                </span>
              </div>
            </div>

            {/* Floating Metric 1 */}
            <div className="hidden sm:flex absolute -bottom-5 -left-6 items-center gap-3 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl animate-float">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Avg. Dispatch Time</span>
                <span className="text-sm font-extrabold text-slate-900">&lt; 14.8 Minutes</span>
              </div>
            </div>

            {/* Floating Metric 2 */}
            <div className="hidden sm:flex absolute -top-5 -right-6 items-center gap-3 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl animate-float-delayed">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Vetted Pool</span>
                <span className="text-sm font-extrabold text-slate-900">45,000+ Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise Client Logos Strip */}
        <div className="mt-20 pt-10 border-t border-slate-200/80 text-center">
          <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-6">
            Empowering Field Operations For Industry-Leading Enterprises
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-80 hover:opacity-100 transition-opacity">
            {clientLogos.map((client) => (
              <div
                key={client.name}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 border border-slate-200/60 shadow-2xs hover:border-blue-300 hover:bg-white transition-all"
              >
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-sm font-extrabold text-slate-800 tracking-tight">
                  {client.name}
                </span>
                <span className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                  {client.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
