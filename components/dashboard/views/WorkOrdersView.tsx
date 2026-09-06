"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Download,
  Building2,
  Wrench,
  User,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Calendar,
  AlertCircle,
  TrendingUp,
  Check,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export type PriorityType = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type WorkOrderStatusType =
  | "OPEN"
  | "ASSIGNED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "PAUSED"
  | "COMPLETED"
  | "CLOSED"
  | "CANCELLED";

export interface StatusLogEntry {
  id: string;
  fromStatus: WorkOrderStatusType;
  toStatus: WorkOrderStatusType;
  changedAt: string;
  notes?: string | null;
  changedBy?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface WorkOrderData {
  id: string;
  title: string;
  description: string;
  priority: PriorityType;
  status: WorkOrderStatusType;
  customerId: string;
  technicianId: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  completionNotes: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    company: string | null;
    email: string;
    phone: string;
    address: string;
    city: string | null;
  };
  technician: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    specialization: string | null;
    skills: string[];
    status: "AVAILABLE" | "BUSY" | "OFF";
    serviceArea: string | null;
  } | null;
  statusLogs?: StatusLogEntry[];
}

interface CustomerOption {
  id: string;
  name: string;
  company: string | null;
  city: string | null;
}

interface TechnicianOption {
  id: string;
  name: string;
  specialization: string | null;
  status: "AVAILABLE" | "BUSY" | "OFF";
  serviceArea: string | null;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface StatsInfo {
  totalWorkOrders: number;
  openCount: number;
  assignedCount: number;
  acceptedCount: number;
  inProgressCount: number;
  pausedCount: number;
  completedCount: number;
  closedCount: number;
  cancelledCount: number;
  overdueCount: number;
}

interface WorkOrdersViewProps {
  role?: "ADMIN" | "DISPATCHER" | "TECHNICIAN";
}

export default function WorkOrdersView({ role = "DISPATCHER" }: WorkOrdersViewProps) {
  // Data state
  const [workOrders, setWorkOrders] = useState<WorkOrderData[]>([]);
  const [customersList, setCustomersList] = useState<CustomerOption[]>([]);
  const [techniciansList, setTechniciansList] = useState<TechnicianOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [stats, setStats] = useState<StatsInfo>({
    totalWorkOrders: 0,
    openCount: 0,
    assignedCount: 0,
    acceptedCount: 0,
    inProgressCount: 0,
    pausedCount: 0,
    completedCount: 0,
    closedCount: 0,
    cancelledCount: 0,
    overdueCount: 0,
  });

  const [nowTimestamp] = useState(() => new Date().getTime());

  // Query / Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [technicianFilter, setTechnicianFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateField, setDateField] = useState<"scheduledAt" | "createdAt">("scheduledAt");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Lifecycle Action Modals
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Active work order being acted upon
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderData | null>(null);
  const [activeTargetOrder, setActiveTargetOrder] = useState<WorkOrderData | null>(null);

  // Modal input fields
  const [actionNotesInput, setActionNotesInput] = useState("");
  const [completionNotesInput, setCompletionNotesInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form state for Create & Edit
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    customerId: "",
    technicianId: "",
    priority: "MEDIUM" as PriorityType,
    status: "OPEN" as WorkOrderStatusType,
    scheduledAt: "",
    completionNotes: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Toast notification state
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
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

  // Fetch dropdown options for Customers and Technicians (if not technician)
  useEffect(() => {
    if (role !== "TECHNICIAN") {
      const fetchDropdownOptions = async () => {
        try {
          const [custRes, techRes] = await Promise.all([
            fetch("/api/customers?limit=100"),
            fetch("/api/technicians?limit=100"),
          ]);
          if (custRes.ok) {
            const custData = await custRes.json();
            setCustomersList(custData.customers || []);
          }
          if (techRes.ok) {
            const techData = await techRes.json();
            setTechniciansList(techData.technicians || []);
          }
        } catch (err) {
          console.error("Error fetching dropdown options:", err);
        }
      };
      fetchDropdownOptions();
    }
  }, [role]);

  // Fetch work orders from API with server-side search, filtering, sorting, pagination
  const fetchWorkOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        ...(priorityFilter !== "all" ? { priority: priorityFilter } : {}),
        ...(technicianFilter !== "all" && role !== "TECHNICIAN" ? { technicianId: technicianFilter } : {}),
        ...(customerFilter !== "all" && role !== "TECHNICIAN" ? { customerId: customerFilter } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(dateField ? { dateField } : {}),
      });

      const res = await fetch(`/api/work-orders?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load work orders from database.");
      }
      const data = await res.json();
      setWorkOrders(data.workOrders || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
      setStats(
        data.stats || {
          totalWorkOrders: 0,
          openCount: 0,
          assignedCount: 0,
          acceptedCount: 0,
          inProgressCount: 0,
          pausedCount: 0,
          completedCount: 0,
          closedCount: 0,
          cancelledCount: 0,
          overdueCount: 0,
        }
      );
    } catch (err) {
      console.error(err);
      showToast("error", "Could not load work orders. Check database connectivity.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, debouncedSearch, statusFilter, priorityFilter, technicianFilter, customerFilter, startDate, endDate, dateField, role]);

  // Sorting header click handler
  const handleSortToggle = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  // Form Validation
  const validateForm = () => {
    if (role === "TECHNICIAN") return true;
    const errors: Record<string, string> = {};
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      errors.title = "Work order title is required (min 3 characters).";
    }
    if (!formData.description.trim() || formData.description.trim().length < 3) {
      errors.description = "Work order description is required.";
    }
    if (!formData.customerId) {
      errors.customerId = "Please select a client customer.";
    }

    if (formData.technicianId) {
      const tech = techniciansList.find((t) => t.id === formData.technicianId);
      if (tech && tech.status === "OFF") {
        errors.technicianId = `Technician "${tech.name}" is currently Offline/Off-Duty. Please choose an available technician.`;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Create Modal (Dispatcher & Admin)
  const handleOpenCreate = () => {
    setFormData({
      title: "",
      description: "",
      customerId: customersList[0]?.id || "",
      technicianId: "",
      priority: "MEDIUM",
      status: "OPEN",
      scheduledAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16),
      completionNotes: "",
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  // Submit Create Work Order
  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          customerId: formData.customerId,
          technicianId: formData.technicianId || null,
          priority: formData.priority,
          status: formData.status,
          scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
          completionNotes: formData.completionNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setFormErrors(data.errors);
        }
        throw new Error(data.error || "Failed to create work order.");
      }

      showToast("success", `Work Order "${data.title}" created successfully!`);
      setShowCreateModal(false);
      fetchWorkOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating work order";
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (wo: WorkOrderData) => {
    setSelectedWorkOrder(wo);
    setFormData({
      title: wo.title,
      description: wo.description,
      customerId: wo.customerId,
      technicianId: wo.technicianId || "",
      priority: wo.priority,
      status: wo.status,
      scheduledAt: wo.scheduledAt
        ? new Date(wo.scheduledAt).toISOString().slice(0, 16)
        : "",
      completionNotes: wo.completionNotes || "",
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  // Submit Update Work Order
  const handleUpdateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkOrder || !validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        customerId: formData.customerId,
        technicianId: formData.technicianId || null,
        priority: formData.priority,
        status: formData.status,
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
        completionNotes: formData.completionNotes,
      };

      const res = await fetch(`/api/work-orders/${selectedWorkOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setFormErrors(data.errors);
        }
        throw new Error(data.error || "Failed to update work order.");
      }

      showToast("success", `Work order "${data.title}" updated successfully!`);
      setShowEditModal(false);
      setSelectedWorkOrder(null);
      fetchWorkOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating work order";
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // LIFECYCLE ACTIONS
  // =========================================================

  // 1. Technician: Accept Assignment
  const handleAcceptWork = async (wo: WorkOrderData) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/work-orders/${wo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "ACCEPTED",
          notes: "Technician accepted assigned work order",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to accept work order.");
      }

      showToast("success", `Work Order "${wo.title}" accepted! Ready to start work.`);
      fetchWorkOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error accepting work order";
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Technician: Reject Assignment (Decline)
  const handleOpenRejectModal = (wo: WorkOrderData) => {
    setActiveTargetOrder(wo);
    setActionNotesInput("");
    setShowRejectModal(true);
  };

  const handleSubmitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTargetOrder) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/work-orders/${activeTargetOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "OPEN",
          technicianId: null,
          notes: actionNotesInput.trim()
            ? `Assignment declined by technician: ${actionNotesInput.trim()}`
            : "Assignment declined by technician (returned to Open pool)",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to decline work order.");
      }

