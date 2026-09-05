"use client";

import { useState } from "react";
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
} from "lucide-react";
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
  const [unreadCount, setUnreadCount] = useState(2);

  const userName = session?.user?.name || (role === "ADMIN" ? "Admin Lead" : role === "TECHNICIAN" ? "Field Tech" : "Marcus Vance");
  const userEmail = session?.user?.email || "user@fieldflow.io";
  const initials =
    userName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "FF";

  const notifications = [
    {
      id: 1,
      title: "Technician Dispatched On-Site",
      description: "Devon Miller checked in at Austin Retail Node (WO-9913).",
      time: "5 mins ago",
      type: "success",
      icon: CheckCircle2,
      unread: true,
    },
    {
      id: 2,
      title: "SLA Deadline Warning",
      description: "Emergency Work Order #WO-9912 in Austin has 45 mins remaining.",
      time: "18 mins ago",
      type: "warning",
      icon: AlertTriangle,
      unread: true,
    },
    {
      id: 3,
      title: "Digital Sign-off Completed",
      description: "Customer signed off on fiber splice certification ($840).",
      time: "1 hour ago",
      type: "info",
      icon: Clock,
      unread: false,
    },
  ];

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

  const markAllAsRead = () => {
    setUnreadCount(0);
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
            }}
            className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 border-2 border-white rounded-full animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 space-y-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {role === "TECHNICIAN" ? "My Job Alerts" : "Dispatch Notifications"}
                  </h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                {notifications.map((notif) => {
                  const Icon = notif.icon;
                  return (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-xl border transition-all ${notif.unread
                        ? "bg-blue-50/40 border-blue-100"
                        : "bg-slate-50/50 border-slate-100"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${notif.type === "success"
                            ? "bg-emerald-100 text-emerald-600"
                            : notif.type === "warning"
                              ? "bg-amber-100 text-amber-600"
                              : "bg-blue-100 text-blue-600"
                            }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                            {notif.description}
                          </p>
                          <span className="text-[10px] font-medium text-slate-400 mt-1 inline-block">
                            {notif.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
