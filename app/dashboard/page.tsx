"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import Sidebar, { SidebarItemKey } from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import DashboardView from "@/components/dashboard/views/DashboardView";
import { LogOut } from "lucide-react";

// Code Splitting: Dynamically load secondary views to minimize initial bundle size
const CustomersView = dynamic(
  () => import("@/components/dashboard/views/CustomersView"),
  {
    loading: () => (
      <div className="space-y-4 animate-pulse p-4">
        <div className="h-10 bg-slate-200 rounded-2xl w-1/3" />
        <div className="h-64 bg-slate-200 rounded-3xl w-full" />
      </div>
    ),
  }
);

const TechniciansView = dynamic(
  () => import("@/components/dashboard/views/TechniciansView"),
  {
    loading: () => (
      <div className="space-y-4 animate-pulse p-4">
        <div className="h-10 bg-slate-200 rounded-2xl w-1/3" />
        <div className="h-64 bg-slate-200 rounded-3xl w-full" />
      </div>
    ),
  }
);

const WorkOrdersView = dynamic(
  () => import("@/components/dashboard/views/WorkOrdersView"),
  {
    loading: () => (
      <div className="space-y-4 animate-pulse p-4">
        <div className="h-10 bg-slate-200 rounded-2xl w-1/3" />
        <div className="h-64 bg-slate-200 rounded-3xl w-full" />
      </div>
    ),
  }
);

const ScheduleView = dynamic(
  () => import("@/components/dashboard/views/ScheduleView"),
  {
    loading: () => (
      <div className="space-y-4 animate-pulse p-4">
        <div className="h-10 bg-slate-200 rounded-2xl w-1/3" />
        <div className="h-64 bg-slate-200 rounded-3xl w-full" />
      </div>
    ),
  }
);

const ReportsView = dynamic(
  () => import("@/components/dashboard/views/ReportsView"),
  {
    loading: () => (
      <div className="space-y-4 animate-pulse p-4">
        <div className="h-10 bg-slate-200 rounded-2xl w-1/3" />
        <div className="h-64 bg-slate-200 rounded-3xl w-full" />
      </div>
    ),
  }
);

const SettingsView = dynamic(
  () => import("@/components/dashboard/views/SettingsView"),
  {
    loading: () => (
      <div className="space-y-4 animate-pulse p-4">
        <div className="h-10 bg-slate-200 rounded-2xl w-1/3" />
        <div className="h-64 bg-slate-200 rounded-3xl w-full" />
      </div>
    ),
  }
);

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [activeTab, setActiveTab] = useState<SidebarItemKey>("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 1. Collapsible & Responsive Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onLogoutClick={() => setShowLogoutModal(true)}
      />

      {/* 2. Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Top Navbar with Profile, Notifications & Search */}
        <TopNavbar
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onLogoutClick={() => setShowLogoutModal(true)}
          onSettingsClick={() => setActiveTab("settings")}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "dashboard" && (
            <DashboardView onNavigate={(tab) => setActiveTab(tab)} />
          )}
          {activeTab === "customers" && <CustomersView />}
          {activeTab === "technicians" && <TechniciansView />}
          {activeTab === "work-orders" && <WorkOrdersView />}
          {activeTab === "schedule" && <ScheduleView />}
          {activeTab === "reports" && <ReportsView />}
          {activeTab === "settings" && <SettingsView />}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Confirm Sign Out
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Are you sure you want to log out of your FieldFlow dispatcher session? You will be redirected to the login portal.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
