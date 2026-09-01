import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import {
  Zap,
  ShieldCheck,
  Radio,
  CreditCard,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const whyChooseCards = [
    {
      icon: Zap,
      title: "AI-Powered Smart Match",
      description:
        "Our intelligent dispatch engine analyzes trade certifications, tool inventories, ratings, and live GPS proximity to match work orders in under 60 seconds.",
      badge: "Instant Dispatch",
      gradient: "from-blue-600 to-indigo-600",
      accentBg: "bg-blue-50 text-blue-600 border-blue-200/60",
    },
    {
      icon: ShieldCheck,
      title: "100% Vetted & Insured",
      description:
        "Every technician undergoes strict 10-year criminal background screening, drug testing, and certification verification with $2,000,000 in liability coverage.",
      badge: "Zero Risk",
      gradient: "from-emerald-600 to-teal-600",
      accentBg: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
    },
    {
      icon: Radio,
      title: "Live GPS & Milestone Tracking",
      description:
        "Monitor technician travel in real time with geofenced on-site clock-ins, instant photo proof of work, and digital customer sign-offs.",
      badge: "Real-time Telemetry",
      gradient: "from-purple-600 to-pink-600",
      accentBg: "bg-purple-50 text-purple-600 border-purple-200/60",
    },
    {
      icon: CreditCard,
      title: "Automated Escrow Billing",
      description:
        "Client funds are safely held in escrow and released only upon digital sign-off and deliverable verification, eliminating billing disputes.",
      badge: "Secure Payouts",
      gradient: "from-amber-500 to-orange-600",
      accentBg: "bg-amber-50 text-amber-600 border-amber-200/60",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 1. Global Navigation Bar */}
      <Navbar />

      {/* 2. Hero Section with Quick Dispatch Widget & Vetted Preview */}
      <Hero />

      {/* 3. Brief "Why Choose FieldFlow" Section */}
      <section className="py-20 md:py-28 bg-slate-50 relative overflow-hidden border-y border-slate-200/70">
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Core Operational Advantages</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Why Industry Leaders Choose{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
                FieldFlow
              </span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Purpose-built for mission-critical IT, telecom, retail, and commercial infrastructure rollouts with guaranteed SLA compliance.
            </p>
          </div>

          {/* 4 Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs transition-transform group-hover:scale-110 ${card.accentBg}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href="/services"
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group/link"
                    >
                      <span>Learn more</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Call-to-Action Section */}
      <CTA />

      {/* 5. Footer */}
      <Footer />
    </div>
  );
}