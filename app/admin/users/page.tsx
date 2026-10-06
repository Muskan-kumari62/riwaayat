"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Users,
  Search,
  Shield,
} from "lucide-react";
import { db } from "@/lib/db";
import { UserProfile, UserRole } from "@/types";
import { useToast } from "@/lib/toast/toast-context";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const { success, error } = useToast();

  const loadUsers = useCallback(async () => {
    const list = await db.getUsers();
    setUsers(list);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      const list = await db.getUsers();
      if (isMounted) {
        setUsers(list);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const ok = await db.updateUserRole(userId, newRole);
    if (ok) {
      await loadUsers();
      success(`User role successfully updated to "${newRole}".`);
    } else {
      error("Failed to update user role.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesSearch =
      !searchQuery ||
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            User & Role Management
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage authenticated diners, elevate executive admin permissions, and inspect account histories.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Search className="w-4 h-4 text-amber-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-secondary/80 border border-border text-foreground focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-xl border border-border">
            {["all", "user", "admin"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-lg text-xs capitalize font-medium transition-all ${
                  roleFilter === r
                    ? "bg-amber-500 text-stone-950 font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-3xl border border-border/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/60 border-b border-border/80 uppercase text-[10px] tracking-wider text-muted-foreground">
              <tr>
                <th className="py-4 px-6">Diner / Account</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Contact Phone</th>
                <th className="py-4 px-6">Role Privilege</th>
                <th className="py-4 px-6">Registered Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-amber-500/40 relative bg-muted shrink-0 flex items-center justify-center">
                          {u.avatar_url ? (
                            <Image
                              src={u.avatar_url}
                              alt={u.full_name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Users className="w-4 h-4 text-amber-400" />
                          )}
                        </div>
                        <span className="font-semibold text-foreground">
                          {u.full_name}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-muted-foreground">
                      {u.email}
                    </td>

                    <td className="py-4 px-6 text-muted-foreground">
                      {u.phone || "Not specified"}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === "admin"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-secondary text-muted-foreground border border-border"
                        }`}
                      >
                        <Shield className="w-3 h-3 text-amber-400" />
                        {u.role}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-muted-foreground">
                      {formatDate(u.created_at)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {u.role === "admin" ? (
                        <button
                          onClick={() => handleRoleChange(u.id, "user")}
                          className="px-3 py-1 rounded-lg text-[11px] font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-colors"
                          title="Demote to standard diner"
                        >
                          Revoke Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRoleChange(u.id, "admin")}
                          className="px-3 py-1 rounded-lg text-[11px] font-semibold text-amber-400 hover:bg-amber-500/10 border border-amber-500/30 transition-colors"
                          title="Promote to Executive Admin"
                        >
                          Make Admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
