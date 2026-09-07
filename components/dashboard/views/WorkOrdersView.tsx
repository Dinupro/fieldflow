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
  Phone,
  Sparkles,
  ClipboardList,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import LifecycleProgressBar from "@/components/dashboard/LifecycleProgressBar";
import WorkOrderWorkflowGuide from "@/components/dashboard/WorkOrderWorkflowGuide";
import SearchableCustomerSelect, { CustomerOption } from "@/components/dashboard/SearchableCustomerSelect";
import SearchableTechnicianSelect, { TechnicianOption } from "@/components/dashboard/SearchableTechnicianSelect";
import QuickCustomerModal, { CreatedCustomerData } from "@/components/dashboard/QuickCustomerModal";
import CompletionNotesModal from "@/components/dashboard/CompletionNotesModal";

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
  const [showQuickCustomerModal, setShowQuickCustomerModal] = useState(false);

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
  const fetchDropdownOptions = useCallback(async () => {
    if (role !== "TECHNICIAN") {
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
    }
  }, [role]);

  useEffect(() => {
    fetchDropdownOptions();
  }, [fetchDropdownOptions]);

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
  }, [
    page,
    limit,
    sortBy,
    sortOrder,
    debouncedSearch,
    statusFilter,
    priorityFilter,
    technicianFilter,
    customerFilter,
    startDate,
    endDate,
    dateField,
    role,
  ]);

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
      errors.customerId = "Please select or create a client customer.";
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
      priority: "HIGH",
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

      showToast("success", `Work Order "${data.title}" dispatched successfully!`);
      setShowCreateModal(false);
      fetchWorkOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating work order";
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Customer Creation Callback
  const handleQuickCustomerCreated = (newCust: CreatedCustomerData) => {
    setCustomersList((prev) => [newCust, ...prev]);
    setFormData((prev) => ({ ...prev, customerId: newCust.id }));
    showToast("success", `Customer "${newCust.name}" created and selected!`);
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

  // ----------------------------------------------------
  // LIFECYCLE ACTION HANDLERS
  // ----------------------------------------------------

  // 1. Technician: Accept Assignment (ASSIGNED -> ACCEPTED)
  const handleAcceptWork = async (wo: WorkOrderData) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/work-orders/${wo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "ACCEPTED",
          notes: "Technician accepted assignment and confirmed dispatch SLA",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to accept work order.");
      }

      showToast("success", `Job "${wo.title}" accepted! Ready to start work.`);
      fetchWorkOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error accepting assignment";
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Technician: Reject Assignment (ASSIGNED -> OPEN)
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

  // 3. Technician: Start Work (ASSIGNED/ACCEPTED -> IN_PROGRESS)
  const handleStartWork = async (wo: WorkOrderData) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/work-orders/${wo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "IN_PROGRESS",
          notes: "Technician arrived on-site and commenced service execution",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start work order.");
      }

      showToast("success", `Work started on "${wo.title}"! Status updated to In Progress.`);
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
            : "Work paused by technician (awaiting parts / client access)",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to pause work order.");
      }

      showToast("success", `Work paused on "${activeTargetOrder.title}".`);
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

  // 6. Technician: Open Complete Modal
  const handleOpenCompleteModal = (wo: WorkOrderData) => {
    setActiveTargetOrder(wo);
    setShowCompleteModal(true);
  };

  // Submit Completion Notes
  const handleSubmitCompletionWithNotes = async (notes: string) => {
    if (!activeTargetOrder) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/work-orders/${activeTargetOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "COMPLETED",
          completionNotes: notes,
          completedAt: new Date().toISOString(),
          notes: `Job completed with sign-off notes: ${notes}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete work order.");
      }

      showToast("success", `Work order "${activeTargetOrder.title}" marked Completed! Ready for Dispatcher closure.`);
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
            : "Work order reviewed, verified, and officially closed/signed off",
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

  // 8. Dispatcher / Admin: Cancel Work Order
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

  // Open Delete Modal
  const handleOpenDelete = (wo: WorkOrderData) => {
    setSelectedWorkOrder(wo);
    setShowDeleteModal(true);
  };

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

      showToast("success", `Work order "${selectedWorkOrder.title}" deleted.`);
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

  const formatStatusLabel = (status: WorkOrderStatusType) => {
    switch (status) {
      case "IN_PROGRESS":
        return "In Progress";
      case "OPEN":
        return "Open (Unassigned)";
      case "ASSIGNED":
        return "Assigned";
      case "ACCEPTED":
        return "Accepted";
      case "PAUSED":
        return "Paused";
      case "COMPLETED":
        return "Completed";
      case "CLOSED":
        return "Closed & Verified";
      case "CANCELLED":
        return "Cancelled";
    }
  };

  const isOverdue = (wo: WorkOrderData) => {
    if (!wo.scheduledAt) return false;
    const isUnresolved = ["OPEN", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PAUSED"].includes(wo.status);
    return isUnresolved && new Date(wo.scheduledAt).getTime() < Date.now();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-bold text-white ${
              toast.type === "success"
                ? "bg-slate-900 border-emerald-500/40 text-emerald-300"
                : "bg-rose-950 border-rose-500/40 text-rose-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* 1. Header & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className={`w-9 h-9 rounded-2xl text-white flex items-center justify-center shadow-md ${
                role === "TECHNICIAN"
                  ? "bg-emerald-600 shadow-emerald-600/20"
                  : "bg-blue-600 shadow-blue-600/20"
              }`}
            >
              {role === "TECHNICIAN" ? <Wrench className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {role === "TECHNICIAN" ? "My Assigned Jobs" : "Work Orders Management"}
            </h1>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                role === "TECHNICIAN"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  role === "TECHNICIAN" ? "bg-emerald-500" : "bg-blue-500"
                }`}
              />
              <span>{role === "TECHNICIAN" ? "Field Mode" : "Live Dispatch"}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {role === "TECHNICIAN"
              ? "Your dedicated queue of assigned service orders, customer site addresses, and execution triggers."
              : "End-to-end field service lifecycle: schedule dispatches, track technician workload, and log completions."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchWorkOrders}
            title="Refresh database records"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
            <span className="hidden sm:inline">Refresh</span>
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
              <span>Dispatch New Order</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. End-to-End Operational Workflow Guide Banner */}
      <WorkOrderWorkflowGuide
        role={role}
        onQuickCreateClick={role !== "TECHNICIAN" ? handleOpenCreate : undefined}
      />

      {/* 3. Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Work Orders */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {role === "TECHNICIAN" ? "My Total Jobs" : "Total Orders"}
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
              {role === "TECHNICIAN" ? "Pending Start" : "Assigned"}
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-indigo-600">
              {stats.assignedCount + stats.acceptedCount}
            </span>
            <span className="text-[10px] font-bold text-indigo-700">Pre-Dispatch</span>
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
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-orange-600">{stats.pausedCount}</span>
            <span className="text-[10px] font-bold text-orange-700">Awaiting Parts</span>
          </div>
        </div>

        {/* Completed & Closed */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Resolved</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600">
              {stats.completedCount + stats.closedCount}
            </span>
            <span className="text-[10px] font-bold text-emerald-700">Completed</span>
          </div>
        </div>

        {/* Overdue Alert */}
        <div
          className={`p-4 rounded-2xl border shadow-xs space-y-1.5 ${
            stats.overdueCount > 0 ? "bg-rose-50/70 border-rose-200" : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${stats.overdueCount > 0 ? "text-rose-700" : ""}`}>
              Overdue SLAs
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                stats.overdueCount > 0 ? "bg-rose-100 text-rose-600 animate-pulse" : "bg-emerald-50 text-emerald-600"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-black ${stats.overdueCount > 0 ? "text-rose-600" : "text-slate-800"}`}>
              {stats.overdueCount}
            </span>
            <span className={`text-[10px] font-bold ${stats.overdueCount > 0 ? "text-rose-700" : "text-emerald-600"}`}>
              {stats.overdueCount > 0 ? "Needs Action" : "On Schedule"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Filter & Search Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                role === "TECHNICIAN"
                  ? "Search by ID, job title, client name..."
                  : "Search work orders by title, customer, technician, phone..."
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

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
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

            {/* Customer Filter (Dispatcher & Admin) */}
            {role !== "TECHNICIAN" && (
              <select
                value={customerFilter}
                onChange={(e) => {
                  setCustomerFilter(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold outline-none cursor-pointer focus:border-blue-600 max-w-37.5 truncate"
              >
                <option value="all">All Customers</option>
                {customersList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ""}
                  </option>
                ))}
              </select>
            )}

            {/* Technician Filter (Dispatcher & Admin) */}
            {role !== "TECHNICIAN" && (
              <select
                value={technicianFilter}
                onChange={(e) => {
                  setTechnicianFilter(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold outline-none cursor-pointer focus:border-blue-600 max-w-37.5 truncate"
              >
                <option value="all">All Technicians</option>
                <option value="unassigned">Unassigned Only</option>
                {techniciansList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Selector */}
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
        </div>
      </div>

      {/* 5. Main Work Orders Table & Action Feed */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/90 border-b border-slate-200">
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
                <th className="py-3.5 px-4">Lifecycle Step</th>
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
                <th className="py-3.5 px-4 sm:px-6 text-right">Workflow Actions</th>
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
                      <div className="w-32 h-4 bg-slate-200 rounded" />
                    </td>
                    {role !== "TECHNICIAN" && (
                      <td className="py-4 px-4">
                        <div className="w-28 h-4 bg-slate-200 rounded" />
                      </td>
                    )}
                    <td className="py-4 px-4">
                      <div className="w-24 h-4 bg-slate-200 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-24 h-4 bg-slate-200 rounded" />
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="w-20 h-8 bg-slate-200 rounded-xl ml-auto" />
                    </td>
                  </tr>
                ))
              ) : workOrders.length === 0 ? (
                <tr>
                  <td colSpan={role === "TECHNICIAN" ? 5 : 6} className="py-16 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {role === "TECHNICIAN"
                            ? "No Assigned Work Orders"
                            : "No Work Orders in Database"}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {role === "TECHNICIAN"
                            ? "You do not have any pending jobs assigned to your technician profile."
                            : debouncedSearch || statusFilter !== "all"
                            ? "No orders match your filter criteria. Reset filters to see all jobs."
                            : "Create your first work order to start the dispatch and completion workflow."}
                        </p>
                      </div>
                      {role !== "TECHNICIAN" && (
                        <button
                          onClick={handleOpenCreate}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Dispatch First Work Order</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                workOrders.map((wo) => {
                  const overdue = isOverdue(wo);

                  return (
                    <tr key={wo.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Job Details & Priority */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${getPriorityBadgeClass(
                                wo.priority
                              )}`}
                            >
                              {wo.priority}
                            </span>
                            <span
                              onClick={() => handleOpenView(wo)}
                              className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer truncate max-w-xs block"
                            >
                              {wo.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate max-w-sm">{wo.description}</p>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block truncate">{wo.customer?.name}</span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{wo.customer?.company || wo.customer?.city || "Direct Client"}</span>
                          </span>
                        </div>
                      </td>

                      {/* Assigned Technician (Dispatcher / Admin view) */}
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
                                <span className="font-bold text-slate-900 text-xs block truncate">
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

                      {/* Lifecycle Step & Status Badge */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeClass(
                              wo.status
                            )}`}
                          >
                            <span>{formatStatusLabel(wo.status)}</span>
                          </span>
                          <LifecycleProgressBar status={wo.status} compact />
                        </div>
                      </td>

                      {/* Schedule & SLA */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {wo.scheduledAt ? (
                            <div className="flex items-center gap-1 text-slate-700 text-xs font-semibold">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{new Date(wo.scheduledAt).toLocaleDateString()}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Unscheduled</span>
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
                          {/* TECHNICIAN ACTIONS (Primary, Large, Prominent) */}
                          {/* ---------------------------------------------------- */}
                          {role === "TECHNICIAN" ? (
                            <>
                              {/* ASSIGNED -> Accept & Start */}
                              {wo.status === "ASSIGNED" && (
                                <>
                                  <button
                                    onClick={() => handleAcceptWork(wo)}
                                    disabled={submitting}
                                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Accept</span>
                                  </button>
                                  <button
                                    onClick={() => handleStartWork(wo)}
                                    disabled={submitting}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    <span>Start Job</span>
                                  </button>
                                </>
                              )}

                              {/* ACCEPTED -> Start Job */}
                              {wo.status === "ACCEPTED" && (
                                <button
                                  onClick={() => handleStartWork(wo)}
                                  disabled={submitting}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                                >
                                  <TrendingUp className="w-3.5 h-3.5" />
                                  <span>Start Job (On-Site)</span>
                                </button>
                              )}

                              {/* IN_PROGRESS -> Complete Job or Pause */}
                              {wo.status === "IN_PROGRESS" && (
                                <>
                                  <button
                                    onClick={() => handleOpenPauseModal(wo)}
                                    disabled={submitting}
                                    className="px-2.5 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <Clock className="w-3 h-3" />
                                    <span>Pause</span>
                                  </button>
                                  <button
                                    onClick={() => handleOpenCompleteModal(wo)}
                                    disabled={submitting}
                                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Complete Job</span>
                                  </button>
                                </>
                              )}

                              {/* PAUSED -> Resume */}
                              {wo.status === "PAUSED" && (
                                <button
                                  onClick={() => handleResumeWork(wo)}
                                  disabled={submitting}
                                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                                >
                                  <TrendingUp className="w-3.5 h-3.5" />
                                  <span>Resume Work</span>
                                </button>
                              )}

                              {/* COMPLETED */}
                              {wo.status === "COMPLETED" && (
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Pending Sign-Off</span>
                                </span>
                              )}

                              <button
                                onClick={() => handleOpenView(wo)}
                                title="View details"
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
                              {wo.status === "COMPLETED" && (
                                <button
                                  onClick={() => handleOpenCloseModal(wo)}
                                  disabled={submitting}
                                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Sign-Off & Close</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenView(wo)}
                                title="View details"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {wo.status !== "CLOSED" && wo.status !== "CANCELLED" && (
                                <button
                                  onClick={() => handleOpenEdit(wo)}
                                  title="Edit work order"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              )}

                              {role === "ADMIN" && (
                                <button
                                  onClick={() => handleOpenDelete(wo)}
                                  title="Delete work order"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
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
      {/* 6. CREATE WORK ORDER MODAL (Searchable Pickers & Grouping) */}
      {/* ========================================================= */}
      {showCreateModal && role !== "TECHNICIAN" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Dispatch New Work Order</h3>
                  <p className="text-xs text-slate-500">Step 3 of Workflow: Link customer, assign tech & schedule</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkOrder} className="space-y-4 text-xs">
              {/* SECTION 1: JOB SPECIFICATIONS */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-blue-600" />
                  <span>1. Job Specifications</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Work Order Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cisco Catalyst Core Switch Migration & Splicing"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-white text-slate-900 outline-none transition-all ${
                      formErrors.title ? "border-rose-300" : "border-slate-200 focus:border-blue-600"
                    }`}
                  />
                  {formErrors.title && <span className="text-[10px] text-rose-600 block">{formErrors.title}</span>}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Scope of Work & Technical Requirements *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide exact instructions, required equipment, building entry points..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-white text-slate-900 outline-none transition-all resize-none ${
                      formErrors.description ? "border-rose-300" : "border-slate-200 focus:border-blue-600"
                    }`}
                  />
                  {formErrors.description && (
                    <span className="text-[10px] text-rose-600 block">{formErrors.description}</span>
                  )}
                </div>

                {/* Priority Selector Buttons */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Priority Level *</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["LOW", "MEDIUM", "HIGH", "URGENT"] as PriorityType[]).map((p) => {
                      const isSelected = formData.priority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority: p })}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                            isSelected
                              ? p === "URGENT"
                                ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                                : p === "HIGH"
                                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                                : p === "MEDIUM"
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                : "bg-slate-700 text-white border-slate-700 shadow-sm"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION 2: CUSTOMER SELECTION & QUICK CREATE */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>2. Client Customer & Site Location</span>
                </div>

                <SearchableCustomerSelect
                  customers={customersList}
                  selectedId={formData.customerId}
                  onChange={(id) => setFormData({ ...formData, customerId: id })}
                  onOpenNewCustomerModal={() => setShowQuickCustomerModal(true)}
                  error={formErrors.customerId}
                />
              </div>

              {/* SECTION 3: TECHNICIAN ASSIGNMENT & SCHEDULE */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <span>3. Dispatch Assignment & Scheduling</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  <SearchableTechnicianSelect
                    technicians={techniciansList}
                    selectedId={formData.technicianId}
                    onChange={(id) => setFormData({ ...formData, technicianId: id })}
                    error={formErrors.technicianId}
                  />

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Scheduled SLA Date & Time</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-blue-600 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <span>Dispatching Order...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Confirm & Dispatch Work Order</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. EDIT WORK ORDER MODAL */}
      {/* ========================================================= */}
      {showEditModal && selectedWorkOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Update Work Order Details</h3>
                  <p className="text-xs text-slate-500">Edit scope, reassign technician, or adjust priority</p>
                </div>
              </div>
              <button
                type="button"
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
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Work Order Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-white text-slate-900 outline-none transition-all ${
                      formErrors.title ? "border-rose-300" : "border-slate-200 focus:border-blue-600"
                    }`}
                  />
                  {formErrors.title && <span className="text-[10px] text-rose-600 block">{formErrors.title}</span>}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Scope of Work *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-blue-600 resize-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                <SearchableCustomerSelect
                  customers={customersList}
                  selectedId={formData.customerId}
                  onChange={(id) => setFormData({ ...formData, customerId: id })}
                  onOpenNewCustomerModal={() => setShowQuickCustomerModal(true)}
                  error={formErrors.customerId}
                />

                <SearchableTechnicianSelect
                  technicians={techniciansList}
                  selectedId={formData.technicianId}
                  onChange={(id) => setFormData({ ...formData, technicianId: id })}
                  error={formErrors.technicianId}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityType })}
                    className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-blue-600 font-bold"
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
                    className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. VIEW DETAILS & AUDIT TIMELINE MODAL */}
      {/* ========================================================= */}
      {showViewModal && selectedWorkOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${getPriorityBadgeClass(selectedWorkOrder.priority)}`}>
                      {selectedWorkOrder.priority}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 truncate">{selectedWorkOrder.title}</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">ID: {selectedWorkOrder.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedWorkOrder(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lifecycle Progress Stepper */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Work Order Lifecycle Progression
              </div>
              <LifecycleProgressBar status={selectedWorkOrder.status} />
            </div>

            {/* Customer and Technician Cards */}
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              {/* Customer Info Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Client Customer</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{selectedWorkOrder.customer?.name}</div>
                {selectedWorkOrder.customer?.company && (
                  <div className="text-slate-600 font-medium">{selectedWorkOrder.customer.company}</div>
                )}
                <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedWorkOrder.customer?.address || "Address not provided"}</span>
                </div>
                {selectedWorkOrder.customer?.phone && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{selectedWorkOrder.customer.phone}</span>
                  </div>
                )}
              </div>

              {/* Technician Info Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-blue-600" />
                  <span>Assigned Technician</span>
                </div>
                {selectedWorkOrder.technician ? (
                  <>
                    <div className="font-bold text-slate-900 text-sm">{selectedWorkOrder.technician.name}</div>
                    <div className="text-slate-600 font-medium">{selectedWorkOrder.technician.specialization || "Field Tech"}</div>
                    {selectedWorkOrder.technician.serviceArea && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{selectedWorkOrder.technician.serviceArea}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs font-bold">
                    Currently unassigned in open dispatch pool.
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Scope of Work</div>
              <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{selectedWorkOrder.description}</p>
            </div>

            {/* Completion Notes (if completed) */}
            {selectedWorkOrder.completionNotes && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Technician Completion Notes & Resolution</span>
                </div>
                <p className="text-emerald-950 font-medium whitespace-pre-wrap">{selectedWorkOrder.completionNotes}</p>
                {selectedWorkOrder.completedAt && (
                  <div className="text-[10px] text-emerald-700 pt-1">
                    Completed on {new Date(selectedWorkOrder.completedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            {/* Status Log & Audit History Timeline */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Live Audit Trail & Status History</span>
              </div>

              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {selectedWorkOrder.statusLogs && selectedWorkOrder.statusLogs.length > 0 ? (
                  selectedWorkOrder.statusLogs.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-900">{log.fromStatus}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-extrabold text-blue-600">{log.toStatus}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(log.changedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600">{log.notes || "Status update"}</div>
                      {log.changedBy && (
                        <div className="text-[10px] text-slate-400">Actor: {log.changedBy.name || log.changedBy.email}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 italic">No transition logs recorded yet.</div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. QUICK CUSTOMER CREATION MODAL */}
      {/* ========================================================= */}
      <QuickCustomerModal
        isOpen={showQuickCustomerModal}
        onClose={() => setShowQuickCustomerModal(false)}
        onCustomerCreated={handleQuickCustomerCreated}
      />

      {/* ========================================================= */}
      {/* 10. TECHNICIAN COMPLETION NOTES & CHECKLIST MODAL */}
      {/* ========================================================= */}
      {activeTargetOrder && (
        <CompletionNotesModal
          isOpen={showCompleteModal}
          onClose={() => {
            setShowCompleteModal(false);
            setActiveTargetOrder(null);
          }}
          workOrderTitle={activeTargetOrder.title}
          customerName={activeTargetOrder.customer?.name}
          technicianName={activeTargetOrder.technician?.name || "Self"}
          initialNotes={activeTargetOrder.completionNotes || ""}
          onSubmit={handleSubmitCompletionWithNotes}
          submitting={submitting}
        />
      )}

      {/* ========================================================= */}
      {/* 11. PAUSE MODAL */}
      {/* ========================================================= */}
      {showPauseModal && activeTargetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pause Work Order</h3>
                  <p className="text-xs text-slate-500">Temporarily hold job execution</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPauseModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPause} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Reason for Pausing (e.g. Awaiting Parts)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Need Cat6A shielded spool from central inventory..."
                  value={actionNotesInput}
                  onChange={(e) => setActionNotesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-orange-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPauseModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md shadow-orange-600/20"
                >
                  {submitting ? "Pausing..." : "Confirm Pause"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 12. CLOSE SIGN-OFF MODAL (Dispatcher) */}
      {/* ========================================================= */}
      {showCloseModal && activeTargetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Sign-Off & Archive Work Order</h3>
                  <p className="text-xs text-slate-500">Step 5: Final review and official closure</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitClose} className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="font-bold text-slate-900">{activeTargetOrder.title}</div>
                <div className="text-slate-500 text-[11px]">Client: {activeTargetOrder.customer?.name}</div>
                {activeTargetOrder.completionNotes && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-xl mt-2 font-medium">
                    Notes: {activeTargetOrder.completionNotes}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Dispatcher Sign-Off Notes</label>
                <input
                  type="text"
                  placeholder="Verified customer satisfaction, billing approved..."
                  value={actionNotesInput}
                  onChange={(e) => setActionNotesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md"
                >
                  {submitting ? "Closing..." : "Sign-Off & Archive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 13. DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {showDeleteModal && selectedWorkOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Work Order</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete{" "}
              <strong className="text-slate-900">"{selectedWorkOrder.title}"</strong>? All associated status history will be removed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteWorkOrder}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
              >
                {submitting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
