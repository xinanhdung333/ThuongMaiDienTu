import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { OrderWithDetails } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-sky-100 text-sky-700',
  PACKING: 'bg-indigo-100 text-indigo-700',
  SHIPPING: 'bg-cyan-100 text-cyan-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
  RETURNED: 'bg-violet-100 text-violet-700'
};

export const Orders: React.FC = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.orders.list(user.user_id)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-3">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">My Orders</div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white">Lịch sử đơn hàng</h1>
            <p className="text-sm text-slate-500">Theo dõi trạng thái, tổng tiền và chi tiết giao hàng.</p>
          </div>
          <div className="rounded-3xl bg-slate-100 dark:bg-slate-900 p-4 text-sm text-slate-700 dark:text-slate-300">
            Tổng đơn hàng: <span className="font-bold text-slate-900 dark:text-white">{orders.length}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">Đang tải đơn hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">Bạn chưa có đơn hàng nào.</p>
          <p className="mt-2 text-sm text-slate-500">Hãy mua sắm và đơn hàng sẽ được hiển thị tại đây.</p>
          <Link
            to="/products"
            className="inline-flex mt-6 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-primary-dark"
          >
            Đi tới cửa hàng
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map(order => (
            <div key={order.order_id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-950">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span>Mã đơn:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{order.order_code}</span>
                    <span>•</span>
                    <span>{new Date(order.created_at).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric'
                    })}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] ${STATUS_STYLES[order.order_status] || 'bg-slate-100 text-slate-700'}`}>
                      {order.order_status}
                    </span>
                    <span className="text-xs text-slate-400">{order.shopGroups.length} cửa hàng</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-3xl bg-slate-50 px-4 py-2 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    Tổng: <span className="font-semibold text-slate-900 dark:text-white">{order.total_amount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <Link
                    to={`/orders/${order.order_id}`}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-primary hover:text-primary dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-3xl bg-slate-50 p-4 text-sm dark:bg-slate-900">
                  <div className="text-xs uppercase tracking-[0.15em] text-slate-400">Phương thức thanh toán</div>
                  <div className="mt-2 font-semibold text-slate-900 dark:text-white">{order.paymentMethod?.method_name || 'COD'}</div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 text-sm dark:bg-slate-900">
                  <div className="text-xs uppercase tracking-[0.15em] text-slate-400">Phương thức vận chuyển</div>
                  <div className="mt-2 font-semibold text-slate-900 dark:text-white">{order.shippingMethod?.method_name || 'Standard'}</div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 text-sm dark:bg-slate-900">
                  <div className="text-xs uppercase tracking-[0.15em] text-slate-400">Địa chỉ nhận</div>
                  <div className="mt-2 text-slate-900 dark:text-slate-100">
                    {order.address ? `${order.address.receiver_name}, ${order.address.province}` : 'Không có địa chỉ'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
