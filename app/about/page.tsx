import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import CTA from "@/components/landing/CTA";
import Statistics from "@/components/landing/Statistics";
import Testimonials from "@/components/landing/Testimonials";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Sparkles,
  Lock,
  Server,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export default function AboutPage() {
  const engineeringPillars = [
    {
      icon: Zap,
      title: "Algorithmic Dispatch Engine",
      description:
        "High-performance proximity matching that pairs service requests with certified, nearby field technicians in under 60 seconds using real-time GPS telemetry.",
      tag: "Automated Logistics",
    },
    {
      icon: ShieldCheck,
      title: "Geofenced Proof of Work",
      description:
        "GPS-fenced check-in validation, digital asset photo verification, and electronic customer signature sign-offs recorded at every milestone.",
      tag: "Audit Integrity",
    },
    {
      icon: Lock,
      title: "Secure Escrow & Settlement",
      description:
        "Two-party escrow smart billing that secures enterprise funds and releases automatic direct payouts upon job acceptance and verified sign-off.",
      tag: "Financial Reliability",
    },
    {
      icon: Server,
      title: "Enterprise Architecture",
      description:
        "Built on Next.js 16 App Router, TypeScript, Tailwind CSS v4, and Prisma ORM for ultra-low latency, SOC 2 compliance, and high scalability.",
      tag: "Modern Stack",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar />

      {/* Hero Header for About Page */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-linear-to-b from-slate-900 via-slate-900 to-blue-950 text-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-162.5 h-87.5 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>About FieldFlow Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Bridging the Gap Between Enterprise Needs &{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-cyan-400 to-indigo-400">
              Elite Field Engineering
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            FieldFlow was engineered to modernize field service management. We replace legacy phone dispatch and disconnected contractor lists with a unified, transparent, and automated operating system for on-demand field technical labor.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/services"
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
            >
              <span>Explore Capabilities</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm flex items-center gap-2 transition-all"
            >
              <span>Contact Dispatch Desk</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                <BookOpen className="w-4 h-4" />
                <span>Our Founding Mission</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Eliminating Operational Friction in Field Dispatch
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Traditional field service operations suffer from opaque contractor pricing, missed SLAs, lack of real-time GPS arrival visibility, and slow paper invoicing.
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                FieldFlow solves this with a modern, cloud-native dispatch ecosystem. By combining automated geofenced milestones, strict contractor vetting, and automated escrow payments, we ensure that every work order is executed on time and to exact technical specifications.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-2xl font-black text-blue-600">&lt; 14.8 Min</div>
                  <div className="text-xs font-bold text-slate-800">Avg. Dispatch Match</div>
                  <p className="text-[11px] text-slate-500">From ticket open to technician acceptance</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-2xl font-black text-emerald-600">99.8%</div>
                  <div className="text-xs font-bold text-slate-800">On-Time Arrival</div>
                  <p className="text-[11px] text-slate-500">Backed by financial SLA guarantee</p>
                </div>
              </div>
            </div>

            {/* Architecture Highlights Card */}
            <div className="p-8 rounded-3xl bg-slate-900 text-white space-y-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-2 relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Capstone Engineering Excellence
                </span>
                <h3 className="text-2xl font-black text-white">
                  Technical Architecture
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Designed from the ground up as a premier University Capstone showcase adhering to enterprise standards.
                </p>
              </div>

              <div className="space-y-3 relative z-10 text-xs">
                {[
                  { title: "Next.js 16 App Router", desc: "Server Components & optimized Turbopack rendering." },
                  { title: "Prisma ORM & PostgreSQL", desc: "Type-safe database operations and relational integrity." },
                  { title: "Better Auth Security", desc: "Role-based customer and technician credential management." },
                  { title: "Tailwind CSS v4", desc: "Modern CSS design system with ultra-responsive mobile drawer." },
                ].map((item) => (
                  <div key={item.title} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <span className="font-bold text-white block">{item.title}</span>
                    <span className="text-slate-400 text-[11px]">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Pillars Section */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Core Platform Pillars</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Engineered for Mission-Critical SLAs
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Four fundamental architectural pillars make FieldFlow the most reliable field service system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {engineeringPillars.map((p) => {
              const PIcon = p.icon;
              return (
                <div
                  key={p.title}
                  className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all space-y-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
                    <PIcon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 inline-block">
                    {p.tag}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Operational Statistics */}
      <Statistics />

      {/* Testimonials */}
      <Testimonials />

      {/* CTA & Footer */}
      <CTA />
      <Footer />
    </div>
  );
}
