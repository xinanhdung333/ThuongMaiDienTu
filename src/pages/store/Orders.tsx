import React from 'react';
import { db } from '@/services/mockDb';

export const Orders: React.FC = () => {
  const user = db.getCurrentUser();
  const shop = user ? db.getShopByOwner(user.user_id) : null;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Đơn hàng người bán</h1>
      {shop ? (
        <div>
          <p>Hiển thị các đơn hàng thuộc cửa hàng: <strong>{shop.shop_name}</strong></p>
          <p className="mt-2 text-sm text-gray-600">(Placeholder) Danh sách đơn hàng, trạng thái, tracking, xử lý hoàn trả.</p>
        </div>
      ) : (
        <div>Bạn chưa có cửa hàng. Hãy đăng ký shop.</div>
      )}
    </div>
  );
};

export default Orders;
