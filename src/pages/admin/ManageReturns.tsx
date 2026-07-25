import React, { useEffect, useState } from 'react';
import { db } from '@/services/mockDb';

export const ManageReturns: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);

  const load = () => setRequests(db.getReturnRequests());

  useEffect(() => load(), []);

  const handleUpdate = (id: string, status: string) => {
    const note = prompt('Ghi chú (tuỳ chọn):') || '';
    db.updateReturnRequestStatus(id, status, db.getCurrentUser()?.user_id, note);
    if (status === 'APPROVED') {
      // For demo, auto-record a refund equal to 10000
      db.recordRefund(id, 10000, 'MANUAL', db.getCurrentUser()?.user_id);
    }
    load();
    alert('Updated');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Yêu cầu trả hàng / Hoàn tiền</h1>
      {requests.length === 0 ? <div>Không có yêu cầu nào.</div> : (
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r.return_id} className="p-3 border rounded">
              <div className="flex justify-between">
                <div>
                  <div className="font-bold">Return: {r.return_id}</div>
                  <div className="text-xs text-gray-500">Order: {r.order_id} • Item: {r.order_item_id}</div>
                  <div className="text-sm mt-2">{r.reason}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`text-xs px-2 py-1 rounded ${r.status==='PENDING' ? 'bg-yellow-50 text-yellow-600' : r.status==='APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{r.status}</div>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(r.return_id, 'APPROVED')} className="px-2 py-1 rounded bg-emerald-500 text-white text-xs">Approve</button>
                    <button onClick={() => handleUpdate(r.return_id, 'REJECTED')} className="px-2 py-1 rounded bg-rose-500 text-white text-xs">Reject</button>
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

export default ManageReturns;
