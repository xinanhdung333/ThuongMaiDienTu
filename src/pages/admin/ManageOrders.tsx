import React, { useEffect, useState } from 'react';
import { db } from '@/services/mockDb';

export const ManageOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);

  const load = () => setOrders(db.getAllOrders());

  useEffect(() => load(), []);

  const updateStatus = (orderId: string, status: string) => {
    if (!confirm(`Cập nhật trạng thái đơn ${orderId} → ${status}?`)) return;
    db.updateOrderStatus(orderId, status as any, `Admin set to ${status}`);
    load();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Quản lý Đơn hàng (Admin)</h1>
      <div className="space-y-3">
        {orders.map(o => (
          <div key={o.order_id} className="p-3 border rounded">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{o.order_code} • ₫{o.total_amount.toLocaleString()}</div>
                <div className="text-xs text-gray-500">User: {o.user_id} • {o.shopGroups.length} shop groups</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs px-2 py-1 rounded bg-slate-50">{o.order_status}</div>
                <select defaultValue={o.order_status} onChange={e => updateStatus(o.order_id, e.target.value)} className="text-sm border rounded px-2 py-1">
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </div>
            </div>
            <details className="mt-2">
              <summary className="text-sm text-primary cursor-pointer">View details</summary>
              <pre className="mt-2 bg-slate-50 p-3 rounded text-xs overflow-auto">{JSON.stringify(o, null, 2)}</pre>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageOrders;
