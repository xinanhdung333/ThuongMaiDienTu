import React from 'react';
import { useParams } from 'react-router-dom';
import { db } from '@/services/mockDb';

export const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const order = orderId ? db.getOrderDetails(orderId) : null;

  if (!order) return <div className="p-4">Đơn hàng không tìm thấy.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Chi tiết đơn hàng {order.order_code}</h1>
      <div className="mt-4">
        <pre className="bg-slate-50 p-4 rounded">{JSON.stringify(order, null, 2)}</pre>
      </div>
    </div>
  );
};

export default OrderDetail;
