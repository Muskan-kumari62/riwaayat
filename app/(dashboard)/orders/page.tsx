"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  CheckCircle2,
  Truck,
  RotateCcw,
  XCircle,
  Phone,
  Sparkles,
  ChevronRight,
  X,
  PackageCheck,
  AlertTriangle,
  Receipt,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { InvoiceModal } from "@/components/modals/invoice-modal";
import { useAuth } from "@/lib/auth/auth-context";
import { useCart } from "@/lib/cart/cart-context";
import { useToast } from "@/lib/toast/toast-context";
import { db } from "@/lib/db";
import { formatINR, formatDate } from "@/lib/utils";
import { Order, OrderStatus } from "@/types";

export default function MyOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const { success, error } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Active Order Tracking Modal State
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  // Tax Invoice Modal State
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const handleOpenInvoice = (order: Order) => {
    setSelectedInvoiceOrder(order);
    setShowInvoiceModal(true);
  };

  const handleAdvanceOrder = async (orderId: string) => {
    try {
      const updated = await db.advanceOrderStatus(orderId);
      if (updated) {
        setTrackingOrder(updated);
        const data = await db.getOrders(user?.id);
        setOrders(data);
        success(`Kitchen stage updated to: ${updated.order_status.replace(/_/g, " ").toUpperCase()}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to advance order status.";
      error(msg);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchOrders() {
      setLoading(true);
      const data = await db.getOrders(user?.id);
      if (isMounted) {
        setOrders(data);
        setLoading(false);
      }
    }
    fetchOrders();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      await db.cancelOrder(orderId, "Customer requested cancellation from portal.");
      const data = await db.getOrders(user?.id);
      setOrders(data);
      if (trackingOrder?.id === orderId) {
        const updated = await db.getOrder(orderId);
        setTrackingOrder(updated);
      }
      setCancellingOrderId(null);
      success("Your order has been cancelled successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel order.";
      error(msg);
    }
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      // Find full dish or construct mock
      addToCart(
        {
          id: item.dish_id,
          category_id: "",
          name: item.dish_name,
          description: "",
          price: item.unit_price,
          image_url: item.dish_image || "/images/hero.jpg",
          rating: 4.8,
          is_veg: !!item.is_veg,
          availability: "available",
          created_at: new Date().toISOString(),
        },
        item.quantity
      );
    });
    setIsCartOpen(true);
    success(`Re-added ${order.items.length} dishes to your dining cart.`);
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === "in_progress") {
      return (
        o.order_status !== "delivered" && o.order_status !== "cancelled"
      );
    }
    if (filterStatus === "delivered") return o.order_status === "delivered";
    if (filterStatus === "cancelled") return o.order_status === "cancelled";
    return true;
  });

  const statusSteps: { key: OrderStatus; label: string; desc: string }[] = [
    {
      key: "order_placed",
      label: "Order Placed",
      desc: "Received in kitchen queue",
    },
    {
      key: "order_confirmed",
      label: "Order Confirmed",
      desc: "Executive chef verified",
    },
    {
      key: "preparing",
      label: "Preparing",
      desc: "Artisanal brigade crafting dishes",
    },
    {
      key: "ready_for_pickup",
      label: "Ready for Pickup",
      desc: "Sealed in thermal containers",
    },
    {
      key: "out_for_delivery",
      label: "Out for Delivery",
      desc: "Courier en route with climate pod",
    },
    {
      key: "delivered",
      label: "Delivered",
      desc: "Safely received by patron",
    },
  ];

  const getStepIndex = (status: OrderStatus) => {
    if (status === "cancelled") return -1;
    return statusSteps.findIndex((s) => s.key === status);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Dining Portfolio</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              My Orders & Live Dispatch
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Track live kitchen status, inspect delivery recipient records, and view bills.
            </p>
          </div>

          <button
            onClick={() => router.push("/categories")}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all self-start sm:self-auto"
          >
            <span>Order New Dishes</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pb-6 border-b border-border/60 overflow-x-auto mb-8">
          {[
            { id: "all", label: `All Orders (${orders.length})` },
            {
              id: "in_progress",
              label: `In Progress (${
                orders.filter(
                  (o) =>
                    o.order_status !== "delivered" &&
                    o.order_status !== "cancelled"
                ).length
              })`,
            },
            {
              id: "delivered",
              label: `Delivered (${
                orders.filter((o) => o.order_status === "delivered").length
              })`,
            },
            {
              id: "cancelled",
              label: `Cancelled (${
                orders.filter((o) => o.order_status === "cancelled").length
              })`,
            },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterStatus(pill.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                filterStatus === pill.id
                  ? "bg-amber-500 text-stone-950 border-amber-400 shadow-md"
                  : "bg-secondary/40 text-muted-foreground border-border hover:border-amber-500/40 hover:text-foreground"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Orders Listing */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs text-muted-foreground">Loading your dining order history...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center border border-border/80">
            <div className="w-16 h-16 rounded-full bg-secondary/80 border border-border flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <ShoppingBag className="w-8 h-8 opacity-40" />
            </div>
            <h3 className="font-serif text-lg font-bold text-foreground">
              No orders found in this category
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Explore our culinary directory to experience royal Awadhi gravies, fresh pasta, and Michelin delicacies.
            </p>
            <button
              onClick={() => router.push("/categories")}
              className="mt-6 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider transition-all"
            >
              Browse Cuisine Menu
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const canCancel =
                order.order_status === "order_placed" ||
                order.order_status === "order_confirmed";

              return (
                <div
                  key={order.id}
                  className="glass-card rounded-3xl p-6 sm:p-8 border border-border/80 hover:border-amber-500/30 transition-all shadow-xl space-y-6"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
                        #
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-mono text-base font-bold text-foreground">
                            {order.order_number}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              order.order_status === "delivered"
                                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                                : order.order_status === "cancelled"
                                ? "bg-rose-950/80 text-rose-300 border-rose-500/40"
                                : "bg-amber-950/80 text-amber-300 border-amber-500/40"
                            }`}
                          >
                            {order.order_status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Placed on {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:text-right">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                          Total Amount
                        </span>
                        <span className="font-serif text-lg font-bold text-amber-400">
                          {formatINR(order.total_amount)}
                        </span>
                      </div>

                      <div className="pl-4 border-l border-border/60">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                          Payment
                        </span>
                        <span className="text-xs font-semibold text-foreground uppercase">
                          {order.payment.payment_method} •{" "}
                          <span
                            className={
                              order.payment.payment_status === "paid" ||
                              order.payment.payment_status === "cod_collected"
                                ? "text-emerald-400"
                                : "text-amber-400"
                            }
                          >
                            {order.payment.payment_status.replace(/_/g, " ")}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-secondary/40 border border-border/60 flex items-center gap-3"
                      >
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-border">
                          <Image
                            src={item.dish_image || "/images/hero.jpg"}
                            alt={item.dish_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">
                            {item.dish_name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.quantity} × {formatINR(item.unit_price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Recipient Note (COMPULSORY FEATURE) */}
                  {order.delivery_recipient && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-emerald-300">
                          Received By: {order.delivery_recipient.receiver_name}
                        </span>
                        <span className="text-emerald-400/80 ml-2">
                          ({order.delivery_recipient.delivery_time},{" "}
                          {order.delivery_recipient.delivery_date})
                        </span>
                        {order.delivery_recipient.delivery_notes && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Note: {order.delivery_recipient.delivery_notes}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Delivery Partner Assigned Box */}
                  {order.delivery_assignment?.delivery_person_name &&
                    order.order_status !== "delivered" &&
                    order.order_status !== "cancelled" && (
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <Truck className="w-4 h-4 text-amber-400" />
                          <span>
                            Assigned Courier:{" "}
                            <strong className="text-foreground">
                              {order.delivery_assignment.delivery_person_name}
                            </strong>
                          </span>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">
                          {order.delivery_assignment.delivery_person_phone}
                        </span>
                      </div>
                    )}

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setTrackingOrder(order)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs flex items-center gap-1.5 shadow-md transition-all"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track Order Status</span>
                      </button>

                      <button
                        onClick={() => handleOpenInvoice(order)}
                        className="px-4 py-2 rounded-xl border border-amber-500/40 hover:bg-amber-500/10 text-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Tax Invoice</span>
                      </button>

                      <button
                        onClick={() => handleReorder(order)}
                        className="px-4 py-2 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground border border-border text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        <span>Reorder Items</span>
                      </button>
                    </div>

                    {canCancel && (
                      <button
                        onClick={() => setCancellingOrderId(order.id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 border border-rose-500/30 transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel Order</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CANCELLATION CONFIRMATION MODAL */}
        {cancellingOrderId && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-rose-500/40 shadow-2xl animate-slide-up">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-center text-foreground">
                Cancel Dining Order?
              </h3>
              <p className="text-xs text-muted-foreground text-center mt-2 leading-relaxed">
                Are you sure you wish to cancel this dining order? Our kitchen will halt ingredient prep and any online payment will be refunded.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => setCancellingOrderId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  Keep Order
                </button>
                <button
                  onClick={() => handleCancelOrder(cancellingOrderId)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ORDER TRACKING MODAL (COMPULSORY FEATURE) */}
        {trackingOrder && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="relative glass-card rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-amber-500/40 shadow-2xl animate-slide-up my-8">
              <button
                onClick={() => setTrackingOrder(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title & Ref */}
              <div className="flex items-center gap-3 pb-4 border-b border-border/60">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                    Live Kitchen & Dispatch Tracker
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-foreground">
                    Order {trackingOrder.order_number}
                  </h3>
                </div>
              </div>

              {/* Cancelled Alert Banner if cancelled */}
              {trackingOrder.order_status === "cancelled" ? (
                <div className="my-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 flex items-center gap-3 text-rose-300 text-xs">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="font-bold">This order was cancelled.</span>
                    <p className="text-[11px] text-rose-400/80 mt-0.5">
                      Any associated payments have been refunded to the source account.
                    </p>
                  </div>
                </div>
              ) : (
                /* 6-Step Visual Order Stepper */
                <div className="my-8">
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                    {statusSteps.map((step, idx) => {
                      const currentIdx = getStepIndex(trackingOrder.order_status);
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={step.key} className="relative flex items-start gap-4">
                          {/* Dot / Check Icon */}
                          <div
                            className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                              isCompleted
                                ? "bg-amber-500 text-stone-950 ring-4 ring-amber-500/20 shadow-md"
                                : "bg-secondary border border-border text-muted-foreground"
                            } ${isCurrent ? "scale-125 animate-pulse" : ""}`}
                          >
                            {isCompleted ? "✓" : idx + 1}
                          </div>

                          <div>
                            <h4
                              className={`text-sm font-bold transition-colors ${
                                isCompleted
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              } ${isCurrent ? "text-amber-400" : ""}`}
                            >
                              {step.label}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Delivery Recipient Box (COMPULSORY FEATURE - Requirement 13) */}
              {trackingOrder.delivery_recipient && (
                <div className="mb-6 p-5 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/40 text-xs space-y-2 shadow-lg">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>DELIVERY COMPLETED</span>
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    <span className="text-muted-foreground font-normal">Received By: </span>
                    <span className="text-emerald-300 font-bold">{trackingOrder.delivery_recipient.receiver_name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Received At: </span>
                    {trackingOrder.delivery_recipient.delivery_date}, {trackingOrder.delivery_recipient.delivery_time}
                  </div>
                  {trackingOrder.delivery_recipient.delivery_notes && (
                    <p className="text-[11px] text-stone-300 bg-background/50 p-2.5 rounded-lg border border-border/40 italic">
                      Delivery Note: {trackingOrder.delivery_recipient.delivery_notes}
                    </p>
                  )}
                </div>
              )}

              {/* Courier Information */}
              {trackingOrder.delivery_assignment?.delivery_person_name && (
                <div className="mb-6 p-4 rounded-2xl bg-secondary/50 border border-border text-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Assigned Courier Partner
                      </span>
                      <span className="font-semibold text-foreground">
                        {trackingOrder.delivery_assignment.delivery_person_name}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`tel:${trackingOrder.delivery_assignment.delivery_person_phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/10 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Courier</span>
                  </a>
                </div>
              )}

              {/* Delivery Destination */}
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Delivery Destination
                </span>
                <p className="font-medium text-foreground">
                  {trackingOrder.delivery_address.full_name} • {trackingOrder.delivery_address.phone}
                </p>
                <p className="text-muted-foreground">
                  {trackingOrder.delivery_address.house_number}, {trackingOrder.delivery_address.street}, {trackingOrder.delivery_address.area}, {trackingOrder.delivery_address.city} - {trackingOrder.delivery_address.pincode}
                </p>
              </div>

              {/* Modal Actions */}
              <div className="mt-8 pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {trackingOrder.order_status !== "delivered" && trackingOrder.order_status !== "cancelled" && (
                    <button
                      onClick={() => handleAdvanceOrder(trackingOrder.id)}
                      className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Simulate Next Stage</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenInvoice(trackingOrder)}
                    className="px-4 py-2 rounded-xl border border-border hover:bg-secondary text-foreground text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Receipt className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Tax Invoice</span>
                  </button>
                </div>

                <button
                  onClick={() => setTrackingOrder(null)}
                  className="px-6 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold transition-colors"
                >
                  Close Tracker
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tax Invoice Modal */}
        <InvoiceModal
          order={selectedInvoiceOrder}
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
        />
      </div>
    </DashboardLayout>
  );
}
