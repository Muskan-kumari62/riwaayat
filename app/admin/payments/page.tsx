"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  CreditCard,
  Search,
  CheckCircle2,
  IndianRupee,
  RefreshCw,
  Clock,
  X,
} from "lucide-react";
import { db } from "@/lib/db";
import { PaymentMethod, PaymentStatus, Order } from "@/types";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/lib/toast/toast-context";

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>("paid");

  const { success, error } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const allOrders = await db.getOrders();
      setOrders(allOrders);
    } catch (e) {
      console.error(e);
      error("Failed to load payment records.");
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setIsLoading(true);
      try {
        const allOrders = await db.getOrders();
        if (isMounted) {
          setOrders(allOrders);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      await db.updatePaymentStatus(selectedOrder.id, newPaymentStatus);
      success(`Payment for order ${selectedOrder.order_number} updated to ${newPaymentStatus.replace(/_/g, " ")}`);
      await loadData();
      setSelectedOrder(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to update payment status.";
      error(msg);
    }
  };

  const handleQuickMarkCodCollected = async (orderId: string) => {
    try {
      await db.updatePaymentStatus(orderId, "cod_collected");
      success("Marked as COD Collected successfully.");
      await loadData();
    } catch (e) {
      console.error(e);
      error("Failed to update payment status.");
    }
  };

  // Filtered Payments
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.order_number.toLowerCase().includes(q) ||
        order.customer_name.toLowerCase().includes(q) ||
        order.customer_phone.toLowerCase().includes(q) ||
        order.payment.transaction_id.toLowerCase().includes(q);

      const matchesMethod =
        methodFilter === "all" || order.payment.payment_method === methodFilter;

      const matchesStatus =
        statusFilter === "all" || order.payment.payment_status === statusFilter;

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [orders, searchQuery, methodFilter, statusFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalCollected = orders
      .filter((o) => o.payment.payment_status === "paid" || o.payment.payment_status === "cod_collected")
      .reduce((sum, o) => sum + o.payment.amount, 0);

    const onlineCollected = orders
      .filter((o) => o.payment.payment_method !== "cod" && o.payment.payment_status === "paid")
      .reduce((sum, o) => sum + o.payment.amount, 0);

    const codPending = orders
      .filter((o) => o.payment.payment_status === "cod_pending")
      .reduce((sum, o) => sum + o.payment.amount, 0);

    const codCollected = orders
      .filter((o) => o.payment.payment_status === "cod_collected")
      .reduce((sum, o) => sum + o.payment.amount, 0);

    return {
      totalCollected,
      onlineCollected,
      codPending,
      codCollected,
      totalCount: orders.length,
    };
  }, [orders]);

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Paid</span>;
      case "cod_collected":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">COD Collected</span>;
      case "cod_pending":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">COD Pending</span>;
      case "pending":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-500/20 text-stone-400 border border-stone-500/30">Pending</span>;
      case "refunded":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">Refunded</span>;
      case "failed":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">Failed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-500/20 text-stone-400">{status}</span>;
    }
  };

  const getMethodBadge = (method: PaymentMethod) => {
    const formatted = method.toUpperCase().replace(/_/g, " ");
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-secondary border border-border">
        {formatted}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            Financial Reconciliation
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Payment Audit & Gateway Logs
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Reconcile Cash on Delivery settlements, UPI/Card transaction IDs, and refund authorizations.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/80 text-foreground hover:bg-secondary/60 transition-colors text-xs font-semibold w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Realized Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-foreground mt-2">
            ₹{metrics.totalCollected.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            From online gateways & collected COD
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-border/70">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Online Payments (UPI/Cards)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-foreground mt-2">
            ₹{metrics.onlineCollected.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Instant digital settlements
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-border/70">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              COD Handover Collected
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-foreground mt-2">
            ₹{metrics.codCollected.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Cash settled by couriers
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-border/70">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              COD Outstanding Dues
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-foreground mt-2">
            ₹{metrics.codPending.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            To be collected at doorstep
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-border/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Transaction ID (TXN-...), Order ID, or Patron..."
            className="w-full pl-10 pr-4 py-2.5 bg-background/60 border border-border/80 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Method Filter (Requirement 19 options) */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2.5 bg-background/60 border border-border/80 rounded-xl text-xs text-foreground focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Payment Methods</option>
            <option value="cod">Cash on Delivery (COD)</option>
            <option value="upi">UPI (Generic)</option>
            <option value="google_pay">Google Pay</option>
            <option value="phonepe">PhonePe</option>
            <option value="paytm">Paytm</option>
            <option value="card">Debit / Credit Card</option>
            <option value="net_banking">Net Banking</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-background/60 border border-border/80 rounded-xl text-xs text-foreground focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="cod_collected">COD Collected</option>
            <option value="cod_pending">COD Pending</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Payment Records Table (Requirement 19 Columns) */}
      <div className="glass-card rounded-3xl border border-border/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="font-serif text-lg font-bold text-foreground">No Transactions Found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                No payment logs matched your search or method filters.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-secondary/40 text-muted-foreground border-b border-border/80 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 font-semibold">Transaction ID</th>
                  <th className="py-3.5 px-4 font-semibold">Order ID</th>
                  <th className="py-3.5 px-4 font-semibold">Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Amount</th>
                  <th className="py-3.5 px-4 font-semibold">Payment Method</th>
                  <th className="py-3.5 px-4 font-semibold">Payment Status</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredOrders.map((order) => {
                  const p = order.payment;
                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      {/* Transaction ID */}
                      <td className="py-4 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                        {p.transaction_id}
                      </td>

                      {/* Order ID */}
                      <td className="py-4 px-4 font-mono font-medium text-foreground whitespace-nowrap">
                        {order.order_number}
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-foreground">{order.customer_name}</div>
                        <div className="text-[10px] text-muted-foreground">{order.customer_email}</div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 font-bold text-foreground whitespace-nowrap">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {getMethodBadge(p.payment_method)}
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {getPaymentStatusBadge(p.payment_status)}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">
                        {formatDate(p.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {p.payment_status === "cod_pending" && (
                            <button
                              onClick={() => handleQuickMarkCodCollected(order.id)}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 transition-colors"
                            >
                              Collect Cash
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setNewPaymentStatus(order.payment.payment_status);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-stone-950 border border-amber-500/30 transition-all"
                          >
                            Edit Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Payment Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-card border border-border/80 rounded-3xl shadow-2xl p-6 text-card-foreground space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Payment Reconciliation
                </span>
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Order #{selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-7 h-7 rounded-full bg-secondary hover:bg-muted text-muted-foreground flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-2 bg-secondary/30 p-3.5 rounded-xl border border-border/60">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono font-bold text-foreground">{selectedOrder.payment.transaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patron:</span>
                <span className="font-semibold text-foreground">{selectedOrder.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold text-amber-400">₹{selectedOrder.payment.amount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method:</span>
                <span className="font-bold uppercase text-foreground">{selectedOrder.payment.payment_method}</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">
                Update Payment Status
              </label>
              <select
                value={newPaymentStatus}
                onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-amber-400"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid (Gateway Settled)</option>
                <option value="cod_pending">COD Pending</option>
                <option value="cod_collected">COD Collected (Cash in Hand)</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md"
              >
                Save Payment Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
