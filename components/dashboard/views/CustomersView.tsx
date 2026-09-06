"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Search,
  Plus,
  MapPin,
  FileText,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Download,
  Filter,
  ShieldCheck,
  Briefcase,
  Calendar,
  Clock,
  Wrench,
  Activity,
  Award,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export interface CustomerWorkOrder {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  scheduledAt?: string;
  completedAt?: string | null;
  completionNotes?: string | null;
  createdAt: string;
  technician?: {
    id: string;
    name: string;
    specialization: string;
    phone: string;
    status: string;
  } | null;
}

export interface CustomerSummary {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  slaOnTimeRate: number;
}

export interface CustomerData {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  address: string;
  city: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt?: string | null;
  workOrders?: CustomerWorkOrder[];
  summary?: CustomerSummary;
  _count?: {
    workOrders: number;
  };
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface StatsInfo {
  totalCustomers: number;
  activeWithOrders: number;
}

interface CustomersViewProps {
  role?: "ADMIN" | "DISPATCHER" | "TECHNICIAN";
}

export default function CustomersView({ role = "DISPATCHER" }: CustomersViewProps) {
  // Data state
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [stats, setStats] = useState<StatsInfo>({
    totalCustomers: 0,
    activeWithOrders: 0,
  });

  // Query & filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [activeOrdersFilter, setActiveOrdersFilter] = useState<"all" | "active" | "none">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form inputs state
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Toast notification state
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToastNotification = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch customers from API
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(cityFilter ? { city: cityFilter } : {}),
        ...(activeOrdersFilter !== "all" ? { hasActiveOrders: activeOrdersFilter } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      });

