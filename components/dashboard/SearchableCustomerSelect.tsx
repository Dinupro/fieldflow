"use client";

import React, { useState, useRef, useEffect } from "react";
import { Building2, Search, Plus, Check, ChevronDown, User, MapPin, Phone } from "lucide-react";

export interface CustomerOption {
  id: string;
  name: string;
  company: string | null;
  city: string | null;
  phone?: string;
  email?: string;
  address?: string;
}

interface SearchableCustomerSelectProps {
  customers: CustomerOption[];
  selectedId: string;
  onChange: (customerId: string) => void;
  onOpenNewCustomerModal: () => void;
  error?: string;
  disabled?: boolean;
}

export default function SearchableCustomerSelect({
  customers,
  selectedId,
  onChange,
  onOpenNewCustomerModal,
  error,
  disabled = false,
}: SearchableCustomerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCustomer = customers.find((c) => c.id === selectedId);

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    );
  });

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Client Customer *</span>
        </label>
        <button
          type="button"
          onClick={onOpenNewCustomerModal}
          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>+ Add New Customer</span>
        </button>
      </div>

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3.5 py-2.5 rounded-2xl border text-left bg-slate-50 hover:bg-white focus:bg-white text-xs font-medium text-slate-900 transition-all flex items-center justify-between cursor-pointer ${
            error
              ? "border-rose-300 ring-2 ring-rose-100"
              : isOpen
              ? "border-blue-600 ring-2 ring-blue-100 bg-white"
              : "border-slate-200"
          }`}
        >
          {selectedCustomer ? (
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                {selectedCustomer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="truncate">
                <span className="font-bold text-slate-900">{selectedCustomer.name}</span>
                {selectedCustomer.company && (
                  <span className="text-slate-500 text-[11px] ml-1.5">({selectedCustomer.company})</span>
                )}
                {selectedCustomer.city && (
                  <span className="text-slate-400 text-[10px] ml-1.5">• {selectedCustomer.city}</span>
                )}
              </div>
            </div>
          ) : (
            <span className="text-slate-400">Select a customer or add a new one...</span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-blue-600" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-fadeIn">
            {/* Search Input and Add Customer Quick Button */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/70 space-y-1.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer by name, company, city, phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-blue-600 font-medium"
                  autoFocus
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenNewCustomerModal();
                }}
                className="w-full py-1.5 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-blue-200/60"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Customer Record</span>
              </button>
            </div>

            {/* List */}
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-50 p-1 text-xs">
              {filteredCustomers.length === 0 ? (
                <div className="p-4 text-center text-slate-400 space-y-2">
                  <p className="text-xs">No customer matching "{search}"</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenNewCustomerModal();
                    }}
                    className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create "{search}"</span>
                  </button>
                </div>
              ) : (
                filteredCustomers.map((cust) => {
                  const isSelected = cust.id === selectedId;
                  return (
                    <div
                      key={cust.id}
                      onClick={() => {
                        onChange(cust.id);
                        setIsOpen(false);
                      }}
                      className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? "bg-blue-50 text-blue-900 font-bold" : "hover:bg-slate-50 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-black text-[10px] flex items-center justify-center shrink-0">
                          {cust.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">{cust.name}</div>
                          <div className="text-[10px] text-slate-500 truncate flex items-center gap-1.5">
                            {cust.company && <span>{cust.company}</span>}
                            {cust.city && <span>• {cust.city}</span>}
                            {cust.phone && <span>• {cust.phone}</span>}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {error && <span className="text-[11px] text-rose-600 block">{error}</span>}

      {/* Selected Customer Preview Card */}
      {selectedCustomer && (
        <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between text-[11px] text-slate-600 animate-fadeIn">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">
              {selectedCustomer.address || selectedCustomer.city || "Service location linked"}
            </span>
          </div>
          {selectedCustomer.phone && (
            <div className="flex items-center gap-1 text-slate-500 font-semibold shrink-0">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{selectedCustomer.phone}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
