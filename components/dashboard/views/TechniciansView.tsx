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
  Star,
  ShieldCheck,
  Briefcase,
  Clock,
  Activity,
  ArrowRight,
  Sparkles,
  ChevronDown,
} from "lucide-react";

export type TechnicianStatusType = "AVAILABLE" | "BUSY" | "OFF";

export interface TechnicianWorkOrder {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  scheduledAt: string | null;
  completedAt?: string | null;
  completionNotes?: string | null;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    company?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
  } | null;
}

export interface TechnicianData {
  id: string;
  userId?: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  specialization: string | null;
  skills: string[];
  certifications?: string[];
  rating?: number;
  experienceYears?: number;
  maxActiveJobs?: number;
  status: TechnicianStatusType;
  serviceArea: string | null;
  notes: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt?: string | null;
  activeOrdersCount?: number;
  completedOrdersCount?: number;
  totalOrdersCount?: number;
  workloadPercentage?: number;
  isAtCapacity?: boolean;
  slaComplianceRate?: number;
  slaOnTimeRate?: number;
  averageTurnaroundHours?: number;
  workOrders?: TechnicianWorkOrder[];
  currentAssignments?: TechnicianWorkOrder[];
  completedJobs?: TechnicianWorkOrder[];
  activeWorkOrders?: TechnicianWorkOrder[];
  completedWorkOrders?: TechnicianWorkOrder[];
  user?: {
    id: string;
    email: string;
    role: string;
    image?: string | null;
  } | null;
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
  availableForDispatchCount?: number;
  totalActiveJobs?: number;
  avgRating?: number;
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
  "CCTV Surveillance",
  "Access Control",
  "RF Spectrum Analysis",
  "Cleanroom Class 100",
];

const COMMON_CERTIFICATIONS_SUGGESTIONS = [
  "EPA 608 Universal Certification",
  "NATE HVAC Specialist",
  "Master Electrician License",
  "OSHA 30 Construction Safety",
  "FOA Certified Fiber Optic Tech (CFOT)",
  "BICSI RCDD Network Cabling",
  "CompTIA Network+",
  "Cisco CCNA Certified",
  "ASIS Physical Security Professional (PSP)",
  "NFPA 70E Arc Flash Safety",
  "Axis Certified Professional",
  "Universal Refrigerant Recovery",
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
  "Quantum Cryogenics & Superconducting RF",
];

interface TechniciansViewProps {
  role?: "ADMIN" | "DISPATCHER" | "TECHNICIAN";
}

