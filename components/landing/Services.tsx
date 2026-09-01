"use client";

import { useState } from "react";
import {
  Network,
  CreditCard,
  Server,
  Camera,
  Cpu,
  Zap,
  Tv,
  Wrench,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export default function Services() {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Field Services" },
    { id: "it", label: "IT & Cabling" },
    { id: "retail", label: "Retail & POS" },
    { id: "security", label: "Security & CCTV" },
    { id: "smart", label: "Smart IoT & EV" },
  ];

  const serviceList = [
    {
      id: "cabling",
      category: "it",
      title: "Structured Cabling & Fiber Optics",
      description:
        "Cat6/Cat6A horizontal runs, optical fiber fusion splicing, OTDR channel certification, and IDF/MDF rack cable dressing.",
      icon: Network,
      sla: "Next-Day / Emergency 4hr",
      techsAvailable: "1,420+",
      skills: ["Fluke Certified", "Single/Multi-mode Splicing", "Patch Panel Clean-up"],
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "pos",
      category: "retail",
      title: "POS & Retail Hardware Rollouts",
      description:
        "Turnkey installation and cutover of POS terminals, receipt printers, barcode scanners, PIN pads, and self-checkout kiosks across retail chains.",
      icon: CreditCard,
      sla: "Scheduled Multi-site",
      techsAvailable: "980+",
      skills: ["Verifone / Ingenico", "NCR Kiosks", "After-hours Cutover"],
      color: "from-emerald-500 to-teal-600",
    },
    {
      id: "server",
      category: "it",
      title: "Server & Network Infrastructure",
      description:
        "Rack & stack servers, enterprise router/firewall installation, SD-WAN gateway deployment, UPS replacements, and smart PDU config.",
      icon: Server,
      sla: "2-4 Hour Critical SLA",
      techsAvailable: "840+",
      skills: ["Cisco & Meraki", "Fortinet & Palo Alto", "Data Center Escort"],
      color: "from-indigo-500 to-purple-600",
    },
    {
      id: "cctv",
      category: "security",
      title: "Commercial CCTV & Access Control",
      description:
        "Deployment of IP dome/bullet cameras, PTZ configurations, NVR/VMS setup, electronic door strikes, and biometric badge readers.",
      icon: Camera,
      sla: "Same-Day Response",
      techsAvailable: "1,150+",
      skills: ["Hikvision & Axis", "Door King & HID Badges", "PoE Optimization"],
      color: "from-rose-500 to-orange-600",
    },
    {
      id: "iot",
      category: "smart",
      title: "Smart Building & IoT Sensors",
      description:
        "Environmental sensors, smart HVAC thermostats, gateway bridges, motion telemetry, and building management system (BMS) integrations.",
      icon: Cpu,
      sla: "Flexible Dispatch",
      techsAvailable: "620+",
      skills: ["Zigbee / LoRaWAN", "BACnet Protocols", "Edge Gateways"],
      color: "from-cyan-500 to-blue-600",
    },
    {
      id: "ev",
      category: "smart",
      title: "EV Chargers & Power Management",
      description:
        "Commercial Level 2 and DC Fast EV charger commissioning, smart load management modules, and electrical safety compliance audits.",
      icon: Zap,
      sla: "Scheduled & Maintenance",
      techsAvailable: "490+",
      skills: ["Licensed Electricians", "ChargePoint / Tesla Commercial", "Load Balancing"],
      color: "from-amber-500 to-yellow-600",
    },
    {
      id: "av",
      category: "retail",
      title: "Audio/Visual & Digital Signage",
      description:
        "Multi-panel video walls, conference room Zoom/Teams room kits, commercial menu displays, and ceiling audio speaker integration.",
      icon: Tv,
      sla: "Next-Day",
      techsAvailable: "730+",
      skills: ["BrightSign Players", "Crestron / Polycom", "Ceiling Grid Mounts"],
      color: "from-violet-500 to-indigo-600",
    },
    {
      id: "breakfix",
      category: "it",
      title: "24/7 Rapid Emergency Break-Fix",
      description:
        "Immediate dispatch for downed telecom circuits, power supply failures, switch crashes, and hardware part swap dispatches.",
      icon: Wrench,
      sla: "< 2 Hour Guaranteed Arrival",
      techsAvailable: "2,200+ on-call",
      skills: ["Live Remote Escort", "Hot Swap Spares", "Full Root Cause Log"],
      color: "from-red-500 to-pink-600",
    },
  ];

  const filteredServices =
    activeCategory === "all"
      ? serviceList
      : serviceList.filter((s) => s.category === activeCategory);

  return (
    <section id="services" className="py-20 md:py-28 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full-Spectrum Field Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Specialized Field Services Tailored for Every Industry
            </h2>
            <p className="text-slate-600 text-base">
              From single site emergency troubleshooting to nationwide 1,000+ location
              hardware cutovers, our vetted field technicians deliver exceptional craftsmanship.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeCategory === cat.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredServices.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="group relative rounded-3xl bg-white border border-slate-200/80 p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/80 hover:border-blue-300 hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  {/* Top Icon & Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-linear-to-tr ${service.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span>{service.sla}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Skills Checklist */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Verified Capabilities:
                    </span>
                    {service.skills.map((skill) => (
                      <div
                        key={skill}
                        className="flex items-center gap-1.5 text-xs text-slate-700 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer of Card */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">
                    <strong className="text-slate-900 font-bold">
                      {service.techsAvailable}
                    </strong>{" "}
                    Techs active
                  </span>
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 group/btn"
                  >
                    <span>Dispatch</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner inside Services */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">
                Need a Custom SLA or Nationwide Multi-Site Deployment?
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Our enterprise project desk can mobilize 50+ technicians simultaneously for weekend cutovers.
              </p>
            </div>
          </div>
          <a
            href="#contact"
            className="shrink-0 px-6 py-3 rounded-xl bg-white text-slate-900 hover:bg-blue-50 font-bold text-sm shadow-md transition-all whitespace-nowrap"
          >
            Talk to Enterprise Desk
          </a>
        </div>
      </div>
    </section>
  );
}
