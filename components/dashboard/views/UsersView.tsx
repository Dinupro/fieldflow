"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Radio,
  Wrench,
  Search,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Lock,
} from "lucide-react";

type UserRole = "ADMIN" | "DISPATCHER" | "TECHNICIAN";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  technician: {
    id: string;
    name: string;
    specialization: string | null;
    status: "AVAILABLE" | "BUSY" | "OFF";
    phone: string | null;
  } | null;
  _count?: {
    statusLogs: number;
  };
}

interface AvailableTech {
  id: string;
  name: string;
  email: string | null;
  specialization: string | null;
  status: "AVAILABLE" | "BUSY" | "OFF";
}

export default function UsersView() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [availableTechs, setAvailableTechs] = useState<AvailableTech[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");

  // Edit Role Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("DISPATCHER");
  const [selectedTechId, setSelectedTechId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) {
        throw new Error("Failed to load users. Administrator access required.");
      }
      const data = await res.json();
      setUsers(data.users || []);
      setAvailableTechs(data.availableTechnicians || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching users";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenEdit = (user: UserItem) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setSelectedTechId(user.technician?.id || "");
    setShowEditModal(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          technicianId: selectedRole === "TECHNICIAN" ? selectedTechId || undefined : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update user role.");
      }

      showToast("success", data.message || "User role updated successfully.");
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating role";
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user account.");
      }

      showToast("success", data.message || "User account removed.");
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting user";
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const dispatcherCount = users.filter((u) => u.role === "DISPATCHER").length;
  const technicianCount = users.filter((u) => u.role === "TECHNICIAN").length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              User & Access Control Management
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Admin Only
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Provision roles (Administrator, Dispatcher, Technician) and bind technician field accounts.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <svg
            className={`w-4 h-4 ${loading ? "animate-spin text-purple-600" : "text-slate-500"}`}
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
          <span>Sync Users</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Accounts
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">{users.length}</span>
            <span className="text-[10px] font-bold text-slate-500">Registered</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Administrators</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-purple-700">{adminCount}</span>
            <span className="text-[10px] font-bold text-purple-600">Full Access</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Dispatchers</span>
            <Radio className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-blue-700">{dispatcherCount}</span>
            <span className="text-[10px] font-bold text-blue-600">Operations</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Technicians</span>
            <Wrench className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-700">{technicianCount}</span>
            <span className="text-[10px] font-bold text-emerald-600">Field Scoped</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9.5 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-xs sm:text-sm font-medium text-slate-900 transition-all outline-none"
          />
        </div>

        <div className="flex items-center p-1 rounded-xl bg-slate-100 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setRoleFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              roleFilter === "ALL"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Roles ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter("ADMIN")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              roleFilter === "ADMIN"
                ? "bg-white text-purple-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Admins ({adminCount})
          </button>
          <button
            onClick={() => setRoleFilter("DISPATCHER")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              roleFilter === "DISPATCHER"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Dispatchers ({dispatcherCount})
          </button>
          <button
            onClick={() => setRoleFilter("TECHNICIAN")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              roleFilter === "TECHNICIAN"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Technicians ({technicianCount})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">User Account</th>
                <th className="py-3.5 px-4">Role & Permissions</th>
                <th className="py-3.5 px-4">Linked Technician</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-sm">No matching user accounts found.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const initials =
                    (user.name || user.email)
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "U";

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {user.name || "Unnamed User"}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {user.role === "ADMIN" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200/80 font-bold text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Administrator
                          </span>
                        )}
                        {user.role === "DISPATCHER" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 font-bold text-[11px]">
                            <Radio className="w-3.5 h-3.5" />
                            Dispatcher
                          </span>
                        )}
                        {user.role === "TECHNICIAN" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold text-[11px]">
                            <Wrench className="w-3.5 h-3.5" />
                            Technician
                          </span>
                        )}
                      </td>

                      {/* Linked Technician Profile */}
                      <td className="py-3.5 px-4">
                        {user.technician ? (
                          <div className="text-[11px]">
                            <p className="font-bold text-slate-800">{user.technician.name}</p>
                            <p className="text-slate-500">
                              {user.technician.specialization || "Field Specialist"} •{" "}
                              <span
                                className={
                                  user.technician.status === "AVAILABLE"
                                    ? "text-emerald-600 font-bold"
                                    : user.technician.status === "BUSY"
                                    ? "text-amber-600 font-bold"
                                    : "text-slate-400 font-bold"
                                }
                              >
                                {user.technician.status}
                              </span>
                            </p>
                          </div>
                        ) : user.role === "TECHNICIAN" ? (
                          <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Auto-mapped to account
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Not applicable</span>
                        )}
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                            title="Edit Role & Access Permissions"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setUserToDelete(user);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove User Account"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role & Access Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Modify User Access Role</h3>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Select Project Role</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {/* ADMIN */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      selectedRole === "ADMIN"
                        ? "bg-purple-50/60 border-purple-300 ring-2 ring-purple-500/20"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="ADMIN"
                      checked={selectedRole === "ADMIN"}
                      onChange={() => setSelectedRole("ADMIN")}
                      className="mt-1 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        Administrator (ADMIN)
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Full access to all records, user and role access management, company metrics, and system configuration.
                      </p>
                    </div>
                  </label>

                  {/* DISPATCHER */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      selectedRole === "DISPATCHER"
                        ? "bg-blue-50/60 border-blue-300 ring-2 ring-blue-500/20"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="DISPATCHER"
                      checked={selectedRole === "DISPATCHER"}
                      onChange={() => setSelectedRole("DISPATCHER")}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-blue-600" />
                        Dispatcher (DISPATCHER)
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Create & manage customers and technicians, create and assign work orders, track job progress and priorities.
                      </p>
                    </div>
                  </label>

                  {/* TECHNICIAN */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      selectedRole === "TECHNICIAN"
                        ? "bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="TECHNICIAN"
                      checked={selectedRole === "TECHNICIAN"}
                      onChange={() => setSelectedRole("TECHNICIAN")}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                        Field Technician (TECHNICIAN)
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Can only view assigned jobs only, start and update work (IN_PROGRESS), and add digital completion notes (COMPLETED).
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Optional Link to Technician record when TECHNICIAN role is chosen */}
              {selectedRole === "TECHNICIAN" && availableTechs.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 block">
                    Link to Existing Technician Profile (Optional)
                  </label>
                  <select
                    value={selectedTechId}
                    onChange={(e) => setSelectedTechId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:bg-white focus:border-purple-600 outline-none"
                  >
                    <option value="">Auto-create matching technician profile</option>
                    {availableTechs.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name} ({tech.specialization || "Tech"} • {tech.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Role Permissions"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete User Account</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete account for{" "}
                <strong className="text-slate-800">{userToDelete.email}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
