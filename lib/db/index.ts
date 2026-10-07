"use client";

import {
  Category,
  Dish,
  ServiceItem,
  Testimonial,
  RestaurantInfo,
  NotificationItem,
  SupportRequest,
  ContactMessage,
  UserProfile,
  Reservation,
  UserRole,
  Order,
  OrderItem,
  Payment,
  DeliveryRecipient,
  DeliveryAddress,
  DeliveryPerson,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  DeliveryStatus,
  OrderStats,
} from "@/types";
import {
  initialCategories,
  initialDishes,
  initialServices,
  initialTestimonials,
  initialRestaurantInfo,
  initialNotifications,
  initialSupportRequests,
  initialContactMessages,
  demoUsers,
  initialOrders,
  initialDeliveryPersons,
  initialDeliveryAddresses,
} from "@/lib/supabase/mock-data";
import { createClient } from "@/lib/supabase/client";

// Storage keys for client-side persistence (v4 refreshed with authentic Indian category dish mapping)
const KEYS = {
  CATEGORIES: "riwaayat_v4_categories",
  DISHES: "riwaayat_v4_dishes",
  SERVICES: "riwaayat_v2_services",
  NOTIFICATIONS: "riwaayat_v2_notifications",
  SUPPORT: "riwaayat_v2_support_requests",
  CONTACT: "riwaayat_v2_contact_messages",
  USERS: "riwaayat_v2_users",
  CURRENT_USER: "riwaayat_v2_current_user",
  RESERVATIONS: "riwaayat_v2_reservations",
  RESTAURANT: "riwaayat_v2_restaurant_info",
  ORDERS: "riwaayat_v2_orders",
  DELIVERY_PERSONS: "riwaayat_v2_delivery_persons",
  DELIVERY_ADDRESSES: "riwaayat_v2_delivery_addresses",
};

