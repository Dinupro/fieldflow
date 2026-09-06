"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  Search,
  Bell,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Radio,
  Wrench,
  ShieldCheck,
  Check,
  Sparkles,
} from "lucide-react";

function TrashIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}
import { SidebarItemKey } from "@/components/dashboard/Sidebar";

interface TopNavbarProps {
  onMenuToggle: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onLogoutClick: () => void;
  onSettingsClick: () => void;
  onUsersClick?: () => void;
  activeTab?: SidebarItemKey;
  role?: "ADMIN" | "DISPATCHER" | "TECHNICIAN";
}

interface NotificationItem {
  id: string;
  userId: string;
  workOrderId?: string | null;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  workOrder?: {
    id: string;
    title: string;
    status: string;
    priority: string;
  } | null;
}

function formatTimeAgo(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffSec < 45) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString();
}

function getNotificationMeta(type: string) {
  switch (type) {
    case "WORK_ORDER_COMPLETED":
    case "WORK_ORDER_CLOSED":
      return {
        icon: CheckCircle2,
        bg: "bg-emerald-100 text-emerald-600",
        badge: "Completed",
      };
    case "WORK_ORDER_IN_PROGRESS":
      return {
        icon: Clock,
        bg: "bg-blue-100 text-blue-600",
        badge: "In Progress",
      };
    case "WORK_ORDER_ACCEPTED":
      return {
        icon: CheckCircle2,
        bg: "bg-teal-100 text-teal-600",
        badge: "Accepted",
      };
    case "WORK_ORDER_ASSIGNED":
    case "WORK_ORDER_CREATED":
      return {
        icon: Wrench,
        bg: "bg-indigo-100 text-indigo-600",
        badge: "Dispatch",
      };
    case "WORK_ORDER_PAUSED":
      return {
        icon: AlertTriangle,
        bg: "bg-amber-100 text-amber-600",
        badge: "Paused",
      };
    case "WORK_ORDER_CANCELLED":
      return {
        icon: AlertTriangle,
        bg: "bg-rose-100 text-rose-600",
        badge: "Cancelled",
      };
    default:
      return {
        icon: ShieldCheck,
        bg: "bg-purple-100 text-purple-600",
        badge: "Alert",
      };
  }
}

