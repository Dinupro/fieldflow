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
  Radio,
} from "lucide-react";

export type SidebarItemKey =
  | "dashboard"
  | "customers"
  | "technicians"
  | "work-orders"
  | "schedule"
  | "reports"
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
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  onLogoutClick,
}: SidebarProps) {
  const navItems = [
    { key: "dashboard" as SidebarItemKey, label: "Dashboard", icon: LayoutDashboard, badge: undefined },
    { key: "customers" as SidebarItemKey, label: "Customers", icon: Building2, badge: "128" },
    { key: "technicians" as SidebarItemKey, label: "Technicians", icon: Wrench, badge: "42 Active" },
    { key: "work-orders" as SidebarItemKey, label: "Work Orders", icon: FileText, badge: "14 Open" },
    { key: "schedule" as SidebarItemKey, label: "Schedule", icon: Calendar, badge: undefined },
    { key: "reports" as SidebarItemKey, label: "Reports", icon: BarChart3, badge: undefined },
    { key: "settings" as SidebarItemKey, label: "Settings", icon: Settings, badge: undefined },
  ];

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
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-64"
          } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-4 flex items-center justify-between border-b border-slate-800/80">
          <Link
            href="/"
            className="flex items-center gap-3 group overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Wrench className="w-5 h-5 transform -rotate-45" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 truncate">
                  Field<span className="text-blue-400">Flow</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    FSM
                  </span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 truncate">
                  Command Center
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse / Expand Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Operations Menu
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group cursor-pointer ${isActive
                    ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                  } ${isCollapsed ? "justify-center" : "justify-between"}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                      }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Section Divider */}
          <div className="pt-3 pb-2">
            <div className="border-t border-slate-800" />
          </div>

          {/* Logout Button */}
          <button
            onClick={() => handleNavClick("logout")}
            title={isCollapsed ? "Logout" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 transition-all cursor-pointer ${isCollapsed ? "justify-center" : ""
              }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Bottom Status Card (Visible when expanded) */}
        {!isCollapsed && (
          <div className="p-3 m-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Live Dispatch Sync
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                Online
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              42 technicians broadcasting real-time GPS telemetry.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
