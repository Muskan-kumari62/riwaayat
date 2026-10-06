export type UserRole = "user" | "admin" | "delivery_person";

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  dish_count?: number;
  status: "active" | "inactive";
  display_order?: number;
  created_at: string;
  updated_at?: string;
}

export interface Dish {
  id: string;
  category_id: string;
  category_name?: string;
  name: string;
  description: string;
  price: number; // in INR (₹)
  image_url: string;
  image?: string;
  rating: number;
  reviews_count?: number;
  is_veg: boolean;
  is_chef_special?: boolean;
  availability: "available" | "sold_out";
  created_at: string;
  updated_at?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image_url: string;
  status: "active" | "inactive";
  badge?: string;
  features?: string[];
  created_at: string;
  updated_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "order" | "promo" | "alert";
  is_read: boolean;
  created_at: string;
}

export interface SupportRequest {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  subject: string;
  message: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved";
  created_at: string;
  updated_at?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role_or_title: string;
  message: string;
  rating: number;
  image_url: string;
  status: "active" | "pending";
  created_at: string;
}

export interface RestaurantInfo {
  id: string;
  restaurant_name: string;
  tagline: string;
  logo_url: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  opening_hours: string;
  updated_at?: string;
}

export interface Reservation {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  guest_count: number;
  booking_date: string;
  booking_time: string;
  special_requests?: string;
  status: "confirmed" | "pending" | "cancelled";
  created_at: string;
}

export interface AuthSession {
  user: UserProfile | null;
  token?: string;
}

// ====================================================================
// FOOD ORDERING, PAYMENT & DELIVERY TYPES
// ====================================================================

export type OrderStatus =
  | "order_placed"
  | "order_confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod =
  | "cod"
  | "upi"
  | "gpay"
  | "google_pay"
  | "phonepe"
  | "paytm"
  | "card"
  | "netbanking";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "cod_pending"
  | "cod_collected";

export type DeliveryStatus =
  | "unassigned"
  | "assigned"
  | "picked_up"
  | "out_for_delivery"
  | "delivered"
  | "failed_delivery";

export interface CartItem {
  dish: Dish;
  quantity: number;
  portion?: "standard" | "royal";
  spice_level?: string;
  selected_addons?: string[];
  item_notes?: string;
}

export interface DeliveryAddress {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  house_number: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  delivery_instructions?: string;
  created_at: string;
  updated_at?: string;
}

export interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: "available" | "busy" | "offline";
  vehicle_type?: string;
  rating?: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  dish_id: string;
  dish_name: string;
  dish_image?: string;
  is_veg?: boolean;
  quantity: number;
  unit_price: number;
  subtotal: number;
  portion?: string;
  spice_level?: string;
  addons?: string[];
  item_notes?: string;
}

export interface Payment {
  id: string;
  order_id: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_id: string;
  amount: number;
  paid_at?: string;
  created_at: string;
}

export interface DeliveryAssignment {
  id: string;
  order_id: string;
  delivery_person_id: string;
  delivery_person_name?: string;
  delivery_person_phone?: string;
  delivery_status: DeliveryStatus;
  assigned_at: string;
  picked_up_at?: string;
  delivered_at?: string;
  delivery_notes?: string;
}

export interface DeliveryRecipient {
  id: string;
  order_id: string;
  receiver_name: string;
  receiver_phone?: string;
  delivery_date: string;
  delivery_time: string;
  received_at: string;
  delivery_notes?: string;
  proof_of_delivery_url?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string; // e.g. ORD-2026-0001
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: DeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  coupon_code?: string;
  delivery_fee: number;
  tax: number;
  total_amount: number;
  order_status: OrderStatus;
  payment: Payment;
  delivery_assignment?: DeliveryAssignment;
  delivery_recipient?: DeliveryRecipient;
  cooking_instructions?: string;
  created_at: string;
  updated_at?: string;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  outForDeliveryOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}