// Safe localStorage access
function getStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving to localStorage [${key}]`, e);
  }
}

export const db = {
  // ---------------- CATEGORIES ----------------
  async getCategories(): Promise<Category[]> {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });
      if (!error && data && data.length > 0) return data as Category[];
    }
    return getStored<Category[]>(KEYS.CATEGORIES, initialCategories);
  },

  async getCategory(id: string): Promise<Category | null> {
    const categories = await this.getCategories();
    return categories.find((c) => c.id === id) || null;
  },

  async createCategory(
    category: Omit<Category, "id" | "created_at" | "updated_at">
  ): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("categories")
        .insert([newCategory])
        .select()
        .single();
      if (!error && data) return data as Category;
    }

    const current = await this.getCategories();
    const updated = [newCategory, ...current];
    setStored(KEYS.CATEGORIES, updated);
    return newCategory;
  },

  async updateCategory(
    id: string,
    updates: Partial<Category>
  ): Promise<Category | null> {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("categories")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (!error && data) return data as Category;
    }

    const current = await this.getCategories();
    const index = current.findIndex((c) => c.id === id);
    if (index === -1) return null;

    current[index] = {
      ...current[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    setStored(KEYS.CATEGORIES, current);
    return current[index];
  },

  async deleteCategory(id: string): Promise<boolean> {
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (!error) return true;
    }

    const current = await this.getCategories();
    const filtered = current.filter((c) => c.id !== id);
    setStored(KEYS.CATEGORIES, filtered);
    return true;
  },

  // ---------------- DISHES ----------------
  async getDishes(options?: {
    categoryId?: string;
    search?: string;
    isVeg?: boolean;
  }): Promise<Dish[]> {
    const supabase = createClient();
    if (supabase) {
      let query = supabase.from("dishes").select("*");
      if (options?.categoryId && options.categoryId !== "all") {
        query = query.eq("category_id", options.categoryId);
      }
      if (options?.isVeg !== undefined) {
        query = query.eq("is_veg", options.isVeg);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as Dish[];
    }

    let dishes = getStored<Dish[]>(KEYS.DISHES, initialDishes);

    if (options?.categoryId && options.categoryId !== "all") {
      dishes = dishes.filter((d) => d.category_id === options.categoryId);
    }
    if (options?.isVeg !== undefined) {
      dishes = dishes.filter((d) => d.is_veg === options.isVeg);
    }
    if (options?.search && options.search.trim()) {
      const s = options.search.toLowerCase();
      dishes = dishes.filter(
        (d) =>
          d.name.toLowerCase().includes(s) ||
          d.description.toLowerCase().includes(s) ||
          (d.category_name && d.category_name.toLowerCase().includes(s))
      );
    }
    return dishes;
  },

  async getDish(id: string): Promise<Dish | null> {
    const dishes = await this.getDishes();
    return dishes.find((d) => d.id === id) || null;
  },

  // ---------------- SERVICES ----------------
  async getServices(): Promise<ServiceItem[]> {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error && data && data.length > 0) return data as ServiceItem[];
    }
    return getStored<ServiceItem[]>(KEYS.SERVICES, initialServices);
  },

  async getService(id: string): Promise<ServiceItem | null> {
    const services = await this.getServices();
    return services.find((s) => s.id === id || s.slug === id) || null;
  },

  async createService(
    service: Omit<ServiceItem, "id" | "created_at" | "updated_at">
  ): Promise<ServiceItem> {
    const newService: ServiceItem = {
      ...service,
      id: `srv-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("services")
        .insert([newService])
        .select()
        .single();
      if (!error && data) return data as ServiceItem;
    }

    const current = await this.getServices();
    const updated = [...current, newService];
    setStored(KEYS.SERVICES, updated);
    return newService;
  },

  async updateService(
    id: string,
    updates: Partial<ServiceItem>
  ): Promise<ServiceItem | null> {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("services")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (!error && data) return data as ServiceItem;
    }

    const current = await this.getServices();
    const index = current.findIndex((s) => s.id === id);
    if (index === -1) return null;

    current[index] = {
      ...current[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    setStored(KEYS.SERVICES, current);
    return current[index];
  },

  async deleteService(id: string): Promise<boolean> {
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (!error) return true;
    }

    const current = await this.getServices();
    const filtered = current.filter((s) => s.id !== id);
    setStored(KEYS.SERVICES, filtered);
    return true;
  },

  // ---------------- TESTIMONIALS & RESTAURANT INFO ----------------
  async getTestimonials(): Promise<Testimonial[]> {
    return initialTestimonials;
  },

  async getRestaurantInfo(): Promise<RestaurantInfo> {
    return getStored<RestaurantInfo>(KEYS.RESTAURANT, initialRestaurantInfo);
  },

  // ---------------- NOTIFICATIONS ----------------
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    const notifs = getStored<NotificationItem[]>(
      KEYS.NOTIFICATIONS,
      initialNotifications
    );
    if (userId) {
      return notifs.filter((n) => !n.user_id || n.user_id === userId);
    }
    return notifs;
  },

  async createNotification(
    data: Omit<NotificationItem, "id" | "is_read" | "created_at">
  ): Promise<NotificationItem> {
    const newNotif: NotificationItem = {
      ...data,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    const current = await this.getNotifications();
    setStored(KEYS.NOTIFICATIONS, [newNotif, ...current]);
    return newNotif;
  },

  async markNotificationAsRead(id: string): Promise<boolean> {
    const notifs = await this.getNotifications();
    const updated = notifs.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    setStored(KEYS.NOTIFICATIONS, updated);
    return true;
  },

  async markAllNotificationsAsRead(userId?: string): Promise<boolean> {
    const notifs = await this.getNotifications();
    const updated = notifs.map((n) =>
      !userId || n.user_id === userId ? { ...n, is_read: true } : n
    );
    setStored(KEYS.NOTIFICATIONS, updated);
    return true;
  },

  async deleteNotification(id: string): Promise<boolean> {
    const notifs = await this.getNotifications();
    const updated = notifs.filter((n) => n.id !== id);
    setStored(KEYS.NOTIFICATIONS, updated);
    return true;
  },

  // ---------------- CONTACT MESSAGES ----------------
  async getContactMessages(): Promise<ContactMessage[]> {
    return getStored<ContactMessage[]>(KEYS.CONTACT, initialContactMessages);
  },

  async submitContactMessage(
    data: Omit<ContactMessage, "id" | "status" | "created_at">
  ): Promise<ContactMessage> {
    const newMessage: ContactMessage = {
      ...data,
      id: `msg-${Date.now()}`,
      status: "new",
      created_at: new Date().toISOString(),
    };

    const supabase = createClient();
    if (supabase) {
      await supabase.from("contact_messages").insert([newMessage]);
    }

    const current = await this.getContactMessages();
    setStored(KEYS.CONTACT, [newMessage, ...current]);
    return newMessage;
  },

  async updateContactMessageStatus(
    id: string,
    status: "new" | "read" | "replied"
  ): Promise<boolean> {
    const current = await this.getContactMessages();
    const updated = current.map((m) => (m.id === id ? { ...m, status } : m));
    setStored(KEYS.CONTACT, updated);
    return true;
  },

  // ---------------- SUPPORT REQUESTS ----------------
  async getSupportRequests(userId?: string): Promise<SupportRequest[]> {
    const reqs = getStored<SupportRequest[]>(KEYS.SUPPORT, initialSupportRequests);
    if (userId) {
      return reqs.filter((r) => r.user_id === userId);
    }
    return reqs;
  },

  async submitSupportRequest(
    data: Omit<SupportRequest, "id" | "status" | "created_at" | "updated_at">
  ): Promise<SupportRequest> {
    const newReq: SupportRequest = {
      ...data,
      id: `sup-${Date.now()}`,
      status: "open",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const current = await this.getSupportRequests();
    setStored(KEYS.SUPPORT, [newReq, ...current]);
    return newReq;
  },

  async updateSupportRequestStatus(
    id: string,
    status: "open" | "in_progress" | "resolved"
  ): Promise<boolean> {
    const current = await this.getSupportRequests();
    const updated = current.map((r) =>
      r.id === id ? { ...r, status, updated_at: new Date().toISOString() } : r
    );
    setStored(KEYS.SUPPORT, updated);
    return true;
  },

  // ---------------- RESERVATIONS ----------------
  async createReservation(
    data: Omit<Reservation, "id" | "status" | "created_at">
  ): Promise<Reservation> {
    const newReservation: Reservation = {
      ...data,
      id: `res-${Date.now()}`,
      status: "confirmed",
      created_at: new Date().toISOString(),
    };

    const supabase = createClient();
    if (supabase) {
      const isUuid =
        data.user_id &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.user_id);

      const reservationPayload = {
        user_id: isUuid ? data.user_id : null,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        guest_count: data.guest_count,
        booking_date: data.booking_date,
        booking_time: data.booking_time,
        special_requests: data.special_requests || null,
        status: "confirmed",
      };

      const { data: inserted, error: resErr } = await supabase
        .from("reservations")
        .insert([reservationPayload])
        .select()
        .single();

      if (resErr) {
        console.error("Supabase reservation insert error:", resErr);
        throw new Error(`Failed to save reservation to database: ${resErr.message}`);
      }

      if (inserted) {
        newReservation.id = inserted.id;
      }
    }

    const current = getStored<Reservation[]>(KEYS.RESERVATIONS, []);
    setStored(KEYS.RESERVATIONS, [newReservation, ...current]);

    // Also add a confirmation notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      user_id: data.user_id,
      title: "Table Reservation Confirmed!",
      message: `Your table for ${data.guest_count} guests on ${data.booking_date} at ${data.booking_time} has been confirmed.`,
      type: "order",
      is_read: false,
      created_at: new Date().toISOString(),
    };
    const notifs = await this.getNotifications();
    setStored(KEYS.NOTIFICATIONS, [newNotif, ...notifs]);

    return newReservation;
  },

  async getReservations(userId?: string): Promise<Reservation[]> {
    const supabase = createClient();
    if (supabase) {
      let query = supabase.from("reservations").select("*").order("created_at", { ascending: false });
      if (userId) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        if (isUuid) query = query.eq("user_id", userId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as Reservation[];
    }

    const res = getStored<Reservation[]>(KEYS.RESERVATIONS, []);
    if (userId) {
      return res.filter((r) => r.user_id === userId);
    }
    return res;
  },

  // ---------------- USERS & PROFILES ----------------
  async getUsers(): Promise<UserProfile[]> {
    return getStored<UserProfile[]>(KEYS.USERS, demoUsers);
  },

  async getUserProfile(id: string): Promise<UserProfile | null> {
    const users = await this.getUsers();
    return users.find((u) => u.id === id) || null;
  },

  async updateUserProfile(
    id: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    const users = await this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    setStored(KEYS.USERS, users);

    // If current logged-in user, update session as well
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === id) {
      this.setCurrentUser(users[index]);
    }

    return users[index];
  },

  async updateUserRole(id: string, role: UserRole): Promise<boolean> {
    const users = await this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return false;

    users[index].role = role;
    setStored(KEYS.USERS, users);

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === id) {
      currentUser.role = role;
      this.setCurrentUser(currentUser);
    }

    return true;
  },

  // ---------------- AUTH SESSION (CLIENT-SIDE / PERSISTENT) ----------------
  getCurrentUser(): UserProfile | null {
    if (typeof window === "undefined") return null;
    const user = getStored<UserProfile | null>(KEYS.CURRENT_USER, demoUsers[0]);
    if (user && (user.full_name === "Vikram Malhotra" || user.email === "user@riwaayat.com")) {
      user.full_name = "Muskan Kumari";
      user.email = "muskan@riwaayat.com";
      this.setCurrentUser(user);
    }
    return user;
  },

  setCurrentUser(user: UserProfile | null): void {
    if (typeof window === "undefined") return;
    if (user) {
      setStored(KEYS.CURRENT_USER, user);
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  },

  // ---------------- FOOD ORDERS ----------------
  async getOrders(userId?: string): Promise<Order[]> {
    const supabase = createClient();
    if (supabase) {
      let query = supabase.from("orders").select("*, order_items(*), payments(*), delivery_assignments(*), delivery_recipients(*)");
      if (userId) query = query.eq("user_id", userId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as Order[];
    }

    const allOrders = getStored<Order[]>(KEYS.ORDERS, initialOrders);
    if (userId) {
      return allOrders.filter((o) => o.user_id === userId);
    }
    return allOrders;
  },

  async getOrder(idOrNumber: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find((o) => o.id === idOrNumber || o.order_number === idOrNumber) || null;
  },

  async createOrder(data: {
    user_id?: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    delivery_address: Omit<DeliveryAddress, "id" | "user_id" | "created_at">;
    items: {
      dish_id: string;
      quantity: number;
      portion?: string;
      spice_level?: string;
      addons?: string[];
      item_notes?: string;
    }[];
    payment_method: PaymentMethod;
    is_simulated?: boolean;
    discount?: number;
    coupon_code?: string;
    cooking_instructions?: string;
  }): Promise<Order> {
    const allDishes = await this.getDishes();
    const existingOrders = await this.getOrders();

    // Verify dishes and compute accurate server subtotal
    const verifiedItems: OrderItem[] = [];
    let computedSubtotal = 0;

    for (const item of data.items) {
      const dish = allDishes.find((d) => d.id === item.dish_id);
      if (dish && dish.availability === "available") {
        const itemSubtotal = dish.price * item.quantity;
        computedSubtotal += itemSubtotal;
        verifiedItems.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          order_id: "",
          dish_id: dish.id,
          dish_name: dish.name,
          dish_image: dish.image_url,
          is_veg: dish.is_veg,
          quantity: item.quantity,
          unit_price: dish.price,
          subtotal: itemSubtotal,
          portion: item.portion,
          spice_level: item.spice_level,
          addons: item.addons,
          item_notes: item.item_notes,
        });
      }
    }

    if (verifiedItems.length === 0) {
      throw new Error("No available menu items found in order payload.");
    }

    const discountAmount = data.discount ? Math.min(computedSubtotal, data.discount) : 0;
    const isFreeDelPromo = data.coupon_code === "FREEDEL";
    const deliveryFee = isFreeDelPromo || computedSubtotal >= 2000 ? 0 : 99;
    const taxableAmount = Math.max(0, computedSubtotal - discountAmount);
    const tax = Math.round(taxableAmount * 0.05 * 100) / 100; // 5% GST
    const totalAmount = Math.round((taxableAmount + deliveryFee + tax) * 100) / 100;

    const orderId = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `ord-${Date.now()}`;
    const orderNumber = `ORD-2026-${String(existingOrders.length + 1).padStart(4, "0")}`;

    verifiedItems.forEach((i) => (i.order_id = orderId));

    const isCod = data.payment_method === "cod";
    const paymentStatus: PaymentStatus = isCod ? "cod_pending" : "paid";
    const transactionId = isCod
      ? `TXN-COD-${Date.now().toString().slice(-6)}`
      : `TXN-${data.payment_method.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      order_id: orderId,
      payment_method: data.payment_method,
      payment_status: paymentStatus,
      transaction_id: transactionId,
      amount: totalAmount,
      paid_at: isCod ? undefined : new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const newAddress: DeliveryAddress = {
      ...data.delivery_address,
      id: `addr-${Date.now()}`,
      user_id: data.user_id || "guest",
      created_at: new Date().toISOString(),
    };

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      user_id: data.user_id || "guest",
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      delivery_address: newAddress,
      items: verifiedItems,
      subtotal: computedSubtotal,
      discount: discountAmount > 0 ? discountAmount : undefined,
      coupon_code: data.coupon_code || undefined,
      delivery_fee: deliveryFee,
      tax: tax,
      total_amount: totalAmount,
      order_status: "order_placed",
      payment: newPayment,
      delivery_assignment: {
        id: `asgn-${Date.now()}`,
        order_id: orderId,
        delivery_person_id: "",
        delivery_status: "unassigned",
        assigned_at: new Date().toISOString(),
      },
      cooking_instructions: data.cooking_instructions || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    if (supabase) {
      const isUserUuid =
        data.user_id &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.user_id);

      const orderPayload = {
        id: orderId,
        order_number: orderNumber,
        user_id: isUserUuid ? data.user_id : null,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        delivery_address: newAddress,
        subtotal: computedSubtotal,
        delivery_fee: deliveryFee,
        tax: tax,
        total_amount: totalAmount,
        order_status: "order_placed",
      };

      const { error: orderErr } = await supabase
        .from("orders")
        .insert([orderPayload]);

      if (orderErr) {
        console.error("Supabase order insert error:", orderErr);
        throw new Error(`Failed to save order to database: ${orderErr.message}`);
      }

      // 1. Insert Order Items
      const orderItemsPayload = verifiedItems.map((item) => {
        const isDishUuid =
          item.dish_id &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.dish_id);
        return {
          order_id: orderId,
          dish_id: isDishUuid ? item.dish_id : null,
          dish_name: item.dish_name,
          dish_image: item.dish_image || null,
          is_veg: item.is_veg,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        };
      });

      const { error: itemsErr } = await supabase
        .from("order_items")
        .insert(orderItemsPayload);

      if (itemsErr) {
        console.error("Supabase order_items insert error:", itemsErr);
      }

      // 2. Insert Payment Record
      const paymentPayload = {
        order_id: orderId,
        payment_method: data.payment_method,
        payment_status: paymentStatus,
        transaction_id: transactionId,
        amount: totalAmount,
        paid_at: isCod ? null : new Date().toISOString(),
      };

      const { error: payErr } = await supabase
        .from("payments")
        .insert([paymentPayload]);

      if (payErr) {
        console.error("Supabase payments insert error:", payErr);
      }
    }

    const updatedOrders = [newOrder, ...existingOrders];
    setStored(KEYS.ORDERS, updatedOrders);

    // Persist address if user logged in
    if (data.user_id) {
      await this.saveUserAddress(data.user_id, data.delivery_address);
    }

    // Auto-create confirmation notification for customer
    if (data.user_id) {
      await this.createNotification({
        user_id: data.user_id,
        title: `Order Placed: ${orderNumber}`,
        message: `Your fine dining order of ${verifiedItems.length} items (Total: ₹${totalAmount.toLocaleString('en-IN')}) has been received by Riwaayat royal kitchen brigade.`,
        type: "order",
      });
    }

    return newOrder;
  },

  async advanceOrderStatus(orderId: string): Promise<Order | null> {
    const orders = await this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.order_number === orderId);
    if (index === -1) return null;

    const order = orders[index];
    const orderProgression: OrderStatus[] = [
      "order_placed",
      "order_confirmed",
      "preparing",
      "ready_for_pickup",
      "out_for_delivery",
      "delivered",
    ];

    const currentIdx = orderProgression.indexOf(order.order_status);
    if (currentIdx === -1 || currentIdx >= orderProgression.length - 1) {
      return order;
    }

    const nextStatus = orderProgression[currentIdx + 1];

    // Ensure courier is assigned by out_for_delivery or delivered
    if (nextStatus === "ready_for_pickup" || nextStatus === "out_for_delivery" || nextStatus === "delivered") {
      if (!order.delivery_assignment || !order.delivery_assignment.delivery_person_id) {
        order.delivery_assignment = {
          id: `asgn-${Date.now()}`,
          order_id: order.id,
          delivery_person_id: "del-01",
          delivery_person_name: "Rahul Sharma",
          delivery_person_phone: "+91 98330 77123",
          delivery_status: nextStatus === "delivered" ? "delivered" : "out_for_delivery",
          assigned_at: new Date().toISOString(),
          picked_up_at: new Date().toISOString(),
          delivery_notes: "Dispatched with thermal seal.",
        };
      }
    }

    // If advancing to delivered, record recipient if not present
    if (nextStatus === "delivered") {
      const now = new Date();
      order.delivery_recipient = {
        id: `recip-${Date.now()}`,
        order_id: order.id,
        receiver_name: order.delivery_recipient?.receiver_name || order.customer_name || "Muskan Kumari",
        receiver_phone: order.customer_phone || "+91 98201 44552",
        delivery_date: now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
        delivery_time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
        received_at: now.toISOString(),
        delivery_notes: "Verified delivery to patron at doorstep.",
        created_at: now.toISOString(),
      };
      if (order.delivery_assignment) {
        order.delivery_assignment.delivery_status = "delivered";
        order.delivery_assignment.delivered_at = now.toISOString();
      }
      if (order.payment.payment_method === "cod") {
        order.payment.payment_status = "cod_collected";
        order.payment.paid_at = now.toISOString();
      }
    }

    order.order_status = nextStatus;
    order.updated_at = new Date().toISOString();
    orders[index] = order;
    setStored(KEYS.ORDERS, orders);

    if (order.user_id) {
      await this.createNotification({
        user_id: order.user_id,
        title: `Order Status: ${nextStatus.replace(/_/g, " ").toUpperCase()}`,
        message: `Order #${order.order_number} is now ${nextStatus.replace(/_/g, " ")}.`,
        type: "order",
      });
    }

    return order;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    const orders = await this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.order_number === orderId);
    if (index === -1) return null;

    const order = orders[index];

    // Backend validation per compulsory business rule 12:
    if (status === "delivered") {
      if (!order.delivery_recipient?.receiver_name?.trim()) {
        throw new Error(
          "Backend Validation Error: An order cannot be marked as Delivered without recording who received the delivery (Receiver Name is mandatory)."
        );
      }
      if (!order.delivery_assignment?.delivery_person_id) {
        throw new Error(
          "Backend Validation Error: A delivery person must be assigned before marking order as Delivered."
        );
      }
    }

    order.order_status = status;
    order.updated_at = new Date().toISOString();

    // Sync delivery assignment status
    if (order.delivery_assignment) {
      if (status === "out_for_delivery") {
        order.delivery_assignment.delivery_status = "out_for_delivery";
        if (!order.delivery_assignment.picked_up_at) {
          order.delivery_assignment.picked_up_at = new Date().toISOString();
        }
      } else if (status === "delivered") {
        order.delivery_assignment.delivery_status = "delivered";
        if (!order.delivery_assignment.delivered_at) {
          order.delivery_assignment.delivered_at = new Date().toISOString();
        }
        if (order.payment.payment_method === "cod" && order.payment.payment_status === "cod_pending") {
          order.payment.payment_status = "cod_collected";
          order.payment.paid_at = new Date().toISOString();
        }
      }
    }

    orders[index] = order;
    setStored(KEYS.ORDERS, orders);

    // Send customer notification on status milestone
    if (order.user_id) {
      const messages: Record<OrderStatus, string> = {
        order_placed: `Your order ${order.order_number} has been received.`,
        order_confirmed: `Your order ${order.order_number} has been confirmed by Executive Kitchen.`,
        preparing: `Chef is currently preparing your artisanal order ${order.order_number}.`,
        ready_for_pickup: `Order ${order.order_number} is packed in thermal containers and ready for courier pickup.`,
        out_for_delivery: `Your order ${order.order_number} is out for delivery with our white-glove courier.`,
        delivered: `Your order ${order.order_number} has been successfully delivered. Bon Appétit!`,
        cancelled: `Your order ${order.order_number} has been cancelled.`,
      };

      await this.createNotification({
        user_id: order.user_id,
        title: `Order Update: ${status.replace(/_/g, " ").toUpperCase()}`,
        message: messages[status] || `Your order status changed to ${status}.`,
        type: "order",
      });
    }

    return order;
  },

  async cancelOrder(orderId: string, reason?: string): Promise<boolean> {
    const orders = await this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.order_number === orderId);
    if (index === -1) return false;

    const order = orders[index];
    if (order.order_status === "delivered" || order.order_status === "out_for_delivery") {
      throw new Error("Orders currently out for delivery or already delivered cannot be cancelled.");
    }

    order.order_status = "cancelled";
    if (order.payment.payment_status === "paid") {
      order.payment.payment_status = "refunded";
    }
    order.updated_at = new Date().toISOString();

    orders[index] = order;
    setStored(KEYS.ORDERS, orders);

    if (order.user_id) {
      await this.createNotification({
        user_id: order.user_id,
        title: `Order Cancelled: ${order.order_number}`,
        message: reason || `Your order ${order.order_number} has been cancelled. Any pre-authorized charges will be refunded.`,
        type: "alert",
      });
    }

    return true;
  },

  // ---------------- DELIVERY MANAGEMENT ----------------
  async getDeliveryPersons(): Promise<DeliveryPerson[]> {
    return getStored<DeliveryPerson[]>(KEYS.DELIVERY_PERSONS, initialDeliveryPersons);
  },

  async assignDeliveryPerson(
    orderId: string,
    deliveryPersonId: string,
    notes?: string
  ): Promise<Order | null> {
    const orders = await this.getOrders();
    const persons = await this.getDeliveryPersons();

    const orderIndex = orders.findIndex((o) => o.id === orderId || o.order_number === orderId);
    if (orderIndex === -1) return null;

    const person = persons.find((p) => p.id === deliveryPersonId);
    if (!person) return null;

    const order = orders[orderIndex];
    order.delivery_assignment = {
      id: `asgn-${Date.now()}`,
      order_id: order.id,
      delivery_person_id: person.id,
      delivery_person_name: person.name,
      delivery_person_phone: person.phone,
      delivery_status: "assigned",
      assigned_at: new Date().toISOString(),
      delivery_notes: notes || "Assigned by executive logistics desk.",
    };

    if (order.order_status === "order_placed" || order.order_status === "order_confirmed") {
      order.order_status = "preparing";
    }
    order.updated_at = new Date().toISOString();

    orders[orderIndex] = order;
    setStored(KEYS.ORDERS, orders);

    return order;
  },

  async updateDeliveryStatus(
    orderId: string,
    status: DeliveryStatus,
    notes?: string
  ): Promise<Order | null> {
    const orders = await this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.order_number === orderId);
    if (index === -1) return null;

    const order = orders[index];
    if (!order.delivery_assignment) {
      order.delivery_assignment = {
        id: `asgn-${Date.now()}`,
        order_id: order.id,
        delivery_person_id: "del-01",
        delivery_person_name: "Rahul Sharma",
        delivery_person_phone: "+91 98330 77123",
        delivery_status: status,
        assigned_at: new Date().toISOString(),
      };
    }

    order.delivery_assignment.delivery_status = status;
    if (notes) order.delivery_assignment.delivery_notes = notes;

    if (status === "picked_up") {
      order.delivery_assignment.picked_up_at = new Date().toISOString();
      order.order_status = "ready_for_pickup";
    } else if (status === "out_for_delivery") {
      order.order_status = "out_for_delivery";
      if (!order.delivery_assignment.picked_up_at) {
        order.delivery_assignment.picked_up_at = new Date().toISOString();
      }
    } else if (status === "delivered") {
      order.order_status = "delivered";
      order.delivery_assignment.delivered_at = new Date().toISOString();
      if (order.payment.payment_method === "cod" && order.payment.payment_status === "cod_pending") {
        order.payment.payment_status = "cod_collected";
        order.payment.paid_at = new Date().toISOString();
      }
    }

    order.updated_at = new Date().toISOString();
    orders[index] = order;
    setStored(KEYS.ORDERS, orders);

    return order;
  },

  // COMPULSORY: WHO RECEIVED THE DELIVERY
  async recordDeliveryRecipient(
    orderId: string,
    recipient: {
      receiver_name: string;
      receiver_phone?: string;
      delivery_notes?: string;
      proof_of_delivery_url?: string;
    }
  ): Promise<Order | null> {
    if (!recipient.receiver_name || !recipient.receiver_name.trim()) {
      throw new Error("Backend Validation Error: Receiver Name is compulsory before an order can be marked as Delivered.");
    }

    const orders = await this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.order_number === orderId);
    if (index === -1) return null;

    const order = orders[index];
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const deliveryRecipient: DeliveryRecipient = {
      id: `recip-${Date.now()}`,
      order_id: order.id,
      receiver_name: recipient.receiver_name.trim(),
      receiver_phone: recipient.receiver_phone?.trim(),
      delivery_date: formattedDate,
      delivery_time: formattedTime,
      received_at: now.toISOString(),
      delivery_notes: recipient.delivery_notes || "Delivered and verified by courier.",
      proof_of_delivery_url: recipient.proof_of_delivery_url,
      created_at: now.toISOString(),
    };

    order.delivery_recipient = deliveryRecipient;
    order.order_status = "delivered";

    if (order.delivery_assignment) {
      order.delivery_assignment.delivery_status = "delivered";
      order.delivery_assignment.delivered_at = now.toISOString();
    } else {
      order.delivery_assignment = {
        id: `asgn-${Date.now()}`,
        order_id: order.id,
        delivery_person_id: "del-01",
        delivery_person_name: "Rahul Sharma",
        delivery_person_phone: "+91 98330 77123",
        delivery_status: "delivered",
        assigned_at: now.toISOString(),
        delivered_at: now.toISOString(),
        delivery_notes: "Assigned and verified upon delivery.",
      };
    }

    if (order.payment.payment_method === "cod" && order.payment.payment_status === "cod_pending") {
      order.payment.payment_status = "cod_collected";
      order.payment.paid_at = now.toISOString();
    }

    order.updated_at = now.toISOString();
    orders[index] = order;
    setStored(KEYS.ORDERS, orders);

    // Notify customer who received it
    if (order.user_id) {
      await this.createNotification({
        user_id: order.user_id,
        title: `Order Delivered: ${order.order_number}`,
        message: `Package received by ${deliveryRecipient.receiver_name} at ${deliveryRecipient.delivery_time}, ${deliveryRecipient.delivery_date}.`,
        type: "order",
      });
    }

    return order;
  },

  // ---------------- PAYMENTS ----------------
  async getPayments(): Promise<
    {
      payment: Payment;
      order_id: string;
      order_number: string;
      customer_name: string;
      customer_email: string;
      customer_phone: string;
    }[]
  > {
    const orders = await this.getOrders();
    return orders.map((o) => ({
      payment: o.payment,
      order_id: o.id,
      order_number: o.order_number,
      customer_name: o.customer_name,
      customer_email: o.customer_email,
      customer_phone: o.customer_phone,
    }));
  },

  async updatePaymentStatus(orderId: string, status: PaymentStatus): Promise<boolean> {
    const orders = await this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.order_number === orderId);
    if (index === -1) return false;

    orders[index].payment.payment_status = status;
    if (status === "paid" || status === "cod_collected") {
      orders[index].payment.paid_at = new Date().toISOString();
    }
    orders[index].updated_at = new Date().toISOString();

    setStored(KEYS.ORDERS, orders);
    return true;
  },

  // ---------------- USER DELIVERY ADDRESSES ----------------
  async getUserAddresses(userId: string): Promise<DeliveryAddress[]> {
    const addresses = getStored<DeliveryAddress[]>(KEYS.DELIVERY_ADDRESSES, initialDeliveryAddresses);
    return addresses.filter((a) => a.user_id === userId);
  },

  async saveUserAddress(
    userId: string,
    addr: Omit<DeliveryAddress, "id" | "user_id" | "created_at">
  ): Promise<DeliveryAddress> {
    const addresses = getStored<DeliveryAddress[]>(KEYS.DELIVERY_ADDRESSES, initialDeliveryAddresses);
    const existingIndex = addresses.findIndex(
      (a) =>
        a.user_id === userId &&
        a.house_number.toLowerCase() === addr.house_number.toLowerCase() &&
        a.pincode === addr.pincode
    );

    if (existingIndex !== -1) {
      addresses[existingIndex] = {
        ...addresses[existingIndex],
        ...addr,
        updated_at: new Date().toISOString(),
      };
      setStored(KEYS.DELIVERY_ADDRESSES, addresses);
      return addresses[existingIndex];
    }

    const newAddr: DeliveryAddress = {
      ...addr,
      id: `addr-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    addresses.push(newAddr);
    setStored(KEYS.DELIVERY_ADDRESSES, addresses);
    return newAddr;
  },

  // ---------------- ORDER STATS & ADMIN OVERVIEW ----------------
  async getOrderStats(): Promise<OrderStats> {
    const orders = await this.getOrders();
    const validOrders = orders.filter((o) => o.order_status !== "cancelled");
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.total_amount, 0);

    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.order_status === "order_placed" || o.order_status === "order_confirmed").length,
      preparingOrders: orders.filter((o) => o.order_status === "preparing").length,
      outForDeliveryOrders: orders.filter((o) => o.order_status === "out_for_delivery").length,
      deliveredOrders: orders.filter((o) => o.order_status === "delivered").length,
      cancelledOrders: orders.filter((o) => o.order_status === "cancelled").length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
    };
  },

  async getAdminStats() {
    const users = await this.getUsers();
    const categories = await this.getCategories();
    const services = await this.getServices();
    const messages = await this.getContactMessages();
    const support = await this.getSupportRequests();
    const reservations = await this.getReservations();
    const orderStats = await this.getOrderStats();

    return {
      totalUsers: users.length,
      activeUsers: users.length,
      totalCategories: categories.length,
      totalServices: services.length,
      totalMessages: messages.length,
      unreadMessages: messages.filter((m) => m.status === "new").length,
      totalSupportRequests: support.length,
      openSupportRequests: support.filter((s) => s.status !== "resolved").length,
      totalReservations: reservations.length,
      ...orderStats,
    };
  },
};

