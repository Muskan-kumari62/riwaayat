"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Dish, CartItem } from "@/types";
import { useToast } from "@/lib/toast/toast-context";

interface PromoCode {
  code: string;
  discountAmount: number;
  description: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (dish: Dish, quantity?: number) => void;
  addToCartWithOptions: (
    dish: Dish,
    options: {
      quantity?: number;
      portion?: "standard" | "royal";
      spice_level?: string;
      selected_addons?: string[];
      item_notes?: string;
      addOnPrice?: number;
    }
  ) => void;
  removeFromCart: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (dishId: string) => number;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  appliedPromo: PromoCode | null;
  applyPromo: (code: string) => { success: boolean; message: string };
  removePromo: () => void;
  cookingInstructions: string;
  setCookingInstructions: (instructions: string) => void;
  tax: number;
  grandTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "riwaayat_shopping_cart";
const PROMO_STORAGE_KEY = "riwaayat_shopping_promo";
const NOTES_STORAGE_KEY = "riwaayat_shopping_notes";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const savedItems = localStorage.getItem(CART_STORAGE_KEY);
      return savedItems ? JSON.parse(savedItems) : [];
    } catch {
      return [];
    }
  });

  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const savedPromo = localStorage.getItem(PROMO_STORAGE_KEY);
      return savedPromo ? JSON.parse(savedPromo) : null;
    } catch {
      return null;
    }
  });

  const [cookingInstructions, setCookingInstructions] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem(NOTES_STORAGE_KEY) || "";
    } catch {
      return "";
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(() => typeof window !== "undefined");
  const { success, info } = useToast();

  useEffect(() => {
    queueMicrotask(() => {
      setIsLoaded(true);
    });
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        if (appliedPromo) {
          localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(appliedPromo));
        } else {
          localStorage.removeItem(PROMO_STORAGE_KEY);
        }
        localStorage.setItem(NOTES_STORAGE_KEY, cookingInstructions);
      } catch (e) {
        console.error("Failed to save cart to storage", e);
      }
    }
  }, [items, appliedPromo, cookingInstructions, isLoaded]);

  const addToCart = (dish: Dish, quantity: number = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.dish.id === dish.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { dish, quantity }];
    });
    success(`"${dish.name}" added to your dining order.`);
  };

  const addToCartWithOptions = (
    dish: Dish,
    options: {
      quantity?: number;
      portion?: "standard" | "royal";
      spice_level?: string;
      selected_addons?: string[];
      item_notes?: string;
      addOnPrice?: number;
    }
  ) => {
    const qty = options.quantity || 1;
    const addOnExtra = options.addOnPrice || 0;
    const isRoyal = options.portion === "royal";
    const adjustedUnitPrice = Math.round(
      (isRoyal ? dish.price * 1.75 : dish.price) + addOnExtra
    );

    const customizedDish: Dish = {
      ...dish,
      price: adjustedUnitPrice,
      name: isRoyal ? `${dish.name} (Royal Platter)` : dish.name,
    };

    setItems((prev) => [
      ...prev,
      {
        dish: customizedDish,
        quantity: qty,
        portion: options.portion || "standard",
        spice_level: options.spice_level,
        selected_addons: options.selected_addons,
        item_notes: options.item_notes,
      },
    ]);

    success(`"${customizedDish.name}" with custom preparation added.`);
  };

  const removeFromCart = (dishId: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.dish.id === dishId);
      if (item) {
        info(`Removed "${item.dish.name}" from your order.`);
      }
      return prev.filter((i) => i.dish.id !== dishId);
    });
  };

  const updateQuantity = (dishId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(dishId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.dish.id === dishId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedPromo(null);
    setCookingInstructions("");
  };

  const getItemQuantity = (dishId: string) => {
    const item = items.find((i) => i.dish.id === dishId);
    return item ? item.quantity : 0;
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.dish.price * item.quantity,
    0
  );

  // Promo code validation & application
  const applyPromo = (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      return { success: false, message: "Please enter a valid coupon code." };
    }

    if (subtotal === 0) {
      return { success: false, message: "Please add dishes before applying coupon." };
    }

    if (code === "RIWAAYAT10") {
      const discountVal = Math.round(subtotal * 0.1);
      const promo = {
        code: "RIWAAYAT10",
        discountAmount: discountVal,
        description: "10% Royal Heritage Courtesy Discount",
      };
      setAppliedPromo(promo);
      success("Coupon RIWAAYAT10 applied! 10% discount deducted.");
      return { success: true, message: "10% discount applied." };
    }

    if (code === "ROYAL150") {
      if (subtotal < 800) {
        return { success: false, message: "ROYAL150 requires a minimum order of ₹800." };
      }
      const promo = {
        code: "ROYAL150",
        discountAmount: 150,
        description: "Flat ₹150 Royal Daawat Privilege",
      };
      setAppliedPromo(promo);
      success("Coupon ROYAL150 applied! ₹150 discount deducted.");
      return { success: true, message: "₹150 discount applied." };
    }

    if (code === "FIRSTORDER") {
      const promo = {
        code: "FIRSTORDER",
        discountAmount: Math.min(subtotal, 100),
        description: "Inaugural Patron Courtesy (₹100 Off)",
      };
      setAppliedPromo(promo);
      success("Coupon FIRSTORDER applied! ₹100 discount deducted.");
      return { success: true, message: "₹100 discount applied." };
    }

    if (code === "FREEDEL") {
      const promo = {
        code: "FREEDEL",
        discountAmount: 99,
        description: "Complimentary Courier Delivery",
      };
      setAppliedPromo(promo);
      success("Coupon FREEDEL applied! Delivery fee waived.");
      return { success: true, message: "Delivery fee waived." };
    }

    return {
      success: false,
      message: "Invalid coupon code. Try RIWAAYAT10 or ROYAL150.",
    };
  };

  const removePromo = () => {
    setAppliedPromo(null);
    info("Coupon removed.");
  };

  // Calculations
  const isFreeDeliveryCoupon = appliedPromo?.code === "FREEDEL";
  const rawDeliveryFee = subtotal === 0 ? 0 : subtotal >= 2000 ? 0 : 99;
  const deliveryFee = isFreeDeliveryCoupon ? 0 : rawDeliveryFee;

  const discount = appliedPromo && !isFreeDeliveryCoupon
    ? Math.min(subtotal, appliedPromo.discountAmount)
    : 0;

  const netSubtotal = Math.max(0, subtotal - discount);
  const tax = Math.round(netSubtotal * 0.05 * 100) / 100; // 5% GST
  const grandTotal = Math.round((netSubtotal + deliveryFee + tax) * 100) / 100;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        addToCartWithOptions,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
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
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
