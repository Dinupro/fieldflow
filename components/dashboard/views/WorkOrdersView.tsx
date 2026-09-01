"use client";

import { useState } from "react";
import {
  FileText,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Radio,
  MapPin,
  DollarSign,
  Download,
  Building2,
} from "lucide-react";

export default function WorkOrdersView() {
  const [filterTab, setFilterTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const initialOrders = [
    {
      id: "WO-9912",
      title: "Cisco Catalyst 9300 Core Switch Cutover",
      customer: "Apex Logistics Hub #4",
      site: "Austin Metro Center, Floor 4",
      tech: "Marcus Vance",
      category: "Enterprise IT & Cabling",
      priority: "Emergency (2hr SLA)",
      priorityColor: "bg-rose-100 text-rose-800 border-rose-200",
      status: "En Route",
      statusBadge: "bg-blue-100 text-blue-800",
      slaCountdown: "42 mins remaining",
      escrow: "$840.00",
      date: "Today, 10:30 AM",
    },
    {
      id: "WO-9913",
      title: "Verifone & Ingenico POS Terminal Migration (6 lanes)",
      customer: "OmniRetail SuperCenters",
      site: "Dallas Galleria Store #184",
      tech: "Devon Miller",
      category: "Retail & POS Hardware",
      priority: "Scheduled Multi-site",
      priorityColor: "bg-blue-100 text-blue-800 border-blue-200",
      status: "On-Site",
      statusBadge: "bg-purple-100 text-purple-800",
      slaCountdown: "In Progress (60% done)",
      escrow: "$1,250.00",
      date: "Today, 08:00 AM",
    },
    {
      id: "WO-9914",
      title: "Fluke Cat6A Channel Certification & OTDR Fiber Splice",
      customer: "MetroLink Tier-1 Telecom",
      site: "Houston Transport Node #12",
      tech: "Sarah Lin",
      category: "Structured Cabling",
      priority: "Critical SLA",
      priorityColor: "bg-amber-100 text-amber-800 border-amber-200",
      status: "Completed",
      statusBadge: "bg-emerald-100 text-emerald-800",
      slaCountdown: "Signed off on-site",
      escrow: "$640.00",
      date: "Yesterday, 04:15 PM",
    },
    {
      id: "WO-9915",
      title: "IP CCTV NVR Replacement & Biometric Door Strike Setup",
      customer: "Nexus Healthcare Campus",
      site: "San Antonio Medical Tower",
      tech: "Travis Vance",
      category: "Commercial Security",
      priority: "Standard",
      priorityColor: "bg-slate-100 text-slate-700 border-slate-200",
      status: "Open Dispatch",
      statusBadge: "bg-amber-100 text-amber-800",
      slaCountdown: "Auto-matching tech...",
      escrow: "$980.00",
      date: "Today, 11:15 AM",
    },
  ];

  const [orders, setOrders] = useState(initialOrders);
  const [newOrder, setNewOrder] = useState({ title: "", customer: "", site: "", category: "Networking" });

  const filtered = orders.filter((o) => {
    const matchesFilter = filterTab === "all" || o.status.toLowerCase().replace(" ", "-").includes(filterTab.toLowerCase());
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.tech.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.title) return;
    const added = {
      id: `WO-${Math.floor(9000 + Math.random() * 999)}`,
      title: newOrder.title,
      customer: newOrder.customer || "General Enterprise Client",
      site: newOrder.site || "Austin, TX Metro",
      tech: "Auto-Dispatching...",
      category: newOrder.category,
      priority: "Emergency (2hr SLA)",
      priorityColor: "bg-rose-100 text-rose-800 border-rose-200",
      status: "Open Dispatch",
      statusBadge: "bg-amber-100 text-amber-800",
      slaCountdown: "1 hr 58 mins remaining",
      escrow: "$750.00",
      date: "Just now",
    };
    setOrders([added, ...orders]);
    setShowCreateModal(false);
    setNewOrder({ title: "", customer: "", site: "", category: "Networking" });
    setToastMessage(`Work Order ${added.id} created and dispatched to nearest certified technician.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Work Order Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time work orders, SLA deadlines, technician deliverables, and escrow approvals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Work Order</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tabs & Search Filter */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl">
          {[
            { id: "all", label: "All (148)" },
            { id: "open", label: "Open (14)" },
            { id: "en-route", label: "En Route (28)" },
            { id: "on-site", label: "On-Site (18)" },
            { id: "completed", label: "Completed (88)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterTab === tab.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by job ID, title, or customer..."
            className="w-full pl-10 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Work Orders List */}
      <div className="space-y-3">
        {filtered.map((wo) => (
          <div
            key={wo.id}
            className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-blue-600 text-xs sm:text-sm">
                  {wo.id}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${wo.priorityColor}`}>
                  {wo.priority}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${wo.statusBadge}`}>
                  {wo.status}
                </span>
                <span className="text-[10px] text-slate-400">{wo.date}</span>
              </div>

              <h3 className="text-sm font-extrabold text-slate-900">
                {wo.title}
              </h3>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {wo.customer}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {wo.site}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <div className="text-left lg:text-right">
                <span className="text-[11px] text-slate-400 block font-medium">
                  Assigned Engineer
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {wo.tech}
                </span>
                <span className="text-[10px] text-emerald-600 block font-semibold">
                  {wo.slaCountdown}
                </span>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-slate-900 block">
                  {wo.escrow}
                </span>
                <span className="text-[10px] text-blue-600 font-bold block">
                  Escrow Verified
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Create & Dispatch Work Order
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Scope of Work Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WiFi 6 AP Mounting & OTDR Channel Certification"
                  value={newOrder.title}
                  onChange={(e) => setNewOrder({ ...newOrder, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Customer / Facility Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Logistics Hub #8"
                  value={newOrder.customer}
                  onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Site Location Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 500 Tech Blvd, Austin, TX 78701"
                  value={newOrder.site}
                  onChange={(e) => setNewOrder({ ...newOrder, site: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Dispatch to Vetted Techs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