export default function TopNavbar({
  onMenuToggle,
  searchQuery,
  setSearchQuery,
  onLogoutClick,
  onSettingsClick,
  onUsersClick,
  activeTab = "dashboard",
  role = "DISPATCHER",
}: TopNavbarProps) {
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(false);

  const userName = session?.user?.name || (role === "ADMIN" ? "Admin Lead" : role === "TECHNICIAN" ? "Field Tech" : "Marcus Vance");
  const userEmail = session?.user?.email || "user@fieldflow.io";
  const initials =
    userName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "FF";

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=30");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch (e) {
      console.error("[FETCH_NOTIFICATIONS_ERROR]", e);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Live polling every 15 seconds for real-time notification sync
    const interval = setInterval(fetchNotifications, 15000);

    // Refetch on window focus
    const handleFocus = () => fetchNotifications();
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchNotifications]);

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "PUT" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (e) {
      console.error("[MARK_ALL_READ_ERROR]", e);
    }
  };

  const markSingleAsRead = async (id: string, currentReadState: boolean) => {
    if (currentReadState) return;
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error("[MARK_SINGLE_READ_ERROR]", e);
    }
  };

  const clearReadNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "DELETE" });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => !n.isRead));
      }
    } catch (e) {
      console.error("[CLEAR_READ_ERROR]", e);
    }
  };

  const displayedNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.isRead : true
  );

  const breadcrumbLabels: Record<SidebarItemKey, string> = {
    dashboard: role === "TECHNICIAN" ? "My Field Overview" : "Executive Overview",
    customers: "Customer Directory & CRM",
    technicians: "Field Workforce & Roster",
    "work-orders": role === "TECHNICIAN" ? "My Assigned Work Orders" : "Work Order Dispatch",
    schedule: role === "TECHNICIAN" ? "My Field Schedule" : "Dispatch Calendar",
    users: "User Access & Role Management",
    reports: "Reports & KPIs",
    settings: "System & Account Settings",
    logout: "Sign Out",
  };

  const roleBadgeInfo = {
    ADMIN: {
      label: "Administrator",
      subTitle: "System Administrator",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200/80",
      gradient: "from-purple-600 to-indigo-700",
      icon: ShieldCheck,
    },
    DISPATCHER: {
      label: "Dispatcher",
      subTitle: "Senior Dispatcher",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200/80",
      gradient: "from-blue-600 to-indigo-600",
      icon: Radio,
    },
    TECHNICIAN: {
      label: "Technician",
      subTitle: "Field Specialist",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      gradient: "from-emerald-600 to-teal-700",
      icon: Wrench,
    },
  }[role];

  return (
    <header className="sticky top-0 z-30 h-18 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-all">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          type="button"
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          aria-label="Toggle Sidebar Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 overflow-hidden">
          <Link
            href="/dashboard"
            className="hover:text-blue-600 transition-colors hidden sm:inline-block shrink-0"
          >
            FieldFlow
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline-block shrink-0" />
          <span className="font-bold text-slate-900 truncate">
            {breadcrumbLabels[activeTab] || "Dashboard"}
          </span>
        </nav>
      </div>

      {/* Center / Right: Global Search & Controls */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Search Bar */}
        <div className="relative hidden md:block w-64 lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              role === "TECHNICIAN"
                ? "Search my assigned jobs..."
                : "Search orders, techs, customers..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-8 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
              fetchNotifications();
            }}
            className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 space-y-3 z-50 animate-fadeIn">
              {/* Popover Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {role === "TECHNICIAN" ? "My Job Alerts" : "Live Dispatch Notifications"}
                  </h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                      {unreadCount} New
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                      title="Mark all as read"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center justify-between">
                <div className="flex items-center p-0.5 rounded-lg bg-slate-100 text-[11px] font-bold">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      filter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setFilter("unread")}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      filter === "unread" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>

                {notifications.some((n) => n.isRead) && (
                  <button
                    onClick={clearReadNotifications}
                    className="text-[10px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Clear read notifications"
                  >
                    <TrashIcon className="w-3 h-3" />
                    <span>Clear read</span>
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-0.5">
                {displayedNotifications.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <Bell className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-600">All caught up!</p>
                    <p className="text-[11px] text-slate-400">
                      {filter === "unread" ? "No unread alerts." : "No notifications recorded yet."}
                    </p>
                  </div>
                ) : (
                  displayedNotifications.map((notif) => {
                    const meta = getNotificationMeta(notif.type);
                    const Icon = meta.icon;

                    return (
                      <div
                        key={notif.id}
                        onClick={() => markSingleAsRead(notif.id, notif.isRead)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer relative group ${
                          !notif.isRead
                            ? "bg-blue-50/40 border-blue-200/80 hover:bg-blue-50/70"
                            : "bg-slate-50/60 border-slate-100 hover:bg-slate-100/70"
                        }`}
                      >
                        {!notif.isRead && (
                          <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-600" />
                        )}

                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${meta.bg}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>

                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {notif.title}
                              </p>
                            </div>

                            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                              {notif.message}
                            </p>

                            <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-100/60 text-[10px] text-slate-400">
                              <span>{formatTimeAgo(notif.createdAt)}</span>
                              {notif.workOrder?.priority && (
                                <span className="font-bold text-slate-500 uppercase text-[9px]">
                                  {notif.workOrder.priority}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer group"
          >
            <div
              className={`w-8 h-8 rounded-lg bg-linear-to-tr ${roleBadgeInfo.gradient} text-white flex items-center justify-center font-bold text-xs shadow-xs`}
            >
              {initials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                {userName}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 leading-tight">
                {roleBadgeInfo.subTitle}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1 z-50 animate-fadeIn">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
                <span
                  className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md font-bold text-[10px] border ${roleBadgeInfo.badgeClass}`}
                >
                  <roleBadgeInfo.icon className="w-3 h-3" />
                  {roleBadgeInfo.label}
                </span>
              </div>

              {role === "ADMIN" && onUsersClick && (
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onUsersClick();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>User Access & RBAC</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  onSettingsClick();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Account Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogoutClick();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
