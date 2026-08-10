import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/services/api';
import { OrderWithDetails } from '@/types';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-sky-100 text-sky-700',
  PACKING: 'bg-indigo-100 text-indigo-700',
  SHIPPING: 'bg-cyan-100 text-cyan-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
  RETURNED: 'bg-violet-100 text-violet-700'
};

export const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    api.orders.get(orderId)
      .then((data) => setOrder(data as OrderWithDetails))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center sm:px-6 lg:px-8">
        <p className="text-lg font-semibold text-slate-900 dark:text-white">Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center sm:px-6 lg:px-8">
        <p className="text-lg font-semibold text-slate-900 dark:text-white">Không tìm thấy đơn hàng.</p>
        <Link to="/orders" className="mt-4 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark">
          Quay lại đơn hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white">Đơn hàng {order.order_code}</h1>
          <p className="text-sm text-slate-500">Ngày đặt: {new Date(order.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
        </div>
        <div className={`rounded-full px-4 py-2 text-sm font-semibold ${statusStyles[order.order_status] || 'bg-slate-100 text-slate-700'}`}>
          {order.order_status}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Thông tin thanh toán</div>
          <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <div>
              <p className="text-slate-500">Phương thức</p>
              <p className="font-semibold text-slate-900 dark:text-white">{order.paymentMethod?.method_name || 'COD'}</p>
            </div>
            <div>
              <p className="text-slate-500">Tổng tiền</p>
              <p className="font-semibold text-slate-900 dark:text-white">{order.total_amount.toLocaleString('vi-VN')} ₫</p>
            </div>
            <div>
              <p className="text-slate-500">Phí ship</p>
              <p className="font-semibold text-slate-900 dark:text-white">{order.shipping_fee.toLocaleString('vi-VN')} ₫</p>
            </div>
            <div>
              <p className="text-slate-500">Giảm giá</p>
              <p className="font-semibold text-slate-900 dark:text-white">{order.discount.toLocaleString('vi-VN')} ₫</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 xl:col-span-2">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Địa chỉ giao hàng</div>
          <div className="mt-4 text-sm text-slate-700 dark:text-slate-300 space-y-1">
            <p className="font-semibold text-slate-900 dark:text-white">{order.address?.receiver_name || 'N/A'}</p>
            <p>{order.address?.phone}</p>
            <p>{order.address?.detail_address}</p>
            <p>{order.address ? `${order.address.ward}, ${order.address.district}, ${order.address.province}` : ''}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {order.shopGroups.map(group => (
          <div key={group.order_shop_id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{group.shop.shop_name}</p>
                <p className="text-xs text-slate-500">{group.items.length} sản phẩm</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-500">Tổng nhóm:</span>
                <span className="text-base font-semibold text-slate-900 dark:text-white">{group.total_amount.toLocaleString('vi-VN')} ₫</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[group.group_status] || 'bg-slate-100 text-slate-700'}`}>
                  {group.group_status}
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {group.items.map(item => {
                const product = item.product || (item.variant as any)?.product;
                return (
                  <div key={item.order_item_id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{product?.product_name || 'Sản phẩm'}</div>
                    <div className="mt-2 text-sm text-slate-500">Màu/SKU: {item.variant?.sku || item.variant_id}</div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                      <span>Số lượng: {item.quantity}</span>
                      <span>{item.subtotal.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/orders"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-primary hover:text-primary dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
        >
          Quay lại đơn hàng
        </Link>
      </div>
    </div>
  );
};

export default OrderDetail;
