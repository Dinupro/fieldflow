import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import CTA from "@/components/landing/CTA";
import Link from "next/link";
import {
  Building2,
  Users,
  FileText,
  Radio,
  BarChart3,
  Wrench,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Server,
  Camera,
  Tv,
  Cpu,
  Zap,
} from "lucide-react";

export default function ServicesPage() {
  const coreCapabilities = [
    {
      id: "customer-management",
      title: "Customer Management",
      icon: Building2,
      tag: "Multi-Site Hierarchy",
      color: "from-blue-600 to-indigo-600",
      accentBg: "bg-blue-50 text-blue-600",
      description:
        "Centralized client directory for managing hundreds of regional facilities, enterprise contracts, billing preferences, and custom service level agreements (SLAs).",
      features: [
        "Multi-facility hierarchy mapping & regional clustering",
        "Custom billing profiles & automated monthly invoicing",
        "Dedicated corporate dispatch permissions and role controls",
        "Real-time site access authorization and security badging",
      ],
    },
    {
      id: "technician-management",
      title: "Technician Management",
      icon: Users,
      tag: "45,000+ Vetted Network",
      color: "from-emerald-600 to-teal-600",
      accentBg: "bg-emerald-50 text-emerald-600",
      description:
        "Comprehensive contractor vetting and fleet management engine that tracks certifications, live GPS locations, trade toolkits, and historical quality scores.",
      features: [
        "10-year criminal background screening & drug testing verification",
        "Live trade credential audit (CompTIA, Fluke, BICSI, Cisco, OSHA)",
        "Real-time GPS availability telemetry and skill matching",
        "Guaranteed next-day direct payout engine upon work verification",
      ],
    },
    {
      id: "work-order-management",
      title: "Work Order Management",
      icon: FileText,
      tag: "End-to-End Workflow",
      color: "from-purple-600 to-pink-600",
      accentBg: "bg-purple-50 text-purple-600",
      description:
        "Intuitive work order lifecycle engine from initial dispatch creation and scope checklists to milestone approvals and financial settlement.",
      features: [
        "Automated scope-of-work templates for rapid dispatch",
        "Multi-technician team assignments for large store rollouts",
        "Custom priority tiers: Emergency 2hr, Same-day 4hr, Scheduled",
        "Integrated parts, serial numbers, and equipment tracking",
      ],
    },
    {
      id: "job-tracking",
      title: "Real-Time Job Tracking",
      icon: Radio,
      tag: "Geofenced Telemetry",
      color: "from-amber-500 to-orange-600",
      accentBg: "bg-amber-50 text-amber-600",
      description:
        "High-precision GPS telemetry with geofenced arrival clock-ins, live milestone notifications, and digital photo proof of work uploads.",
      features: [
        "Automated geofence check-in and checkout validation",
        "Time-stamped before & after photo proof of installation",
        "OTDR fiber & Fluke copper certification PDF file uploads",
        "Customer digital signature sign-off directly on technician mobile app",
      ],
    },
    {
      id: "reporting",
      title: "SLA & Financial Reporting",
      icon: BarChart3,
      tag: "Audit & Analytics",
      color: "from-cyan-600 to-blue-600",
      accentBg: "bg-cyan-50 text-cyan-600",
      description:
        "Executive dashboards and exportable audit logs analyzing first-time fix rates, dispatch velocity, technician performance benchmarks, and escrow accounting.",
      features: [
        "First-time resolution and on-time arrival rate metrics",
        "Trade category cost efficiency and spend breakdown",
        "Automated escrow settlement ledgers with PDF/CSV export",
        "Contractor performance scoring & SLA breach prevention alerts",
      ],
    },
  ];

  const fieldCategories = [
    {
      title: "Structured Cabling & Fiber",
      icon: Wrench,
      sla: "2-Hour Emergency SLA",
      desc: "Cat6A / Cat7 copper termination, high-strand fusion splicing, OTDR testing, and patch panel dressing.",
    },
    {
      title: "Retail POS & Kiosk Rollouts",
      icon: Tv,
      sla: "Multi-Store Scheduled",
      desc: "NCR, Verifone, and Ingenico terminal deployments, self-checkout kiosks, barcode scanners, and pin pads.",
    },
    {
      title: "Server & Rack Infrastructure",
      icon: Server,
      sla: "24/7 Smart Hands",
      desc: "Data center rack & stack, Cisco 9300 switches, SD-WAN router installs, server blade cutovers, and PDU wiring.",
    },
    {
      title: "CCTV & Biometric Access",
      icon: Camera,
      sla: "Same-Day Dispatch",
      desc: "Axis/Hikvision IP camera mounting, PoE switches, HID door strikes, keycard readers, and NVR replacements.",
    },
    {
      title: "Smart IoT & EV Power",
      icon: Cpu,
      sla: "Certified Electricians",
      desc: "Commercial Level 2 and DC Fast EV charging stations, BMS sensor gateways, submeters, and power cutovers.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar />

      {/* Services Hero Header */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-linear-to-b from-slate-900 via-slate-900 to-blue-950 text-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-162.5 h-87.5 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FieldFlow Capabilities</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Complete Field Service Operations.{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-cyan-400 to-indigo-400">
              One Unified Platform.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            From algorithmic dispatch and contractor vetting to geofenced GPS tracking and automated escrow settlements, explore how FieldFlow transforms technical field services.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm flex items-center gap-2 transition-all"
            >
              <span>Talk with an Ops Specialist</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5 Core Capabilities Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Core Modules</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Enterprise Field Service Capabilities
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              The 5 essential pillars powering seamless nationwide dispatch operations.
            </p>
          </div>

          <div className="space-y-12">
            {coreCapabilities.map((cap, idx) => {
              const Icon = cap.icon;
              const isEven = idx % 2 === 1;
              return (
                <div
                  key={cap.id}
                  id={cap.id}
                  className={`grid lg:grid-cols-12 gap-8 items-center p-8 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm hover:shadow-md transition-all ${
                    isEven ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <div className={`lg:col-span-6 space-y-4 ${isEven ? "lg:order-2" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${cap.accentBg}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
                        {cap.tag}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                      {cap.title}
                    </h3>

                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      {cap.description}
                    </p>

                    <div className="space-y-2 pt-2">
                      {cap.features.map((feat) => (
                        <div key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3">
                      <Link
                        href="/register"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 group"
                      >
                        <span>Experience {cap.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>

                  <div className={`lg:col-span-6 ${isEven ? "lg:order-1" : ""}`}>
                    <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800">
                          Live Architecture Highlight
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Production Ready
                        </span>
                      </div>
                      <div className="space-y-2 text-xs text-slate-600">
                        <p className="leading-relaxed">
                          Integrated into FieldFlow&apos;s Next.js 16 core with instant database synchronization via Prisma ORM.
                        </p>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                          <div className="flex justify-between font-mono text-[11px] text-slate-700">
                            <span>SLA Metric Adherence:</span>
                            <span className="text-emerald-600 font-bold">99.8%</span>
                          </div>
                          <div className="flex justify-between font-mono text-[11px] text-slate-700">
                            <span>Avg. Dispatch Time:</span>
                            <span className="text-blue-600 font-bold">&lt; 14.8 Min</span>
                          </div>
                          <div className="flex justify-between font-mono text-[11px] text-slate-700">
                            <span>Escrow Protection:</span>
                            <span className="text-purple-600 font-bold">Automated</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Specialized Field Trades Catalog */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Specialized Technical Disciplines</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Coverage Across Every Field Discipline
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Certified engineers available 24/7 for commercial rollouts and critical infrastructure repair.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fieldCategories.map((cat) => {
              const CIcon = cat.icon;
              return (
                <div
                  key={cat.title}
                  className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                      <CIcon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {cat.sla}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {cat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA & Footer */}
      <CTA />
      <Footer />
    </div>
  );
}
