"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ShieldCheck,
  Headphones,
  Sparkles,
} from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    serviceType: "Networking & Fiber Splicing",
    urgency: "Standard (Scheduled)",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 900);
  };

  return (
    <section id="contact" className="py-20 md:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <Headphones className="w-3.5 h-3.5" />
                <span>24/7 Operations Desk</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Ready to Dispatch or Schedule a Consultation?
              </h2>
              <p className="text-slate-600 text-base">
                Whether you need immediate emergency break-fix technicians or want to plan
                a multi-site enterprise hardware rollout, our dispatch coordinators are ready.
              </p>
            </div>

            {/* Direct Contact Cards */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Emergency Dispatch Hotline
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Available 24/7/365 for Priority 1 Downed Circuits
                  </p>
                  <a
                    href="tel:+18005550199"
                    className="text-sm font-bold text-blue-600 hover:text-blue-700 mt-1 inline-block"
                  >
                    +1 (800) 555-FLOW (3569)
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Enterprise Solutions Desk
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    RFP inquiries, custom SLA agreements, and billing support
                  </p>
                  <a
                    href="mailto:solutions@fieldflow.io"
                    className="text-sm font-bold text-indigo-600 hover:text-indigo-700 mt-1 inline-block"
                  >
                    solutions@fieldflow.io
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    National Operations Command
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    FieldFlow Tower, 400 Tech Center Parkway, Austin, TX 78701
                  </p>
                </div>
              </div>
            </div>

            {/* SLA Trust Tag */}
            <div className="p-4 rounded-2xl bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div className="text-xs text-slate-700">
                <strong>Guaranteed Response:</strong> All standard web inquiries receive a coordinator reply within 15 minutes during business hours.
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200 shadow-xl relative">
              {isSubmitted ? (
                <div className="py-12 text-center space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">
                    Request Received Successfully!
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed">
                    Thank you, <strong>{formData.fullName}</strong>. A FieldFlow dispatch coordinator has been notified and will contact you at <strong>{formData.email}</strong> with technician availability within 15 minutes.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        fullName: "",
                        email: "",
                        company: "",
                        serviceType: "Networking & Fiber Splicing",
                        urgency: "Standard (Scheduled)",
                        message: "",
                      });
                    }}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-b border-slate-200 pb-4 mb-2">
                    <h3 className="text-xl font-black text-slate-900">
                      Request Field Service or Book a Demo
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Fill out the form below for instant technician availability.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Sarah Jenkins"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="s.jenkins@company.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        placeholder="Apex Logistics"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                        Urgency / SLA Window
                      </label>
                      <select
                        value={formData.urgency}
                        onChange={(e) =>
                          setFormData({ ...formData, urgency: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="Emergency (Under 2 Hours)">
                          🚨 Emergency (&lt; 2 Hours Arrival)
                        </option>
                        <option value="Same-Day Critical">
                          ⚡ Same-Day Critical
                        </option>
                        <option value="Next-Day Dispatch">
                          📅 Next-Day Dispatch
                        </option>
                        <option value="Scheduled Multi-Site Rollout">
                          🏢 Scheduled Multi-Site Rollout
                        </option>
                        <option value="Platform Demo & Consultation">
                          💼 Platform Demo & Consultation
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                      Required Field Service Category
                    </label>
                    <select
                      value={formData.serviceType}
                      onChange={(e) =>
                        setFormData({ ...formData, serviceType: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="Networking & Fiber Splicing">
                        Structured Cabling & Fiber Optics
                      </option>
                      <option value="POS & Retail Hardware Rollout">
                        POS & Retail Hardware Rollout
                      </option>
                      <option value="Server & Rack Infrastructure">
                        Server & Rack Network Infrastructure
                      </option>
                      <option value="Commercial CCTV & Access Control">
                        Commercial CCTV & Access Control
                      </option>
                      <option value="Smart IoT & BMS Automation">
                        Smart IoT & BMS Building Automation
                      </option>
                      <option value="EV Chargers & Power Management">
                        EV Chargers & Power Management
                      </option>
                      <option value="General Field Service Consultation">
                        Other / Custom Enterprise Requirement
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                      Scope Details & Location *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Specify site location (City/Zip), number of devices/cables, tools needed, or preferred schedule..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Submitting Request...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Work Order Request</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-2">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      100% Confidential
                    </span>
                    <span>•</span>
                    <span>No Obligation or Credit Card Required</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
