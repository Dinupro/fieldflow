"use client";

import { Star, Quote, ShieldCheck, CheckCircle2, Building2 } from "lucide-react";

export default function Testimonials() {
  const reviews = [
    {
      name: "Arthur Pendelton",
      role: "VP of IT & Infrastructure",
      company: "OmniRetail Corp",
      locations: "640 Locations Nationwide",
      impact: "Cut Rollout Costs by 42%",
      rating: 5,
      quote:
        "FieldFlow transformed how we handle store upgrades. We completed a nationwide 640-store EMV and WiFi 6 cutover in 3 weeks without a single missed SLA. The photo proof and live GPS tracking gave our command center complete peace of mind.",
      initials: "AP",
      color: "bg-blue-600",
    },
    {
      name: "Elena Rostova",
      role: "Director of Network Deployment",
      company: "MetroLink Telecom",
      locations: "Regional Tier 1 Provider",
      impact: "18 Min Emergency Dispatch",
      rating: 5,
      quote:
        "When our fiber transport nodes suffer hardware degradation, we don't have time to call 20 local contractors. FieldFlow's auto-dispatch finds certified fiber engineers with OTDR equipment in minutes. It is irreplaceable.",
      initials: "ER",
      color: "bg-indigo-600",
    },
    {
      name: "Marcus Sterling",
      role: "Head of Operations & Facilities",
      company: "Apex Logistics Hubs",
      locations: "28 Distribution Centers",
      impact: "Zero Billing Disputes",
      rating: 5,
      quote:
        "The automated escrow and digital sign-off features completely solved our vendor billing disputes. Technicians love the instant payment, and our accounting team receives clean, consolidated invoices with geotagged deliverables.",
      initials: "MS",
      color: "bg-emerald-600",
    },
  ];

  return (
    <section id="testimonials" className="py-20 md:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Trusted Enterprise Proof</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Loved by Field Operations Leaders
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            See how enterprise leaders reduce overhead, eliminate downtime, and guarantee
            flawless field execution.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="group relative rounded-3xl bg-slate-50 border border-slate-200/90 p-8 flex flex-col justify-between hover:bg-white hover:shadow-xl hover:shadow-slate-100 hover:border-blue-300 hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                {/* Top Quote & Rating */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {review.impact}
                  </span>
                </div>

                {/* Quote Text */}
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{review.quote}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="mt-8 pt-6 border-t border-slate-200/80 flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl ${review.color} text-white font-black text-base flex items-center justify-center shadow-md`}
                >
                  {review.initials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    {review.name}
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    {review.role}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3" />
                    {review.company} • {review.locations}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Capstone / Quality Assurance Banner */}
        <div className="mt-14 p-6 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <div className="text-xs uppercase font-bold text-blue-400 tracking-wider">
              Quality Assurance Commitment
            </div>
            <h4 className="text-lg font-bold text-white">
              Every job is backed by our 100% Quality & Workmanship Guarantee
            </h4>
            <p className="text-xs text-slate-400">
              If an on-site deliverable fails certification standards, we re-dispatch at zero additional cost to your company.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-emerald-400">99.8%</span>
            <span className="text-xs text-slate-300 max-w-30 leading-tight">
              Average First-Visit Resolution
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
