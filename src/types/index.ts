export type UserRole = 'Admin' | 'Seller' | 'Customer';

export interface User {
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  birthday?: string;
  status: 'ACTIVE' | 'BLOCKED';
  roles: UserRole[];
  created_at: string;
  updated_at: string;
}

export interface Address {
  address_id: string;
  user_id: string;
  receiver_name: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail_address: string;
  is_default: boolean;
  created_at: string;
}

export interface Shop {
  shop_id: string;
  owner_id: string;
  shop_name: string;
  logo?: string;
  description?: string;
  rating: number;
  total_followers: number;
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  created_at: string;
  updated_at: string;
}

export interface Brand {
  brand_id: string;
  brand_name: string;
  logo?: string;
  description?: string;
}

export interface Category {
  category_id: string;
  parent_id?: string;
  category_name: string;
  image?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

export interface Product {
  product_id: string;
  shop_id: string;
  brand_id?: string;
  category_id?: string;
  product_name: string;
  slug?: string;
  description?: string;
  thumbnail?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'OUT_OF_STOCK';
  average_rating: number;
  review_count: number;
  sold_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  image_id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface Attribute {
  attribute_id: string;
  attribute_name: string;
}

export interface AttributeValue {
  value_id: string;
  attribute_id: string;
  value_name: string;
}

export interface ProductVariant {
  variant_id: string;
  product_id: string;
  sku: string;
  price: number;
  original_price?: number;
  weight?: number;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
  // Attributes mapped for this variant (e.g. Size: M, Color: Blue)
  attributeValues?: {
    attribute_name: string;
    value_name: string;
    value_id: string;
  }[];
}

export interface Inventory {
  inventory_id: string;
  variant_id: string;
  quantity: number;
  reserved_quantity: number;
  updated_at: string;
}

export interface Cart {
  cart_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  cart_item_id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  created_at: string;
}

export interface WishlistItem {
  wishlist_id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface ProductView {
  view_id: string;
  user_id?: string;
  product_id: string;
  viewed_at: string;
}

export interface PaymentMethod {
  payment_method_id: string;
  method_name: 'COD' | 'VNPay' | 'MoMo' | 'PayPal' | 'Stripe';
  description?: string;
  is_active: boolean;
}

export interface ShippingMethod {
  shipping_method_id: string;
  method_name: 'Standard' | 'Fast' | 'Express';
  shipping_fee: number;
  estimated_days?: number;
  is_active: boolean;
}

export interface Voucher {
  voucher_id: string;
  shop_id?: string; // Null if system voucher
  voucher_code: string;
  voucher_name: string;
  discount_type: 'PERCENT' | 'FIXED';
  discount_value: number;
  max_discount?: number;
  min_order_amount: number;
  usage_limit?: number;
  used_count: number;
  start_at: string;
  end_at: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
}

export interface Order {
  order_id: string;
  order_code: string;
  user_id: string;
  address_id?: string;
  payment_method_id?: string;
  shipping_method_id?: string;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total_amount: number;
  note?: string;
  order_status: 'PENDING' | 'CONFIRMED' | 'PACKING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED' | 'RETURNED';
  created_at: string;
  updated_at: string;
}

export interface OrderVoucher {
  order_id: string;
  voucher_id: string;
  discount_amount: number;
}

export interface OrderShopGroup {
  order_shop_id: string;
  order_id: string;
  shop_id: string;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total_amount: number;
  group_status: 'PENDING' | 'CONFIRMED' | 'PACKING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED' | 'RETURNED';
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  order_item_id: string;
  order_id: string;
  order_shop_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
}

export interface ProductReview {
  review_id: string;
  user_id: string;
  product_id: string;
  order_item_id?: string;
  rating: number; // 1 to 5
  comment?: string;
  status: 'VISIBLE' | 'HIDDEN';
  created_at: string;
  updated_at: string;
}

export interface OrderStatusHistory {
  history_id: string;
  order_id: string;
  status: 'PENDING' | 'CONFIRMED' | 'PACKING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED' | 'RETURNED';
  note?: string;
  changed_at: string;
}

export interface Payment {
  payment_id: string;
  order_id: string;
  transaction_code?: string;
  amount: number;
  payment_status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  paid_at?: string;
  created_at: string;
}

export interface Shipment {
  shipment_id: string;
  order_shop_id: string;
  tracking_number?: string;
  carrier?: string;
  shipped_at?: string;
  delivered_at?: string;
  shipment_status: 'PREPARING' | 'SHIPPING' | 'DELIVERED' | 'FAILED' | 'RETURNED';
}

export interface ReturnRequest {
  return_id: string;
  order_item_id: string;
  user_id: string;
  reason: string;
  return_status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'RETURNING' | 'RECEIVED' | 'REFUNDED';
  requested_at: string;
  updated_at: string;
}

export interface Refund {
  refund_id: string;
  return_id: string;
  payment_id?: string;
  amount: number;
  refund_status: 'PENDING' | 'SUCCESS' | 'FAILED';
  refunded_at?: string;
  created_at: string;
}

// Complex aggregate UI structures for front-end bindings
export interface ProductWithDetails extends Product {
  shop: Shop;
  brand?: Brand;
  category?: Category;
  images: ProductImage[];
  variants: ProductVariantWithInventory[];
}

export interface ProductVariantWithInventory extends ProductVariant {
  inventory?: Inventory;
}

export interface CartItemWithDetails {
  cart_item_id: string;
  quantity: number;
  variant: ProductVariant;
  product: Product;
  shop: Shop;
  inventory: Inventory;
}

export interface OrderShopGroupWithDetails extends OrderShopGroup {
  shop: Shop;
  shipment?: Shipment;
  items: OrderItemWithDetails[];
}

export interface OrderItemWithDetails extends OrderItem {
  variant: ProductVariant;
  product: Product;
}

export interface OrderWithDetails extends Order {
  address?: Address;
  paymentMethod?: PaymentMethod;
  shippingMethod?: ShippingMethod;
  payment?: Payment;
  shopGroups: OrderShopGroupWithDetails[];
  statusHistory: OrderStatusHistory[];
}

export interface ProductReviewWithUser extends ProductReview {
  user: {
    full_name: string;
    avatar?: string;
  };
  variant_sku?: string;
  variant_name?: string;
}
