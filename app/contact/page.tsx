"use client";

import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Building2,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    serviceType: "Networking & Cabling",
    urgency: "Standard Dispatch",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = "Full name is required";
    if (!formData.email.trim()) {
      errs.email = "Work email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Please enter a valid email";
    }
    if (!formData.phone.trim()) errs.phone = "Phone number is required";
    if (!formData.message.trim()) errs.message = "Please provide scope details";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-linear-to-b from-slate-900 via-slate-900 to-blue-950 text-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>24/7 Operations Command</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Contact Our National{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-cyan-400 to-indigo-400">
              Dispatch Desk
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Need emergency break-fix technicians, nationwide multi-site rollouts, or enterprise platform onboarding? Our dispatch specialists are on standby 24/7.
          </p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-16 md:py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left 5 Cols: Company Information & Contact Channels */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-2 relative z-10">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Direct Operations Lines
                  </span>
                  <h3 className="text-2xl font-black text-white">
                    FieldFlow Headquarters
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Reach our enterprise operations desk, regional technician coordinators, and SLA compliance team.
                  </p>
                </div>

                <div className="space-y-4 relative z-10 text-xs sm:text-sm">
                  {/* Phone */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                    <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase">
                        Emergency Dispatch & Support Phone
                      </span>
                      <span className="text-sm font-bold text-white block">
                        +1 (800) 555-FLOW (3569)
                      </span>
                      <span className="text-xs text-slate-400 block">
                        Direct HQ: +1 (512) 892-4000
                      </span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase">
                        Email Dispatch Desks
                      </span>
                      <span className="text-sm font-bold text-white block">
                        dispatch@fieldflow.io
                      </span>
                      <span className="text-xs text-slate-400 block">
                        General Support: support@fieldflow.io
                      </span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase">
                        Headquarters Office
                      </span>
                      <span className="text-sm font-bold text-white block">
                        FieldFlow Technologies Inc.
                      </span>
                      <span className="text-xs text-slate-400 block leading-relaxed">
                        100 Congress Avenue, Suite 2100<br />
                        Austin, TX 78701, United States
                      </span>
                    </div>
                  </div>

                  {/* Operational Hours */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase">
                        Operating Hours
                      </span>
                      <span className="text-xs font-bold text-emerald-400 block">
                        🟢 24/7/365 Emergency Dispatch Active
                      </span>
                      <span className="text-xs text-slate-400 block">
                        Executive Offices: Mon - Fri, 8 AM - 7 PM CST
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="p-5 rounded-3xl bg-blue-50/70 border border-blue-200/80 text-xs text-slate-700 space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Guaranteed 15-Minute Dispatch SLA</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  All urgent work orders submitted through this portal are instantly broadcast to top-rated, certified technicians within a 50-mile radius.
                </p>
              </div>
            </div>

            {/* Right 7 Cols: Interactive Contact & Dispatch Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-10">
              <div className="space-y-2 mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Request Technician Consultation or Dispatch
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Fill out the form below to receive immediate technician availability and project estimates.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-4 animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-extrabold">Dispatch Request Transmitted!</h4>
                    <p className="text-xs sm:text-sm text-emerald-700 max-w-md mx-auto">
                      Thank you, <strong>{formData.fullName}</strong>. A dedicated FieldFlow operations coordinator will contact you at <strong>{formData.phone}</strong> and <strong>{formData.email}</strong> within 15 minutes.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        fullName: "",
                        email: "",
                        phone: "",
                        company: "",
                        serviceType: "Networking & Cabling",
                        urgency: "Standard Dispatch",
                        message: "",
                      });
                    }}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Arthur Pendelton"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-900 bg-white transition-all focus:outline-none focus:ring-2 ${
                          errors.fullName
                            ? "border-rose-400 focus:ring-rose-200 bg-rose-50/20"
                            : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                        }`}
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.fullName}</span>
                        </p>
                      )}
                    </div>

                    {/* Work Email */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="a.pendelton@apexlogistics.com"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-900 bg-white transition-all focus:outline-none focus:ring-2 ${
                          errors.email
                            ? "border-rose-400 focus:ring-rose-200 bg-rose-50/20"
                            : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 234-5678"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-900 bg-white transition-all focus:outline-none focus:ring-2 ${
                          errors.phone
                            ? "border-rose-400 focus:ring-rose-200 bg-rose-50/20"
                            : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>

                    {/* Company Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Apex Logistics Inc."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Discipline Selector */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                        Technical Discipline
                      </label>
                      <select
                        value={formData.serviceType}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 cursor-pointer"
                      >
                        <option value="Networking & Cabling">Structured Cabling & Fiber Splicing</option>
                        <option value="Retail POS Rollouts">Retail POS & Kiosk Rollouts</option>
                        <option value="Server & Rack Infrastructure">Server & Rack Infrastructure</option>
                        <option value="CCTV & Access Control">CCTV & Biometric Security</option>
                        <option value="Smart IoT & EV Power">Smart IoT & EV Power</option>
                        <option value="General Field Service Consultation">General Consultation</option>
                      </select>
                    </div>

                    {/* Urgency SLA */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                        Dispatch SLA Urgency
                      </label>
                      <select
                        value={formData.urgency}
                        onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 cursor-pointer"
                      >
                        <option value="Emergency (2hr SLA)">Emergency Break-Fix (2hr SLA)</option>
                        <option value="Same-Day Dispatch">Same-Day Dispatch (4-6 hrs)</option>
                        <option value="Next-Day Scheduled">Next-Day Scheduled</option>
                        <option value="Multi-Week Project Rollout">Multi-Week Project Rollout</option>
                      </select>
                    </div>
                  </div>

                  {/* Scope Message */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                      Scope of Work Details *
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please describe your job requirements, site address/zip code, equipment to mount, or timeline..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-900 bg-white transition-all focus:outline-none focus:ring-2 ${
                        errors.message
                          ? "border-rose-400 focus:ring-rose-200 bg-rose-50/20"
                          : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                      }`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-blue-600/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Transmitting Dispatch Ticket...</span>
                      </div>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Dispatch Request</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
