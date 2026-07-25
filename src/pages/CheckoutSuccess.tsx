import React from 'react';
import { Link } from 'react-router-dom';

export const CheckoutSuccess: React.FC = () => {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Thanh toán thành công!</h1>
      <p className="mb-4">Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được ghi nhận.</p>
      <Link to="/orders" className="inline-block bg-primary text-white px-4 py-2 rounded">Xem đơn hàng</Link>
    </div>
  );
};

export default CheckoutSuccess;
