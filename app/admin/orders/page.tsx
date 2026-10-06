"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ShoppingBag,
  Search,
  Truck,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Eye,
  Edit,
  X,
  Sparkles,
  RefreshCw,
  Check,
  Receipt,
} from "lucide-react";
import { db } from "@/lib/db";
import {
  Order,
  OrderStatus,
  PaymentStatus,
  DeliveryPerson,
} from "@/types";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/lib/toast/toast-context";
import { InvoiceModal } from "@/components/modals/invoice-modal";

const ORDER_STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "order_placed", label: "Order Placed" },
  { key: "order_confirmed", label: "Order Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready_for_pickup", label: "Ready for Pickup" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [couriers, setCouriers] = useState<DeliveryPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

  // Selected Order for Modal View/Edit
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Modal form states
  const [newStatus, setNewStatus] = useState<OrderStatus>("order_placed");
  const [selectedCourierId, setSelectedCourierId] = useState<string>("");
  const [courierNotes, setCourierNotes] = useState<string>("");
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>("pending");

  // Receiver recording form state
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const { success, error } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allOrders, allCouriers] = await Promise.all([
        db.getOrders(),
        db.getDeliveryPersons(),
      ]);
      setOrders(allOrders);
      setCouriers(allCouriers);
    } catch (e) {
      console.error(e);
      error("Failed to load orders.");
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setIsLoading(true);
      try {
        const [allOrders, allCouriers] = await Promise.all([
          db.getOrders(),
          db.getDeliveryPersons(),
        ]);
        if (isMounted) {
          setOrders(allOrders);
          setCouriers(allCouriers);
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

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.order_status);
    setSelectedCourierId(order.delivery_assignment?.delivery_person_id || "");
    setCourierNotes(order.delivery_assignment?.delivery_notes || "");
    setNewPaymentStatus(order.payment.payment_status);
    setReceiverName(order.delivery_recipient?.receiver_name || order.customer_name || "");
    setReceiverPhone(order.delivery_recipient?.receiver_phone || order.customer_phone || "");
    setDeliveryNotes(order.delivery_recipient?.delivery_notes || "");
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
  };

  // Status Change Handler
  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      // If marking as delivered, require recipient name
      if (newStatus === "delivered" && !receiverName.trim()) {
        error("Compulsory: Please enter the name of the person who received the delivery.");
        return;
      }

      await db.updateOrderStatus(selectedOrder.id, newStatus);

      // If delivered, also record receiver details
      if (newStatus === "delivered" && receiverName.trim()) {
        await db.recordDeliveryRecipient(selectedOrder.id, {
          receiver_name: receiverName.trim(),
          receiver_phone: receiverPhone.trim() || undefined,
          delivery_notes: deliveryNotes.trim() || undefined,
        });
      }

      // If courier assigned
      if (selectedCourierId && selectedCourierId !== selectedOrder.delivery_assignment?.delivery_person_id) {
        await db.assignDeliveryPerson(selectedOrder.id, selectedCourierId, courierNotes);
      }

      // If payment status changed
      if (newPaymentStatus !== selectedOrder.payment.payment_status) {
        await db.updatePaymentStatus(selectedOrder.id, newPaymentStatus);
      }

      success(`Order ${selectedOrder.order_number} status updated to ${newStatus.replace(/_/g, " ")}`);
      await loadData();
      closeOrderModal();
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Failed to update order.";
      error(msg);
    }
  };

  // Filtered and Sorted Orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Search
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          order.order_number.toLowerCase().includes(query) ||
          order.customer_name.toLowerCase().includes(query) ||
          order.customer_phone.toLowerCase().includes(query) ||
          order.customer_email.toLowerCase().includes(query) ||
          order.items.some((it) => it.dish_name.toLowerCase().includes(query));

        // Status Filter
        const matchesStatus =
          statusFilter === "all" || order.order_status === statusFilter;

        // Payment Filter
        const matchesPayment =
          paymentFilter === "all" ||
          order.payment.payment_status === paymentFilter ||
          order.payment.payment_method === paymentFilter;

        return matchesSearch && matchesStatus && matchesPayment;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === "highest") {
          return b.total_amount - a.total_amount;
        }
        if (sortBy === "lowest") {
          return a.total_amount - b.total_amount;
        }
        return 0;
      });
  }, [orders, searchQuery, statusFilter, paymentFilter, sortBy]);

  // Order Counts
  const counts = useMemo(() => {
    return {
      all: orders.length,
      placed: orders.filter((o) => o.order_status === "order_placed").length,
      confirmed: orders.filter((o) => o.order_status === "order_confirmed").length,
      preparing: orders.filter((o) => o.order_status === "preparing").length,
      ready: orders.filter((o) => o.order_status === "ready_for_pickup").length,
      out: orders.filter((o) => o.order_status === "out_for_delivery").length,
      delivered: orders.filter((o) => o.order_status === "delivered").length,
      cancelled: orders.filter((o) => o.order_status === "cancelled").length,
    };
  }, [orders]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "order_placed":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">Order Placed</span>;
      case "order_confirmed":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/40">Confirmed</span>;
      case "preparing":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/40">Preparing</span>;
      case "ready_for_pickup":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">Ready For Pickup</span>;
      case "out_for_delivery":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">Out For Delivery</span>;
      case "delivered":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">Delivered</span>;
      case "cancelled":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-500/20 text-stone-400">{status}</span>;
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Paid</span>;
      case "cod_collected":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">COD Collected</span>;
      case "cod_pending":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">COD Due</span>;
      case "pending":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-500/20 text-stone-400 border border-stone-500/30">Pending</span>;
      case "refunded":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">Refunded</span>;
      case "failed":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">Failed</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-500/20 text-stone-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Executive Order Desk
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Culinary Order Management
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time control over patron orders, kitchen dispatch stages, courier assignments, and delivery confirmations.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/80 text-foreground hover:bg-secondary/60 transition-colors text-xs font-semibold w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Status Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { key: "all", label: "All Orders", count: counts.all, color: "text-foreground" },
          { key: "order_placed", label: "Placed", count: counts.placed, color: "text-amber-400" },
          { key: "order_confirmed", label: "Confirmed", count: counts.confirmed, color: "text-blue-400" },
          { key: "preparing", label: "Preparing", count: counts.preparing, color: "text-orange-400" },
          { key: "ready_for_pickup", label: "Ready", count: counts.ready, color: "text-cyan-400" },
          { key: "out_for_delivery", label: "In Transit", count: counts.out, color: "text-indigo-400" },
          { key: "delivered", label: "Delivered", count: counts.delivered, color: "text-emerald-400" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key)}
            className={`p-3 rounded-2xl glass-card text-left transition-all border ${
              statusFilter === item.key
                ? "border-amber-400 bg-amber-500/10 shadow-md"
                : "border-border/60 hover:border-border"
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {item.label}
            </div>
            <div className={`font-serif text-xl font-bold mt-1 ${item.color}`}>
              {item.count}
            </div>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-border/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID (ORD-2026-XXXX), Patron name, phone, item..."
            className="w-full pl-10 pr-4 py-2.5 bg-background/60 border border-border/80 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-background/60 border border-border/80 rounded-xl text-xs text-foreground focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Order Statuses</option>
            <option value="order_placed">Placed</option>
            <option value="order_confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2.5 bg-background/60 border border-border/80 rounded-xl text-xs text-foreground focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="cod_collected">COD Collected</option>
            <option value="cod_pending">COD Due</option>
            <option value="pending">Pending</option>
            <option value="cod">Cash on Delivery</option>
            <option value="upi">UPI</option>
            <option value="google_pay">Google Pay</option>
            <option value="phonepe">PhonePe</option>
            <option value="paytm">Paytm</option>
            <option value="card">Card</option>
            <option value="net_banking">Net Banking</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "highest" | "lowest")}
            className="px-3 py-2.5 bg-background/60 border border-border/80 rounded-xl text-xs text-foreground focus:outline-none focus:border-amber-400"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Orders Table (Requirement 9 Columns) */}
      <div className="glass-card rounded-3xl border border-border/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="font-serif text-lg font-bold text-foreground">No Orders Found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                No culinary orders matched your search criteria or status filter.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-secondary/40 text-muted-foreground border-b border-border/80 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 font-semibold">Order ID</th>
                  <th className="py-3.5 px-4 font-semibold">Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Phone</th>
                  <th className="py-3.5 px-4 font-semibold">Order Date</th>
                  <th className="py-3.5 px-4 font-semibold">Items</th>
                  <th className="py-3.5 px-4 font-semibold">Amount</th>
                  <th className="py-3.5 px-4 font-semibold">Payment</th>
                  <th className="py-3.5 px-4 font-semibold">Order Status</th>
                  <th className="py-3.5 px-4 font-semibold">Delivery Person</th>
                  <th className="py-3.5 px-4 font-semibold">Delivery Recipient</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    {/* 1. Order ID */}
                    <td className="py-4 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                      {order.order_number}
                    </td>

                    {/* 2. Customer */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-foreground whitespace-nowrap">
                        {order.customer_name}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                        {order.customer_email}
                      </div>
                    </td>

                    {/* 3. Phone */}
                    <td className="py-4 px-4 text-foreground font-mono text-[11px] whitespace-nowrap">
                      {order.customer_phone}
                    </td>

                    {/* 4. Order Date */}
                    <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>

                    {/* 5. Items */}
                    <td className="py-4 px-4">
                      <div className="text-foreground font-medium max-w-[170px] truncate">
                        {order.items.map((it) => `${it.quantity}x ${it.dish_name}`).join(", ")}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {order.items.reduce((sum, it) => sum + it.quantity, 0)} items total
                      </div>
                    </td>

                    {/* 6. Amount */}
                    <td className="py-4 px-4 font-bold text-foreground whitespace-nowrap">
                      ₹{order.total_amount.toLocaleString("en-IN")}
                    </td>

                    {/* 7. Payment Method & Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {order.payment.payment_method.toUpperCase().replace(/_/g, " ")}
                      </div>
                      <div className="mt-1">{getPaymentStatusBadge(order.payment.payment_status)}</div>
                    </td>

                    {/* 8. Order Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getStatusBadge(order.order_status)}
                    </td>

                    {/* 9. Delivery Person */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {order.delivery_assignment?.delivery_person_name ? (
                        <div>
                          <div className="font-medium text-foreground flex items-center gap-1">
                            <Truck className="w-3 h-3 text-amber-400" />
                            <span>{order.delivery_assignment.delivery_person_name}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {order.delivery_assignment.delivery_person_phone}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-amber-400/80 italic">Unassigned</span>
                          <button
                            onClick={() => openOrderModal(order)}
                            className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors font-semibold"
                          >
                            Assign
                          </button>
                        </div>
                      )}
                    </td>

                    {/* 10. Delivery Recipient (Compulsory Requirement 12) */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {order.delivery_recipient?.receiver_name ? (
                        <div>
                          <div className="font-semibold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{order.delivery_recipient.receiver_name}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {order.delivery_recipient.delivery_time}, {order.delivery_recipient.delivery_date}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">
                          Pending delivery
                        </span>
                      )}
                    </td>

                    {/* 11. Actions */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openOrderModal(order)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-stone-950 font-semibold border border-amber-500/30 transition-all flex items-center gap-1.5 ml-auto shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* DETAILED ADMIN ORDER MODAL (Requirement 20) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8 bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden text-card-foreground">
            {/* Modal Header */}
            <div className="p-6 bg-secondary/50 border-b border-border/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Order Administration
                  </span>
                  <span className="font-mono text-sm font-bold text-foreground">
                    #{selectedOrder.order_number}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Placed on {formatDate(selectedOrder.created_at)}
                </p>
              </div>

              <button
                onClick={closeOrderModal}
                className="w-8 h-8 rounded-full bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Stepper overview */}
              <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Current Workflow Stage
                </div>
                <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
                  {ORDER_STATUS_STEPS.map((step, idx) => {
                    const currentIdx = ORDER_STATUS_STEPS.findIndex((s) => s.key === selectedOrder.order_status);
                    const isDone = currentIdx >= idx;
                    const isCurrent = selectedOrder.order_status === step.key;

                    return (
                      <div key={step.key} className="flex items-center gap-1 shrink-0">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isCurrent
                              ? "bg-amber-500 text-stone-950 ring-2 ring-amber-400/50"
                              : isDone
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                        </div>
                        <span
                          className={`text-[11px] font-semibold ${
                            isCurrent
                              ? "text-amber-400"
                              : isDone
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </span>
                        {idx < ORDER_STATUS_STEPS.length - 1 && (
                          <div className="w-4 h-[1px] bg-border mx-1" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid: Customer Info & Delivery Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer */}
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Customer Information</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-foreground">{selectedOrder.customer_name}</div>
                    <div className="text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3 text-amber-400" />
                      <span>{selectedOrder.customer_phone}</span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3 text-amber-400" />
                      <span>{selectedOrder.customer_email}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Delivery Address</span>
                  </div>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p className="text-foreground font-medium">
                      {selectedOrder.delivery_address.house_number}, {selectedOrder.delivery_address.street}
                    </p>
                    <p>
                      {selectedOrder.delivery_address.area}, {selectedOrder.delivery_address.city} - {selectedOrder.delivery_address.pincode}
                    </p>
                    {selectedOrder.delivery_address.landmark && (
                      <p className="text-[11px] text-amber-300">
                        Landmark: {selectedOrder.delivery_address.landmark}
                      </p>
                    )}
                    {selectedOrder.delivery_address.delivery_instructions && (
                      <p className="text-[11px] italic bg-muted/40 p-1.5 rounded-lg border border-border/40">
                        &quot;{selectedOrder.delivery_address.delivery_instructions}&quot;
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Ordered Dishes & Calculations</span>
                </div>
                <div className="divide-y divide-border/40 text-xs">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-foreground">
                          {item.quantity}x {item.dish_name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          ₹{item.unit_price} each
                        </div>
                      </div>
                      <div className="font-bold text-foreground">
                        ₹{item.subtotal.toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-border/60 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span>{selectedOrder.delivery_fee === 0 ? "FREE" : `₹${selectedOrder.delivery_fee}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (5%):</span>
                    <span>₹{selectedOrder.tax.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border text-foreground font-bold text-sm">
                    <span>Grand Total:</span>
                    <span className="text-amber-400">₹{selectedOrder.total_amount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Action Section: Update Status & Logistics */}
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Edit className="w-3.5 h-3.5" />
                  <span>Update Order Workflow & Dispatch Controls</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">
                      Change Order Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-amber-400"
                    >
                      <option value="order_placed">1. Order Placed</option>
                      <option value="order_confirmed">2. Order Confirmed</option>
                      <option value="preparing">3. Preparing</option>
                      <option value="ready_for_pickup">4. Ready for Pickup</option>
                      <option value="out_for_delivery">5. Out for Delivery</option>
                      <option value="delivered">6. Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Assign Delivery Courier (Requirement 11) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">
                      Assign Delivery Person
                    </label>
                    <select
                      value={selectedCourierId}
                      onChange={(e) => setSelectedCourierId(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-amber-400"
                    >
                      <option value="">Select a courier partner...</option>
                      {couriers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone}) - {c.status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Payment Status Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">
                      Payment Status ({selectedOrder.payment.payment_method.toUpperCase()})
                    </label>
                    <select
                      value={newPaymentStatus}
                      onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-amber-400"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="cod_pending">COD Pending</option>
                      <option value="cod_collected">COD Collected</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">
                      Internal Logistics Notes
                    </label>
                    <input
                      type="text"
                      value={courierNotes}
                      onChange={(e) => setCourierNotes(e.target.value)}
                      placeholder="e.g., Deliver through service gate 2"
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* COMPULSORY: WHO RECEIVED THE DELIVERY (Requirement 12) */}
                {(newStatus === "delivered" || selectedOrder.order_status === "delivered") && (
                  <div className="p-4 rounded-xl bg-card border border-emerald-500/40 space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Compulsory: Delivery Recipient Verification
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Record the exact identity of the patron or representative who accepted physical delivery of the package.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-foreground mb-1">
                          Receiver Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={receiverName}
                          onChange={(e) => setReceiverName(e.target.value)}
                          placeholder="e.g. Muskan Sharma"
                          className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-foreground mb-1">
                          Receiver Contact Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          value={receiverPhone}
                          onChange={(e) => setReceiverPhone(e.target.value)}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-foreground mb-1">
                        Delivery Handover Notes
                      </label>
                      <input
                        type="text"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder="e.g. Received in person by customer with seal intact."
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-secondary/50 border-t border-border/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeOrderModal}
                  className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted text-xs font-semibold transition-colors"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(true)}
                  className="px-4 py-2 rounded-xl border border-amber-500/40 hover:bg-amber-500/10 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>View / Print Tax Invoice</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleUpdateStatus}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save All Updates</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Tax Invoice Modal */}
      <InvoiceModal
        order={selectedOrder}
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
      />
    </div>
  );
}
