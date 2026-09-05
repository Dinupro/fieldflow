"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Wrench,
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
  User,
  Award,
  Zap,
} from "lucide-react";

export type TechnicianStatusType = "AVAILABLE" | "BUSY" | "OFF";

export interface TechnicianData {
  id: string;
  userId?: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  specialization: string | null;
  skills: string[];
  status: TechnicianStatusType;
  serviceArea: string | null;
  notes: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt?: string | null;
  workOrders?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    scheduledAt: string | null;
    createdAt: string;
  }>;
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
  totalTechnicians: number;
  availableCount: number;
  busyCount: number;
  offlineCount: number;
}

const COMMON_SKILLS_SUGGESTIONS = [
  "HVAC Certified",
  "EPA Universal",
  "Master Electrician",
  "Fiber Splicing",
  "Cisco CCNA",
  "PLC Troubleshooting",
  "OSHA 30",
  "CAT6 Cabling",
  "Commercial Plumbing",
  "Backflow Certified",
  "POS Terminal Repair",
  "BMS & BAS Systems",
];

const SPECIALIZATION_OPTIONS = [
  "HVAC & Climate Control",
  "Electrical & Power Distribution",
  "Fiber & Network Infrastructure",
  "Commercial Plumbing & Pipefitting",
  "Security & Access Control",
  "Retail POS & Terminal Systems",
  "Industrial Machinery & Robotics",
  "General Field Operations",
];

interface TechniciansViewProps {
  role?: "ADMIN" | "DISPATCHER" | "TECHNICIAN";
}