      const res = await fetch(`/api/customers?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load customers from server.");
      }
      const data = await res.json();
      setCustomers(data.customers || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
      setStats(data.stats || { totalCustomers: 0, activeWithOrders: 0 });
    } catch (err) {
      console.error(err);
      showToastNotification("error", "Could not load customers. Please check database connectivity.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, debouncedSearch, cityFilter, activeOrdersFilter, startDate, endDate]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Client-side form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = "Customer or primary contact name is required (min 2 chars).";
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 6) {
      errors.phone = "Valid contact phone number is required (min 6 digits).";
    }
    if (!formData.address.trim() || formData.address.trim().length < 3) {
      errors.address = "Physical service address is required (min 3 chars).";
    }
    if (!formData.city.trim() || formData.city.trim().length < 2) {
      errors.city = "City name is required (min 2 chars).";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      notes: "",
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  // Submit Create Customer
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setFormErrors(data.errors);
        }
        throw new Error(data.error || "Failed to create customer.");
      }

      showToastNotification("success", `Customer "${data.name}" provisioned successfully!`);
      setShowAddModal(false);
      fetchCustomers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating customer";
      showToastNotification("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (customer: CustomerData) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      company: customer.company || "",
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city || "",
      notes: customer.notes || "",
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  // Submit Update Customer
  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !validateForm()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setFormErrors(data.errors);
        }
        throw new Error(data.error || "Failed to update customer.");
      }

      showToastNotification("success", `Customer "${data.name}" updated successfully!`);
      setShowEditModal(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating customer";
      showToastNotification("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Open View Modal with live profile data
  const handleOpenView = async (customer: CustomerData) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
    setLoadingProfile(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}`);
      if (res.ok) {
        const full = await res.json();
        setSelectedCustomer(full);
      }
    } catch (err) {
      console.error("Failed to fetch full customer profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (customer: CustomerData) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  // Submit Safe Delete Customer
  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete customer.");
      }

      showToastNotification("success", `Customer "${selectedCustomer.name}" was safely removed.`);
      setShowDeleteModal(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting customer";
      showToastNotification("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Clear all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setCityFilter("");
    setActiveOrdersFilter("all");
    setStartDate("");
    setEndDate("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const hasActiveFilterSet =
    Boolean(debouncedSearch) ||
    Boolean(cityFilter) ||
    activeOrdersFilter !== "all" ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc";

  // Export to CSV
  const handleExportCSV = () => {
    if (customers.length === 0) {
      showToastNotification("error", "No customer records available to export.");
      return;
    }

    const headers = ["Customer ID", "Full Name", "Company", "Email", "Phone", "Street Address", "City", "Internal Notes", "Created At"];
    const rows = customers.map((c) => [
      c.id,
      `"${(c.name || "").replace(/"/g, '""')}"`,
      `"${(c.company || "").replace(/"/g, '""')}"`,
      `"${(c.email || "").replace(/"/g, '""')}"`,
      `"${(c.phone || "").replace(/"/g, '""')}"`,
      `"${(c.address || "").replace(/"/g, '""')}"`,
      `"${(c.city || "").replace(/"/g, '""')}"`,
      `"${(c.notes || "").replace(/"/g, '""')}"`,
      c.createdAt,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FieldFlow_Customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToastNotification("success", "Exported customer list to CSV.");
  };

  // Helper status badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CLOSED":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "IN_PROGRESS":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "PAUSED":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "ACCEPTED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "ASSIGNED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  // Helper priority badge styles
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MEDIUM":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Extract unique cities from current list for quick selector
  const availableCities = Array.from(
    new Set(customers.map((c) => c.city).filter((city): city is string => Boolean(city)))
  ).sort();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 max-w-md w-full animate-fadeIn shadow-2xl">
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 backdrop-blur-md ${toast.type === "success"
                ? "bg-emerald-50/95 border-emerald-200 text-emerald-900 shadow-emerald-500/10"
                : "bg-rose-50/95 border-rose-200 text-rose-900 shadow-rose-500/10"
              }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">{toast.message}</div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customer Management</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              Postgres Live
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Provision, monitor, and manage client profiles, service locations, site access notes, and dispatch history.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchCustomers}
            title="Refresh database records"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {role !== "TECHNICIAN" && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.totalCustomers}</span>
            <span className="text-[11px] font-bold text-emerald-600">Active Records</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Work Orders</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.activeWithOrders}</span>
            <span className="text-[11px] font-bold text-slate-500">In-Flight Jobs</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Service Cities</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {new Set(customers.map((c) => c.city).filter(Boolean)).size || 1}
            </span>
            <span className="text-[11px] font-bold text-purple-600">Metro Areas</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Security Tier</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-900">Enterprise</span>
            <span className="text-[11px] font-bold text-amber-600">SOC 2 / Encrypted</span>
          </div>
        </div>
      </div>

      {/* Main Filter & Search Control Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer, company, email, phone, city, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9.5 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-xs sm:text-sm font-medium text-slate-900 transition-all outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Actions & Filter Toggle */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${showFiltersPanel || hasActiveFilterSet
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilterSet && (
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              )}
            </button>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <span>Sort:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortBy(field);
                  setSortOrder(order as "asc" | "desc");
                }}
                className="px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold outline-none cursor-pointer focus:border-blue-600"
              >
                <option value="createdAt-desc">Newest Added</option>
                <option value="createdAt-asc">Oldest Added</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="company-asc">Company (A-Z)</option>
                <option value="city-asc">City (A-Z)</option>
              </select>
            </div>

            {/* Page Limit Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <span>Show:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(parseInt(e.target.value, 10));
                  setPage(1);
                }}
                className="px-2 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold outline-none cursor-pointer focus:border-blue-600"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Collapsible Advanced Filters Tray */}
        {showFiltersPanel && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-fadeIn">
            {/* City Filter */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Filter by City</label>
              <select
                value={cityFilter}
                onChange={(e) => {
                  setCityFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium outline-none focus:border-blue-600"
              >
                <option value="">All Service Cities</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Orders Status Filter */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Active Work Orders</label>
              <select
                value={activeOrdersFilter}
                onChange={(e) => {
                  setActiveOrdersFilter(e.target.value as "all" | "active" | "none");
                  setPage(1);
                }}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium outline-none focus:border-blue-600"
              >
                <option value="all">All Accounts</option>
                <option value="active">Has Active In-Flight Jobs</option>
                <option value="none">No Active Work Orders</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Created After</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium outline-none focus:border-blue-600"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Created Before</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium outline-none focus:border-blue-600"
                />
                {hasActiveFilterSet && (
                  <button
                    onClick={handleResetFilters}
                    title="Reset All Filters"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all shrink-0 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Customers Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden max-h-175 overflow-y-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 border-b border-slate-200 shadow-xs">
              <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-4 sm:px-6">Customer & Company</th>
                <th className="py-3.5 px-4">Contact Details</th>
                <th className="py-3.5 px-4">Service Location</th>
                <th className="py-3.5 px-4 text-center">Work Orders</th>
                <th className="py-3.5 px-4">Added Date</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-200" />
                        <div className="space-y-1.5">
                          <div className="w-32 h-3.5 bg-slate-200 rounded" />
                          <div className="w-20 h-2.5 bg-slate-100 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1.5">
                        <div className="w-36 h-3 bg-slate-200 rounded" />
                        <div className="w-24 h-2.5 bg-slate-100 rounded" />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-28 h-3 bg-slate-200 rounded" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-10 h-5 bg-slate-200 rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-20 h-3 bg-slate-200 rounded" />
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="w-16 h-7 bg-slate-200 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 px-4 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {hasActiveFilterSet ? "No matching customers found" : "No customer accounts yet"}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {hasActiveFilterSet
                          ? "We couldn't find any customer accounts matching your search or filters. Try adjusting your query."
                          : "Start building your field dispatch directory by provisioning your first customer account."}
                      </p>
                      {hasActiveFilterSet ? (
                        <button
                          onClick={handleResetFilters}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                        >
                          Clear All Filters
                        </button>
                      ) : (
                        role !== "TECHNICIAN" && (
                          <button
                            onClick={handleOpenCreate}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add First Customer</span>
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => {
                  const initials =
                    customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "CU";

                  return (
                    <tr key={customer.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Name & Company */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <span
                              className="font-bold text-slate-900 block truncate hover:text-blue-600 cursor-pointer"
                              onClick={() => handleOpenView(customer)}
                            >
                              {customer.name}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 block truncate">
                              {customer.company || "Independent Account"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <a
                            href={`mailto:${customer.email}`}
                            className="text-xs text-slate-700 hover:text-blue-600 flex items-center gap-1.5 truncate group/link"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-blue-600 shrink-0" />
                            <span className="truncate">{customer.email}</span>
                          </a>
                          <a
                            href={`tel:${customer.phone}`}
                            className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1.5 truncate group/link"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-blue-600 shrink-0" />
                            <span>{customer.phone}</span>
                          </a>
                        </div>
                      </td>

                      {/* Service Location */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="text-xs text-slate-800 flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate font-semibold">{customer.city || "Primary Metro"}</span>
                          </span>
                          <span className="text-[11px] text-slate-400 truncate block pl-5 max-w-50">
                            {customer.address}
                          </span>
                        </div>
                      </td>

                      {/* Work Orders Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${(customer._count?.workOrders ?? 0) > 0
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-slate-100 text-slate-500"
                            }`}
                        >
                          <FileText className="w-3 h-3" />
                          <span>{customer._count?.workOrders ?? 0}</span>
                        </span>
                      </td>

                      {/* Date Added */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                        {new Date(customer.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenView(customer)}
                            title="View Customer Profile & History"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {role !== "TECHNICIAN" && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(customer)}
                                title="Edit Customer Account"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleOpenDelete(customer)}
                                title="Delete Customer Account"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!loading && customers.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-800">{(pagination.page - 1) * pagination.limit + 1}</span>{" "}
              to{" "}
              <span className="font-bold text-slate-800">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-bold text-slate-800">{pagination.total}</span> customers
            </div>

            <div className="flex items-center gap-1 self-center">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1)
                .map((pageNum, idx, arr) => {
                  const showEllipsis = idx > 0 && pageNum - arr[idx - 1] > 1;
                  return (
                    <div key={pageNum} className="flex items-center gap-1">
                      {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                      <button
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${pagination.page === pageNum
                            ? "bg-blue-600 text-white shadow-xs"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                      >
                        {pageNum}
                      </button>
                    </div>
                  );
                })}

              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. CREATE CUSTOMER MODAL */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Add Customer Account</h3>
                  <p className="text-xs text-slate-500">Register a new client record in PostgreSQL</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3.5">
                {/* Customer Name */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe or Jane Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${formErrors.name ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                      }`}
                  />
                  {formErrors.name && <span className="text-[11px] text-rose-600 block">{formErrors.name}</span>}
                </div>

                {/* Company Name */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Company (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Logistics Inc."
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                {/* Email */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${formErrors.email ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                      }`}
                  />
                  {formErrors.email && <span className="text-[11px] text-rose-600 block">{formErrors.email}</span>}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${formErrors.phone ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                      }`}
                  />
                  {formErrors.phone && <span className="text-[11px] text-rose-600 block">{formErrors.phone}</span>}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3.5">
                {/* Address */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="1200 Technology Blvd, Suite 400"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${formErrors.address ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                      }`}
                  />
                  {formErrors.address && <span className="text-[11px] text-rose-600 block">{formErrors.address}</span>}
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="Austin"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${formErrors.city ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                      }`}
                  />
                  {formErrors.city && <span className="text-[11px] text-rose-600 block">{formErrors.city}</span>}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Site Access Instructions & Internal Notes</label>
                <textarea
                  rows={3}
                  placeholder="Gate code #4492, key lockbox on north door, priority dispatch SLA instructions..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting && (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  )}
                  <span>{submitting ? "Saving..." : "Save Customer"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. EDIT CUSTOMER MODAL */}
      {/* ========================================================= */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Customer Account</h3>
                  <p className="text-xs text-slate-500">Update customer records and contact details</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCustomer(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCustomer} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${formErrors.name ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                      }`}
                  />
                  {formErrors.name && <span className="text-[11px] text-rose-600 block">{formErrors.name}</span>}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Company (Optional)</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${formErrors.email ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                      }`}
                  />
                  {formErrors.email && <span className="text-[11px] text-rose-600 block">{formErrors.email}</span>}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${formErrors.phone ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                      }`}
                  />
                  {formErrors.phone && <span className="text-[11px] text-rose-600 block">{formErrors.phone}</span>}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${formErrors.address ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                      }`}
                  />
                  {formErrors.address && <span className="text-[11px] text-rose-600 block">{formErrors.address}</span>}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${formErrors.city ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                      }`}
                  />
                  {formErrors.city && <span className="text-[11px] text-rose-600 block">{formErrors.city}</span>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Site Access Instructions & Internal Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md shadow-amber-600/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting && (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  )}
                  <span>{submitting ? "Updating..." : "Update Customer"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. VIEW CUSTOMER PROFILE & WORK ORDER HISTORY MODAL */}
      {/* ========================================================= */}
      {showViewModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto text-xs">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                  {selectedCustomer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-black text-slate-900">{selectedCustomer.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Client</span>
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 block mt-0.5">
                    {selectedCustomer.company || "Independent Customer Account"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 font-bold"
                  title="Direct Call"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Call</span>
                </a>
                <a
                  href={`mailto:${selectedCustomer.email}`}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 font-bold"
                  title="Send Email"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Email</span>
                </a>
                {role !== "TECHNICIAN" && (
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleOpenEdit(selectedCustomer);
                    }}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span>Edit</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Profile KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                  Total Dispatches
                </span>
                <span className="text-xl font-black text-blue-950">
                  {selectedCustomer.summary?.totalOrders ??
                    (selectedCustomer.workOrders?.length ?? selectedCustomer._count?.workOrders ?? 0)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-1">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                  Active In-Flight
                </span>
                <span className="text-xl font-black text-amber-950">
                  {selectedCustomer.summary?.activeOrders ?? 0}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Resolved & Done
                </span>
                <span className="text-xl font-black text-emerald-950">
                  {selectedCustomer.summary?.completedOrders ?? 0}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                  SLA Compliance
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-purple-950">
                    {selectedCustomer.summary ? `${selectedCustomer.summary.slaOnTimeRate}%` : "100%"}
                  </span>
                  <span className="text-[10px] font-bold text-purple-600">On-Time</span>
                </div>
              </div>
            </div>

            {/* Contact & Location Details + Internal Notes */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Contact Information */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  Account & Contact Information
                </span>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Email Address</span>
                    <a
                      href={`mailto:${selectedCustomer.email}`}
                      className="font-semibold text-slate-800 hover:text-blue-600 truncate block"
                    >
                      {selectedCustomer.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Phone Number</span>
                    <a
                      href={`tel:${selectedCustomer.phone}`}
                      className="font-semibold text-slate-800 hover:text-blue-600 block"
                    >
                      {selectedCustomer.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Service Address</span>
                    <span className="font-semibold text-slate-800 block">
                      {selectedCustomer.address}
                      {selectedCustomer.city ? `, ${selectedCustomer.city}` : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Client Since</span>
                    <span className="font-semibold text-slate-800 block">
                      {new Date(selectedCustomer.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Site Access & Internal Notes */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 flex flex-col">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  Site Access & Internal Notes
                </span>
                {selectedCustomer.notes ? (
                  <div className="p-3.5 rounded-xl bg-white border border-amber-200/80 shadow-xs flex-1 text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                    {selectedCustomer.notes}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white/60 border border-slate-200/60 border-dashed text-slate-400 text-center flex-1 flex items-center justify-center italic">
                    No special access codes or site instructions logged for this customer.
                  </div>
                )}
              </div>
            </div>

            {/* Work Order History Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Work Order Dispatch History (
                  {selectedCustomer.workOrders?.length ?? selectedCustomer._count?.workOrders ?? 0})
                </span>
                <span className="text-[11px] text-slate-400">Chronological activity record</span>
              </div>

              {loadingProfile ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-16 rounded-2xl bg-slate-100" />
                  <div className="h-16 rounded-2xl bg-slate-100" />
                </div>
              ) : selectedCustomer.workOrders && selectedCustomer.workOrders.length > 0 ? (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {selectedCustomer.workOrders.map((wo) => (
                    <div
                      key={wo.id}
                      className="p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">{wo.title}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(
                                wo.priority
                              )}`}
                            >
                              {wo.priority}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(
                                wo.status
                              )}`}
                            >
                              {wo.status}
                            </span>
                          </div>
                          {wo.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{wo.description}</p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-semibold text-slate-400 block">
                            {new Date(wo.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Assigned Tech info & Completion note */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
                        {wo.technician ? (
                          <div className="flex items-center gap-2 text-slate-600">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                              <Wrench className="w-3 h-3" />
                            </span>
                            <span className="font-medium text-slate-800">
                              Tech: {wo.technician.name}
                            </span>
                            <span className="text-slate-400">({wo.technician.specialization})</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No technician assigned yet</span>
                        )}

                        {wo.completedAt && (
                          <div className="text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Completed {new Date(wo.completedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {wo.completionNotes && (
                        <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-[11px] text-emerald-900 leading-snug">
                          <span className="font-bold">Completion Notes: </span>
                          {wo.completionNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/60 border-dashed text-center space-y-2">
                  <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-700">No work orders recorded yet</p>
                  <p className="text-xs text-slate-400">
                    Dispatch service visits or routine maintenance orders to populate this customer&apos;s history.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                Customer ID: <code className="font-mono text-slate-600">{selectedCustomer.id}</code>
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedCustomer(null);
                }}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. SAFE DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {showDeleteModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Delete Customer Account</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-slate-900">&ldquo;{selectedCustomer.name}&rdquo;</span>? This action cannot be
                undone.
              </p>
            </div>

            {(selectedCustomer._count?.workOrders ?? 0) > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block">Safety Cascade Check</span>
                  <span>
                    This customer currently has {selectedCustomer._count?.workOrders} associated work order(s). If any jobs
                    are currently active, the system will prevent deletion to protect live operations.
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCustomer(null);
                }}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteCustomer}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {submitting && (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                )}
                <span>{submitting ? "Deleting..." : "Confirm Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
