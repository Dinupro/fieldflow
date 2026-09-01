"use client";

import { useState } from "react";
import {
  Building2,
  Search,
  Plus,
  Filter,
  MapPin,
  FileText,
  Phone,
  Mail,
  CheckCircle2,
  ArrowRight,
  Download,
} from "lucide-react";

export default function CustomersView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", industry: "", locations: "", email: "" });
  const [successToast, setSuccessToast] = useState(false);

  const initialCustomers = [
    {
      id: "CUST-101",
      name: "Apex Logistics & Supply Hubs",
      industry: "Supply Chain & Warehousing",
      locations: "28 Distribution Centers",
      activeOrders: 6,
      tier: "Enterprise Platinum",
      spend: "$142,500",
      contact: "Arthur Pendelton (VP Ops)",
      email: "a.pendelton@apexlogistics.com",
      status: "Active SLA",
    },
    {
      id: "CUST-102",
      name: "OmniRetail SuperCenters",
      industry: "Retail & POS Hardware",
      locations: "640 Nationwide Stores",
      activeOrders: 14,
      tier: "Enterprise Gold",
      spend: "$380,000",
      contact: "Elena Rostova (IT Director)",
      email: "elena.r@omniretail.com",
      status: "Active SLA",
    },
    {
      id: "CUST-103",
      name: "MetroLink Tier-1 Telecom",
      industry: "Enterprise Fiber & Transport",
      locations: "18 Regional Nodes",
      activeOrders: 4,
      tier: "Custom SLA",
      spend: "$94,200",
      contact: "Marcus Sterling (Lead Eng)",
      email: "m.sterling@metrolink.net",
      status: "Active SLA",
    },
    {
      id: "CUST-104",
      name: "Nexus Healthcare Campus",
      industry: "Healthcare & Critical Facilities",
      locations: "12 Hospitals & Clinics",
      activeOrders: 2,
      tier: "Standard Commercial",
      spend: "$58,400",
      contact: "Dr. Rachel Kim (Facility VP)",
      email: "rkim@nexushealth.org",
      status: "Active SLA",
    },
    {
      id: "CUST-105",
      name: "Skyline EV Mobility Stations",
      industry: "EV Charging Infrastructure",
      locations: "85 Fast Charging Plazas",
      activeOrders: 5,
      tier: "Enterprise Gold",
      spend: "$112,000",
      contact: "Derek Walsh (Ops Lead)",
      email: "dwalsh@skylineev.com",
      status: "Active SLA",
    },
  ];

  const [customerList, setCustomerList] = useState(initialCustomers);

  const filtered = customerList.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name) return;
    const added = {
      id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
      name: newCustomer.name,
      industry: newCustomer.industry || "Commercial Infrastructure",
      locations: newCustomer.locations || "1 Site",
      activeOrders: 1,
      tier: "Standard Commercial",
      spend: "$0.00",
      contact: "Primary Coordinator",
      email: newCustomer.email || "info@client.com",
      status: "Active SLA",
    };
    setCustomerList([added, ...customerList]);
    setShowAddModal(false);
    setNewCustomer({ name: "", industry: "", locations: "", email: "" });
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Customer Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage enterprise client accounts, service agreements, and multi-site locations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer Account</span>
          </button>
        </div>
      </div>

      {/* Toast */}
      {successToast && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>New enterprise customer account provisioned successfully.</span>
        </div>
      )}

      {/* Customer Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Client Accounts", val: "128", sub: "Nationwide footprint" },
          { label: "Multi-Site Locations", val: "1,420", sub: "Managed facilities" },
          { label: "Active SLA Contracts", val: "98.2%", sub: "Zero churn this quarter" },
          { label: "Total Invoiced Volume", val: "$4.8M+", sub: "Escrow settled" },
        ].map((m) => (
          <div
            key={m.label}
            className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-1"
          >
            <span className="text-xs font-semibold text-slate-500">{m.label}</span>
            <h3 className="text-2xl font-black text-slate-900">{m.val}</h3>
            <p className="text-[11px] text-slate-400">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, industry, or contact..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter Tier</span>
          </button>
          <button className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Account ID & Name</th>
                <th className="py-3.5 px-3">Industry & Footprint</th>
                <th className="py-3.5 px-3">Primary Contact</th>
                <th className="py-3.5 px-3">Service Tier</th>
                <th className="py-3.5 px-3 text-center">Active Jobs</th>
                <th className="py-3.5 px-4 text-right">Total Invoiced</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4">
                    <span className="text-[10px] font-extrabold text-blue-600 block">
                      {c.id}
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm block">
                      {c.name}
                    </span>
                  </td>

                  <td className="py-4 px-3">
                    <span className="font-semibold text-slate-700 block">
                      {c.industry}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {c.locations}
                    </span>
                  </td>

                  <td className="py-4 px-3">
                    <span className="font-medium text-slate-800 block">
                      {c.contact}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {c.email}
                    </span>
                  </td>

                  <td className="py-4 px-3">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      {c.tier}
                    </span>
                  </td>

                  <td className="py-4 px-3 text-center">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700">
                      {c.activeOrders}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right font-black text-slate-900 text-sm">
                    {c.spend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Add Enterprise Customer Account
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Skyline Data Facilities"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Industry Vertical
                </label>
                <input
                  type="text"
                  placeholder="e.g. Retail POS, Data Center, Telecommunications"
                  value={newCustomer.industry}
                  onChange={(e) => setNewCustomer({ ...newCustomer, industry: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Managed Sites
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15 Locations"
                    value={newCustomer.locations}
                    onChange={(e) => setNewCustomer({ ...newCustomer, locations: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Primary Email
                  </label>
                  <input
                    type="email"
                    placeholder="ops@client.com"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
