import { create } from 'zustand';
import { CartItemWithDetails, Voucher, ShippingMethod } from '@/types';
import { api } from '@/services/api';

interface CartState {
  items: any[];
  selectedItemIds: string[]; // cart_item_ids selected for checkout
  vouchers: Voucher[]; // applied vouchers
  shippingMethod: ShippingMethod;
  paymentMethodId: string;
  note: string;
  
  loadCart: (userId: string) => void;
  addItem: (userId: string, variantId: string, quantity: number) => Promise<boolean>;
  updateQty: (cartItemId: string, newQty: number) => Promise<boolean>;
  removeItem: (cartItemId: string) => void;
  toggleSelect: (cartItemId: string) => void;
  toggleSelectAll: () => void;
  
  // Vouchers & Checkout options
  applyVoucher: (code: string, shopId?: string) => { success: boolean; message: string };
  removeVoucher: (voucherId: string) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  setPaymentMethodId: (id: string) => void;
  setNote: (note: string) => void;
  
  // Calculations
  getCalculations: () => {
    subtotal: number;
    shippingFee: number;
    discount: number;
    totalAmount: number;
  };
  
  checkout: (userId: string, addressId: string) => Promise<string | null>;
}

const defaultShipping: ShippingMethod = {
  shipping_method_id: 'ship-std',
  method_name: 'Standard',
  shipping_fee: 30000,
  estimated_days: 3,
  is_active: true
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  selectedItemIds: [],
  vouchers: [],
  shippingMethod: defaultShipping,
  paymentMethodId: 'pay-cod',
  note: '',

  loadCart: (userId) => {
    api.carts.get(userId).then((cart: any) => {
      const validItems = (cart.items || []).filter((item: any) => 
        item && item.shop && item.shop.shop_id && item.product && item.variant
      );
      set({ items: validItems });
    }).catch(() => set({ items: [] }));
  },

  addItem: async (userId, variantId, quantity) => {
    try {
      await api.carts.addItem(userId, variantId, quantity);
      get().loadCart(userId);
      return true;
    } catch {
      return false;
    }
  },

  updateQty: async (cartItemId, newQty) => {
    const user = localStorage.getItem('shopeelite_user');
    if (!user) return false;
    try {
      const parsed = JSON.parse(user);
      await api.carts.updateItem(parsed.user_id, cartItemId, newQty);
      get().loadCart(parsed.user_id);
      return true;
    } catch {
      return false;
    }
  },

  removeItem: async (cartItemId) => {
    const user = localStorage.getItem('shopeelite_user');
    if (!user) return;
    try {
      const parsed = JSON.parse(user);
      await api.carts.removeItem(parsed.user_id, cartItemId);
      set(state => ({ selectedItemIds: state.selectedItemIds.filter(id => id !== cartItemId) }));
      get().loadCart(parsed.user_id);
    } catch {}
  },

  toggleSelect: (cartItemId) => {
    set(state => {
      const alreadySelected = state.selectedItemIds.includes(cartItemId);
      const nextSelected = alreadySelected
        ? state.selectedItemIds.filter(id => id !== cartItemId)
        : [...state.selectedItemIds, cartItemId];
      return { selectedItemIds: nextSelected };
    });
  },

  toggleSelectAll: () => {
    set(state => {
      const allSelected = state.selectedItemIds.length === state.items.length;
      const nextSelected = allSelected ? [] : state.items.map(i => i.cart_item_id);
      return { selectedItemIds: nextSelected };
    });
  },

  applyVoucher: (code, shopId) => {
    const { items, selectedItemIds } = get();
    // Calculate subtotal for voucher validation
    const checkoutItems = items.filter(i => selectedItemIds.includes(i.cart_item_id));
    
    const eligibleAmount = checkoutItems.reduce((sum: number, i: any) => sum + (i.variant?.price || 0) * i.quantity, 0);

    const res = { valid: false, voucher: undefined, message: 'Voucher API not yet wired' };
    
    if (res.valid && res.voucher) {
      // Check if already applied
      const alreadyApplied = get().vouchers.some(v => v.voucher_code === (res as any).voucher?.voucher_code);
      if (alreadyApplied) {
        return { success: false, message: 'Voucher already applied!' };
      }
      
      // Remove other vouchers for same shop if any
      const filtered = get().vouchers.filter(v => v.shop_id !== shopId);
      set({ vouchers: [...filtered, res.voucher] });
      return { success: true, message: res.message };
    }
    
    return { success: false, message: res.message };
  },

  removeVoucher: (voucherId) => {
    set(state => ({
      vouchers: state.vouchers.filter(v => v.voucher_id !== voucherId)
    }));
  },

  setShippingMethod: (method) => set({ shippingMethod: method }),
  setPaymentMethodId: (id) => set({ paymentMethodId: id }),
  setNote: (note) => set({ note }),

  getCalculations: () => {
    const { items, selectedItemIds, vouchers, shippingMethod } = get();
    const checkoutItems = items.filter(i => selectedItemIds.includes(i.cart_item_id));
    
    const subtotal = checkoutItems.reduce((sum: number, i: any) => sum + (i.variant?.price || 0) * i.quantity, 0);
    
    // Group subtotal by shop to calculate shipping fee (e.g. flat 30k base shipping per shop)
    const uniqueShops = Array.from(new Set(checkoutItems.map((i: any) => i.shop?.shop_id).filter(Boolean)));
    const shopCount = uniqueShops.length;
    const baseShippingFee = shippingMethod.shipping_fee;
    const totalShippingFee = shopCount > 0 ? baseShippingFee * shopCount : 0;

    let discount = 0;
    vouchers.forEach(v => {
      if (v.shop_id) {
        const shopAmount = checkoutItems
          .filter((i: any) => i.shop?.shop_id === v.shop_id)
          .reduce((sum: number, i: any) => sum + (i.variant?.price || 0) * i.quantity, 0);
        
        let d = 0;
        if (v.discount_type === 'FIXED') {
          d = v.discount_value;
        } else {
          d = (shopAmount * v.discount_value) / 100;
          if (v.max_discount) d = Math.min(d, v.max_discount);
        }
        discount += d;
      } else {
        // system voucher
        let d = 0;
        if (v.discount_type === 'FIXED') {
          d = v.discount_value;
        } else {
          d = (subtotal * v.discount_value) / 100;
          if (v.max_discount) d = Math.min(d, v.max_discount);
        }
        discount += d;
      }
    });

    const totalAmount = Math.max(0, subtotal + totalShippingFee - discount);

    return {
      subtotal,
      shippingFee: totalShippingFee,
      discount,
      totalAmount
    };
  },

  checkout: async (userId, addressId) => {
    const { items, selectedItemIds, vouchers, shippingMethod, paymentMethodId, note } = get();
    const checkoutItems = items.filter(i => selectedItemIds.includes(i.cart_item_id));
    
    if (checkoutItems.length === 0) return null;

    // Build values for db.createOrder
    const orderItemsParam = checkoutItems.map(i => ({
      cartItemId: i.cart_item_id,
      shopId: i.shop.shop_id,
      variantId: i.variant.variant_id,
      quantity: i.quantity,
      price: i.variant.price
    }));

    // Calculate applied discounts for params
    const calculations = get().getCalculations();
    const vouchersAppliedParam = vouchers.map(v => {
      let d = 0;
      if (v.shop_id) {
        const shopSub = checkoutItems
          .filter((i: any) => i.shop?.shop_id === v.shop_id)
          .reduce((sum: number, i: any) => sum + (i.variant?.price || 0) * i.quantity, 0);
        d = v.discount_type === 'FIXED' ? v.discount_value : (shopSub * v.discount_value) / 100;
        if (v.max_discount) d = Math.min(d, v.max_discount);
      } else {
        d = v.discount_type === 'FIXED' ? v.discount_value : (calculations.subtotal * v.discount_value) / 100;
        if (v.max_discount) d = Math.min(d, v.max_discount);
      }
      
      return {
        shopId: v.shop_id,
        code: v.voucher_code,
        discount: d
      };
    });

    const order = null as any;

    if (order) {
      // Reset checkout states
      set({ selectedItemIds: [], vouchers: [], note: '' });
      get().loadCart(userId);
      return order.order_id;
    }

    return null;
  }
}));