export default function TechniciansView({ role = "DISPATCHER" }: TechniciansViewProps) {
  // Data state
  const [technicians, setTechnicians] = useState<TechnicianData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
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
    availableForDispatchCount: 0,
    totalActiveJobs: 0,
    avgRating: 4.9,
  });

  // Query & filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [specializationFilter, setSpecializationFilter] = useState<string>("all");
  const [serviceAreaFilter, setServiceAreaFilter] = useState<string>("all");
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const [workloadStatusFilter, setWorkloadStatusFilter] = useState<string>("all");
  const [minRatingFilter, setMinRatingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<TechnicianData | null>(null);
  const [profileActiveTab, setProfileActiveTab] = useState<"active" | "completed">("active");
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  // Form inputs state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    skills: [] as string[],
    certifications: [] as string[],
    experienceYears: 3,
    maxActiveJobs: 3,
    rating: 4.9,
    status: "AVAILABLE" as TechnicianStatusType,
    serviceArea: "",
    notes: "",
  });
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [customCertInput, setCustomCertInput] = useState("");
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
        ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
        ...(specializationFilter !== "all" ? { specialization: specializationFilter } : {}),
        ...(serviceAreaFilter !== "all" ? { serviceArea: serviceAreaFilter } : {}),
        ...(skillFilter !== "all" ? { skill: skillFilter } : {}),
        ...(workloadStatusFilter !== "all" ? { workloadStatus: workloadStatusFilter } : {}),
        ...(minRatingFilter !== "all" ? { minRating: minRatingFilter } : {}),
      });

      const res = await fetch(`/api/technicians?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load technicians from server.");
      }
      const data = await res.json();
      setTechnicians(data.technicians || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
      setStats(
        data.stats || {
          totalTechnicians: 0,
          availableCount: 0,
          busyCount: 0,
          offlineCount: 0,
          availableForDispatchCount: 0,
          totalActiveJobs: 0,
          avgRating: 4.9,
        }
      );
    } catch (err) {
      console.error(err);
      showToastNotification("error", "Could not load technicians. Please check database connectivity.");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    sortBy,
    sortOrder,
    debouncedSearch,
    statusFilter,
    specializationFilter,
    serviceAreaFilter,
    skillFilter,
    workloadStatusFilter,
    minRatingFilter,
  ]);

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  // Client-side form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = "Technician full name is required (min 2 characters).";
    }
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = "Please enter a valid email address.";
      }
    }
    if (formData.phone.trim() && formData.phone.trim().length < 6) {
      errors.phone = "Please enter a valid phone number.";
    }
    if (formData.experienceYears < 0) {
      errors.experienceYears = "Experience cannot be negative.";
    }
    if (formData.maxActiveJobs < 1 || formData.maxActiveJobs > 10) {
      errors.maxActiveJobs = "Max active capacity must be between 1 and 10.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Quick 1-Click Status Toggle
  const handleQuickStatusChange = async (techId: string, newStatus: TechnicianStatusType) => {
    if (role === "TECHNICIAN" && selectedTechnician?.id !== techId) {
      // Tech can only update their own status
    }
    setStatusUpdatingId(techId);
    try {
      const res = await fetch(`/api/technicians/${techId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update availability status.");
      }

      showToastNotification("success", `Availability status updated to ${newStatus}.`);
      fetchTechnicians();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating status";
      showToastNotification("error", msg);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialization: "",
      skills: [],
      certifications: [],
      experienceYears: 3,
      maxActiveJobs: 3,
      rating: 4.9,
      status: "AVAILABLE",
      serviceArea: "",
      notes: "",
    });
    setCustomSkillInput("");
    setCustomCertInput("");
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
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setFormErrors(data.errors);
        }
        throw new Error(data.error || "Failed to create technician.");
      }

      showToastNotification("success", `Technician "${data.name}" added to roster!`);
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
      specialization: tech.specialization || "",
      skills: tech.skills || [],
      certifications: tech.certifications || [],
      experienceYears: tech.experienceYears ?? 3,
      maxActiveJobs: tech.maxActiveJobs ?? 3,
      rating: tech.rating ?? 4.9,
      status: tech.status,
      serviceArea: tech.serviceArea || "",
      notes: tech.notes || "",
    });
    setCustomSkillInput("");
    setCustomCertInput("");
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
        body: JSON.stringify(formData),
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

  // Open View Profile Modal with live assignments & history
  const handleOpenView = async (tech: TechnicianData) => {
    setSelectedTechnician(tech);
    setProfileActiveTab("active");
    setShowViewModal(true);
    setLoadingProfile(true);
    try {
      const res = await fetch(`/api/technicians/${tech.id}`);
      if (res.ok) {
        const full = await res.json();
        setSelectedTechnician(full);
      }
    } catch (err) {
      console.error("Failed to fetch full technician profile:", err);
    } finally {
      setLoadingProfile(false);
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

      showToastNotification("success", `Technician "${selectedTechnician.name}" removed from roster.`);
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

  // Skill tag add/remove helpers
  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData({ ...formData, skills: [...formData.skills, trimmed] });
    }
    setCustomSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    });
  };

  // Certifications tag add/remove helpers
  const handleAddCert = (cert: string) => {
    const trimmed = cert.trim();
    if (trimmed && !formData.certifications.includes(trimmed)) {
      setFormData({ ...formData, certifications: [...formData.certifications, trimmed] });
    }
    setCustomCertInput("");
  };

  const handleRemoveCert = (certToRemove: string) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((c) => c !== certToRemove),
    });
  };

  // Clear all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("ALL");
    setSpecializationFilter("all");
    setServiceAreaFilter("all");
    setSkillFilter("all");
    setWorkloadStatusFilter("all");
    setMinRatingFilter("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const hasActiveFilterSet =
    Boolean(debouncedSearch) ||
    statusFilter !== "ALL" ||
    specializationFilter !== "all" ||
    serviceAreaFilter !== "all" ||
    skillFilter !== "all" ||
    workloadStatusFilter !== "all" ||
    minRatingFilter !== "all" ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc";

  // Export to CSV
  const handleExportCSV = () => {
    if (technicians.length === 0) {
      showToastNotification("error", "No technician records available to export.");
      return;
    }

    const headers = [
      "Technician ID",
      "Full Name",
      "Specialization",
      "Rating",
      "Experience (Years)",
      "Status",
      "Active Jobs",
      "Max Capacity",
      "Completed Jobs",
      "SLA On-Time Rate (%)",
      "Email",
      "Phone",
      "Service Territory",
      "Skills",
      "Certifications",
    ];

    const rows = technicians.map((t) => [
      t.id,
      `"${(t.name || "").replace(/"/g, '""')}"`,
      `"${(t.specialization || "").replace(/"/g, '""')}"`,
      t.rating ?? 4.9,
      t.experienceYears ?? 3,
      t.status,
      t.activeOrdersCount ?? 0,
      t.maxActiveJobs ?? 3,
      t.completedOrdersCount ?? 0,
      `${t.slaComplianceRate ?? 100}%`,
      `"${(t.email || "").replace(/"/g, '""')}"`,
      `"${(t.phone || "").replace(/"/g, '""')}"`,
      `"${(t.serviceArea || "").replace(/"/g, '""')}"`,
      `"${(t.skills || []).join("; ").replace(/"/g, '""')}"`,
      `"${(t.certifications || []).join("; ").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FieldFlow_Technicians_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToastNotification("success", "Exported technician roster to CSV.");
  };

  // Extract dynamic filters from loaded data
  const availableSpecializations = Array.from(
    new Set(technicians.map((t) => t.specialization).filter((s): s is string => Boolean(s)))
  ).sort();

  const availableTerritories = Array.from(
    new Set(technicians.map((t) => t.serviceArea).filter((a): a is string => Boolean(a)))
  ).sort();

  const availableSkills = Array.from(
    new Set(technicians.flatMap((t) => t.skills || []).filter(Boolean))
  ).sort();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 max-w-md w-full animate-fadeIn shadow-2xl">
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 backdrop-blur-md ${
              toast.type === "success"
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
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Technician Management</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              Live Dispatch Intelligence
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitor contractor skills, verified certifications, availability, active workload capacity, and SLA benchmarks.
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
              <span>Add Technician</span>
            </button>
          )}
        </div>
      </div>

      {/* Roster Overview Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Roster */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Field Roster</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.totalTechnicians}</span>
            <span className="text-[11px] font-bold text-slate-500">Contractors</span>
          </div>
        </div>

        {/* Ready for Dispatch */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Ready for Dispatch</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">
              {stats.availableForDispatchCount ?? stats.availableCount}
            </span>
            <span className="text-[11px] font-bold text-emerald-700">Available Capacity</span>
          </div>
        </div>

        {/* In-Flight Field Jobs */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">In-Flight Field Jobs</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {stats.totalActiveJobs ?? technicians.reduce((acc, t) => acc + (t.activeOrdersCount || 0), 0)}
            </span>
            <span className="text-[11px] font-bold text-amber-700">Active Workload</span>
          </div>
        </div>

        {/* Customer Rating & SLA */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Quality & SLA Score</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">★ {stats.avgRating ?? 4.9}</span>
            <span className="text-[11px] font-bold text-purple-600">Top Benchmark</span>
          </div>
        </div>
      </div>

      {/* Main Filter & Search Controls Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search technician, skill, certification, area, phone..."
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

          {/* Quick Status Pills & Filter Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
              {(["ALL", "AVAILABLE", "BUSY", "OFF"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === s
                      ? s === "AVAILABLE"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : s === "BUSY"
                        ? "bg-amber-600 text-white shadow-xs"
                        : s === "OFF"
                        ? "bg-slate-700 text-white shadow-xs"
                        : "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {s === "ALL" ? "All" : s === "AVAILABLE" ? "Available" : s === "BUSY" ? "Busy" : "Offline"}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                showFiltersPanel || hasActiveFilterSet
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilterSet && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
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
                <option value="rating-desc">Rating (Highest)</option>
                <option value="activeWorkload-desc">Active Workload (High)</option>
                <option value="activeWorkload-asc">Active Workload (Low)</option>
                <option value="completedJobs-desc">Completed Jobs</option>
                <option value="name-asc">Name (A-Z)</option>
              </select>
            </div>

            {/* Limit Selector */}
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

        {/* Collapsible Advanced Filters Panel */}
        {showFiltersPanel && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-fadeIn">
            {/* Specialization */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Specialization</label>
              <select
                value={specializationFilter}
                onChange={(e) => {
                  setSpecializationFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium outline-none focus:border-blue-600"
              >
                <option value="all">All Specializations</option>
                {availableSpecializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Territory */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Service Territory</label>
              <select
                value={serviceAreaFilter}
                onChange={(e) => {
                  setServiceAreaFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium outline-none focus:border-blue-600"
              >
                <option value="all">All Service Territories</option>
                {availableTerritories.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* Skills / Cert Filter */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Specific Skill / Tech</label>
              <select
                value={skillFilter}
                onChange={(e) => {
                  setSkillFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium outline-none focus:border-blue-600"
              >
                <option value="all">All Skills</option>
                {availableSkills.map((sk) => (
                  <option key={sk} value={sk}>
                    {sk}
                  </option>
                ))}
              </select>
            </div>

            {/* Workload Capacity Filter */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Workload Capacity</label>
              <div className="flex items-center gap-2">
                <select
                  value={workloadStatusFilter}
                  onChange={(e) => {
                    setWorkloadStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium outline-none focus:border-blue-600"
                >
                  <option value="all">All Capacity Levels</option>
                  <option value="available">Available for Dispatch (&lt; Max)</option>
                  <option value="at_capacity">At Max Capacity / Busy</option>
                </select>

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

      {/* Main Technicians Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden max-h-175 overflow-y-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 border-b border-slate-200 shadow-xs">
              <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-4 sm:px-6">Technician & Expertise</th>
                <th className="py-3.5 px-4">Availability</th>
                <th className="py-3.5 px-4">Live Workload & Capacity</th>
                <th className="py-3.5 px-4">Skills & Certifications</th>
                <th className="py-3.5 px-4">Contact & Territory</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-200" />
                        <div className="space-y-1.5">
                          <div className="w-32 h-3.5 bg-slate-200 rounded" />
                          <div className="w-24 h-2.5 bg-slate-100 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-20 h-6 bg-slate-200 rounded-full" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-28 h-3.5 bg-slate-200 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-32 h-5 bg-slate-200 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-24 h-3 bg-slate-200 rounded" />
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
                        {hasActiveFilterSet ? "No matching technicians found" : "No technician records yet"}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {hasActiveFilterSet
                          ? "We couldn't find any technicians matching your search or filters. Try clearing your filters."
                          : "Start building your field operations workforce by provisioning your first certified technician."}
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
                            <span>Add First Technician</span>
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                technicians.map((tech) => {
                  const initials =
                    tech.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "TC";

                  const activeCount = tech.activeOrdersCount ?? 0;
                  const maxCap = tech.maxActiveJobs ?? 3;
                  const workloadPct = tech.workloadPercentage ?? Math.min(100, Math.round((activeCount / maxCap) * 100));

                  return (
                    <tr key={tech.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Technician & Expertise */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="font-bold text-slate-900 block truncate hover:text-blue-600 cursor-pointer"
                                onClick={() => handleOpenView(tech)}
                              >
                                {tech.name}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                <span>{tech.rating ?? 4.9}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                              <span className="truncate">{tech.specialization || "General Operations"}</span>
                              {tech.experienceYears ? (
                                <span className="text-slate-400 text-[10px]">· {tech.experienceYears}y exp</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Availability & Quick Status Toggle */}
                      <td className="py-3.5 px-4">
                        <div className="relative inline-block group/status">
                          <button
                            disabled={role === "TECHNICIAN"}
                            onClick={() => {
                              const nextStatus: TechnicianStatusType =
                                tech.status === "AVAILABLE" ? "BUSY" : tech.status === "BUSY" ? "OFF" : "AVAILABLE";
                              handleQuickStatusChange(tech.id, nextStatus);
                            }}
                            title={role !== "TECHNICIAN" ? "Click to toggle availability status" : "Availability status"}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
                              tech.status === "AVAILABLE"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : tech.status === "BUSY"
                                ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                            } ${role !== "TECHNICIAN" ? "cursor-pointer" : "cursor-default"}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                tech.status === "AVAILABLE"
                                  ? "bg-emerald-500 animate-pulse"
                                  : tech.status === "BUSY"
                                  ? "bg-amber-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            <span>{tech.status}</span>
                            {role !== "TECHNICIAN" && (
                              <ChevronDown className="w-3 h-3 text-slate-400 group-hover/status:text-slate-600" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Workload Meter & Capacity */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5 max-w-40">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-800">
                              {activeCount} / {maxCap} Jobs
                            </span>
                            <span
                              className={`text-[10px] font-bold ${
                                workloadPct >= 100
                                  ? "text-rose-600"
                                  : workloadPct >= 66
                                  ? "text-amber-600"
                                  : "text-emerald-600"
                              }`}
                            >
                              {workloadPct}%
                            </span>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                workloadPct >= 100
                                  ? "bg-rose-500"
                                  : workloadPct >= 66
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${workloadPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Skills & Certifications */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-64">
                          {/* Certifications (Gold) */}
                          {(tech.certifications || []).slice(0, 1).map((cert, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold flex items-center gap-1 shrink-0"
                            >
                              <Award className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                              <span className="truncate max-w-28">{cert}</span>
                            </span>
                          ))}

                          {/* Skills (Blue) */}
                          {(tech.skills || []).slice(0, 2).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-semibold shrink-0 truncate max-w-24"
                            >
                              {skill}
                            </span>
                          ))}

                          {((tech.skills?.length || 0) + (tech.certifications?.length || 0) > 3) && (
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold">
                              +{(tech.skills?.length || 0) + (tech.certifications?.length || 0) - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Contact & Territory */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {tech.serviceArea && (
                            <span className="text-xs text-slate-800 flex items-center gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate font-semibold">{tech.serviceArea}</span>
                            </span>
                          )}
                          {tech.phone && (
                            <a
                              href={`tel:${tech.phone}`}
                              className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1.5 truncate"
                            >
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{tech.phone}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenView(tech)}
                            title="View Profile & Active Workload"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {role !== "TECHNICIAN" && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(tech)}
                                title="Edit Technician Profile"
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
                                onClick={() => handleOpenDelete(tech)}
                                title="Remove Technician"
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
        {!loading && technicians.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-800">{(pagination.page - 1) * pagination.limit + 1}</span>{" "}
              to{" "}
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          pagination.page === pageNum
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
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Add Field Technician</h3>
                  <p className="text-slate-500">Register a new contractor with skills and certifications</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTechnician} className="space-y-4">
              {/* Name & Specialization */}
              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Henderson"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${
                      formErrors.name ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                    }`}
                  />
                  {formErrors.name && <span className="text-[11px] text-rose-600 block">{formErrors.name}</span>}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Specialization</label>
                  <input
                    type="text"
                    list="spec-suggestions"
                    placeholder="e.g. HVAC & Climate Control"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all"
                  />
                  <datalist id="spec-suggestions">
                    {SPECIALIZATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="technician@fieldflow.io"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${
                      formErrors.email ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                    }`}
                  />
                  {formErrors.email && <span className="text-[11px] text-rose-600 block">{formErrors.email}</span>}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Contact Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 345-6789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              {/* Service Territory, Experience, Max Capacity */}
              <div className="grid sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Service Territory</label>
                  <input
                    type="text"
                    placeholder="e.g. Austin Metro - North"
                    value={formData.serviceArea}
                    onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Max Active Jobs</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.maxActiveJobs}
                    onChange={(e) => setFormData({ ...formData, maxActiveJobs: parseInt(e.target.value, 10) || 3 })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              {/* Skills Tag Builder */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Skills & Technical Competencies ({formData.skills.length})
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a skill and press Enter..."
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill(customSkillInput);
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-blue-200 bg-white text-slate-900 outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(customSkillInput)}
                    className="px-3 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Selected Skills Chips */}
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold flex items-center gap-1.5"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-blue-500 hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Popular Skill Suggestions */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Quick Suggestions:</span>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {COMMON_SKILLS_SUGGESTIONS.filter((s) => !formData.skills.includes(s)).slice(0, 8).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleAddSkill(s)}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-700 text-[10px] font-medium transition-colors cursor-pointer"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Certifications Tag Builder */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    Verified Certifications & Licenses ({formData.certifications.length})
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a certification and press Enter..."
                    value={customCertInput}
                    onChange={(e) => setCustomCertInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCert(customCertInput);
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-amber-200 bg-white text-slate-900 outline-none focus:border-amber-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCert(customCertInput)}
                    className="px-3 py-2 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Selected Certs Chips */}
                {formData.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold flex items-center gap-1.5"
                      >
                        <Award className="w-3 h-3 text-amber-600" />
                        <span>{cert}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCert(cert)}
                          className="text-amber-500 hover:text-amber-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Popular Cert Suggestions */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Popular Certifications:</span>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {COMMON_CERTIFICATIONS_SUGGESTIONS.filter((c) => !formData.certifications.includes(c)).slice(0, 6).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleAddCert(c)}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-800 text-[10px] font-medium transition-colors cursor-pointer"
                      >
                        + {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Internal Operations & Equipment Notes</label>
                <textarea
                  rows={2}
                  placeholder="Equipped with thermal imager, high-reach ladder clearance, security clearance level 2..."
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
                  <span>{submitting ? "Provisioning..." : "Save Technician"}</span>
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
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Technician Profile</h3>
                  <p className="text-slate-500">Update contractor certifications, workload limit, and skills</p>
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

            <form onSubmit={handleUpdateTechnician} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${
                      formErrors.name ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                    }`}
                  />
                  {formErrors.name && <span className="text-[11px] text-rose-600 block">{formErrors.name}</span>}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Specialization</label>
                  <input
                    type="text"
                    list="edit-spec-suggestions"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all"
                  />
                  <datalist id="edit-spec-suggestions">
                    {SPECIALIZATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${
                      formErrors.email ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                    }`}
                  />
                  {formErrors.email && <span className="text-[11px] text-rose-600 block">{formErrors.email}</span>}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Contact Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Service Territory</label>
                  <input
                    type="text"
                    value={formData.serviceArea}
                    onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Max Active Jobs</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.maxActiveJobs}
                    onChange={(e) => setFormData({ ...formData, maxActiveJobs: parseInt(e.target.value, 10) || 3 })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              {/* Skills Tag Builder */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100">
                <label className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Skills & Technical Competencies ({formData.skills.length})
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a skill and press Enter..."
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill(customSkillInput);
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-blue-200 bg-white text-slate-900 outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(customSkillInput)}
                    className="px-3 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold flex items-center gap-1.5"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-blue-500 hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Certifications Tag Builder */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100">
                <label className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  Verified Certifications & Licenses ({formData.certifications.length})
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a certification and press Enter..."
                    value={customCertInput}
                    onChange={(e) => setCustomCertInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCert(customCertInput);
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-amber-200 bg-white text-slate-900 outline-none focus:border-amber-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCert(customCertInput)}
                    className="px-3 py-2 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {formData.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold flex items-center gap-1.5"
                      >
                        <Award className="w-3 h-3 text-amber-600" />
                        <span>{cert}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCert(cert)}
                          className="text-amber-500 hover:text-amber-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Internal Operations & Equipment Notes</label>
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
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
      {/* 3. VIEW TECHNICIAN PROFILE & LIVE WORKLOAD MODAL */}
      {/* ========================================================= */}
      {showViewModal && selectedTechnician && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto text-xs">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                  {selectedTechnician.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-black text-slate-900">{selectedTechnician.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{selectedTechnician.rating ?? 4.9} Rating</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        selectedTechnician.status === "AVAILABLE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : selectedTechnician.status === "BUSY"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {selectedTechnician.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-0.5">
                    <span>{selectedTechnician.specialization || "General Field Technician"}</span>
                    {selectedTechnician.serviceArea && <span>· 📍 {selectedTechnician.serviceArea}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {selectedTechnician.phone && (
                  <a
                    href={`tel:${selectedTechnician.phone}`}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 font-bold"
                    title="Direct Call"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-600" />
                    <span className="hidden sm:inline">Call</span>
                  </a>
                )}
                {selectedTechnician.email && (
                  <a
                    href={`mailto:${selectedTechnician.email}`}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 font-bold"
                    title="Send Email"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-600" />
                    <span className="hidden sm:inline">Email</span>
                  </a>
                )}
                {role !== "TECHNICIAN" && (
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleOpenEdit(selectedTechnician);
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
                    setSelectedTechnician(null);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Performance KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-1">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                  Active Workload
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-amber-950">
                    {selectedTechnician.activeOrdersCount ?? (selectedTechnician.activeWorkOrders?.length || 0)} /{" "}
                    {selectedTechnician.maxActiveJobs ?? 3}
                  </span>
                  <span className="text-[10px] font-bold text-amber-700">
                    ({selectedTechnician.workloadPercentage ?? 0}%)
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Resolved Dispatches
                </span>
                <span className="text-xl font-black text-emerald-950">
                  {selectedTechnician.completedOrdersCount ?? (selectedTechnician.completedWorkOrders?.length || 0)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                  SLA On-Time Rate
                </span>
                <span className="text-xl font-black text-purple-950">
                  {selectedTechnician.slaOnTimeRate ?? selectedTechnician.slaComplianceRate ?? 100}%
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                  Experience & Tier
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-blue-950">{selectedTechnician.experienceYears ?? 3} Yrs</span>
                  <span className="text-[10px] font-bold text-blue-600">Senior Field</span>
                </div>
              </div>
            </div>

            {/* Skills & Certifications Showcase */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Skills */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Technical Skills ({(selectedTechnician.skills || []).length})
                </span>
                {(selectedTechnician.skills || []).length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedTechnician.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-xs">No technical skills assigned.</p>
                )}
              </div>

              {/* Certifications */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  Verified Certifications ({(selectedTechnician.certifications || []).length})
                </span>
                {(selectedTechnician.certifications || []).length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(selectedTechnician.certifications || []).map((cert, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{cert}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-xs">No formal certifications recorded.</p>
                )}
              </div>
            </div>

            {/* Workload Assignments & History Tabs */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setProfileActiveTab("active")}
                    className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      profileActiveTab === "active"
                        ? "bg-amber-100 text-amber-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    In-Flight Assignments (
                    {selectedTechnician.activeWorkOrders?.length ??
                      selectedTechnician.currentAssignments?.length ??
                      selectedTechnician.activeOrdersCount ??
                      0}
                    )
                  </button>

                  <button
                    onClick={() => setProfileActiveTab("completed")}
                    className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      profileActiveTab === "completed"
                        ? "bg-emerald-100 text-emerald-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Resolved Jobs History (
                    {selectedTechnician.completedWorkOrders?.length ??
                      selectedTechnician.completedJobs?.length ??
                      selectedTechnician.completedOrdersCount ??
                      0}
                    )
                  </button>
                </div>
              </div>

              {loadingProfile ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-16 rounded-2xl bg-slate-100" />
                  <div className="h-16 rounded-2xl bg-slate-100" />
                </div>
              ) : profileActiveTab === "active" ? (
                /* Active Assignments Tab */
                (selectedTechnician.activeWorkOrders?.length || 0) > 0 ? (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {(selectedTechnician.activeWorkOrders || []).map((wo) => (
                      <div
                        key={wo.id}
                        className="p-3 rounded-2xl border border-amber-200/60 bg-amber-50/20 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900">{wo.title}</span>
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              {wo.status}
                            </span>
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                              {wo.priority}
                            </span>
                          </div>
                          {wo.customer && (
                            <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>
                                {wo.customer.name} · {wo.customer.address || wo.customer.city}
                              </span>
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0 text-[10px] text-slate-400">
                          {wo.scheduledAt ? (
                            <span className="font-bold text-amber-700">
                              Scheduled: {new Date(wo.scheduledAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <span>Created {new Date(wo.createdAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 border-dashed text-center space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                    <p className="font-bold text-slate-700 text-xs">No active in-flight assignments</p>
                    <p className="text-[11px] text-slate-400">
                      This technician has available capacity and is ready for work order dispatch.
                    </p>
                  </div>
                )
              ) : (
                /* Completed Jobs Tab */
                (selectedTechnician.completedWorkOrders?.length || 0) > 0 ? (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {(selectedTechnician.completedWorkOrders || []).map((wo) => (
                      <div
                        key={wo.id}
                        className="p-3 rounded-2xl border border-emerald-200/60 bg-emerald-50/20 space-y-1.5 text-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="font-bold text-slate-900 block">{wo.title}</span>
                            {wo.customer && (
                              <span className="text-[11px] text-slate-500">
                                Client: {wo.customer.name} ({wo.customer.company || "Direct"})
                              </span>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            {wo.completedAt && (
                              <span className="text-[10px] font-bold text-emerald-700 block">
                                Done {new Date(wo.completedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        {wo.completionNotes && (
                          <div className="p-2 rounded-xl bg-white border border-emerald-100 text-[11px] text-emerald-900 leading-snug">
                            <span className="font-bold">Resolution Notes: </span>
                            {wo.completionNotes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 border-dashed text-center space-y-1">
                    <Briefcase className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-700 text-xs">No completed dispatch history yet</p>
                    <p className="text-[11px] text-slate-400">Resolved jobs will automatically populate this section.</p>
                  </div>
                )
              )}
            </div>

            {/* Notes if available */}
            {selectedTechnician.notes && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Operations & Equipment Notes</span>
                <p className="text-slate-700 text-xs leading-relaxed">{selectedTechnician.notes}</p>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                Technician ID: <code className="font-mono text-slate-600">{selectedTechnician.id}</code>
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTechnician(null);
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
      {showDeleteModal && selectedTechnician && (
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
              <h3 className="text-lg font-bold text-slate-900">Remove Technician</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to remove{" "}
                <span className="font-bold text-slate-900">&ldquo;{selectedTechnician.name}&rdquo;</span> from the active roster?
              </p>
            </div>

            {(selectedTechnician.activeOrdersCount || 0) > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block">Active Workload Guard</span>
                  <span>
                    This technician is currently assigned to {selectedTechnician.activeOrdersCount} active in-flight job(s).
                    Please reassign or resolve their active work orders first.
                  </span>
                </div>
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                )}
                <span>{submitting ? "Deleting..." : "Confirm Removal"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
