"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Truck,
  Search,
  CheckCircle2,
  Edit,
  X,
  RefreshCw,
  Check,
  Navigation,
  MapPin,
} from "lucide-react";
import { db } from "@/lib/db";
import {
  Order,
  DeliveryPerson,
  DeliveryStatus,
} from "@/types";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/lib/toast/toast-context";
import { useAuth } from "@/lib/auth/auth-context";


export default function AdminDeliveryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [couriers, setCouriers] = useState<DeliveryPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courierFilter, setCourierFilter] = useState<string>("all");

  // Modal states for updating delivery & recording receiver
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newDeliveryStatus, setNewDeliveryStatus] = useState<DeliveryStatus>("assigned");
  const [assignedCourierId, setAssignedCourierId] = useState<string>("");
  const [deliveryNotes, setDeliveryNotes] = useState<string>("");

  // Receiver Form (Compulsory Requirement 12)
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverNotes, setReceiverNotes] = useState("");

  const { user, isDeliveryPerson, isAdmin } = useAuth();
  const { success, error } = useToast();

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
        if (isMounted) {
          error("Failed to load delivery dispatch records.");
        }
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
  }, [error]);

  const openDeliveryModal = (order: Order) => {
    setSelectedOrder(order);
    setNewDeliveryStatus(order.delivery_assignment?.delivery_status || "unassigned");
    setAssignedCourierId(order.delivery_assignment?.delivery_person_id || "");
    setDeliveryNotes(order.delivery_assignment?.delivery_notes || "");
    setReceiverName(order.delivery_recipient?.receiver_name || order.customer_name || "");
    setReceiverPhone(order.delivery_recipient?.receiver_phone || order.customer_phone || "");
    setReceiverNotes(order.delivery_recipient?.delivery_notes || "");
  };

  const closeDeliveryModal = () => {
    setSelectedOrder(null);
  };

  // Submit changes
  const handleSaveDeliveryUpdate = async () => {
    if (!selectedOrder) return;
    try {
      // If marking as delivered, receiver name is compulsory
      if (newDeliveryStatus === "delivered" && !receiverName.trim()) {
        error("Compulsory: Please enter the name of the person who received the delivery.");
        return;
      }

      // Assign courier if changed
      if (assignedCourierId && assignedCourierId !== selectedOrder.delivery_assignment?.delivery_person_id) {
        await db.assignDeliveryPerson(selectedOrder.id, assignedCourierId, deliveryNotes);
      }

      // Update delivery status
      if (newDeliveryStatus !== (selectedOrder.delivery_assignment?.delivery_status || "unassigned")) {
        await db.updateDeliveryStatus(selectedOrder.id, newDeliveryStatus, deliveryNotes);
      }

      // Record recipient if delivered
      if (newDeliveryStatus === "delivered" && receiverName.trim()) {
        await db.recordDeliveryRecipient(selectedOrder.id, {
          receiver_name: receiverName.trim(),
          receiver_phone: receiverPhone.trim() || undefined,
          delivery_notes: receiverNotes.trim() || deliveryNotes.trim() || undefined,
        });
      }

      success(`Delivery dispatch for order #${selectedOrder.order_number} successfully updated.`);
      const [allOrders, allCouriers] = await Promise.all([
        db.getOrders(),
        db.getDeliveryPersons(),
      ]);
      setOrders(allOrders);
      setCouriers(allCouriers);
      closeDeliveryModal();
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Failed to save delivery updates.";
      error(msg);
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // If user is delivery_person and not admin, only show orders assigned to them or unassigned
      if (isDeliveryPerson && !isAdmin) {
        const assignedName = order.delivery_assignment?.delivery_person_name?.toLowerCase();
        const userName = user?.full_name?.toLowerCase();
        if (assignedName && userName && !assignedName.includes(userName) && !userName.includes(assignedName)) {
          return false;
        }
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.order_number.toLowerCase().includes(q) ||
        order.customer_name.toLowerCase().includes(q) ||
        order.customer_phone.toLowerCase().includes(q) ||
        order.delivery_address.city.toLowerCase().includes(q) ||
        order.delivery_address.street.toLowerCase().includes(q) ||
        order.delivery_assignment?.delivery_person_name?.toLowerCase().includes(q) ||
        order.delivery_recipient?.receiver_name?.toLowerCase().includes(q);

      const currentDelStatus = order.delivery_assignment?.delivery_status || "unassigned";
      const matchesStatus =
        statusFilter === "all" || currentDelStatus === statusFilter;

      const matchesCourier =
        courierFilter === "all" ||
        order.delivery_assignment?.delivery_person_id === courierFilter;

      return matchesSearch && matchesStatus && matchesCourier;
    });
  }, [orders, searchQuery, statusFilter, courierFilter, isDeliveryPerson, isAdmin, user]);

  // Delivery status counts
  const counts = useMemo(() => {
    return {
      all: orders.length,
      unassigned: orders.filter((o) => !o.delivery_assignment || o.delivery_assignment.delivery_status === "unassigned").length,
      assigned: orders.filter((o) => o.delivery_assignment?.delivery_status === "assigned").length,
      picked_up: orders.filter((o) => o.delivery_assignment?.delivery_status === "picked_up").length,
      out: orders.filter((o) => o.delivery_assignment?.delivery_status === "out_for_delivery").length,
      delivered: orders.filter((o) => o.delivery_assignment?.delivery_status === "delivered").length,
    };
  }, [orders]);

  const getDeliveryStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case "unassigned":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-500/20 text-stone-400 border border-stone-500/30">Unassigned</span>;
      case "assigned":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">Assigned</span>;
      case "picked_up":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/40">Picked Up</span>;
      case "out_for_delivery":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">In Transit</span>;
      case "delivered":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">Delivered</span>;
      case "failed_delivery":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40">Failed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-500/20 text-stone-400">{status}</span>;
    }
  };

  const handleRefresh = async () => {
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
      error("Failed to load delivery dispatch records.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" />
            Courier Logistics Dispatch
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Delivery Management & Handover Log
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Dispatch fleet assignment, real-time route tracking, and compulsory recipient signature verification.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/80 text-foreground hover:bg-secondary/60 transition-colors text-xs font-semibold w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Fleet</span>
        </button>
      </div>

      {/* Fleet Partner Cards */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-amber-400" />
          <span>Registered Logistics Fleet Partners</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {couriers.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl glass-card border border-border/70 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{c.phone}</div>
                </div>
              </div>

              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  c.status === "available"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : c.status === "busy"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "bg-stone-500/20 text-stone-400"
                }`}
              >
                {c.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {[
          { key: "all", label: "All Dispatches", count: counts.all, color: "text-foreground" },
          { key: "unassigned", label: "Unassigned", count: counts.unassigned, color: "text-stone-400" },
          { key: "assigned", label: "Assigned", count: counts.assigned, color: "text-amber-400" },
          { key: "picked_up", label: "Picked Up", count: counts.picked_up, color: "text-blue-400" },
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
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Customer, Address, Courier, or Receiver..."
            className="w-full pl-10 pr-4 py-2.5 bg-background/60 border border-border/80 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-background/60 border border-border/80 rounded-xl text-xs text-foreground focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Delivery Statuses</option>
            <option value="unassigned">Unassigned</option>
            <option value="assigned">Assigned</option>
            <option value="picked_up">Picked Up</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="failed_delivery">Failed Delivery</option>
          </select>

          <select
            value={courierFilter}
            onChange={(e) => setCourierFilter(e.target.value)}
            className="px-3 py-2.5 bg-background/60 border border-border/80 rounded-xl text-xs text-foreground focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Courier Partners</option>
            {couriers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Delivery Management Table (Requirement 14 Columns) */}
      <div className="glass-card rounded-3xl border border-border/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center">
              <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="font-serif text-lg font-bold text-foreground">No Dispatches Found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                No orders match your delivery status or courier filter.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-secondary/40 text-muted-foreground border-b border-border/80 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 font-semibold">Order ID</th>
                  <th className="py-3.5 px-4 font-semibold">Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Delivery Address</th>
                  <th className="py-3.5 px-4 font-semibold">Delivery Person</th>
                  <th className="py-3.5 px-4 font-semibold">Delivery Status</th>
                  <th className="py-3.5 px-4 font-semibold">Order Status</th>
                  <th className="py-3.5 px-4 font-semibold">Assigned Time</th>
                  <th className="py-3.5 px-4 font-semibold">Delivered Time</th>
                  <th className="py-3.5 px-4 font-semibold">Received By</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredOrders.map((order) => {
                  const del = order.delivery_assignment;
                  const recip = order.delivery_recipient;
                  const currentDelStatus = del?.delivery_status || "unassigned";

                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      {/* 1. Order ID */}
                      <td className="py-4 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                        {order.order_number}
                      </td>

                      {/* 2. Customer */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-foreground">{order.customer_name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {order.customer_phone}
                        </div>
                      </td>

                      {/* 3. Delivery Address */}
                      <td className="py-4 px-4 max-w-[200px]">
                        <div className="text-foreground truncate font-medium">
                          {order.delivery_address.house_number}, {order.delivery_address.street}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {order.delivery_address.area}, {order.delivery_address.city} - {order.delivery_address.pincode}
                        </div>
                      </td>

                      {/* 4. Delivery Person */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {del?.delivery_person_name ? (
                          <div>
                            <div className="font-medium text-foreground flex items-center gap-1">
                              <Truck className="w-3 h-3 text-amber-400" />
                              <span>{del.delivery_person_name}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {del.delivery_person_phone}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-400/80 italic">Unassigned</span>
                        )}
                      </td>

                      {/* 5. Delivery Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {getDeliveryStatusBadge(currentDelStatus)}
                      </td>

                      {/* 6. Order Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                          {order.order_status.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* 7. Assigned Time */}
                      <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">
                        {del?.assigned_at ? formatDate(del.assigned_at) : "—"}
                      </td>

                      {/* 8. Delivered Time */}
                      <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">
                        {del?.delivered_at ? formatDate(del.delivered_at) : "—"}
                      </td>

                      {/* 9. Received By (Compulsory Requirement 12) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {recip?.receiver_name ? (
                          <div>
                            <div className="font-semibold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{recip.receiver_name}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {recip.delivery_time}, {recip.delivery_date}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-[11px]">
                            Pending Handover
                          </span>
                        )}
                      </td>

                      {/* 10. Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => openDeliveryModal(order)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-stone-950 font-semibold border border-amber-500/30 transition-all flex items-center gap-1.5 ml-auto shadow-sm"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Dispatch</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* DISPATCH & HANDOVER MODAL (Requirement 14 Actions) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden text-card-foreground">
            {/* Header */}
            <div className="p-6 bg-secondary/50 border-b border-border/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Logistics Dispatch Station
                </span>
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Order #{selectedOrder.order_number}
                </h3>
              </div>

              <button
                onClick={closeDeliveryModal}
                className="w-8 h-8 rounded-full bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Destination Details */}
              <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Destination & Patron Details</span>
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-foreground">
                    {selectedOrder.customer_name} ({selectedOrder.customer_phone})
                  </p>
                  <p className="text-muted-foreground">
                    {selectedOrder.delivery_address.house_number}, {selectedOrder.delivery_address.street}, {selectedOrder.delivery_address.area}, {selectedOrder.delivery_address.city} - {selectedOrder.delivery_address.pincode}
                  </p>
                  {selectedOrder.delivery_address.landmark && (
                    <p className="text-amber-300 text-[11px]">
                      Landmark: {selectedOrder.delivery_address.landmark}
                    </p>
                  )}
                  {selectedOrder.delivery_address.delivery_instructions && (
                    <p className="text-[11px] italic bg-muted/40 p-1.5 rounded-lg border border-border/40">
                      Instructions: {selectedOrder.delivery_address.delivery_instructions}
                    </p>
                  )}
                </div>
              </div>

              {/* Assignment Controls */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Courier Partner */}
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">
                      Assign Courier Partner
                    </label>
                    <select
                      value={assignedCourierId}
                      onChange={(e) => setAssignedCourierId(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-amber-400"
                    >
                      <option value="">Select courier partner...</option>
                      {couriers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone}) - {c.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Delivery Status */}
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">
                      Update Delivery Status
                    </label>
                    <select
                      value={newDeliveryStatus}
                      onChange={(e) => setNewDeliveryStatus(e.target.value as DeliveryStatus)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-amber-400"
                    >
                      <option value="unassigned">Unassigned</option>
                      <option value="assigned">Assigned</option>
                      <option value="picked_up">Picked Up from Kitchen</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered to Patron</option>
                      <option value="failed_delivery">Failed Delivery</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">
                    Logistics / Route Notes
                  </label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Dispatched with thermal bag #4"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* COMPULSORY REQUIREMENT 12: WHO RECEIVED THE DELIVERY */}
              {newDeliveryStatus === "delivered" && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Compulsory Handover Record
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Record who physically took receipt of the order at the delivery address.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-foreground mb-1">
                        Receiver Name *
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
                        Receiver Phone (Optional)
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
                      Handover Notes
                    </label>
                    <input
                      type="text"
                      value={receiverNotes}
                      onChange={(e) => setReceiverNotes(e.target.value)}
                      placeholder="e.g. Handed over at doorstep, verified by OTP/signature."
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-secondary/50 border-t border-border/80 flex items-center justify-between">
              <button
                type="button"
                onClick={closeDeliveryModal}
                className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveDeliveryUpdate}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Dispatch Updates</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
