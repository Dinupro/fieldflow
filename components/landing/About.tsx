"use client";

import {
  ShieldCheck,
  Zap,
  Globe,
  Cpu,
  Layers,
  CheckCircle2,
  Award,
  BookOpen,
} from "lucide-react";

export default function About() {
  const pillars = [
    {
      title: "Engineered for Trust & Compliance",
      desc: "Every technician in the FieldFlow network undergoes rigorous identity verification, 10-year criminal background screening, and skill assessments.",
      icon: ShieldCheck,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Real-time Geospatial Intelligence",
      desc: "Built on high-concurrency event telemetry, ensuring dispatchers and clients maintain sub-second visibility over field assets and technician ETAs.",
      icon: Zap,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Modern Full-Stack Architecture",
      desc: "Designed as an enterprise-grade SaaS leveraging Next.js App Router, TypeScript, Prisma ORM, and PostgreSQL for maximum performance and security.",
      icon: Cpu,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      title: "Nationwide On-Demand Footprint",
      desc: "Connecting enterprise clients with over 45,000 certified technicians across all 50 states, from major metropolitan hubs to rural facilities.",
      icon: Globe,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <section id="about" className="py-20 md:py-28 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Vision & About Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>About FieldFlow</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Pioneering the Future of{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Field Service Intelligence
              </span>
            </h2>

            <p className="text-slate-600 text-base leading-relaxed">
              FieldFlow was conceived to solve the critical bottlenecks plaguing traditional field
              services: unpredictable contractor quality, manual phone-based dispatching, lack of
              live tracking, and tedious invoice disputes.
            </p>

            <p className="text-slate-600 text-base leading-relaxed">
              By combining on-demand talent marketplaces with robust SaaS work order workflows,
              FieldFlow empowers companies to scale their physical IT, telecom, and building
              infrastructure with the same agility as cloud software.
            </p>

            {/* Capstone Project Feature Callout */}
            <div className="p-4 rounded-2xl bg-white border border-blue-200/80 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Capstone Engineering Excellence</span>
              </div>
              <p className="text-xs text-slate-600 leading-normal">
                Built with strict type safety, modular component hierarchy, responsive UX,
                and scalable database models ready for production enterprise deployment.
              </p>
            </div>
          </div>

          {/* Right Column: 4 Core Pillars Grid */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`w-12 h-12 rounded-2xl ${pillar.color} flex items-center justify-center mb-4`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-bold text-blue-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Standard</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
