import React from 'react';
import { db } from '@/services/mockDb';

export const MyVouchers: React.FC = () => {
  const v = db.getVouchers();
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Mã giảm giá của bạn</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {v.map(vc => (
          <div key={vc.voucher_id} className="border rounded p-3">
            <div className="font-bold">{vc.voucher_name}</div>
            <div className="text-sm text-gray-600">Code: {vc.voucher_code}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyVouchers;
