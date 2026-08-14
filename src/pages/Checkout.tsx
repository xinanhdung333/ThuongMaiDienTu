import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/context/ToastContext';
import { api } from '@/services/api';
import { ShippingMethod, Address } from '@/types';
import { 
  MapPin, CreditCard, Truck, Receipt, MessageSquare, ChevronRight, 
  Plus, Check, Percent, ArrowLeft, Loader2, Sparkles, Smartphone, Building2, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SHIPPING_METHODS: ShippingMethod[] = [
  {
    shipping_method_id: 'ship-std',
    method_name: 'Standard',
    shipping_fee: 30000,
    estimated_days: 3,
    is_active: true
  },
  {
    shipping_method_id: 'ship-fast',
    method_name: 'Fast',
    shipping_fee: 50000,
    estimated_days: 2,
    is_active: true
  },
  {
    shipping_method_id: 'ship-exp',
    method_name: 'Express',
    shipping_fee: 80000,
    estimated_days: 1,
    is_active: true
  }
];

const PAYMENT_METHODS = [
  { id: 'pay-cod', name: 'Cash on Delivery (COD)', desc: 'Pay with cash upon arrival.' },
  { id: 'pay-bank-qr', name: 'Bank QR Transfer', desc: 'Scan with any banking app.' },
  { id: 'pay-momo', name: 'MoMo Wallet', desc: 'Scan with MoMo and confirm.' },
  { id: 'pay-paypal', name: 'PayPal Account', desc: 'Secure global transaction.' },
  { id: 'pay-stripe', name: 'Credit/Debit Card (Stripe)', desc: 'All major cards supported.' }
];

const BANK_ACCOUNT = {
  bankName: 'MB Bank',
  bankBin: '970422',
  accountNumber: '0702014280',
  accountName: 'PHAM NGOC TIEN',
};

const MOMO_ACCOUNT = {
  walletName: 'Lumina Marketplace',
  phone: '0901234567',
};

const isQrPayment = (methodId: string) => ['pay-bank-qr', 'pay-momo', 'pay-vnpay'].includes(methodId);

const buildQrImageUrl = (data: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodeURIComponent(data)}`;

const buildBankQrUrl = (amount: number, content: string) =>
  `https://img.vietqr.io/image/${BANK_ACCOUNT.bankBin}-${BANK_ACCOUNT.accountNumber}-compact2.png?amount=${Math.round(amount)}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(BANK_ACCOUNT.accountName)}`;

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user, addresses, addAddress, loadAddresses } = useAuthStore();
  const { 
    items, selectedItemIds, vouchers, shippingMethod, paymentMethodId, note,
    setShippingMethod, setPaymentMethodId, setNote, applyVoucher, removeVoucher,
    getCalculations, checkout 
  } = useCartStore();
  
  const { toast } = useToast();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutLocked, setCheckoutLocked] = useState(false);
  const [paymentModalState, setPaymentModalState] = useState<{
    orderId: string;
    methodId: string;
    amount: number;
    reference: string;
  } | null>(null);
  const [momoPayUrl, setMomoPayUrl] = useState<string | null>(null);
  const [momoCreating, setMomoCreating] = useState(false);
  const [hasMomoRedirected, setHasMomoRedirected] = useState(false);
  
  // New address form state
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newReceiverName, setNewReceiverName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newProvince, setNewProvince] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newWard, setNewWard] = useState('');
  const [newDetailAddress, setNewDetailAddress] = useState('');

  // Voucher input state
  const [voucherCode, setVoucherCode] = useState('');
  
  // Group checkout items
  const checkoutItems = items.filter(i => selectedItemIds.includes(i.cart_item_id));
  
  // Group items by shop
  const groupedItems: Record<string, typeof checkoutItems> = {};
  checkoutItems.forEach(item => {
    if (!item || !item.shop || !item.shop.shop_id || !item.product || !item.variant) return; // Skip invalid items
    const shopId = item.shop.shop_id;
    if (!groupedItems[shopId]) {
      groupedItems[shopId] = [];
    }
    groupedItems[shopId].push(item);
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Avoid redirect while submitting or while a QR modal is expected to show
    if (checkoutItems.length === 0 && !paymentModalState && !checkoutLocked && !isSubmitting) {
      toast('Your checkout is empty. Redirecting to cart.', 'info');
      navigate('/cart');
      return;
    }
    
    loadAddresses();
  }, [user, checkoutItems.length, paymentModalState, checkoutLocked, isSubmitting]);

  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddr = addresses.find(a => a.is_default);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.address_id);
      } else {
        setSelectedAddressId(addresses[0].address_id);
      }
    }
  }, [addresses]);

  const selectedAddress = addresses.find(a => a.address_id === selectedAddressId);
  const calculations = getCalculations();
  const selectedPayment = PAYMENT_METHODS.find(method => method.id === paymentMethodId) || PAYMENT_METHODS[0];
  const paymentContent = paymentModalState?.reference || `LUMINA ${user?.user_id?.slice(0, 8) || 'ORDER'}`;
  const paymentQrUrl = (() => {
    if (!paymentModalState) return '';
    if (paymentModalState.methodId === 'pay-bank-qr' || paymentModalState.methodId === 'pay-vnpay') {
      return buildBankQrUrl(paymentModalState.amount, paymentContent);
    }
    if (paymentModalState.methodId === 'pay-momo' && momoPayUrl) {
      return buildQrImageUrl(momoPayUrl);
    }
    return buildQrImageUrl(`momo://pay?phone=${MOMO_ACCOUNT.phone}&amount=${paymentModalState?.amount || 0}&comment=${paymentContent}`);
  })();

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;

    // Try applying globally
    const resGlobal = applyVoucher(voucherCode.trim());
    if (resGlobal.success) {
      toast(resGlobal.message, 'success');
      setVoucherCode('');
      return;
    }

    // Try applying per shop for the shops in checkout
    let shopApplied = false;
    const uniqueShopIds = Object.keys(groupedItems);
    for (const shopId of uniqueShopIds) {
      const resShop = applyVoucher(voucherCode.trim(), shopId);
      if (resShop.success) {
        toast(`${resShop.message} for ${groupedItems[shopId][0].shop.shop_name}`, 'success');
        shopApplied = true;
        break;
      }
    }

    if (!shopApplied) {
      toast('Voucher is invalid or does not meet minimum order amounts.', 'error');
    }
    setVoucherCode('');
  };

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReceiverName || !newPhone || !newProvince || !newDistrict || !newWard || !newDetailAddress) {
      toast('Please fill all fields', 'warning' as any);
      return;
    }
    
    addAddress({
      receiver_name: newReceiverName,
      phone: newPhone,
      province: newProvince,
      district: newDistrict,
      ward: newWard,
      detail_address: newDetailAddress,
      is_default: addresses.length === 0
    });

    toast('New address added!', 'success');
    setShowAddAddressForm(false);
    
    // Clear inputs
    setNewReceiverName('');
    setNewPhone('');
    setNewProvince('');
    setNewDistrict('');
    setNewWard('');
    setNewDetailAddress('');
  };

  const handlePlaceOrder = async () => {
    if (!user) return;
    if (!selectedAddressId) {
      toast('Please select a shipping address.', 'warning' as any);
      return;
    }

    // Lock checkout early for QR flows to avoid redirect while cart is being cleared
    if (isQrPayment(paymentMethodId)) {
      setCheckoutLocked(true);
    }

    setIsSubmitting(true);
    // Simulate slight API processing delay for aesthetics
    setTimeout(async () => {
      try {
        const orderId = await checkout(user.user_id, selectedAddressId);
        if (orderId) {
          if (isQrPayment(paymentMethodId)) {
            const reference = `LUMINA ${orderId.slice(0, 8).toUpperCase()}`;
            setPaymentModalState({
              orderId,
              methodId: paymentMethodId,
              amount: calculations.totalAmount,
              reference,
            });
            if (paymentMethodId === 'pay-momo') {
              setHasMomoRedirected(false);
              setMomoPayUrl(null);
              setMomoCreating(true);
              api.orders.createMoMo(orderId, { orderInfo: reference })
                .then((res) => {
                  if (res && res.payUrl) {
                    setMomoPayUrl(res.payUrl);
                  } else {
                    toast('Could not obtain MoMo pay link from sandbox.', 'warning');
                  }
                })
                .catch((error) => {
                  const message = typeof error === 'object' && error && 'message' in error
                    ? String((error as { message: unknown }).message)
                    : 'Không thể tạo liên kết thanh toán MoMo.';
                  toast(message, 'error');
                })
                .finally(() => setMomoCreating(false));
            }
            toast('Order created. Please scan the QR code to pay.', 'success');
          } else {
            toast('Order placed successfully! Thank you for purchasing.', 'success');
            navigate('/orders');
          }
        } else {
          toast('Checkout failed. Product might be out of stock.', 'error');
          setCheckoutLocked(false);
        }
      } catch (err: any) {
        toast('An error occurred during checkout.', 'error');
        setCheckoutLocked(false);
      } finally {
        setIsSubmitting(false);
      }
    }, 1500);
  };

  const handleCopyPaymentContent = async () => {
    if (!paymentModalState) return;
    await navigator.clipboard?.writeText(paymentModalState.reference);
    toast('Payment content copied.', 'success');
  };

  useEffect(() => {
    if (paymentModalState?.methodId === 'pay-momo' && momoPayUrl && !hasMomoRedirected) {
      setHasMomoRedirected(true);
      window.location.assign(momoPayUrl);
    }
  }, [momoPayUrl, paymentModalState, hasMomoRedirected]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* HEADER NAVIGATION */}
      <div className="mb-8">
        <Link to="/cart" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white mt-2 flex items-center gap-2">
          <Receipt className="w-6 h-6 text-primary" /> Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT COLUMN: Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. SHIPPING ADDRESS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                <MapPin className="w-4.5 h-4.5 text-primary" /> Delivery Address
              </h2>
              <button 
                onClick={() => setShowAddressModal(true)}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                Change Address
              </button>
            </div>

            {selectedAddress ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{selectedAddress.receiver_name}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">|</span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{selectedAddress.phone}</span>
                      {selectedAddress.is_default && (
                        <span className="px-2 py-0.5 rounded-md bg-primary-light text-[9px] font-bold text-primary dark:bg-primary/10">Default</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {selectedAddress.detail_address}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-400 mb-3">No delivery address found.</p>
                <button 
                  onClick={() => {
                    setShowAddressModal(true);
                    setShowAddAddressForm(true);
                  }}
                  className="inline-flex py-2 px-4 rounded-xl bg-primary text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Address
                </button>
              </div>
            )}
          </div>

          {/* 2. GROUPED CHECKOUT ITEMS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white pb-3 border-b border-slate-50 dark:border-slate-800">
              Review Ordered Items
            </h2>

            {Object.keys(groupedItems).map(shopId => {
              const shopGroup = groupedItems[shopId];
              const shop = shopGroup[0].shop;
              
              // Find if this shop has voucher applied
              const shopVoucher = vouchers.find(v => v.shop_id === shopId);
              
              return (
                <div key={shopId} className="space-y-4">
                  {/* Shop header */}
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 py-2 px-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{shop.shop_name}</span>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {shopGroup.map(item => (
                      <div key={item.cart_item_id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                        <img 
                          src={item.product.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'} 
                          alt={item.product.product_name} 
                          className="w-16 h-16 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">{item.product.product_name}</h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">SKU: {item.variant.sku}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                              {item.variant.price.toLocaleString()} ₫
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              x{item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shop subtotal & voucher applied */}
                  <div className="flex flex-wrap justify-between items-center gap-2 pt-2 text-[11px] text-slate-500 border-t border-slate-50 dark:border-slate-800/50">
                    <div>
                      {shopVoucher && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                          <Percent className="w-3 h-3" /> Shop Voucher Applied: {shopVoucher.voucher_code}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold">
                      Shop Total: <span className="font-extrabold text-slate-800 dark:text-slate-200">{(shopGroup.reduce((sum, i) => sum + i.variant.price * i.quantity, 0)).toLocaleString()} ₫</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. SHIPPING & PAYMENT METHODS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SHIPPING METHOD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5 mb-4">
                <Truck className="w-4.5 h-4.5 text-primary" /> Shipping Service
              </h2>
              <div className="space-y-3">
                {SHIPPING_METHODS.map(method => {
                  const isSelected = shippingMethod.shipping_method_id === method.shipping_method_id;
                  return (
                    <button
                      key={method.shipping_method_id}
                      onClick={() => setShippingMethod(method)}
                      className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all relative flex justify-between items-center cursor-pointer ${
                        isSelected 
                          ? 'border-primary bg-primary-light/10 dark:bg-primary/5' 
                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{method.method_name}</span>
                          <span className="text-[10px] text-slate-400">({method.estimated_days} {method.estimated_days === 1 ? 'day' : 'days'})</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 dark:text-slate-500">Delivered via partner carrier.</p>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {method.shipping_fee.toLocaleString()} ₫
                      </span>
                      {isSelected && (
                        <div className="absolute right-0.5 top-0.5 h-3.5 w-3.5 bg-primary rounded-bl-xl flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5 mb-4">
                <CreditCard className="w-4.5 h-4.5 text-primary" /> Payment Method
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(pay => {
                  const isSelected = paymentMethodId === pay.id;
                  return (
                    <button
                      key={pay.id}
                      onClick={() => setPaymentMethodId(pay.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all relative flex justify-between items-center cursor-pointer ${
                        isSelected 
                          ? 'border-primary bg-primary-light/10 dark:bg-primary/5' 
                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{pay.name}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block truncate dark:text-slate-500">{pay.desc}</span>
                      </div>
                      {isSelected && (
                        <div className="h-4 w-4 bg-primary text-white rounded-full flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {isQrPayment(paymentMethodId) && (
                <div className="mt-4 rounded-2xl border border-primary/20 bg-primary-light/10 p-4 text-xs text-slate-600 dark:bg-primary/5 dark:text-slate-300">
                  <div className="flex items-start gap-3">
                    {paymentMethodId === 'pay-momo' ? (
                      <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    )}
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedPayment.name}</p>
                      <p className="mt-1 leading-relaxed">A QR code will appear after the order is created. Confirm payment after scanning.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* 4. SELLER NOTES */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5 mb-4">
              <MessageSquare className="w-4.5 h-4.5 text-primary" /> Order Notes
            </h2>
            <textarea
              rows={2}
              placeholder="Leave notes for seller or delivery riders..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

        </div>

        {/* RIGHT COLUMN: Voucher & Summary */}
        <div className="space-y-6">
          
          {/* VOUCHER PROMOTION */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5 mb-4">
              <Percent className="w-4.5 h-4.5 text-primary" /> Platform & Shop Voucher
            </h2>
            <form onSubmit={handleApplyVoucher} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code..."
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
              />
              <button 
                type="submit"
                className="py-2.5 px-4 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                Apply
              </button>
            </form>

            {/* List applied vouchers */}
            {vouchers.length > 0 && (
              <div className="mt-4 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Applied Vouchers:</span>
                {vouchers.map(v => (
                  <div key={v.voucher_id} className="flex justify-between items-center p-2 rounded-xl bg-primary-light/40 dark:bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Percent className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-bold font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate">{v.voucher_code}</span>
                      <span className="text-[10px] text-slate-400 truncate dark:text-slate-500">
                        ({v.shop_id ? 'Shop' : 'Global'})
                      </span>
                    </div>
                    <button 
                      onClick={() => removeVoucher(v.voucher_id)}
                      className="text-[10px] font-bold text-rose-500 hover:underline shrink-0 pl-2 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PAYMENT SUMMARY */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white pb-3 border-b border-slate-50 dark:border-slate-800">
              Payment Summary
            </h2>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Items Subtotal</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{calculations.subtotal.toLocaleString()} ₫</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping Fee</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{calculations.shippingFee.toLocaleString()} ₫</span>
              </div>
              {calculations.discount > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Discounts Applied</span>
                  <span className="font-bold">-{calculations.discount.toLocaleString()} ₫</span>
                </div>
              )}
            </div>

            <hr className="border-slate-50 dark:border-slate-800/80 my-4" />

            <div className="flex justify-between items-baseline mb-6">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Total Payment</span>
              <span className="text-xl font-black text-primary">
                {calculations.totalAmount.toLocaleString()} ₫
              </span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-primary text-white hover:bg-primary-dark font-extrabold text-sm shadow-md shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" /> Processing Order...
                </>
              ) : (
                <>
                  Place Order <Sparkles className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* PAYMENT QR MODAL */}
      {paymentModalState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                    {paymentModalState.methodId === 'pay-momo' ? 'MoMo Payment' : 'Bank QR Payment'}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">Payment status is verified by the server; this screen cannot mark an order as paid.</p>
                </div>
                <span className="rounded-full bg-primary-light px-3 py-1 text-[10px] font-bold text-primary dark:bg-primary/10">
                  {paymentModalState.amount.toLocaleString()} ₫
                </span>
              </div>

              <div className="flex justify-center rounded-3xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                <img src={paymentQrUrl} alt="Payment QR code" className="h-64 w-64 rounded-2xl bg-white object-contain p-2" />
              </div>

              <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 text-xs dark:bg-slate-950">
                {paymentModalState.methodId === 'pay-momo' ? (
                  <>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">MoMo wallet</span>
                      <span className="font-bold text-slate-900 dark:text-white">{MOMO_ACCOUNT.phone}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">Receiver</span>
                      <span className="font-bold text-slate-900 dark:text-white">{MOMO_ACCOUNT.walletName}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">Bank</span>
                      <span className="font-bold text-slate-900 dark:text-white">{BANK_ACCOUNT.bankName}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">Account</span>
                      <span className="font-bold text-slate-900 dark:text-white">{BANK_ACCOUNT.accountNumber}</span>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Content</span>
                  <button onClick={handleCopyPaymentContent} className="inline-flex items-center gap-1 font-bold text-primary">
                    {paymentModalState.reference} <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {paymentModalState.methodId === 'pay-momo' && (
                <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                  {momoCreating ? 'Preparing MoMo sandbox payment...' : momoPayUrl ? 'You will be redirected to the MoMo sandbox page shortly.' : 'Waiting for MoMo sandbox payment link...'}
                </div>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Pay Later
                </button>
              </div>
              {paymentModalState.methodId === 'pay-momo' && momoPayUrl && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => window.open(momoPayUrl, '_blank')}
                    className="w-full rounded-2xl border border-primary bg-white px-4 py-3 text-xs font-bold text-primary transition hover:bg-primary/5"
                  >
                    Open MoMo Sandbox Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      {/* ADDRESS SELECTOR MODAL */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddressModal(false);
                setShowAddAddressForm(false);
              }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" 
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl p-6 overflow-hidden max-h-[85vh] flex flex-col z-10"
            >
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Delivery Addresses
                </h3>
                {!showAddAddressForm && (
                  <button 
                    onClick={() => setShowAddAddressForm(true)}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New
                  </button>
                )}
              </div>

              {/* Scrollable list or form */}
              <div className="flex-1 overflow-y-auto pr-1 py-1 space-y-4">
                
                {showAddAddressForm ? (
                  <form onSubmit={handleAddNewAddress} className="space-y-4.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Add New Delivery Address</span>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Receiver Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          value={newReceiverName}
                          onChange={(e) => setNewReceiverName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 0912345678"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Province</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. TPHCM"
                          value={newProvince}
                          onChange={(e) => setNewProvince(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">District</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Quận 1"
                          value={newDistrict}
                          onChange={(e) => setNewDistrict(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ward</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Phường 2"
                          value={newWard}
                          onChange={(e) => setNewWard(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Street Address</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 123 High Street"
                        value={newDetailAddress}
                        onChange={(e) => setNewDetailAddress(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddAddressForm(false)}
                        className="flex-1 py-2 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-dark transition-all cursor-pointer"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    {addresses.map(addr => {
                      const isSelected = selectedAddressId === addr.address_id;
                      return (
                        <button
                          key={addr.address_id}
                          onClick={() => {
                            setSelectedAddressId(addr.address_id);
                            setShowAddressModal(false);
                          }}
                          className={`w-full text-left p-4 rounded-2xl border text-xs transition-all relative block cursor-pointer ${
                            isSelected 
                              ? 'border-primary bg-primary-light/10 dark:bg-primary/5' 
                              : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{addr.receiver_name}</span>
                            <span className="text-xs text-slate-400">|</span>
                            <span className="font-semibold text-slate-500">{addr.phone}</span>
                            {addr.is_default && (
                              <span className="px-1.5 py-0.5 rounded bg-primary-light text-[8px] font-bold text-primary dark:bg-primary/10">Default</span>
                            )}
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-normal">
                            {addr.detail_address}, {addr.ward}, {addr.district}, {addr.province}
                          </p>
                          {isSelected && (
                            <div className="absolute right-3.5 top-3.5 h-4 w-4 bg-primary text-white rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Checkout;