      showToast("success", `Work order returned to Open pool. Dispatcher notified.`);
      setShowRejectModal(false);
      setActiveTargetOrder(null);
      fetchWorkOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error declining assignment";
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Technician: Start Work (ACCEPTED -> IN_PROGRESS)
  const handleStartWork = async (wo: WorkOrderData) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/work-orders/${wo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "IN_PROGRESS",
          notes: "Technician arrived on-site and commenced service",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start work order.");
      }

      showToast("success", `Work started on "${wo.title}" (Status: In Progress). Technician marked Busy.`);
      fetchWorkOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error starting work";
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Technician: Pause Work (IN_PROGRESS -> PAUSED)
  const handleOpenPauseModal = (wo: WorkOrderData) => {
    setActiveTargetOrder(wo);
    setActionNotesInput("");
    setShowPauseModal(true);
  };

  const handleSubmitPause = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTargetOrder) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/work-orders/${activeTargetOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "PAUSED",
          notes: actionNotesInput.trim()
            ? `Work paused: ${actionNotesInput.trim()}`
            : "Work paused by technician (awaiting parts / access)",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to pause work order.");
      }

      showToast("success", `Work paused on "${activeTargetOrder.title}". Technician status updated.`);
      setShowPauseModal(false);
      setActiveTargetOrder(null);
      fetchWorkOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error pausing work";
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Technician: Resume Work (PAUSED -> IN_PROGRESS)
  const handleResumeWork = async (wo: WorkOrderData) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/work-orders/${wo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "IN_PROGRESS",
          notes: "Technician resumed paused work order",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resume work order.");
      }

      showToast("success", `Work resumed on "${wo.title}" (Status: In Progress).`);
      fetchWorkOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error resuming work";
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 6. Technician: Complete Job (IN_PROGRESS/PAUSED -> COMPLETED)
  const handleOpenCompleteModal = (wo: WorkOrderData) => {
    setActiveTargetOrder(wo);
    setCompletionNotesInput(wo.completionNotes || "");
    setShowCompleteModal(true);
  };

  const handleSubmitCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTargetOrder) return;

    if (!completionNotesInput.trim() || completionNotesInput.trim().length < 5) {
      showToast("error", "Completion notes are mandatory (minimum 5 characters).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/work-orders/${activeTargetOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "COMPLETED",
          completionNotes: completionNotesInput.trim(),
          completedAt: new Date().toISOString(),
          notes: `Job completed with notes: ${completionNotesInput.trim()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete work order.");
      }

      showToast("success", `Work order "${activeTargetOrder.title}" marked Completed! Ready for Dispatcher sign-off.`);
      setShowCompleteModal(false);
      setActiveTargetOrder(null);
      fetchWorkOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error completing job";
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 7. Dispatcher / Admin: Close Work Order (COMPLETED -> CLOSED)
  const handleOpenCloseModal = (wo: WorkOrderData) => {
    setActiveTargetOrder(wo);
    setActionNotesInput("");
    setShowCloseModal(true);
  };

  const handleSubmitClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTargetOrder) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/work-orders/${activeTargetOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CLOSED",
          notes: actionNotesInput.trim()
            ? `Final sign-off by Dispatcher: ${actionNotesInput.trim()}`
            : "Work order reviewed and officially closed/signed off",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to close work order.");
      }

      showToast("success", `Work order "${activeTargetOrder.title}" officially Closed & Archived.`);
      setShowCloseModal(false);
      setActiveTargetOrder(null);
      fetchWorkOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error closing work order";
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 8. Dispatcher / Admin: Cancel Work Order (OPEN/ASSIGNED/ACCEPTED/PAUSED -> CANCELLED)
  const handleOpenCancelModal = (wo: WorkOrderData) => {
    setActiveTargetOrder(wo);
    setActionNotesInput("");
    setShowCancelModal(true);
  };

  const handleSubmitCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTargetOrder) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/work-orders/${activeTargetOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CANCELLED",
          notes: actionNotesInput.trim()
            ? `Work order cancelled: ${actionNotesInput.trim()}`
            : "Work order cancelled by Dispatcher",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel work order.");
      }

      showToast("success", `Work order "${activeTargetOrder.title}" cancelled.`);
      setShowCancelModal(false);
      setActiveTargetOrder(null);
      fetchWorkOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error cancelling work order";
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Open View Modal with complete StatusLog history
  const handleOpenView = async (wo: WorkOrderData) => {
    setSelectedWorkOrder(wo);
    setShowViewModal(true);
    try {
      const res = await fetch(`/api/work-orders/${wo.id}`);
      if (res.ok) {
        const full = await res.json();
        setSelectedWorkOrder(full);
      }
    } catch {
      // keep current data
    }
  };

  // Open Delete Modal (Dispatcher & Admin only)
  const handleOpenDelete = (wo: WorkOrderData) => {
    setSelectedWorkOrder(wo);
    setShowDeleteModal(true);
  };

  // Submit Delete Work Order
  const handleDeleteWorkOrder = async () => {
    if (!selectedWorkOrder) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/work-orders/${selectedWorkOrder.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete work order.");
      }

      showToast("success", `Work order "${selectedWorkOrder.title}" deleted successfully.`);
      setShowDeleteModal(false);
      setSelectedWorkOrder(null);
      fetchWorkOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting work order";
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (workOrders.length === 0) {
      showToast("error", "No work order records available to export.");
      return;
    }

    const headers = [
      "Order ID",
      "Title",
      "Customer",
      "Company",
      "Assigned Technician",
      "Priority",
      "Status",
      "Scheduled At",
      "Completed At",
      "Created At",
    ];

    const rows = workOrders.map((wo) => [
      wo.id,
      `"${wo.title.replace(/"/g, '""')}"`,
      `"${wo.customer?.name?.replace(/"/g, '""') || "N/A"}"`,
      `"${wo.customer?.company?.replace(/"/g, '""') || ""}"`,
      `"${wo.technician?.name?.replace(/"/g, '""') || "Unassigned"}"`,
      wo.priority,
      wo.status,
      wo.scheduledAt ? new Date(wo.scheduledAt).toISOString() : "",
      wo.completedAt ? new Date(wo.completedAt).toISOString() : "",
      new Date(wo.createdAt).toISOString(),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FieldFlow_WorkOrders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("success", "Exported work order registry to CSV.");
  };

  const getPriorityBadgeClass = (priority: PriorityType) => {
    switch (priority) {
      case "URGENT":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "HIGH":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "MEDIUM":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "LOW":
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getStatusBadgeClass = (status: WorkOrderStatusType) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CLOSED":
        return "bg-slate-100 text-slate-700 border-slate-300";
      case "IN_PROGRESS":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "PAUSED":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "ACCEPTED":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "ASSIGNED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "OPEN":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
    }
  };

  const getStatusDotColor = (status: WorkOrderStatusType) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-500";
      case "CLOSED":
        return "bg-slate-500";
      case "IN_PROGRESS":
        return "bg-purple-500";
      case "PAUSED":
        return "bg-orange-500";
      case "ACCEPTED":
        return "bg-teal-500";
      case "ASSIGNED":
        return "bg-indigo-500";
      case "OPEN":
        return "bg-blue-500";
      case "CANCELLED":
        return "bg-rose-500";
    }
  };

  const formatStatusLabel = (status: WorkOrderStatusType) => {
    switch (status) {
      case "IN_PROGRESS":
        return "In Progress";
      case "OPEN":
        return "Open";
      case "ASSIGNED":
        return "Assigned";
      case "ACCEPTED":
        return "Accepted";
      case "PAUSED":
        return "Paused";
      case "COMPLETED":
        return "Completed";
      case "CLOSED":
        return "Closed";
      case "CANCELLED":
        return "Cancelled";
    }
  };

  const isOverdue = (wo: WorkOrderData) => {
    if (!wo.scheduledAt) return false;
    const isPast = new Date(wo.scheduledAt).getTime() < nowTimestamp;
    return isPast && ["OPEN", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"].includes(wo.status);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Feedback */}
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
            <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
              {toast.message}
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
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
              {role === "TECHNICIAN" ? "My Assigned Work Orders" : "Work Order Management"}
            </h2>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                role === "TECHNICIAN"
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-blue-100 text-blue-700 border-blue-200"
              }`}
            >
              {role === "TECHNICIAN" ? "Technician Execution Portal" : "Full Lifecycle Control"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {role === "TECHNICIAN"
              ? "Accept jobs, start service, pause when needed, and complete with mandatory sign-off notes."
              : "Strict lifecycle orchestration: Created → Assigned → Accepted → In Progress → Completed → Closed."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchWorkOrders}
            title="Refresh work order records"
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
              <span>Create Work Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Work Orders */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {role === "TECHNICIAN" ? "My Total" : "Total Orders"}
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">{stats.totalWorkOrders}</span>
            <span className="text-[10px] font-bold text-blue-600">
              {role === "TECHNICIAN" ? "Assigned" : "All Time"}
            </span>
          </div>
        </div>

        {/* Assigned & Accepted */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {role === "TECHNICIAN" ? "Ready" : "Assigned/Accepted"}
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-teal-600">
              {stats.assignedCount + stats.acceptedCount}
            </span>
            <span className="text-[10px] font-bold text-teal-700">Pre-Dispatch</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Progress</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-purple-600">{stats.inProgressCount}</span>
            <span className="text-[10px] font-bold text-purple-700">Active On-Site</span>
          </div>
        </div>

        {/* Paused */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Paused</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-orange-600">{stats.pausedCount}</span>
            <span className="text-[10px] font-bold text-orange-700">Awaiting Action</span>
          </div>
        </div>

        {/* Completed & Closed */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed/Closed</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600">
              {stats.completedCount + stats.closedCount}
            </span>
            <span className="text-[10px] font-bold text-emerald-700">Resolved</span>
          </div>
        </div>

        {/* Overdue Alert */}
        <div
          className={`p-4 rounded-2xl border shadow-xs space-y-1.5 ${
            stats.overdueCount > 0
              ? "bg-rose-50/70 border-rose-200"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${stats.overdueCount > 0 ? "text-rose-700" : ""}`}>
              Overdue SLAs
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                stats.overdueCount > 0
                  ? "bg-rose-100 text-rose-600 animate-pulse"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-black ${
                stats.overdueCount > 0 ? "text-rose-600" : "text-slate-800"
              }`}
            >
              {stats.overdueCount}
            </span>
            <span
              className={`text-[10px] font-bold ${
                stats.overdueCount > 0 ? "text-rose-700" : "text-emerald-600"
              }`}
            >
              {stats.overdueCount > 0 ? "Urgent Attention" : "On Schedule"}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                role === "TECHNICIAN"
                  ? "Search by ID, title, customer, phone..."
                  : "Search by ID, customer, technician, email, phone..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9.5 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-xs sm:text-sm font-medium text-slate-900 transition-all outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tabs & Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 text-xs font-bold overflow-x-auto max-w-full">
              {[
                { label: "All", value: "all" },
                { label: "Open", value: "OPEN", color: "bg-blue-600" },
                { label: "Assigned", value: "ASSIGNED", color: "bg-indigo-600" },
                { label: "Accepted", value: "ACCEPTED", color: "bg-teal-600" },
                { label: "In Progress", value: "IN_PROGRESS", color: "bg-purple-600" },
                { label: "Paused", value: "PAUSED", color: "bg-orange-600" },
                { label: "Completed", value: "COMPLETED", color: "bg-emerald-600" },
                { label: "Closed", value: "CLOSED", color: "bg-slate-700" },
                { label: "Cancelled", value: "CANCELLED", color: "bg-rose-600" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => {
                    setStatusFilter(tab.value);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === tab.value
                      ? `${tab.color || "bg-white text-slate-900"} text-white shadow-xs`
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold outline-none cursor-pointer focus:border-blue-600"
              >
                <option value="all">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Customer Filter (only for Dispatcher & Admin) */}
            {role !== "TECHNICIAN" && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <select
                  value={customerFilter}
                  onChange={(e) => {
                    setCustomerFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold outline-none cursor-pointer focus:border-blue-600 max-w-[150px] truncate"
                >
                  <option value="all">All Customers</option>
                  {customersList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Technician Filter (only for Dispatcher & Admin) */}
            {role !== "TECHNICIAN" && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <select
                  value={technicianFilter}
                  onChange={(e) => {
                    setTechnicianFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold outline-none cursor-pointer focus:border-blue-600 max-w-[150px] truncate"
                >
                  <option value="all">All Technicians</option>
                  <option value="unassigned">Unassigned Only</option>
                  {techniciansList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortBy(field);
                  setSortOrder(order as "asc" | "desc");
                  setPage(1);
                }}
                className="px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold outline-none cursor-pointer focus:border-blue-600"
              >
                <option value="createdAt-desc">Newest Added</option>
                <option value="scheduledAt-asc">Scheduled (Earliest)</option>
                <option value="scheduledAt-desc">Scheduled (Latest)</option>
                <option value="priority-desc">Priority</option>
                <option value="title-asc">Title (A-Z)</option>
              </select>
            </div>

            {/* Page Size */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(parseInt(e.target.value, 10));
                  setPage(1);
                }}
                className="px-2 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold outline-none cursor-pointer focus:border-blue-600"
              >
                <option value="5">5 / page</option>
                <option value="10">10 / page</option>
                <option value="25">25 / page</option>
                <option value="50">50 / page</option>
                <option value="100">100 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Secondary Date Range Filter Bar */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 flex-wrap text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Date Range:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 font-medium">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 font-medium">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 font-medium">Field:</span>
              <select
                value={dateField}
                onChange={(e) => {
                  setDateField(e.target.value as "scheduledAt" | "createdAt");
                  setPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold outline-none focus:border-blue-600"
              >
                <option value="scheduledAt">Scheduled Date</option>
                <option value="createdAt">Created Date</option>
              </select>
            </div>

            {(startDate || endDate || searchTerm || statusFilter !== "all" || priorityFilter !== "all" || customerFilter !== "all" || technicianFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                  setTechnicianFilter("all");
                  setCustomerFilter("all");
                  setStartDate("");
                  setEndDate("");
                  setPage(1);
                }}
                className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden max-h-[700px] overflow-y-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 border-b border-slate-200 shadow-xs">
              <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-600 select-none">
                <th
                  onClick={() => handleSortToggle("title")}
                  className="py-3.5 px-4 sm:px-6 cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Job Details & Priority</span>
                    {sortBy === "title" && (
                      <span className="text-blue-600 text-xs">{sortOrder === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th className="py-3.5 px-4">Client Customer</th>
                {role !== "TECHNICIAN" && <th className="py-3.5 px-4">Assigned Technician</th>}
                <th
                  onClick={() => handleSortToggle("status")}
                  className="py-3.5 px-4 cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Lifecycle Status</span>
                    {sortBy === "status" && (
                      <span className="text-blue-600 text-xs">{sortOrder === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle("scheduledAt")}
                  className="py-3.5 px-4 cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Schedule & SLA</span>
                    {sortBy === "scheduledAt" && (
                      <span className="text-blue-600 text-xs">{sortOrder === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="space-y-2">
                        <div className="w-48 h-4 bg-slate-200 rounded" />
                        <div className="w-28 h-3 bg-slate-100 rounded" />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1.5">
                        <div className="w-32 h-4 bg-slate-200 rounded" />
                        <div className="w-20 h-3 bg-slate-100 rounded" />
                      </div>
                    </td>
                    {role !== "TECHNICIAN" && (
                      <td className="py-4 px-4">
                        <div className="w-28 h-4 bg-slate-200 rounded" />
                      </td>
                    )}
                    <td className="py-4 px-4">
                      <div className="w-20 h-6 bg-slate-200 rounded-full" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-24 h-4 bg-slate-200 rounded" />
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="w-16 h-8 bg-slate-200 rounded-xl ml-auto" />
                    </td>
                  </tr>
                ))
              ) : workOrders.length === 0 ? (
                <tr>
                  <td colSpan={role === "TECHNICIAN" ? 5 : 6} className="py-16 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          {role === "TECHNICIAN"
                            ? "No Assigned Jobs in View"
                            : "No Work Orders Found"}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {role === "TECHNICIAN"
                            ? "You do not have any work orders matching the selected filter criteria."
                            : debouncedSearch || statusFilter !== "all" || priorityFilter !== "all"
                            ? "No work orders match the current filter criteria. Try clearing search filters."
                            : "Start dispatching by creating the first field service work order."}
                        </p>
                      </div>
                      {role !== "TECHNICIAN" && (
                        <button
                          onClick={handleOpenCreate}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create First Work Order</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                workOrders.map((wo) => {
                  const overdue = isOverdue(wo);

                  return (
                    <tr
                      key={wo.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Job Title & Priority */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${getPriorityBadgeClass(
                                wo.priority
                              )}`}
                            >
                              {wo.priority}
                            </span>
                            <span
                              className="font-bold text-slate-900 truncate hover:text-blue-600 cursor-pointer max-w-xs block"
                              onClick={() => handleOpenView(wo)}
                            >
                              {wo.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate max-w-sm line-clamp-1">
                            {wo.description}
                          </p>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block truncate">
                            {wo.customer?.name}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{wo.customer?.company || wo.customer?.city || "Direct Client"}</span>
                          </span>
                        </div>
                      </td>

                      {/* Assigned Technician (only for Dispatcher & Admin) */}
                      {role !== "TECHNICIAN" && (
                        <td className="py-3.5 px-4">
                          {wo.technician ? (
                            <div className="flex items-center gap-2">
                              <div className="relative shrink-0">
                                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center">
                                  {wo.technician.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </div>
                                <span
                                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                    wo.technician.status === "AVAILABLE"
                                      ? "bg-emerald-500"
                                      : wo.technician.status === "BUSY"
                                      ? "bg-amber-500"
                                      : "bg-slate-400"
                                  }`}
                                />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-800 text-xs block truncate">
                                  {wo.technician.name}
                                </span>
                                <span className="text-[10px] text-slate-500 block truncate">
                                  {wo.technician.specialization || "Field Tech"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold inline-flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>Unassigned</span>
                            </span>
                          )}
                        </td>
                      )}

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeClass(
                            wo.status
                          )}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(wo.status)}`}
                          />
                          <span>{formatStatusLabel(wo.status)}</span>
                        </span>
                      </td>

                      {/* Schedule & Overdue */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {wo.scheduledAt ? (
                            <div className="flex items-center gap-1 text-slate-700 text-xs font-semibold">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{new Date(wo.scheduledAt).toLocaleDateString()}</span>
                              <span className="text-slate-400 text-[11px]">
                                {new Date(wo.scheduledAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Not scheduled</span>
                          )}

                          {overdue && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                              <AlertCircle className="w-3 h-3" />
                              <span>Overdue SLA</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* ---------------------------------------------------- */}
                          {/* TECHNICIAN ROLE ACTIONS */}
                          {/* ---------------------------------------------------- */}
                          {role === "TECHNICIAN" ? (
                            <>
                              {/* 1. ASSIGNED -> Accept or Reject */}
                              {wo.status === "ASSIGNED" && (
                                <>
                                  <button
                                    onClick={() => handleAcceptWork(wo)}
                                    disabled={submitting}
                                    title="Accept Assignment"
                                    className="px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Accept</span>
                                  </button>
                                  <button
                                    onClick={() => handleOpenRejectModal(wo)}
                                    disabled={submitting}
                                    title="Decline Assignment"
                                    className="px-2 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span>Decline</span>
                                  </button>
                                </>
                              )}

                              {/* 2. ACCEPTED -> Start Work */}
                              {wo.status === "ACCEPTED" && (
                                <button
                                  onClick={() => handleStartWork(wo)}
                                  disabled={submitting}
                                  title="Commence work on-site"
                                  className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                                >
                                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                  </svg>
                                  <span>Start Work</span>
                                </button>
                              )}

                              {/* 3. IN_PROGRESS -> Pause or Complete */}
                              {wo.status === "IN_PROGRESS" && (
                                <>
                                  <button
                                    onClick={() => handleOpenPauseModal(wo)}
                                    disabled={submitting}
                                    title="Pause work order"
                                    className="px-2.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                      <rect x="6" y="4" width="4" height="16"></rect>
                                      <rect x="14" y="4" width="4" height="16"></rect>
                                    </svg>
                                    <span>Pause</span>
                                  </button>
                                  <button
                                    onClick={() => handleOpenCompleteModal(wo)}
                                    disabled={submitting}
                                    title="Complete work with notes"
                                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Complete</span>
                                  </button>
                                </>
                              )}

                              {/* 4. PAUSED -> Resume or Complete */}
                              {wo.status === "PAUSED" && (
                                <>
                                  <button
                                    onClick={() => handleResumeWork(wo)}
                                    disabled={submitting}
                                    title="Resume work order"
                                    className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>Resume</span>
                                  </button>
                                  <button
                                    onClick={() => handleOpenCompleteModal(wo)}
                                    disabled={submitting}
                                    title="Complete work with notes"
                                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Complete</span>
                                  </button>
                                </>
                              )}

                              {/* 5. COMPLETED -> Done */}
                              {wo.status === "COMPLETED" && (
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Pending Sign-Off
                                </span>
                              )}

                              {/* 6. CLOSED -> Closed */}
                              {wo.status === "CLOSED" && (
                                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 inline-flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" />
                                  Closed
                                </span>
                              )}

                              <button
                                onClick={() => handleOpenView(wo)}
                                title="View Details & Timeline"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            // ----------------------------------------------------
                            // DISPATCHER & ADMIN ACTIONS
                            // ----------------------------------------------------
                            <>
                              {/* If COMPLETED -> Close Sign-off action */}
                              {wo.status === "COMPLETED" && (
                                <button
                                  onClick={() => handleOpenCloseModal(wo)}
                                  disabled={submitting}
                                  title="Review & Officially Close Work Order"
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Close Order</span>
                                </button>
                              )}

                              {/* If Cancellable (OPEN, ASSIGNED, ACCEPTED, PAUSED) */}
                              {["OPEN", "ASSIGNED", "ACCEPTED", "PAUSED"].includes(wo.status) && (
                                <button
                                  onClick={() => handleOpenCancelModal(wo)}
                                  disabled={submitting}
                                  title="Cancel Work Order"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                  </svg>
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenView(wo)}
                                title="View Work Order & Timeline"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {wo.status !== "CLOSED" && wo.status !== "CANCELLED" && (
                                <button
                                  onClick={() => handleOpenEdit(wo)}
                                  title="Edit / Reassign Work Order"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenDelete(wo)}
                                title="Delete Work Order"
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

        {/* Pagination */}
        {!loading && workOrders.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-800">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
              <span className="font-bold text-slate-800">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-bold text-slate-800">{pagination.total}</span> work orders
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
      {/* 1. CREATE WORK ORDER MODAL (Dispatcher & Admin Only) */}
      {/* ========================================================= */}
      {showCreateModal && role !== "TECHNICIAN" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Dispatch New Work Order</h3>
                  <p className="text-xs text-slate-500">Schedule customer job and assign field technician</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkOrder} className="space-y-4 text-xs">
              {/* Title */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Work Order Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cisco Catalyst Core Switch Migration & Splicing"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${
                    formErrors.title ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                  }`}
                />
                {formErrors.title && <span className="text-[11px] text-rose-600 block">{formErrors.title}</span>}
              </div>

              {/* Customer and Technician Selectors */}
              <div className="grid sm:grid-cols-2 gap-3.5">
                {/* Customer Selector */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Client Customer *</label>
                  <select
                    required
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all cursor-pointer font-medium ${
                      formErrors.customerId ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                    }`}
                  >
                    <option value="">Select customer...</option>
                    {customersList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ""}
                      </option>
                    ))}
                  </select>
                  {formErrors.customerId && (
                    <span className="text-[11px] text-rose-600 block">{formErrors.customerId}</span>
                  )}
                </div>

                {/* Assigned Technician Selector */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Assign Field Technician</label>
                  <select
                    value={formData.technicianId}
                    onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all cursor-pointer font-medium ${
                      formErrors.technicianId ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                    }`}
                  >
                    <option value="">Leave Unassigned (Open Pool)</option>
                    <optgroup label="Available Now (Recommended)">
                      {techniciansList
                        .filter((t) => t.status === "AVAILABLE")
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            ✓ {t.name} - {t.specialization || "Field Tech"} (Available)
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="Busy / On Active Job">
                      {techniciansList
                        .filter((t) => t.status === "BUSY")
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            ⏳ {t.name} - {t.specialization || "Field Tech"} (Busy)
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="Offline / Off-Duty (Not Dispatchable)">
                      {techniciansList
                        .filter((t) => t.status === "OFF")
                        .map((t) => (
                          <option key={t.id} value={t.id} disabled>
                            ✕ {t.name} (Offline / Off-Duty)
                          </option>
                        ))}
                    </optgroup>
                  </select>
                  {formErrors.technicianId && (
                    <span className="text-[11px] text-rose-600 block">{formErrors.technicianId}</span>
                  )}
                </div>
              </div>

              {/* Priority & Status */}
              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Priority Level *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityType })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all cursor-pointer font-medium"
                  >
                    <option value="LOW">Low (Standard Maintenance)</option>
                    <option value="MEDIUM">Medium (Scheduled Upgrade)</option>
                    <option value="HIGH">High (SLA Expedited)</option>
                    <option value="URGENT">Urgent (Outage / Emergency)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Scheduled Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Job Description & Scope of Work *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed breakdown of technician requirements, site access instructions, equipment IDs..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all resize-none ${
                    formErrors.description ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                  }`}
                />
                {formErrors.description && (
                  <span className="text-[11px] text-rose-600 block">{formErrors.description}</span>
                )}
              </div>

              {/* Special Dispatch Notes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Special Dispatch / Security Access Notes</label>
                <input
                  type="text"
                  placeholder="Badge required at Guard Post #2, parking in loading dock..."
                  value={formData.completionNotes}
                  onChange={(e) => setFormData({ ...formData, completionNotes: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
                  <span>{submitting ? "Dispatching..." : "Dispatch Work Order"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. EDIT WORK ORDER MODAL (Dispatcher & Admin) */}
      {/* ========================================================= */}
      {showEditModal && selectedWorkOrder && (
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
                  <h3 className="text-lg font-bold text-slate-900">Update Work Order</h3>
                  <p className="text-xs text-slate-500">Edit details, reassign technician, and reschedule SLA</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedWorkOrder(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateWorkOrder} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Work Order Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-slate-900 outline-none transition-all ${
                    formErrors.title ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-blue-600"
                  }`}
                />
                {formErrors.title && <span className="text-[11px] text-rose-600 block">{formErrors.title}</span>}
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Client Customer *</label>
                  <select
                    required
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all cursor-pointer font-medium"
                  >
                    {customersList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Assigned Technician</label>
                  <select
                    value={formData.technicianId}
                    onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all cursor-pointer font-medium"
                  >
                    <option value="">Leave Unassigned (Open Pool)</option>
                    <optgroup label="Available Now">
                      {techniciansList
                        .filter((t) => t.status === "AVAILABLE")
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            ✓ {t.name} ({t.specialization || "Available"})
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="Busy">
                      {techniciansList
                        .filter((t) => t.status === "BUSY")
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            ⏳ {t.name} (Busy)
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="Offline">
                      {techniciansList
                        .filter((t) => t.status === "OFF")
                        .map((t) => (
                          <option key={t.id} value={t.id} disabled>
                            ✕ {t.name} (Offline)
                          </option>
                        ))}
                    </optgroup>
                  </select>
                  {formErrors.technicianId && (
                    <span className="text-[11px] text-rose-600 block">{formErrors.technicianId}</span>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Priority Level *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityType })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all cursor-pointer font-medium"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Scheduled Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Technician Completion Notes</label>
                <textarea
                  rows={2}
                  placeholder="Resolution summary, equipment serial numbers, sign-off notes..."
                  value={formData.completionNotes}
                  onChange={(e) => setFormData({ ...formData, completionNotes: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedWorkOrder(null);
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
                  <span>{submitting ? "Updating..." : "Update Work Order"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TECHNICIAN: DECLINE / REJECT ASSIGNMENT MODAL */}
      {/* ========================================================= */}
      {showRejectModal && activeTargetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Decline Work Order</h3>
                <p className="text-xs text-slate-500">Return assignment back to Dispatcher</p>
              </div>
            </div>

            <form onSubmit={handleSubmitReject} className="space-y-4 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
                <p className="font-bold text-rose-900 text-xs">Job: {activeTargetOrder.title}</p>
                <p className="text-[11px] text-rose-700">Client: {activeTargetOrder.customer?.name}</p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Reason for Declining (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Schedule conflict with emergency job, specialized tool required..."
                  value={actionNotesInput}
                  onChange={(e) => setActionNotesInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-rose-600 transition-all resize-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setActiveTargetOrder(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting && (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  <span>{submitting ? "Declining..." : "Confirm Decline"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. TECHNICIAN: PAUSE WORK MODAL */}
      {/* ========================================================= */}
      {showPauseModal && activeTargetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Pause Work Order</h3>
                <p className="text-xs text-slate-500">Temporarily suspend on-site service</p>
              </div>
            </div>

            <form onSubmit={handleSubmitPause} className="space-y-4 text-xs">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl space-y-1">
                <p className="font-bold text-orange-900 text-xs">Job: {activeTargetOrder.title}</p>
                <p className="text-[11px] text-orange-700">Client: {activeTargetOrder.customer?.name}</p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Pause Reason & Next Steps *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Waiting for replacement optical transceiver, site power shutdown till 2 PM..."
                  value={actionNotesInput}
                  onChange={(e) => setActionNotesInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-orange-600 transition-all resize-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowPauseModal(false);
                    setActiveTargetOrder(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md shadow-orange-600/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting && (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  <span>{submitting ? "Pausing..." : "Pause Work Order"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. TECHNICIAN: COMPLETE JOB MODAL (Mandatory Notes) */}
      {/* ========================================================= */}
      {showCompleteModal && activeTargetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Complete Job & Submit Sign-Off</h3>
                  <p className="text-xs text-slate-500">{activeTargetOrder.title}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setActiveTargetOrder(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCompletion} className="space-y-4 text-xs">
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-1">
                <p className="font-bold text-emerald-900 text-xs">Client: {activeTargetOrder.customer?.name}</p>
                <p className="text-[11px] text-emerald-700">
                  Address: {activeTargetOrder.customer?.address}, {activeTargetOrder.customer?.city || ""}
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block flex items-center justify-between">
                  <span>Technician Resolution & Completion Notes *</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Mandatory (min 5 chars)</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the work completed, replacement parts installed, meter readings, test results, or customer sign-off confirmation..."
                  value={completionNotesInput}
                  onChange={(e) => setCompletionNotesInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-emerald-600 transition-all resize-none text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCompleteModal(false);
                    setActiveTargetOrder(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting && (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  <span>{submitting ? "Submitting..." : "Complete & Submit"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. DISPATCHER: CLOSE WORK ORDER MODAL */}
      {/* ========================================================= */}
      {showCloseModal && activeTargetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Close & Sign Off Work Order</h3>
                <p className="text-xs text-slate-500">Final verification & administrative closure</p>
              </div>
            </div>

            <form onSubmit={handleSubmitClose} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <p className="font-bold text-slate-900 text-xs">{activeTargetOrder.title}</p>
                <p className="text-[11px] text-slate-600">Client: {activeTargetOrder.customer?.name}</p>
                {activeTargetOrder.completionNotes && (
                  <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200 mt-2">
                    <span className="font-bold block">Technician Notes:</span>
                    {activeTargetOrder.completionNotes}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Dispatcher Verification / Sign-Off Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Invoice prepared, customer signed off on-site, SLA verified..."
                  value={actionNotesInput}
                  onChange={(e) => setActionNotesInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-slate-800 transition-all resize-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCloseModal(false);
                    setActiveTargetOrder(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold shadow-md shadow-slate-900/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting && (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  <span>{submitting ? "Closing..." : "Close & Archive Order"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. DISPATCHER: CANCEL WORK ORDER MODAL */}
      {/* ========================================================= */}
      {showCancelModal && activeTargetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cancel Work Order</h3>
                <p className="text-xs text-slate-500">Cancel active dispatch and release technician</p>
              </div>
            </div>

            <form onSubmit={handleSubmitCancel} className="space-y-4 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
                <p className="font-bold text-rose-900 text-xs">Job: {activeTargetOrder.title}</p>
                <p className="text-[11px] text-rose-700">Client: {activeTargetOrder.customer?.name}</p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Cancellation Reason & Justification *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Customer cancelled appointment, site inaccessible, duplicate ticket..."
                  value={actionNotesInput}
                  onChange={(e) => setActionNotesInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-rose-600 transition-all resize-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelModal(false);
                    setActiveTargetOrder(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting && (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  <span>{submitting ? "Cancelling..." : "Confirm Cancellation"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. VIEW WORK ORDER DETAILS & STATUS TIMELINE MODAL */}
      {/* ========================================================= */}
      {showViewModal && selectedWorkOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto text-xs">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getPriorityBadgeClass(
                      selectedWorkOrder.priority
                    )}`}
                  >
                    {selectedWorkOrder.priority}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getStatusBadgeClass(
                      selectedWorkOrder.status
                    )}`}
                  >
                    {formatStatusLabel(selectedWorkOrder.status)}
                  </span>
                  {isOverdue(selectedWorkOrder) && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                      Overdue SLA
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {selectedWorkOrder.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedWorkOrder(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-700">Scope of Work:</span>
              <p className="text-slate-600 leading-relaxed">{selectedWorkOrder.description}</p>
            </div>

            {/* Customer & Technician 2-Column Card */}
            <div className="grid sm:grid-cols-2 gap-3.5">
              {/* Customer Box */}
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  Client Information
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedWorkOrder.customer?.name}</h4>
                  {selectedWorkOrder.customer?.company && (
                    <p className="text-[11px] text-slate-600 font-semibold">{selectedWorkOrder.customer.company}</p>
                  )}
                </div>
                <div className="space-y-1 text-slate-500 text-[11px]">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{selectedWorkOrder.customer?.address}, {selectedWorkOrder.customer?.city || ""}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="text-slate-400">Tel:</span>
                    <a href={`tel:${selectedWorkOrder.customer?.phone}`} className="hover:text-blue-600 font-medium">
                      {selectedWorkOrder.customer?.phone}
                    </a>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="text-slate-400">Email:</span>
                    <a href={`mailto:${selectedWorkOrder.customer?.email}`} className="hover:text-blue-600 font-medium">
                      {selectedWorkOrder.customer?.email}
                    </a>
                  </p>
                </div>
              </div>

              {/* Technician Box */}
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-slate-400" />
                  Assigned Field Engineer
                </span>
                {selectedWorkOrder.technician ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                        {selectedWorkOrder.technician.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{selectedWorkOrder.technician.name}</h4>
                        <span className="text-[10px] font-semibold text-blue-600">
                          {selectedWorkOrder.technician.specialization || "Field Specialist"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1 text-slate-500 text-[11px]">
                      <p className="flex items-center gap-1.5">
                        <span className="text-slate-400">Area:</span>
                        <span>{selectedWorkOrder.technician.serviceArea || "Metro Area"}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span className="text-slate-400">Status:</span>
                        <span
                          className={`font-bold ${
                            selectedWorkOrder.technician.status === "AVAILABLE"
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        >
                          {selectedWorkOrder.technician.status}
                        </span>
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="py-4 text-center text-slate-400">
                    <User className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                    <span>No technician assigned yet.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule & Notes */}
            <div className="grid sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Scheduled At</span>
                <span className="font-bold text-slate-800 block mt-0.5">
                  {selectedWorkOrder.scheduledAt
                    ? new Date(selectedWorkOrder.scheduledAt).toLocaleString()
                    : "Not scheduled"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Created At</span>
                <span className="font-bold text-slate-800 block mt-0.5">
                  {new Date(selectedWorkOrder.createdAt).toLocaleString()}
                </span>
              </div>
              {selectedWorkOrder.completedAt && (
                <div className="sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 block">Completed On</span>
                  <span className="font-bold text-emerald-800 block mt-0.5">
                    {new Date(selectedWorkOrder.completedAt).toLocaleString()}
                  </span>
                </div>
              )}
              {selectedWorkOrder.completionNotes && (
                <div className="sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Resolution & Notes</span>
                  <p className="text-slate-700 mt-0.5 leading-relaxed">{selectedWorkOrder.completionNotes}</p>
                </div>
              )}
            </div>

            {/* StatusLog Complete Timeline History */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                Immutable Status Activity Log ({selectedWorkOrder.statusLogs?.length || 0} transitions)
              </span>

              {selectedWorkOrder.statusLogs && selectedWorkOrder.statusLogs.length > 0 ? (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {selectedWorkOrder.statusLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-2xl border border-slate-200 bg-white shadow-xs text-xs space-y-1.5 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${getStatusBadgeClass(
                              log.fromStatus
                            )}`}
                          >
                            {formatStatusLabel(log.fromStatus)}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${getStatusBadgeClass(
                              log.toStatus
                            )}`}
                          >
                            {formatStatusLabel(log.toStatus)}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {new Date(log.changedAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          Action by:{" "}
                          <span className="font-bold text-slate-800">
                            {log.changedBy?.name || log.changedBy?.email || "System"}
                          </span>
                        </span>
                      </div>

                      {log.notes && (
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-[11px] text-slate-600 flex items-start gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{log.notes}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center text-slate-400">
                  Initial dispatch record recorded.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              {role !== "TECHNICIAN" && selectedWorkOrder.status !== "CLOSED" && selectedWorkOrder.status !== "CANCELLED" && (
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    handleOpenEdit(selectedWorkOrder);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Work Order</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedWorkOrder(null);
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
      {/* 9. DELETE WORK ORDER CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {showDeleteModal && selectedWorkOrder && role !== "TECHNICIAN" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Delete Work Order</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to remove work order{" "}
                <span className="font-bold text-slate-900">&ldquo;{selectedWorkOrder.title}&rdquo;</span>? This will
                permanently clear all dispatch records and history logs.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedWorkOrder(null);
                }}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteWorkOrder}
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
