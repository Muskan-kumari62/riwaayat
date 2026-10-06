"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  CreditCard,
  Truck,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Building2,
  Lock,
  Sparkles,
  QrCode,
  Banknote,
  Receipt,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { InvoiceModal } from "@/components/modals/invoice-modal";
import { useAuth } from "@/lib/auth/auth-context";
import { useCart } from "@/lib/cart/cart-context";
import { useToast } from "@/lib/toast/toast-context";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/utils";
import { PaymentMethod, Order } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
    subtotal,
    deliveryFee,
    discount,
    appliedPromo,
    cookingInstructions,
    tax,
    grandTotal,
    clearCart,
  } = useCart();
  const { success, error } = useToast();

  // Customer Information
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "+91 ");
  const [email, setEmail] = useState(user?.email || "");

  // Delivery Address
  const [houseNumber, setHouseNumber] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [stateName, setStateName] = useState("Maharashtra");
  const [pincode, setPincode] = useState("400001");
  const [landmark, setLandmark] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  // Payment Selection
  const [paymentType, setPaymentType] = useState<"cod" | "online">("online");
  const [onlineMethod, setOnlineMethod] = useState<
    "upi" | "gpay" | "phonepe" | "paytm" | "card" | "netbanking"
  >("upi");

  // Online Payment Specific Fields
  const [upiId, setUpiId] = useState("patron@okhdfcbank");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8910");
  const [cardExpiry, setCardExpiry] = useState("08/28");
  const [cardCvv, setCardCvv] = useState("•••");
  const [cardHolder, setCardHolder] = useState(user?.full_name || "Muskan Kumari");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");

  // Submission & Invoice State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Auto-fill existing saved user address & user contact info if available
  useEffect(() => {
    let isMounted = true;
    async function loadUserData() {
      if (user?.id) {
        if (isMounted) {
          setFullName((prev) => (prev ? prev : user.full_name || ""));
          setEmail((prev) => (prev ? prev : user.email || ""));
          setPhone((prev) => (prev && prev !== "+91 " ? prev : user.phone || "+91 "));
        }
        const addresses = await db.getUserAddresses(user.id);
        if (isMounted && addresses.length > 0) {
          const addr = addresses[0];
          setHouseNumber(addr.house_number);
          setStreet(addr.street);
          setArea(addr.area);
          setCity(addr.city);
          setStateName(addr.state);
          setPincode(addr.pincode);
          setLandmark(addr.landmark || "");
          setDeliveryInstructions(addr.delivery_instructions || "");
        }
      }
    }
    loadUserData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      error("Your dining cart is empty. Please add items before checkout.");
      return;
    }

    if (!fullName || !phone || !email) {
      error("Please complete all customer contact information fields.");
      return;
    }

    if (!houseNumber || !street || !area || !city || !pincode) {
      error("Please complete the required delivery address fields.");
      return;
    }

    const selectedPaymentMethod: PaymentMethod =
      paymentType === "cod" ? "cod" : onlineMethod;

    setIsSubmitting(true);
    try {
      const order = await db.createOrder({
        user_id: user?.id,
        customer_name: fullName.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim(),
        delivery_address: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          house_number: houseNumber.trim(),
          street: street.trim(),
          area: area.trim(),
          city: city.trim(),
          state: stateName.trim(),
          pincode: pincode.trim(),
          landmark: landmark.trim(),
          delivery_instructions: deliveryInstructions.trim(),
        },
        items: items.map((i) => ({
          dish_id: i.dish.id,
          quantity: i.quantity,
          portion: i.portion,
          spice_level: i.spice_level,
          addons: i.selected_addons,
          item_notes: i.item_notes,
        })),
        payment_method: selectedPaymentMethod,
        is_simulated: paymentType === "online",
        discount: discount > 0 ? discount : undefined,
        coupon_code: appliedPromo?.code,
        cooking_instructions: cookingInstructions || undefined,
      });

      clearCart();
      setPlacedOrder(order);
      success(`Order placed successfully! Reference: ${order.order_number}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place order. Please try again.";
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order was placed, display rich confirmation view
  if (placedOrder) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="glass-card rounded-3xl p-8 sm:p-12 border border-amber-500/40 shadow-2xl text-center animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-amber-500/15 border-2 border-amber-500/40 flex items-center justify-center mx-auto mb-6 text-amber-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-500 text-stone-950">
              Order Confirmed
            </span>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mt-4">
              Thank You For Your Dining Order!
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto leading-relaxed">
              Your order has been registered in the Riwaayat royal kitchen system. Our master chefs are preparing your course with white-glove packaging.
            </p>

            {/* Order Reference Box */}
            <div className="mt-8 p-6 rounded-2xl bg-secondary/50 border border-border/80 text-left space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/60">
                <div>
                  <span className="text-xs text-muted-foreground">Order Reference:</span>
                  <div className="font-mono text-xl font-bold text-amber-400">
                    {placedOrder.order_number}
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className="text-xs text-muted-foreground">Amount:</span>
                  <div className="font-serif text-xl font-bold text-foreground">
                    {formatINR(placedOrder.total_amount)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">Deliver To:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {placedOrder.delivery_address.house_number},{" "}
                    {placedOrder.delivery_address.street},{" "}
                    {placedOrder.delivery_address.area},{" "}
                    {placedOrder.delivery_address.city} -{" "}
                    {placedOrder.delivery_address.pincode}
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground block">Payment Status:</span>
                  <p className="font-medium text-foreground mt-0.5 flex items-center gap-1.5 capitalize">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        placedOrder.payment.payment_status === "paid"
                          ? "bg-emerald-400"
                          : "bg-amber-400"
                      }`}
                    />
                    {placedOrder.payment.payment_status.replace(/_/g, " ")} (
                    {placedOrder.payment.payment_method.toUpperCase()})
                  </p>
                  <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                    Ref: {placedOrder.payment.transaction_id}
                  </p>
                </div>
              </div>

              {placedOrder.coupon_code && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                  Applied Privilege: <strong>{placedOrder.coupon_code}</strong> (Discount: {formatINR(placedOrder.discount || 0)})
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push("/orders")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>Track Order Live</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowInvoiceModal(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-amber-500/40 hover:bg-amber-500/10 text-amber-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Receipt className="w-4 h-4" />
                <span>View Tax Invoice</span>
              </button>

              <button
                onClick={() => router.push("/categories")}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground border border-border text-xs font-semibold transition-all"
              >
                Continue Dining Menu
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Modal */}
        <InvoiceModal
          order={placedOrder}
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
        />
      </DashboardLayout>
    );
  }

  // If cart is empty, show empty prompt
  if (items.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-secondary/80 border border-border flex items-center justify-center mx-auto mb-6 text-muted-foreground">
            <ShoppingBag className="w-10 h-10 opacity-40" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Your Cart is Empty
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Please select your desired appetizers, artisanal mains, or patisserie items before proceeding to checkout.
          </p>
          <button
            onClick={() => router.push("/categories")}
            className="mt-8 px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md"
          >
            Explore Menu Directory
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-amber-400 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Menu</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Checkout & Delivery Concierge
            </h1>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Priority Dispatch
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Review delivery coordinates, verify temperature-regulated packing, and select payment.
          </p>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form Details (8 Cols) */}
            <div className="lg:col-span-7 space-y-8">
              {/* SECTION A: Customer Information */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-border/80 shadow-xl space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                    A
                  </div>
                  <h2 className="font-serif text-lg font-bold text-foreground">
                    Customer Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="e.g. Vikram Malhotra"
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/70 border border-border text-foreground text-xs focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="+91 98201 44552"
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/70 border border-border text-foreground text-xs focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="patron@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/70 border border-border text-foreground text-xs focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: Delivery Address */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-border/80 shadow-xl space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                    B
                  </div>
                  <h2 className="font-serif text-lg font-bold text-foreground">
                    Delivery Coordinates & Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      House / Flat / Suite No. *
                    </label>
                    <input
                      type="text"
                      value={houseNumber}
                      onChange={(e) => setHouseNumber(e.target.value)}
                      required
                      placeholder="e.g. Penthouse 1402, Tower B"
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/70 border border-border text-foreground text-xs focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Street / Society / Building *
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      required
                      placeholder="e.g. Imperial Heights, Altamount Rd"
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/70 border border-border text-foreground text-xs focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Area / Locality *
                    </label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      required
                      placeholder="e.g. Cumballa Hill / Bandra West"
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/70 border border-border text-foreground text-xs focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      placeholder="Mumbai"
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/70 border border-border text-foreground text-xs focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      required
                      placeholder="Maharashtra"
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/70 border border-border text-foreground text-xs focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      required
                      placeholder="400026"
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/70 border border-border text-foreground text-xs focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Nearby Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Opposite Royal Mumbai Yacht Club"
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/70 border border-border text-foreground text-xs focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Special Delivery Instructions (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="e.g. Ring doorbell twice. Leave thermal carrier with private concierge if in a business conference."
                      className="w-full px-4 py-2 rounded-xl bg-secondary/70 border border-border text-foreground text-xs focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION D: Payment Method Selection */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-border/80 shadow-xl space-y-6">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                    D
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-foreground">
                      Payment Method Selection
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Select your preferred settlement method
                    </p>
                  </div>
                </div>

                {/* Main Choice: COD vs Online Payment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: Cash on Delivery */}
                  <label
                    className={`relative p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      paymentType === "cod"
                        ? "border-amber-500 bg-amber-500/10 shadow-md ring-1 ring-amber-500/40"
                        : "border-border/80 bg-secondary/40 hover:border-border hover:bg-secondary/70"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentType"
                          checked={paymentType === "cod"}
                          onChange={() => setPaymentType("cod")}
                          className="text-amber-500 focus:ring-amber-400 w-4 h-4 mt-0.5"
                        />
                        <div>
                          <div className="font-serif font-bold text-sm text-foreground flex items-center gap-1.5">
                            <Banknote className="w-4 h-4 text-amber-400" />
                            Cash on Delivery (COD)
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            Pay in cash or instant QR upon food delivery.
                          </p>
                        </div>
                      </div>
                    </div>
                    <span className="mt-3 text-[10px] uppercase font-bold tracking-wider text-amber-400">
                      Status: COD Pending
                    </span>
                  </label>

                  {/* Option 2: Online Payment */}
                  <label
                    className={`relative p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      paymentType === "online"
                        ? "border-amber-500 bg-amber-500/10 shadow-md ring-1 ring-amber-500/40"
                        : "border-border/80 bg-secondary/40 hover:border-border hover:bg-secondary/70"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentType"
                          checked={paymentType === "online"}
                          onChange={() => setPaymentType("online")}
                          className="text-amber-500 focus:ring-amber-400 w-4 h-4 mt-0.5"
                        />
                        <div>
                          <div className="font-serif font-bold text-sm text-foreground flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-amber-400" />
                            Online Payment
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            UPI, Google Pay, PhonePe, Cards & Net Banking.
                          </p>
                        </div>
                      </div>
                    </div>
                    <span className="mt-3 text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Encrypted Instant Clearance
                    </span>
                  </label>
                </div>

                {/* If Online Payment is selected, display compulsory detailed options */}
                {paymentType === "online" && (
                  <div className="p-5 rounded-2xl bg-secondary/30 border border-amber-500/20 space-y-5 animate-slide-up">
                    <span className="text-xs font-bold text-foreground block">
                      Choose Your Online Channel:
                    </span>

                    {/* Sub-channel Radio Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: "upi", label: "UPI ID / VPA", icon: QrCode },
                        { id: "gpay", label: "Google Pay", icon: Smartphone },
                        { id: "phonepe", label: "PhonePe", icon: Smartphone },
                        { id: "paytm", label: "Paytm Wallet", icon: Smartphone },
                        { id: "card", label: "Debit/Credit Card", icon: CreditCard },
                        { id: "netbanking", label: "Net Banking", icon: Building2 },
                      ].map((ch) => {
                        const Icon = ch.icon;
                        const isSelected = onlineMethod === ch.id;
                        return (
                          <button
                            type="button"
                            key={ch.id}
                            onClick={() =>
                              setOnlineMethod(
                                ch.id as
                                  | "upi"
                                  | "gpay"
                                  | "phonepe"
                                  | "paytm"
                                  | "card"
                                  | "netbanking"
                              )
                            }
                            className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                              isSelected
                                ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm"
                                : "bg-card/70 border-border text-muted-foreground hover:border-amber-500/40 hover:text-foreground"
                            }`}
                          >
                            <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="text-xs font-semibold truncate">
                              {ch.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Channel Specific Inputs */}
                    <div className="pt-3 border-t border-border/40">
                      {onlineMethod === "upi" && (
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1">
                            Enter UPI ID / Virtual Payment Address (VPA)
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="username@okhdfcbank"
                              className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs focus:outline-none focus:border-amber-400"
                            />
                            <span className="absolute right-3 top-2.5 text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Supported: BHIM, Google Pay, PhonePe, Paytm, CRED UPI
                          </p>
                        </div>
                      )}

                      {(onlineMethod === "gpay" ||
                        onlineMethod === "phonepe" ||
                        onlineMethod === "paytm") && (
                        <div className="p-4 rounded-xl bg-card border border-border text-xs flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold uppercase">
                              {onlineMethod.slice(0, 3)}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground capitalize">
                                {onlineMethod === "gpay" ? "Google Pay UPI" : onlineMethod} Gateway
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                Fast 1-tap UPI authentication linked to {phone}
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Instant Token
                          </span>
                        </div>
                      )}

                      {onlineMethod === "card" && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">
                              Card Number
                            </label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              placeholder="4532 •••• •••• 8910"
                              className="w-full px-4 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:outline-none focus:border-amber-400"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-foreground mb-1">
                                Expiry (MM/YY)
                              </label>
                              <input
                                type="text"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                placeholder="08/28"
                                className="w-full px-4 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:outline-none focus:border-amber-400"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-foreground mb-1">
                                CVV
                              </label>
                              <input
                                type="password"
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value)}
                                placeholder="•••"
                                maxLength={4}
                                className="w-full px-4 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:outline-none focus:border-amber-400"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">
                              Name on Card
                            </label>
                            <input
                              type="text"
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              placeholder="Full Name as printed on card"
                              className="w-full px-4 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>
                      )}

                      {onlineMethod === "netbanking" && (
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1">
                            Select Financial Institution
                          </label>
                          <select
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs focus:outline-none focus:border-amber-400"
                          >
                            <option value="HDFC Bank">HDFC Bank (Primary)</option>
                            <option value="ICICI Bank">ICICI Bank</option>
                            <option value="State Bank of India">State Bank of India (SBI)</option>
                            <option value="Axis Bank">Axis Bank</option>
                            <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                            <option value="Other Bank">Other Indian Scheduled Bank</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Developer / Demonstration Mode Notice */}
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Academic Demonstration Mode:</strong> Real payment gateways (Razorpay / Stripe) can be attached via production credentials. In this demo, online transactions are securely verified & generated with unique transaction IDs in the database.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary (5 Cols) */}
            <div className="lg:col-span-5">
              <div className="sticky top-28 glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl space-y-6">
                {/* Section C: Order Summary Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-amber-400" />
                    <h2 className="font-serif text-lg font-bold text-foreground">
                      Order Summary
                    </h2>
                  </div>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {items.length} {items.length === 1 ? "Item" : "Items"}
                  </span>
                </div>

                {/* Items List */}
                <div className="max-h-60 overflow-y-auto divide-y divide-border/40 pr-1 space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.dish.id}
                      className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-border">
                          <Image
                            src={item.dish.image_url}
                            alt={item.dish.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-serif font-bold text-foreground line-clamp-1">
                            {item.dish.name}
                          </p>
                          <span className="text-[11px] text-muted-foreground">
                            Qty: {item.quantity} × {formatINR(item.dish.price)}
                          </span>
                        </div>
                      </div>

                      <span className="font-serif font-bold text-amber-400 shrink-0">
                        {formatINR(item.dish.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 border-t border-border/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-semibold text-foreground">
                      {formatINR(subtotal)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-400 font-semibold">
                      <span>Privilege Discount ({appliedPromo?.code}):</span>
                      <span className="font-mono">-{formatINR(discount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-amber-400" />
                      White-Glove Delivery Fee
                    </span>
                    <span
                      className={
                        deliveryFee === 0
                          ? "text-emerald-400 font-semibold"
                          : "text-foreground font-semibold"
                      }
                    >
                      {deliveryFee === 0 ? "FREE (VIP Order)" : formatINR(deliveryFee)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>GST & Hospitality Taxes (5%)</span>
                    <span className="font-semibold text-foreground">
                      {formatINR(tax)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-base">
                    <span className="font-bold text-foreground">Grand Total</span>
                    <span className="font-serif text-2xl font-bold text-amber-400">
                      {formatINR(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-950/60 hover:shadow-amber-900/70 transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        Confirm & Place Order ({formatINR(grandTotal)})
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center text-[10px] text-muted-foreground flex items-center justify-center gap-1.5 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>256-Bit SSL Protection • Certified Fine Dining Kitchen</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
