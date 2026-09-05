"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  Wrench,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export type SidebarItemKey =
  | "dashboard"
  | "customers"
  | "technicians"
  | "work-orders"
  | "schedule"
  | "reports"
  | "users"
  | "settings"
  | "logout";

interface SidebarProps {
  activeTab: SidebarItemKey;
  setActiveTab: (tab: SidebarItemKey) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onLogoutClick: () => void;
  role?: "ADMIN" | "DISPATCHER" | "TECHNICIAN";
}

interface NavGroup {
  title: string;
  items: {
    key: SidebarItemKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
  }[];
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  onLogoutClick,
  role = "DISPATCHER",
}: SidebarProps) {
  // Build role-specific navigation groups
  let navGroups: NavGroup[] = [];

  if (role === "TECHNICIAN") {
    navGroups = [
      {
        title: "Field Operations",
        items: [
          { key: "dashboard", label: "My Overview", icon: LayoutDashboard },
          {
            key: "work-orders",
            label: "My Work Orders",
            icon: FileText,
            badge: "Assigned",
            badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
          },
          { key: "schedule", label: "My Schedule", icon: Calendar },
        ],
      },
      {
        title: "Account",
        items: [{ key: "settings", label: "My Profile & Status", icon: Settings }],
      },
    ];
  } else if (role === "ADMIN") {
    navGroups = [
      {
        title: "Core Operations",
        items: [
          { key: "dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
          {
            key: "work-orders",
            label: "Work Orders",
            icon: FileText,
            badge: "Live",
            badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/30",
          },
          { key: "schedule", label: "Dispatch Calendar", icon: Calendar },
        ],
      },
      {
        title: "Workforce & CRM",
        items: [
          { key: "customers", label: "Customers CRM", icon: Building2 },
          {
            key: "technicians",
            label: "Technicians Roster",
            icon: Wrench,
            badge: "Roster",
            badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
          },
        ],
      },
      {
        title: "Administration & RBAC",
        items: [
          {
            key: "users",
            label: "User Access & Roles",
            icon: ShieldCheck,
            badge: "Admin",
            badgeColor: "bg-purple-500/20 text-purple-300 border-purple-400/30",
          },
        ],
      },
      {
        title: "Analytics & System",
        items: [
          { key: "reports", label: "Reports & KPIs", icon: BarChart3 },
          { key: "settings", label: "Platform Settings", icon: Settings },
        ],
      },
    ];
  } else {
    // DISPATCHER
    navGroups = [
      {
        title: "Core Operations",
        items: [
          { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          {
            key: "work-orders",
            label: "Work Orders",
            icon: FileText,
            badge: "Live",
            badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/30",
          },
          { key: "schedule", label: "Schedule", icon: Calendar },
        ],
      },
      {
        title: "Workforce & CRM",
        items: [
          { key: "customers", label: "Customers", icon: Building2 },
          {
            key: "technicians",
            label: "Technicians",
            icon: Wrench,
            badge: "Roster",
            badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
          },
        ],
      },
      {
        title: "Analytics & Settings",
        items: [
          { key: "reports", label: "Reports & KPIs", icon: BarChart3 },
          { key: "settings", label: "Settings", icon: Settings },
        ],
      },
    ];
  }

  const handleNavClick = (key: SidebarItemKey) => {
    if (key === "logout") {
      onLogoutClick();
    } else {
      setActiveTab(key);
    }
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div className="h-18 px-4 flex items-center justify-between border-b border-slate-800/80">
          <Link
            href="/"
            className="flex items-center gap-3 group overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Wrench className="w-5 h-5 transform -rotate-45" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 truncate">
                  Field<span className="text-blue-400">Flow</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    SaaS
                  </span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 truncate">
                  {role === "ADMIN"
                    ? "Admin Console"
                    : role === "TECHNICIAN"
                    ? "Technician Mobile"
                    : "Enterprise Dispatch"}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Grouped Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavClick(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 font-bold"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                    } ${isCollapsed ? "justify-center" : ""}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                      }`}
                    />

                    {!isCollapsed && (
                      <>
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                              isActive
                                ? "bg-white/20 text-white border-white/30"
                                : item.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Live System Indicator & User Sign Out Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
          {/* Live Sync Status */}
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-750 text-[11px] text-slate-400 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {!isCollapsed && (
              <span className="font-medium text-slate-300 truncate">
                Neon Postgres Live
              </span>
            )}
          </div>

          {/* Sign Out Trigger Button */}
          <button
            type="button"
            onClick={onLogoutClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all group cursor-pointer ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
            {!isCollapsed && <span className="truncate font-bold">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
