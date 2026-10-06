"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Layers,
  UtensilsCrossed,
  MessageSquare,
  HelpCircle,
  CalendarCheck,
  TrendingUp,
  Sparkles,
  ShoppingBag,
  Truck,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  ChevronRight,
} from "lucide-react";
import { db } from "@/lib/db";
import { ContactMessage, SupportRequest, Order } from "@/types";
import { formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCategories: 0,
    totalServices: 0,
    totalMessages: 0,
    unreadMessages: 0,
    totalSupportRequests: 0,
    openSupportRequests: 0,
    totalReservations: 0,
    totalOrders: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    outForDeliveryOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);

  useEffect(() => {
    async function loadStats() {
      const [adminStats, ords, msgs, sups] = await Promise.all([
        db.getAdminStats(),
        db.getOrders(),
        db.getContactMessages(),
        db.getSupportRequests(),
      ]);
      setStats(adminStats);
      setOrders(ords.slice(0, 5));
      setMessages(msgs.slice(0, 4));
      setSupportRequests(sups.slice(0, 4));
    }
    loadStats();
  }, []);

  // Compulsory Order & Revenue Analytics Cards
  const orderKpiCards = [
    {
      label: "Total Gross Revenue",
      value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
      sub: "From fulfilled & live orders",
      icon: IndianRupee,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      sub: "All placed culinary orders",
      icon: ShoppingBag,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      sub: "Awaiting kitchen confirmation",
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
    },
    {
      label: "Kitchen Preparing",
      value: stats.preparingOrders,
      sub: "Actively under chef craft",
      icon: ChefHat,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
    },
    {
      label: "Out For Delivery",
      value: stats.outForDeliveryOrders,
      sub: "With courier partner en route",
      icon: Truck,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/30",
    },
    {
      label: "Delivered Orders",
      value: stats.deliveredOrders,
      sub: "Successfully handed over",
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
    },
    {
      label: "Cancelled Orders",
      value: stats.cancelledOrders,
      sub: "Voided or refunded",
      icon: XCircle,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
    },
    {
      label: "Total Registered Diners",
      value: stats.totalUsers,
      sub: `${stats.activeUsers} active accounts`,
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
    },
  ];

  const operationalCards = [
    {
      label: "Cuisine Categories",
      value: stats.totalCategories,
      sub: "Menu classifications",
      icon: Layers,
      color: "text-amber-400",
      link: "/admin/categories",
    },
    {
      label: "Dining Services",
      value: stats.totalServices,
      sub: "Dine-In, Delivery & VIP",
      icon: UtensilsCrossed,
      color: "text-emerald-400",
      link: "/admin/services",
    },
    {
      label: "Table Reservations",
      value: stats.totalReservations,
      sub: "Guest dining bookings",
      icon: CalendarCheck,
      color: "text-blue-400",
      link: "#",
    },
    {
      label: "Contact Inquiries",
      value: stats.totalMessages,
      sub: `${stats.unreadMessages} new unread`,
      icon: MessageSquare,
      color: "text-rose-400",
      link: "#",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "order_placed":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">Placed</span>;
      case "order_confirmed":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">Confirmed</span>;
      case "preparing":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40">Preparing</span>;
      case "ready_for_pickup":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">Ready</span>;
      case "out_for_delivery":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">In Transit</span>;
      case "delivered":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">Delivered</span>;
      case "cancelled":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-500/20 text-stone-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-amber-500/30 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Executive Oversight
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mt-1">
            System Operations & Culinary Dispatch Center
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Real-time management of diner orders, payment reconciliations, courier dispatch assignments, and restaurant services.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href="/admin/orders"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Manage Orders</span>
          </a>
          <a
            href="/admin/delivery"
            className="px-4 py-2.5 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground border border-border text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Delivery Dispatch</span>
          </a>
          <a
            href="/admin/payments"
            className="px-4 py-2.5 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground border border-border text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <IndianRupee className="w-3.5 h-3.5" />
            <span>Payment Logs</span>
          </a>
        </div>
      </div>

      {/* Compulsory Order & Revenue Analytics Grid (Requirement 8) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span>Order & Revenue Overview</span>
          </h3>
          <span className="text-xs text-muted-foreground">Live Telemetry</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {orderKpiCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                className={`glass-card rounded-2xl p-5 border ${c.border} shadow-lg transition-transform hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {c.label}
                  </span>
                  <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center ${c.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-3">
                  <div className="font-serif text-2xl font-bold text-foreground">
                    {c.value}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-amber-400" />
                    <span>{c.sub}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operational Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {operationalCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <a
              key={i}
              href={c.link}
              className="glass-card rounded-2xl p-4 border border-border/80 hover:border-amber-500/40 transition-all flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <div className="min-w-0">
                <div className="font-serif text-lg font-bold text-foreground">
                  {c.value}
                </div>
                <div className="text-[11px] font-semibold text-muted-foreground truncate">
                  {c.label}
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Recent Live Orders Feed */}
      <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span>Recent Culinary Orders</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live patron orders requiring kitchen prep and dispatch assignment
            </p>
          </div>
          <a
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>View All Orders ({stats.totalOrders})</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        <div className="mt-4 overflow-x-auto">
          {orders.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No orders registered in the system yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border/40">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Patron</th>
                  <th className="pb-3 font-semibold">Items</th>
                  <th className="pb-3 font-semibold">Total Amount</th>
                  <th className="pb-3 font-semibold">Payment</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Courier</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-mono font-bold text-amber-400">
                      {o.order_number}
                    </td>
                    <td className="py-3">
                      <div className="font-semibold text-foreground">{o.customer_name}</div>
                      <div className="text-[10px] text-muted-foreground">{o.customer_phone}</div>
                    </td>
                    <td className="py-3 text-muted-foreground max-w-[180px] truncate">
                      {o.items.map((it) => `${it.quantity}x ${it.dish_name}`).join(", ")}
                    </td>
                    <td className="py-3 font-bold text-foreground">
                      ₹{o.total_amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary border border-border">
                        {o.payment.payment_method.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3">{getStatusBadge(o.order_status)}</td>
                    <td className="py-3 text-muted-foreground">
                      {o.delivery_assignment?.delivery_person_name ? (
                        <span className="text-foreground font-medium">
                          {o.delivery_assignment.delivery_person_name}
                        </span>
                      ) : (
                        <span className="text-amber-400/80 italic text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <a
                        href="/admin/orders"
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                      >
                        Manage
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent Dispatches & Support Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Contact Inquiries */}
        <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Recent Contact Inquiries</span>
            </h3>
            <span className="text-xs text-muted-foreground">
              Total {stats.totalMessages}
            </span>
          </div>

          <div className="mt-4 divide-y divide-border/40">
            {messages.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No contact inquiries logged yet.
              </p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="py-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      {m.name}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        m.status === "new"
                          ? "bg-rose-950/80 text-rose-300 border border-rose-500/50"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-amber-300">
                    {m.subject}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {m.message}
                  </p>
                  <div className="text-[10px] text-muted-foreground pt-0.5">
                    {m.email} • {formatDate(m.created_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Support Tickets */}
        <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Patron Support Tickets</span>
            </h3>
            <span className="text-xs text-muted-foreground">
              Total {stats.totalSupportRequests}
            </span>
          </div>

          <div className="mt-4 divide-y divide-border/40">
            {supportRequests.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No active support requests logged.
              </p>
            ) : (
              supportRequests.map((s) => (
                <div key={s.id} className="py-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      {s.user_name}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        s.status === "resolved"
                          ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50"
                          : s.status === "in_progress"
                          ? "bg-amber-950/80 text-amber-300 border border-amber-500/50"
                          : "bg-blue-950/80 text-blue-300 border border-blue-500/50"
                      }`}
                    >
                      {s.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-amber-300">
                    {s.subject}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {s.message}
                  </p>
                  <div className="text-[10px] text-muted-foreground pt-0.5">
                    Priority: {s.priority} • {formatDate(s.created_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
