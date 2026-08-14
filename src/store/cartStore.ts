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
  
  loadCart: (userId: string) => Promise<void>;
  addItem: (userId: string, variantId: string, quantity: number, selectAdded?: boolean) => Promise<{ success: boolean; message?: string }>;
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

  loadCart: async (userId) => {
    try {
      const cart = await api.carts.get(userId);
      const validItems = (cart.items || []).filter((item: any) => 
        item && item.shop && item.shop.shop_id && item.product && item.variant
      );
      set({ items: validItems });
    } catch {
      set({ items: [] });
    }
  },

  addItem: async (userId, variantId, quantity, selectAdded = false) => {
    try {
      await api.carts.addItem(userId, variantId, quantity);
      const cart = await api.carts.get(userId);
      const validItems = (cart.items || []).filter((item: any) => 
        item && item.shop && item.shop.shop_id && item.product && item.variant
      );
      const addedItem = validItems.find((item: any) => item.variant?.variant_id === variantId);
      set((state) => ({
        items: validItems,
        selectedItemIds: selectAdded && addedItem
          ? [addedItem.cart_item_id]
          : state.selectedItemIds,
      }));
      return { success: true };
    } catch (error: any) {
      const message = typeof error?.message === 'string'
        ? error.message
        : 'Could not add this item to the cart.';
      return { success: false, message };
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

    const calculations = get().getCalculations();

    const shopGroups = Object.values(checkoutItems.reduce((groups: Record<string, any>, item: any) => {
      const shopId = item.shop?.shop_id;
      if (!shopId) return groups;
      if (!groups[shopId]) {
        groups[shopId] = {
          shop_id: shopId,
          subtotal: 0,
          shipping_fee: shippingMethod.shipping_fee,
          discount: 0,
          total_amount: 0,
          items: [] as any[],
        };
      }
      groups[shopId].subtotal += item.variant.price * item.quantity;
      groups[shopId].items.push({
        variant_id: item.variant.variant_id,
        quantity: item.quantity,
        unit_price: item.variant.price,
        discount: 0,
        subtotal: item.variant.price * item.quantity,
      });
      return groups;
    }, {} as Record<string, any>)).map((group: any) => ({
      ...group,
      total_amount: Math.max(0, group.subtotal + group.shipping_fee - group.discount),
    }));

    const payload = {
      user_id: userId,
      address_id: addressId,
      payment_method_id: paymentMethodId,
      shipping_method_id: shippingMethod.shipping_method_id,
      subtotal: calculations.subtotal,
      shipping_fee: calculations.shippingFee,
      discount: calculations.discount,
      total_amount: calculations.totalAmount,
      note,
      shopGroups,
    };

    try {
      const createdOrder = await api.orders.create(payload as any);
      // Keep the cart while MoMo is pending. It is only safe to clear it after
      // the server has received a verified payment notification.
      if (!String(paymentMethodId).toLowerCase().includes('momo')) {
        await api.carts.clear(userId);
      }
      set({ selectedItemIds: [], vouchers: [], note: '' });
      await get().loadCart(userId);
      return createdOrder.order_id;
    } catch {
      return null;
    }
  }
}));
