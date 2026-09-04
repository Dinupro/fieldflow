"use client";

import { useState } from "react";
import {
  FileText,
  UserCheck,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  DollarSign,
  Smartphone,
  ShieldCheck,
} from "lucide-react";

export default function HowItWorks() {
  const [activePersona, setActivePersona] = useState<"business" | "technician">(
    "business"
  );

  const businessSteps = [
    {
      step: "01",
      title: "Create Work Order & Scope",
      description:
        "Upload a single emergency ticket or batch import hundreds of multi-site rollouts via API/CSV. Set required certifications, tools, and budget.",
      icon: FileText,
      pill: "Under 2 Minutes",
    },
    {
      step: "02",
      title: "AI Auto-Matches Vetted Tech",
      description:
        "Our engine screens background checks, distance, ratings, and certifications to match and confirm the best available technician immediately.",
      icon: UserCheck,
      pill: "< 15 Min Acceptance",
    },
    {
      step: "03",
      title: "Live GPS & Execution",
      description:
        "Track technician arrival in real-time. Follow progress via geofenced check-in, live milestone updates, and mandatory task checklists.",
      icon: MapPin,
      pill: "Full Transparency",
    },
    {
      step: "04",
      title: "Verify Proof & Approve Pay",
      description:
        "Review timestamped before/after photos, Fluke test logs, and customer digital signatures. Approve work order and auto-release escrow funds.",
      icon: CheckCircle2,
      pill: "Automated Invoicing",
    },
  ];

  const techSteps = [
    {
      step: "01",
      title: "Complete Fast Verification",
      description:
        "Create your technician profile, upload certifications (OSHA, BICSI, Cisco, EPA), pass the automated background check, and select service radius.",
      icon: ShieldCheck,
      pill: "Free Registration",
    },
    {
      step: "02",
      title: "Receive High-Paying Jobs",
      description:
        "Get instant notifications for lucrative local work orders that match your exact skillset, tools, and preferred schedule.",
      icon: Briefcase,
      pill: "Guaranteed Pay Rates",
    },
    {
      step: "03",
      title: "Execute via Mobile App",
      description:
        "Use the FieldFlow app for turn-by-turn navigation, scope checklist, asset barcode scanning, and taking required jobsite deliverables.",
      icon: Smartphone,
      pill: "Offline Capable App",
    },
    {
      step: "04",
      title: "Instant Direct Deposit",
      description:
        "Get client sign-off directly on your phone screen. Funds are released instantly upon approval with zero payment chasing.",
      icon: DollarSign,
      pill: "Next-Day Direct Pay",
    },
  ];

  const steps = activePersona === "business" ? businessSteps : techSteps;

  return (
    <section
      id="how-it-works"
      className="py-20 md:py-28 bg-slate-50 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <span>Seamless Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            How FieldFlow Operates
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            A frictionless, transparent lifecycle connecting corporate service desks with
            elite on-demand field technicians.
          </p>

          {/* Toggle Switch */}
          <div className="inline-flex p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/80 mt-4">
            <button
              onClick={() => setActivePersona("business")}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activePersona === "business"
                  ? "bg-white text-slate-900 shadow-md shadow-slate-300"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              For Businesses & Clients
            </button>
            <button
              onClick={() => setActivePersona("technician")}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activePersona === "technician"
                  ? "bg-white text-slate-900 shadow-md shadow-slate-300"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              For Field Technicians
            </button>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group relative rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/70 hover:border-blue-300 hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  {/* Top Step Number and Pill */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black text-slate-300 group-hover:text-blue-600 transition-colors">
                      {item.step}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {item.pill}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Arrow Connector Indicator */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-slate-400 group-hover:text-blue-600">
                  <span>
                    {index === 3
                      ? "Process Complete"
                      : `Next: Step ${index + 2}`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <div className="mt-14 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Ready to dispatch your first field technician today?
              </h4>
              <p className="text-xs text-slate-500">
                Sign up in under 60 seconds. No credit card required to explore vetted coverage.
              </p>
            </div>
          </div>

          <a
            href="#contact"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 whitespace-nowrap transition-all"
          >
            Get Started Now
          </a>
        </div>
      </div>
    </section>
  );
}
