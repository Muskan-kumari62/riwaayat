"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  Sparkles,
  Info,
  CalendarCheck,
  AlertTriangle,
  Clock,
  Filter,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/lib/auth/auth-context";
import { db } from "@/lib/db";
import { NotificationItem } from "@/types";
import { useToast } from "@/lib/toast/toast-context";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { success } = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    let isMounted = true;
    async function fetchNotifs() {
      const data = await db.getNotifications(user?.id);
      if (isMounted) {
        setNotifications(data);
      }
    }
    fetchNotifs();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    await db.markNotificationAsRead(id);
    const updated = await db.getNotifications(user?.id);
    setNotifications(updated);
    success("Notification marked as read.");
  };

  const handleMarkAllRead = async () => {
    await db.markAllNotificationsAsRead(user?.id);
    const updated = await db.getNotifications(user?.id);
    setNotifications(updated);
    success("All notifications marked as read.");
  };

  const handleDelete = async (id: string) => {
    await db.deleteNotification(id);
    const updated = await db.getNotifications(user?.id);
    setNotifications(updated);
    success("Notification removed.");
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === "unread") return !n.is_read;
    if (filterType === "read") return n.is_read;
    if (filterType === "order") return n.type === "order";
    if (filterType === "promo") return n.type === "promo";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "order":
        return <CalendarCheck className="w-5 h-5 text-amber-400" />;
      case "promo":
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case "alert":
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-2">
              <Bell className="w-3.5 h-3.5" />
              <span>In-App Dispatch</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Notifications & Alerts
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              You have {unreadCount} unread alert{unreadCount === 1 ? "" : "s"}.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-2 transition-colors shrink-0"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 pb-6 border-b border-border/60 overflow-x-auto">
          <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            Filter:
          </span>
          {[
            { id: "all", label: "All Alerts" },
            { id: "unread", label: `Unread (${unreadCount})` },
            { id: "order", label: "Reservations" },
            { id: "promo", label: "Privileges" },
            { id: "read", label: "Archived" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                filterType === tab.id
                  ? "bg-amber-500 text-stone-950 border-amber-400 font-semibold"
                  : "bg-secondary/60 text-muted-foreground border-border hover:border-amber-500/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="mt-6 space-y-3">
          {filteredNotifs.length === 0 ? (
            <div className="py-16 text-center glass-card rounded-2xl border border-border">
              <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
              <p className="text-sm font-semibold text-foreground">
                No notifications to display.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                When you make table reservations or receive wine updates, they will appear here.
              </p>
            </div>
          ) : (
            filteredNotifs.map((n) => (
              <div
                key={n.id}
                className={`group relative rounded-2xl border p-5 transition-all duration-300 flex items-start gap-4 ${
                  !n.is_read
                    ? "bg-amber-500/5 border-amber-500/30 shadow-md"
                    : "bg-card border-border/80 hover:border-border"
                }`}
              >
                {/* Type Icon */}
                <div className="w-10 h-10 rounded-xl bg-secondary/80 border border-border flex items-center justify-center shrink-0 mt-0.5">
                  {getTypeIcon(n.type)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className={`text-sm font-semibold ${
                        !n.is_read ? "text-amber-300 font-bold" : "text-foreground"
                      }`}
                    >
                      {n.title}
                    </h3>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {n.message}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>
                      {new Date(n.created_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      at{" "}
                      {new Date(n.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      title="Mark as read"
                      className="p-2 rounded-lg text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    title="Delete notification"
                    className="p-2 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
