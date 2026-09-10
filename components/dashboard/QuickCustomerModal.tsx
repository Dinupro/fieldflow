"use client";

import React, { useState } from "react";
import { Building2, X, Plus, Phone, Mail, MapPin, User, Check } from "lucide-react";

export interface CreatedCustomerData {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  address: string;
  city: string | null;
}

interface QuickCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: (customer: CreatedCustomerData) => void;
}

export default function QuickCustomerModal({
  isOpen,
  onClose,
  onCustomerCreated,
}: QuickCustomerModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = "Customer name is required (min 2 characters).";
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "A valid email address is required.";
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 7) {
      errs.phone = "Phone number is required (min 7 digits).";
    }
    if (!formData.address.trim() || formData.address.trim().length < 5) {
      errs.address = "Service address is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          company: formData.company.trim() || null,
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim() || null,
          notes: formData.notes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        }
        throw new Error(data.error || "Failed to create customer.");
      }

      onCustomerCreated(data);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating customer";
      setErrors((prev) => ({ ...prev, global: msg }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add New Customer</h3>
              <p className="text-xs text-slate-500">Quickly create client and link to work order</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errors.global && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errors.global}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Contact / Name *</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full pl-8.5 pr-3 py-2 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none ${errors.name ? "border-rose-300" : "border-slate-200 focus:border-blue-600"
                    }`}
                />
              </div>
              {errors.name && <span className="text-[10px] text-rose-600 block">{errors.name}</span>}
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Company / Facility</label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Apex Health Logistics"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full pl-8.5 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Email Address *</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="sarah@apexhealth.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-8.5 pr-3 py-2 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none ${errors.email ? "border-rose-300" : "border-slate-200 focus:border-blue-600"
                    }`}
                />
              </div>
              {errors.email && <span className="text-[10px] text-rose-600 block">{errors.email}</span>}
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Phone Number *</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="+1 (512) 555-0199"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full pl-8.5 pr-3 py-2 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none ${errors.phone ? "border-rose-300" : "border-slate-200 focus:border-blue-600"
                    }`}
                />
              </div>
              {errors.phone && <span className="text-[10px] text-rose-600 block">{errors.phone}</span>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Service Location Address *</label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. 100 Congress Ave, Floor 14"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={`w-full pl-8.5 pr-3 py-2 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none ${errors.address ? "border-rose-300" : "border-slate-200 focus:border-blue-600"
                  }`}
              />
            </div>
            {errors.address && <span className="text-[10px] text-rose-600 block">{errors.address}</span>}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">City / Region</label>
              <input
                type="text"
                placeholder="Austin, TX"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Site Access Notes</label>
              <input
                type="text"
                placeholder="Keycard required at front desk"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {submitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Create & Select Customer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