export default function TechniciansView({ role = "DISPATCHER" }: TechniciansViewProps) {
  // Data state
  const [technicians, setTechnicians] = useState<TechnicianData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [stats, setStats] = useState<StatsInfo>({
    totalTechnicians: 0,
    availableCount: 0,
    busyCount: 0,
    offlineCount: 0,
  });

  // Query state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<TechnicianData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form inputs state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    skillsInput: "",
    status: "AVAILABLE" as TechnicianStatusType,
    serviceArea: "",
    notes: "",
    avatar: "",
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

  // Fetch technicians from API
  const fetchTechnicians = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        ...(specializationFilter !== "all" ? { specialization: specializationFilter } : {}),
      });

      const res = await fetch(`/api/technicians?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load technicians from server.");
      }
      const data = await res.json();
      setTechnicians(data.technicians || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
      setStats(
        data.stats || { totalTechnicians: 0, availableCount: 0, busyCount: 0, offlineCount: 0 }
      );
    } catch (err) {
      console.error(err);
      showToastNotification("error", "Could not load technicians. Please check database connectivity.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, debouncedSearch, statusFilter, specializationFilter]);

  // Real-time synchronization effect
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sortBy,
          sortOrder,
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
          ...(statusFilter !== "all" ? { status: statusFilter } : {}),
          ...(specializationFilter !== "all" ? { specialization: specializationFilter } : {}),
        });

        const res = await fetch(`/api/technicians?${params.toString()}`);
        if (!res.ok) {
          throw new Error("Failed to load technicians from server.");
        }
        const data = await res.json();
        if (active) {
          setTechnicians(data.technicians || []);
          setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
          setStats(
            data.stats || { totalTechnicians: 0, availableCount: 0, busyCount: 0, offlineCount: 0 }
          );
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          showToastNotification("error", "Could not load technicians. Please check database connectivity.");
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [page, limit, sortBy, sortOrder, debouncedSearch, statusFilter, specializationFilter]);

  // Client-side form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = "Technician full name is required (min 2 characters).";
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 6) {
      errors.phone = "Valid contact phone number is required.";
    }
    if (!formData.specialization.trim()) {
      errors.specialization = "Primary specialization is required.";
    }
    if (!formData.serviceArea.trim()) {
      errors.serviceArea = "Assigned service area / metro region is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialization: SPECIALIZATION_OPTIONS[0],
      skillsInput: "HVAC Certified, EPA Universal, OSHA 30",
      status: "AVAILABLE",
      serviceArea: "",
      notes: "",
      avatar: "",
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  // Submit Create Technician
  const handleCreateTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/technicians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email.trim() || null,
          phone: formData.phone,
          specialization: formData.specialization,
          skills: formData.skillsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          status: formData.status,
          serviceArea: formData.serviceArea,
          notes: formData.notes,
          avatar: formData.avatar || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setFormErrors(data.errors);
        }
        throw new Error(data.error || "Failed to create technician.");
      }

      showToastNotification("success", `Technician "${data.name}" provisioned successfully!`);
      setShowAddModal(false);
      fetchTechnicians();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating technician";
      showToastNotification("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (tech: TechnicianData) => {
    setSelectedTechnician(tech);
    setFormData({
      name: tech.name,
      email: tech.email || "",
      phone: tech.phone || "",
      specialization: tech.specialization || SPECIALIZATION_OPTIONS[0],
      skillsInput: (tech.skills || []).join(", "),
      status: tech.status,
      serviceArea: tech.serviceArea || "",
      notes: tech.notes || "",
      avatar: tech.avatar || "",
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  // Submit Update Technician
  const handleUpdateTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechnician || !validateForm()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/technicians/${selectedTechnician.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email.trim() || null,
          phone: formData.phone,
          specialization: formData.specialization,
          skills: formData.skillsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          status: formData.status,
          serviceArea: formData.serviceArea,
          notes: formData.notes,
          avatar: formData.avatar || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setFormErrors(data.errors);
        }
        throw new Error(data.error || "Failed to update technician.");
      }

      showToastNotification("success", `Technician "${data.name}" updated successfully!`);
      setShowEditModal(false);
      setSelectedTechnician(null);
      fetchTechnicians();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating technician";
      showToastNotification("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Open View Modal
  const handleOpenView = async (tech: TechnicianData) => {
    setSelectedTechnician(tech);
    setShowViewModal(true);
    try {
      const res = await fetch(`/api/technicians/${tech.id}`);
      if (res.ok) {
        const full = await res.json();
        setSelectedTechnician(full);
      }
    } catch {
      // keep initial technician data
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (tech: TechnicianData) => {
    setSelectedTechnician(tech);
    setShowDeleteModal(true);
  };

  // Submit Safe Delete Technician
  const handleDeleteTechnician = async () => {
    if (!selectedTechnician) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/technicians/${selectedTechnician.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete technician.");
      }

      showToastNotification("success", `Technician "${selectedTechnician.name}" removed successfully.`);
      setShowDeleteModal(false);
      setSelectedTechnician(null);
      fetchTechnicians();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting technician";
      showToastNotification("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Add skill helper
  const handleAddSuggestedSkill = (skill: string) => {
    const currentSkills = formData.skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!currentSkills.includes(skill)) {
      const updated = [...currentSkills, skill].join(", ");
      setFormData({ ...formData, skillsInput: updated });
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (technicians.length === 0) {
      showToastNotification("error", "No technician records available to export.");
      return;
    }

    const headers = ["ID", "Name", "Email", "Phone", "Specialization", "Status", "Service Area", "Skills", "Assigned Orders", "Created At"];
    const rows = technicians.map((t) => [
      t.id,
      `"${t.name.replace(/"/g, '""')}"`,
      `"${(t.email || "").replace(/"/g, '""')}"`,
      `"${(t.phone || "").replace(/"/g, '""')}"`,
      `"${(t.specialization || "").replace(/"/g, '""')}"`,
      t.status,
      `"${(t.serviceArea || "").replace(/"/g, '""')}"`,
      `"${(t.skills || []).join("; ").replace(/"/g, '""')}"`,
      t._count?.workOrders ?? 0,
      t.createdAt,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FieldFlow_Technicians_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToastNotification("success", "Exported technician directory to CSV.");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
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
            <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
              {toast.message}
            </div>
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
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Technician Management
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              Postgres Live
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Dispatch, manage field workforce availability, skill certifications, and work order load.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchTechnicians}
            title="Refresh database records"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
              <span>Add Technician</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Workforce */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Workforce Size</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.totalTechnicians}</span>
            <span className="text-[11px] font-bold text-blue-600">Registered Techs</span>
          </div>
        </div>

        {/* Available Now */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Available Now</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{stats.availableCount}</span>
            <span className="text-[11px] font-bold text-emerald-700">Ready to Dispatch</span>
          </div>
        </div>

        {/* Busy on Job */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">On-Site / Busy</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{stats.busyCount}</span>
            <span className="text-[11px] font-bold text-amber-700">In-Flight Jobs</span>
          </div>
        </div>

        {/* Offline / Off-Duty */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Offline / Off-Duty</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-700">{stats.offlineCount}</span>
            <span className="text-[11px] font-bold text-slate-500">Off Shift</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, specialization, skills, email, or area..."
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

        {/* Status Filter Buttons & Dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Filter Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 text-xs font-bold">
            <button
              onClick={() => {
                setStatusFilter("all");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${statusFilter === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setStatusFilter("AVAILABLE");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${statusFilter === "AVAILABLE"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-emerald-700"
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Available</span>
            </button>
            <button
              onClick={() => {
                setStatusFilter("BUSY");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${statusFilter === "BUSY"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-600 hover:text-amber-700"
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Busy</span>
            </button>
            <button
              onClick={() => {
                setStatusFilter("OFF");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${statusFilter === "OFF"
                ? "bg-slate-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Offline</span>
            </button>
          </div>

          {/* Specialization Filter Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <select
              value={specializationFilter}
              onChange={(e) => {
                setSpecializationFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold outline-none cursor-pointer focus:border-blue-600"
            >
              <option value="all">All Specializations</option>
              {SPECIALIZATION_OPTIONS.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
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
              <option value="name-asc">Technician Name (A-Z)</option>
              <option value="name-desc">Technician Name (Z-A)</option>
              <option value="specialization-asc">Specialization (A-Z)</option>
              <option value="status-asc">Status</option>
            </select>
          </div>

          {/* Page Size */}
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

      {/* Main Technicians Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden max-h-175 overflow-y-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 border-b border-slate-200 shadow-xs">
              <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-4 sm:px-6">Technician & Trade</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Status & Service Area</th>
                <th className="py-3.5 px-4">Skills & Certifications</th>
                <th className="py-3.5 px-4 text-center">Active Jobs</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-200" />
                        <div className="space-y-1.5">
                          <div className="w-32 h-3.5 bg-slate-200 rounded" />
                          <div className="w-24 h-2.5 bg-slate-100 rounded" />
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
                      <div className="space-y-1.5">
                        <div className="w-20 h-5 bg-slate-200 rounded-full" />
                        <div className="w-24 h-2.5 bg-slate-100 rounded" />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-1">
                        <div className="w-16 h-5 bg-slate-200 rounded-md" />
                        <div className="w-16 h-5 bg-slate-200 rounded-md" />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-8 h-5 bg-slate-200 rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="w-16 h-7 bg-slate-200 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : technicians.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 px-4 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                        <Wrench className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {debouncedSearch || statusFilter !== "all"
                          ? "No matching technicians found"
                          : "No field technicians provisioned yet"}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {debouncedSearch || statusFilter !== "all"
                          ? "Try adjusting your search criteria or clearing active availability filters."
                          : "Start building your field dispatch team by adding your first certified technician."}
                      </p>
                      {debouncedSearch || statusFilter !== "all" ? (
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("all");
                          }}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                        >
                          Reset Filters
                        </button>
                      ) : (
                        <button
                          onClick={handleOpenCreate}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add First Technician</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                technicians.map((tech) => {
                  const initials = tech.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "TC";

                  return (
                    <tr
                      key={tech.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Name & Trade */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-slate-800 to-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                              {initials}
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${tech.status === "AVAILABLE"
                                ? "bg-emerald-500"
                                : tech.status === "BUSY"
                                  ? "bg-amber-500"
                                  : "bg-slate-400"
                                }`}
                            />
                          </div>
                          <div className="min-w-0">
                            <span
                              className="font-bold text-slate-900 block truncate hover:text-blue-600 cursor-pointer"
                              onClick={() => handleOpenView(tech)}
                            >
                              {tech.name}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 block truncate">
                              {tech.specialization || "General Field Technician"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {tech.email ? (
                            <a
                              href={`mailto:${tech.email}`}
                              className="text-xs text-slate-700 hover:text-blue-600 flex items-center gap-1.5 truncate group/link"
                            >
                              <Mail className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-blue-600 shrink-0" />
                              <span className="truncate">{tech.email}</span>
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No email on file</span>
                          )}
                          {tech.phone && (
                            <a
                              href={`tel:${tech.phone}`}
                              className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1.5 truncate group/link"
                            >
                              <Phone className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-blue-600 shrink-0" />
                              <span>{tech.phone}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Status & Service Area */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${tech.status === "AVAILABLE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : tech.status === "BUSY"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${tech.status === "AVAILABLE"
                                ? "bg-emerald-500"
                                : tech.status === "BUSY"
                                  ? "bg-amber-500"
                                  : "bg-slate-400"
                                }`}
                            />
                            <span>
                              {tech.status === "AVAILABLE"
                                ? "Available"
                                : tech.status === "BUSY"
                                  ? "On-Site"
                                  : "Offline"}
                            </span>
                          </span>
                          <span className="text-[11px] text-slate-500 items-center gap-1 truncate block">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{tech.serviceArea || "Metro Area"}</span>
                          </span>
                        </div>
                      </td>

                      {/* Skills Chips */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {tech.skills && tech.skills.length > 0 ? (
                            tech.skills.slice(0, 3).map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold truncate"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Standard Field Ops</span>
                          )}
                          {tech.skills && tech.skills.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                              +{tech.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Assigned Work Orders */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${(tech._count?.workOrders ?? 0) > 0
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-slate-100 text-slate-500"
                            }`}
                        >
                          <FileText className="w-3 h-3" />
                          <span>{tech._count?.workOrders ?? 0}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenView(tech)}
                            title="View Technician Profile"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {role !== "TECHNICIAN" && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(tech)}
                                title="Edit Technician"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleOpenDelete(tech)}
                                title="Delete Technician"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

        {/* Pagination Controls */}
        {!loading && technicians.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-800">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
              <span className="font-bold text-slate-800">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-bold text-slate-800">{pagination.total}</span> technicians
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
      {/* 1. CREATE TECHNICIAN MODAL */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Provision New Technician</h3>
                  <p className="text-xs text-slate-500">Register certified field engineer in PostgreSQL</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTechnician} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3.5">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marcus Vance"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${formErrors.name ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                      }`}
                  />
                  {formErrors.name && <span className="text-[11px] text-rose-600 block">{formErrors.name}</span>}
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="m.vance@fieldflow.io"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${formErrors.email ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                      }`}
                  />
                  {formErrors.email && <span className="text-[11px] text-rose-600 block">{formErrors.email}</span>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                {/* Phone */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 345-6789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${formErrors.phone ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                      }`}
                  />
                  {formErrors.phone && <span className="text-[11px] text-rose-600 block">{formErrors.phone}</span>}
                </div>

                {/* Service Area */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Service Area / Metro *</label>
                  <input
                    type="text"
                    required
                    placeholder="Austin, TX Metro"
                    value={formData.serviceArea}
                    onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${formErrors.serviceArea ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                      }`}
                  />
                  {formErrors.serviceArea && <span className="text-[11px] text-rose-600 block">{formErrors.serviceArea}</span>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                {/* Specialization */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Specialization / Trade *</label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all cursor-pointer font-medium"
                  >
                    {SPECIALIZATION_OPTIONS.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Initial Availability *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TechnicianStatusType })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all cursor-pointer font-medium"
                  >
                    <option value="AVAILABLE">Available (Ready to Dispatch)</option>
                    <option value="BUSY">Busy (On Active Assignment)</option>
                    <option value="OFF">Offline (Off-Duty)</option>
                  </select>
                </div>
              </div>

              {/* Skills Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Skills & Certifications (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Fluke Certified, Fusion Splicing, OSHA 30"
                  value={formData.skillsInput}
                  onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all"
                />

                {/* Quick Add Skill Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-bold text-slate-400">Quick add:</span>
                  {COMMON_SKILLS_SUGGESTIONS.slice(0, 6).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAddSuggestedSkill(skill)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[10px] font-semibold transition-colors cursor-pointer"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Internal Dispatch Notes & Equipment Assigned</label>
                <textarea
                  rows={2}
                  placeholder="Vehicle license #, ladder rack, specialized OTDR tester kit..."
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  <span>{submitting ? "Saving..." : "Save Technician"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. EDIT TECHNICIAN MODAL */}
      {/* ========================================================= */}
      {showEditModal && selectedTechnician && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Technician Profile</h3>
                  <p className="text-xs text-slate-500">Update contact, availability status, and trade skills</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTechnician(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTechnician} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name *</label>
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
                  <label className="font-bold text-slate-700">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${formErrors.email ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                      }`}
                  />
                  {formErrors.email && <span className="text-[11px] text-rose-600 block">{formErrors.email}</span>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
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

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Service Area / Metro *</label>
                  <input
                    type="text"
                    required
                    value={formData.serviceArea}
                    onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${formErrors.serviceArea ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                      }`}
                  />
                  {formErrors.serviceArea && <span className="text-[11px] text-rose-600 block">{formErrors.serviceArea}</span>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Specialization / Trade *</label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all cursor-pointer font-medium"
                  >
                    {SPECIALIZATION_OPTIONS.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Availability Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TechnicianStatusType })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all cursor-pointer font-medium"
                  >
                    <option value="AVAILABLE">Available (Ready to Dispatch)</option>
                    <option value="BUSY">Busy (On Active Assignment)</option>
                    <option value="OFF">Offline (Off-Duty)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Skills & Certifications (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.skillsInput}
                  onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Internal Dispatch Notes & Equipment</label>
                <textarea
                  rows={2}
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
                    setSelectedTechnician(null);
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  <span>{submitting ? "Updating..." : "Update Technician"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. VIEW TECHNICIAN MODAL */}
      {/* ========================================================= */}
      {showViewModal && selectedTechnician && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-slate-800 to-slate-900 text-white font-black text-base flex items-center justify-center shadow-lg shadow-slate-900/20">
                    {selectedTechnician.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <span
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${selectedTechnician.status === "AVAILABLE"
                      ? "bg-emerald-500"
                      : selectedTechnician.status === "BUSY"
                        ? "bg-amber-500"
                        : "bg-slate-400"
                      }`}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedTechnician.name}</h3>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    {selectedTechnician.specialization || "Field Specialist"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTechnician(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Status</span>
                <span
                  className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedTechnician.status === "AVAILABLE"
                    ? "bg-emerald-100 text-emerald-800"
                    : selectedTechnician.status === "BUSY"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-200 text-slate-700"
                    }`}
                >
                  {selectedTechnician.status}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Phone</span>
                <a href={`tel:${selectedTechnician.phone}`} className="font-semibold text-slate-800 hover:text-blue-600 block mt-0.5 truncate">
                  {selectedTechnician.phone || "Not set"}
                </a>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Service Area</span>
                <span className="font-semibold text-slate-800 block mt-0.5 truncate">
                  {selectedTechnician.serviceArea || "Metro Area"}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Email Address</span>
                <a href={`mailto:${selectedTechnician.email}`} className="font-semibold text-slate-800 hover:text-blue-600 block mt-0.5 truncate">
                  {selectedTechnician.email || "No email assigned"}
                </a>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Member Since</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {new Date(selectedTechnician.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Skills Badges */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                <span>Skill Certifications ({selectedTechnician.skills?.length || 0})</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedTechnician.skills && selectedTechnician.skills.length > 0 ? (
                  selectedTechnician.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-100 font-bold text-[11px]"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">No specific skills listed.</span>
                )}
              </div>
            </div>

            {/* Notes */}
            {selectedTechnician.notes && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700">Dispatch Notes & Assigned Equipment:</span>
                <p className="p-3 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 text-xs leading-relaxed">
                  {selectedTechnician.notes}
                </p>
              </div>
            )}

            {/* Associated Work Orders */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Assigned Work Orders ({selectedTechnician.workOrders?.length ?? selectedTechnician._count?.workOrders ?? 0})
                </span>
              </div>

              {selectedTechnician.workOrders && selectedTechnician.workOrders.length > 0 ? (
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {selectedTechnician.workOrders.map((wo) => (
                    <div
                      key={wo.id}
                      className="p-2.5 rounded-xl border border-slate-100 bg-white flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-slate-800 block truncate">{wo.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(wo.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${wo.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : wo.status === "IN_PROGRESS"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                          }`}
                      >
                        {wo.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center text-slate-400 text-xs">
                  No active work orders currently assigned to this technician.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  handleOpenEdit(selectedTechnician);
                }}
                className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Profile</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTechnician(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. SAFE DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {showDeleteModal && selectedTechnician && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Remove Field Technician</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-bold text-slate-900">&ldquo;{selectedTechnician.name}&rdquo;</span> from your
                active dispatch roster? This action cannot be undone.
              </p>
            </div>

            {(selectedTechnician._count?.workOrders ?? 0) > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Notice: This technician has {selectedTechnician._count?.workOrders} assigned work order(s). Active
                  jobs will strictly prevent deletion.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTechnician(null);
                }}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteTechnician}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {submitting && (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
