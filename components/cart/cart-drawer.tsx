"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { formatINR } from "@/lib/utils";

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
    deliveryFee,
    discount,
    appliedPromo,
    applyPromo,
    removePromo,
    cookingInstructions,
    setCookingInstructions,
    tax,
    grandTotal,
  } = useCart();

  const [promoInput, setPromoInput] = React.useState("");
  const [promoError, setPromoError] = React.useState("");

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 2000;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  const handleApplyPromo = (codeToApply?: string) => {
    setPromoError("");
    const targetCode = codeToApply || promoInput;
    if (!targetCode) return;
    const res = applyPromo(targetCode);
    if (res.success) {
      setPromoInput("");
    } else {
      setPromoError(res.message);
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md glass-card bg-stone-950/95 border-l border-amber-500/30 flex flex-col shadow-2xl animate-slide-up">
          {/* Header */}
          <div className="p-6 border-b border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-foreground">
                  Your Dining Cart
                </h2>
                <p className="text-xs text-muted-foreground">
                  {totalItems} {totalItems === 1 ? "dish" : "dishes"} selected
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              aria-label="Close dining cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Delivery Threshold Progress */}
          {items.length > 0 && (
            <div className="px-6 py-3 bg-secondary/40 border-b border-border/60">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  {amountNeededForFreeDelivery > 0 ? (
                    <>
                      Add{" "}
                      <strong className="text-amber-400">
                        {formatINR(amountNeededForFreeDelivery)}
                      </strong>{" "}
                      for Free Delivery
                    </>
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Complimentary VIP Delivery Unlocked!
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {Math.round(freeDeliveryProgress)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                  style={{ width: `${freeDeliveryProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-secondary/80 border border-border flex items-center justify-center text-muted-foreground mb-4">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Your cart is empty
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Discover our chef&apos;s signature Awadhi curries, clay-oven tandoor rotis, and royal desserts.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/categories");
                  }}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              <>
                {items.map((item) => (
                  <div
                    key={item.dish.id}
                    className="p-4 rounded-2xl bg-secondary/40 border border-border/80 flex gap-3.5 transition-all hover:border-amber-500/30"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-border">
                      <Image
                        src={item.dish.image_url}
                        alt={item.dish.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-1 left-1">
                        <span
                          className={`w-2 h-2 rounded-full inline-block ${
                            item.dish.is_veg ? "bg-emerald-400" : "bg-rose-500"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Info & Quantity */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-serif text-sm font-bold text-foreground line-clamp-1">
                            {item.dish.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.dish.id)}
                            className="text-muted-foreground hover:text-rose-400 transition-colors p-1"
                            aria-label={`Remove ${item.dish.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Customization Details */}
                        {(item.portion || item.spice_level || item.item_notes) && (
                          <div className="text-[10px] text-stone-400 space-y-0.5 mt-0.5">
                            {item.portion && (
                              <span className="capitalize text-amber-300/90 font-medium">
                                {item.portion} portion •{" "}
                              </span>
                            )}
                            {item.spice_level && (
                              <span>Spice: {item.spice_level}</span>
                            )}
                            {item.item_notes && (
                              <p className="italic text-stone-500 line-clamp-1">
                                Note: {item.item_notes}
                              </p>
                            )}
                          </div>
                        )}

                        <span className="text-xs text-amber-400 font-semibold mt-1 inline-block">
                          {formatINR(item.dish.price)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {/* Counter */}
                        <div className="flex items-center border border-border rounded-lg bg-card/80">
                          <button
                            onClick={() =>
                              updateQuantity(item.dish.id, item.quantity - 1)
                            }
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.dish.id, item.quantity + 1)
                            }
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <span className="text-xs font-serif font-bold text-foreground">
                          {formatINR(item.dish.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Promo Code Box */}
                <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/80 space-y-2">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Royal Privileges & Promo Code</span>
                  </span>

                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs">
                      <div>
                        <span className="font-bold text-amber-300">
                          {appliedPromo.code}
                        </span>
                        <p className="text-[10px] text-stone-300">
                          {appliedPromo.description}
                        </p>
                      </div>
                      <button
                        onClick={removePromo}
                        className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 px-2 py-1 rounded-md border border-rose-500/30 hover:bg-rose-950/40"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => {
                            setPromoInput(e.target.value);
                            setPromoError("");
                          }}
                          placeholder="e.g. RIWAAYAT10"
                          className="flex-1 px-3 py-1.5 rounded-xl bg-card border border-border text-xs text-foreground uppercase placeholder:text-muted-foreground focus:outline-none focus:border-amber-400"
                        />
                        <button
                          onClick={() => handleApplyPromo()}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase transition-all"
                        >
                          Apply
                        </button>
                      </div>

                      {promoError && (
                        <p className="text-[10px] text-rose-400 mt-1">
                          {promoError}
                        </p>
                      )}

                      {/* Quick suggestions */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {["RIWAAYAT10", "ROYAL150", "FREEDEL"].map((code) => (
                          <button
                            key={code}
                            onClick={() => handleApplyPromo(code)}
                            className="text-[9px] px-2 py-0.5 rounded-full border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition-colors"
                          >
                            +{code}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Special Instructions */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground block">
                    Kitchen / Cooking Instructions
                  </label>
                  <textarea
                    value={cookingInstructions}
                    onChange={(e) => setCookingInstructions(e.target.value)}
                    placeholder="e.g. Extra mint chutney, less spicy dal, no disposable cutlery..."
                    rows={2}
                    className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-border/80 bg-secondary/30 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-foreground">
                    {formatINR(subtotal)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400 font-semibold">
                    <span>
                      Privilege Discount ({appliedPromo?.code || "Promo"})
                    </span>
                    <span>-{formatINR(discount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span
                    className={
                      deliveryFee === 0
                        ? "text-emerald-400 font-semibold"
                        : "text-foreground font-semibold"
                    }
                  >
                    {deliveryFee === 0 ? "FREE" : formatINR(deliveryFee)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <span>GST & Hospitality Taxes (5%)</span>
                  <span className="font-semibold text-foreground">
                    {formatINR(tax)}
                  </span>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-sm">
                  <span className="font-bold text-foreground">Grand Total</span>
                  <span className="font-serif text-lg font-bold text-amber-400">
                    {formatINR(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 hover:shadow-amber-900/60 transition-all duration-300"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-muted-foreground hover:text-rose-400 transition-colors"
                  >
                    Clear Order
                  </button>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    Verified Kitchen Pricing
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
