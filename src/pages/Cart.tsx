import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/context/ToastContext';
import { db } from '@/services/mockDb';
import { 
  ShoppingCart, Trash2, Plus, Minus, ArrowRight, Store, Gift, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    items, selectedItemIds, vouchers, loadCart, updateQty, removeItem, 
    toggleSelect, toggleSelectAll, applyVoucher, removeVoucher, getCalculations 
  } = useCartStore();
  
  const { toast } = useToast();
  const [voucherInputs, setVoucherInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      loadCart(user.user_id);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="h-16 w-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Log in to view cart</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Please sign in to view items added to your cart.</p>
        <Link to="/login" className="mt-5 inline-flex py-2.5 px-6 rounded-xl bg-primary text-white text-xs font-bold shadow-md cursor-pointer">
          Sign In
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="h-16 w-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Add some premium products from the catalogue to get started.</p>
        <Link to="/products" className="mt-5 inline-flex py-2.5 px-6 rounded-xl bg-primary text-white text-xs font-bold shadow-md cursor-pointer">
          Shop Catalog
        </Link>
      </div>
    );
  }

  // 1. Group items by Shop
  const groupedItems: Record<string, typeof items> = {};
  items.forEach(item => {
    if (!item || !item.shop || !item.shop.shop_id || !item.product || !item.variant) return; // Skip invalid items
    const shopId = item.shop.shop_id;
    if (!groupedItems[shopId]) {
      groupedItems[shopId] = [];
    }
    groupedItems[shopId].push(item);
  });

  const calculations = getCalculations();
  const allSelected = selectedItemIds.length === items.length && items.length > 0;

  const handleVoucherSubmit = (e: React.FormEvent, shopId?: string) => {
    e.preventDefault();
    const code = voucherInputs[shopId || 'global'] || '';
    if (!code.trim()) return;

    const res = applyVoucher(code, shopId);
    if (res.success) {
      toast(res.message, 'success');
      setVoucherInputs(prev => ({ ...prev, [shopId || 'global']: '' }));
    } else {
      toast(res.message, 'error');
    }
  };

  const handleCheckoutClick = () => {
    if (selectedItemIds.length === 0) {
      toast('Please select at least one item to checkout.', 'info');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white mb-8 flex items-center gap-2">
        <ShoppingCart className="w-6 h-6 text-primary" /> Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT LIST: Grouped by Shop */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Select all header bar */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-extrabold ${
                allSelected ? 'border-primary bg-primary text-white' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'
              }`}>
                {allSelected && '✓'}
              </span>
              Select All ({items.length} items)
            </button>
          </div>

          <AnimatePresence>
            {Object.keys(groupedItems).map(shopId => {
              const shopItems = groupedItems[shopId];
              const shop = shopItems[0].shop;
              
              // Find if this shop has voucher applied
              const shopVoucher = vouchers.find(v => v.shop_id === shopId);

              return (
                <motion.div
                  key={shopId}
                  layout
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm"
                >
                  {/* Shop Title Header */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-850/50 border-b border-slate-50 dark:border-slate-800 flex items-center gap-2">
                    <Store className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white shrink-0">{shop.shop_name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  </div>

                  {/* Shop Items List */}
                  <div className="divide-y divide-slate-50 dark:divide-slate-800/80">
                    {shopItems.map(item => {
                      const selected = selectedItemIds.includes(item.cart_item_id);
                      const displayVariantName = item.variant?.attributeValues?.map((av: any) => av.value_name).join(' / ') || '';
                      
                      return (
                        <div key={item.cart_item_id} className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
                          {/* Select Checkbox */}
                          <button
                            onClick={() => toggleSelect(item.cart_item_id)}
                            className="mt-4 w-4 h-4 rounded border flex items-center justify-center text-[10px] font-extrabold shrink-0 cursor-pointer transition-colors"
                          >
                            <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-extrabold ${
                              selected ? 'border-primary bg-primary text-white' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'
                            }`}>
                              {selected && '✓'}
                            </span>
                          </button>

                          {/* Image */}
                          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 shrink-0 border border-slate-100 dark:border-slate-800">
                            <img src={item.product.thumbnail} alt={item.product.product_name} className="w-full h-full object-cover" />
                          </div>

                          {/* Description info */}
                          <div className="flex-1 flex flex-col sm:flex-row justify-between gap-3 min-w-0">
                            <div className="min-w-0 flex flex-col gap-1">
                              <Link to={`/product/${item.product.slug || item.product.product_id}`} className="font-bold text-xs text-slate-800 dark:text-slate-100 hover:text-primary transition-colors truncate">
                                {item.product.product_name}
                              </Link>
                              
                              {displayVariantName && (
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">
                                  Variant: {displayVariantName}
                                </span>
                              )}

                              <span className="font-extrabold text-xs text-primary mt-1">
                                ₫{item.variant.price.toLocaleString('vi-VN')}
                              </span>
                            </div>

                            {/* Qty and Trash */}
                            <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                              <div className="flex items-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg overflow-hidden">
                                <button
                                  onClick={() => updateQty(item.cart_item_id, item.quantity - 1)}
                                  className="h-7 w-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-slate-200">{item.quantity}</span>
                                <button
                                  onClick={() => updateQty(item.cart_item_id, item.quantity + 1)}
                                  className="h-7 w-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeItem(item.cart_item_id)}
                                className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-rose-200 hover:text-rose-500 text-slate-400 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>

                  {/* Shop Voucher Applicator Panel */}
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-850/20 border-t border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-primary shrink-0" />
                      {shopVoucher ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">{shopVoucher.voucher_code}</span>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">applied</span>
                          <button onClick={() => removeVoucher(shopVoucher.voucher_id)} className="text-[10px] font-extrabold text-rose-500 hover:underline cursor-pointer">Remove</button>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Shop Voucher code:</span>
                      )}
                    </div>

                    {!shopVoucher && (
                      <form onSubmit={(e) => handleVoucherSubmit(e, shopId)} className="flex w-full sm:w-auto max-w-xs gap-1.5">
                        <input
                          type="text"
                          placeholder="e.g. LUMINA50"
                          value={voucherInputs[shopId] || ''}
                          onChange={(e) => setVoucherInputs(prev => ({ ...prev, [shopId]: e.target.value.toUpperCase() }))}
                          className="w-full sm:w-28 px-2 py-1 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                        <button type="submit" className="py-1 px-3 bg-slate-900 dark:bg-slate-800 hover:bg-primary hover:text-white rounded-lg text-xs font-bold text-slate-300 cursor-pointer transition-colors">Apply</button>
                      </form>
                    )}
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* RIGHT SUMMARY SIDEBAR */}
        <aside className="sticky top-24 flex flex-col gap-6">
          
          {/* Global Voucher Selector */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-950 dark:text-white mb-4 flex items-center gap-1.5">
              <Gift className="w-4.5 h-4.5 text-primary" /> Lumina Vouchers
            </h3>
            
            {/* Global voucher indicator */}
            {vouchers.find(v => !v.shop_id) ? (
              <div className="p-3 border border-primary/20 bg-primary-light/50 dark:bg-primary/5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded text-xs">
                    {vouchers.find(v => !v.shop_id)?.voucher_code}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Platform voucher applied</p>
                </div>
                <button
                  onClick={() => removeVoucher(vouchers.find(v => !v.shop_id)!.voucher_id)}
                  className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => handleVoucherSubmit(e)} className="flex gap-2">
                <input
                  type="text"
                  placeholder="LUMINAFREE"
                  value={voucherInputs['global'] || ''}
                  onChange={(e) => setVoucherInputs(prev => ({ ...prev, global: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 border border-slate-100 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
                <button type="submit" className="py-2 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-primary text-white hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-colors">Apply</button>
              </form>
            )}
          </div>

          {/* Pricing calculations details */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-950 dark:text-white mb-4 pb-3 border-b border-slate-50 dark:border-slate-800">
              Order Summary
            </h3>

            <div className="flex flex-col gap-3 text-xs font-semibold">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Selected Items Subtotal:</span>
                <span>₫{calculations.subtotal.toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Estimated Shipping (by shops):</span>
                <span>₫{calculations.shippingFee.toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex justify-between text-rose-500">
                <span>Vouchers discount:</span>
                <span>-₫{calculations.discount.toLocaleString('vi-VN')}</span>
              </div>

              <hr className="border-slate-50 dark:border-slate-850 my-2" />

              <div className="flex justify-between text-slate-950 dark:text-white font-extrabold text-sm">
                <span>Total Payment:</span>
                <span className="text-primary text-base">₫{calculations.totalAmount.toLocaleString('vi-VN')}</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              disabled={selectedItemIds.length === 0}
              className="w-full mt-6 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md shadow-primary/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Checkout Selected
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </aside>

      </div>
    </div>
  );
};
export default Cart;
