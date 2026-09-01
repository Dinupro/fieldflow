"use client";

import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle2,
} from "lucide-react";

export default function CTA() {
  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Dynamic Gradient Orbs & Grid */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-100 bg-linear-to-tr from-blue-600/30 via-indigo-600/30 to-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [bg-size:20px_20px] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl bg-linear-to-b from-slate-800/90 to-slate-900/95 border border-slate-700/80 p-8 sm:p-12 lg:p-16 shadow-2xl text-center space-y-8 max-w-5xl mx-auto">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modernize Your Field Services Today</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Stop Losing Time on Manual Dispatch.{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-cyan-400 to-indigo-400">
              Deploy Vetted Field Technicians Instantly.
            </span>
          </h2>

          {/* Subtext */}
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Join thousands of businesses who trust FieldFlow for fast, on-demand field engineering,
            flawless SLA execution, and automated milestone payouts.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Zap className="w-5 h-5" />
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-600 text-white font-bold text-sm sm:text-base transition-all"
            >
              <Users className="w-5 h-5 text-slate-400" />
              <span>Sign In to Portal</span>
            </Link>
          </div>

          {/* Value Assurances Row */}
          <div className="pt-6 border-t border-slate-700/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-300">
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>14-Day Free Evaluation</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>100% Background Checked</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink: 0" />
              <span>No Upfront Credit Card</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>24/7 Dedicated Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
