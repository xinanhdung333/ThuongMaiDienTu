import React from 'react';
import { db } from '@/services/mockDb';

export const Promotions: React.FC = () => {
  const vouchers = db.getVouchers();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Ưu đãi & Mã giảm giá</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vouchers.map(v => (
          <div key={v.voucher_id} className="border rounded p-4">
            <h3 className="font-bold">{v.voucher_name} ({v.voucher_code})</h3>
            <p className="text-sm text-gray-600">Loại: {v.discount_type} • Giá trị: {v.discount_value}{v.discount_type === 'PERCENT' ? '%' : '₫'}</p>
            <p className="text-sm text-gray-500">Áp dụng tối thiểu: ₫{v.min_order_amount?.toLocaleString() || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Promotions;
