"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Mail,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const footerLinks = {
    services: [
      { name: "Customer Management", href: "/services" },
      { name: "Technician Management", href: "/services" },
      { name: "Work Order Management", href: "/services" },
      { name: "Real-time Job Tracking", href: "/services" },
      { name: "SLA Performance Reporting", href: "/services" },
      { name: "Commercial IT & Cabling", href: "/services" },
    ],
    platform: [
      { name: "Operations Dashboard", href: "/dashboard" },
      { name: "Live GPS Telemetry", href: "/dashboard" },
      { name: "Technician Fleet Directory", href: "/dashboard" },
      { name: "Escrow Payment Settlement", href: "/services" },
      { name: "Automated Dispatch Waterfall", href: "/services" },
    ],
    company: [
      { name: "About FieldFlow", href: "/about" },
      { name: "Services Catalog", href: "/services" },
      { name: "Contact & Dispatch Desk", href: "/contact" },
      { name: "Client Portal Login", href: "/login" },
      { name: "Join Technician Network", href: "/register" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/about" },
      { name: "Terms of Service", href: "/about" },
      { name: "Contractor Compliance Agreement", href: "/about" },
      { name: "Security & SOC 2 Compliance", href: "/about" },
    ],
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* Top Newsletter & Brand Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-14 border-b border-slate-800/80">
          {/* Brand Col */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5 text-white transform -rotate-45" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Field<span className="text-blue-500">Flow</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              The premier field service management platform connecting enterprise service
              desks with certified, background-checked on-demand field engineers nationwide.
            </p>

            {/* Live System Operational Status */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-300 font-semibold">
                All Dispatch Systems Operational
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-bold">99.99% Uptime</span>
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Field Service Insights</span>
              </div>
              <h4 className="text-lg font-bold text-white mt-1">
                Subscribe to Field Operations & SLA Trends
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Bi-weekly benchmarks on technician labor rates, rollout case studies, and FSM tech.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="mt-4 flex flex-col sm:flex-row gap-2">
              <div className="relative grow">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="Enter your enterprise email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {subscribed && (
              <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Thank you! You are subscribed to FieldFlow Insights.</span>
              </div>
            )}
          </div>
        </div>

        {/* Middle Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          <div>
            <h5 className="text-xs uppercase font-extrabold tracking-wider text-slate-200 mb-4">
              Capabilities
            </h5>
            <ul className="space-y-2.5">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-xs uppercase font-extrabold tracking-wider text-slate-200 mb-4">
              Operations Hub
            </h5>
            <ul className="space-y-2.5">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-xs uppercase font-extrabold tracking-wider text-slate-200 mb-4">
              Company & Network
            </h5>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-xs uppercase font-extrabold tracking-wider text-slate-200 mb-4">
              Trust & Compliance
            </h5>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Badges in Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SOC 2 Type II Certified</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>ISO 27001 & HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright and Capstone Note */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} FieldFlow Technologies Inc.</span>
            <span>•</span>
            <span className="text-slate-400">All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
              University Capstone Project Edition
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
