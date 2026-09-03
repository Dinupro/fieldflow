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
  Radio,
  User,
  Settings,
  LogOut,
  Sparkles,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

interface TopNavbarProps {
  onMenuToggle: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onLogoutClick: () => void;
  onSettingsClick: () => void;
}

export default function TopNavbar({
  onMenuToggle,
  searchQuery,
  setSearchQuery,
  onLogoutClick,
  onSettingsClick,
}: TopNavbarProps) {
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const userName = session?.user?.name || "Marcus Vance";
  const userEmail = session?.user?.email || "dispatcher@fieldflow.io";
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
      title: "Technician Arrived On-Site",
      description: "Marcus Vance checked in at Austin DataCenter (FL-8924).",
      time: "2 mins ago",
      type: "success",
      icon: CheckCircle2,
      unread: true,
    },
    {
      id: 2,
      title: "SLA Warning (Emergency 2hr)",
      description: "Work order #FL-9042 at Retail Node Dallas has 28 mins remaining.",
      time: "14 mins ago",
      type: "warning",
      icon: AlertTriangle,
      unread: true,
    },
    {
      id: 3,
      title: "Digital Signoff Completed",
      description: "Customer signed off on fiber splice certification ($840 released).",
      time: "45 mins ago",
      type: "info",
      icon: Clock,
      unread: true,
    },
  ];

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <header className="sticky top-0 z-30 h-18 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onMenuToggle}
          type="button"
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle Sidebar Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search work orders, technicians, customers, locations..."
            className="w-full pl-10 pr-12 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          <span className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-white shadow-2xs">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right: Live Status, Notifications, & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Live Engine Status Pill (Hidden on mobile) */}
        <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Dispatch Engine Online</span>
        </div>

        {/* Notifications Dropdown Container */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            type="button"
            className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 space-y-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.map((n) => {
                  const NIcon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-100 transition-colors flex items-start gap-3 text-xs"
                    >
                      <div
                        className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${n.type === "warning"
                            ? "bg-amber-100 text-amber-600"
                            : n.type === "success"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                      >
                        <NIcon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 truncate">
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-tight">
                          {n.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <Link
                  href="/#contact"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  View All Dispatch Alerts
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            type="button"
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {userName}
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                Active Session
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Flyout Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 space-y-1 z-50 animate-fadeIn text-xs">
              <div className="p-2 border-b border-slate-100 mb-1">
                <span className="font-bold text-slate-900 block">{userName}</span>
                <span className="text-slate-500 text-[11px] truncate block">{userEmail}</span>
                <span className="mt-1 inline-block text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                  FieldFlow Portal
                </span>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onSettingsClick();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors text-left cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onSettingsClick();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors text-left cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Account Settings</span>
              </button>

              <div className="border-t border-slate-100 my-1" />

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogoutClick();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left font-semibold cursor-pointer"
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
