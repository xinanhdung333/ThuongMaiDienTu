import React, { useEffect, useState } from 'react';
import { db } from '@/services/mockDb';

export const Vouchers: React.FC = () => {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [value, setValue] = useState<number | ''>('');

  const load = () => {
    const shop = db.getShopByOwner(db.getCurrentUser()?.user_id || '')
    const v = shop ? db.getShopVouchers(shop.shop_id) : [];
    setVouchers(v);
  };

  useEffect(() => load(), []);

  const create = () => {
    const shop = db.getShopByOwner(db.getCurrentUser()?.user_id || '');
    if (!shop) return alert('No shop');
    db.createVoucher({ shop_id: shop.shop_id, voucher_code: code || undefined, voucher_name: name || undefined, discount_type: 'FIXED', discount_value: Number(value) || 0, min_order_amount: 0, start_at: new Date().toISOString(), end_at: new Date(Date.now()+86400000*30).toISOString(), status: 'ACTIVE' });
    setCode(''); setName(''); setValue('');
    load();
  };

  const remove = (id: string) => {
    if (!confirm('Delete voucher?')) return;
    db.deleteVoucher(id);
    load();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Vouchers for your Shop</h1>

      <div className="p-3 border rounded mb-4">
        <div className="grid grid-cols-3 gap-2">
          <input placeholder="Code (optional)" value={code} onChange={e=>setCode(e.target.value)} className="px-3 py-2 rounded border" />
          <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} className="px-3 py-2 rounded border" />
          <input placeholder="Value" value={value as any} onChange={e=>setValue(Number(e.target.value))} className="px-3 py-2 rounded border" />
        </div>
        <div className="flex justify-end mt-3">
          <button onClick={create} className="px-3 py-2 rounded bg-primary text-white">Create Voucher</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {vouchers.map(v => (
          <div key={v.voucher_id} className="p-3 border rounded">
            <div className="font-bold">{v.voucher_name}</div>
            <div className="text-xs text-gray-500">Code: {v.voucher_code} • Value: {v.discount_value}{v.discount_type==='PERCENT' ? '%' : '₫'}</div>
            <div className="flex justify-end mt-2">
              <button onClick={()=>remove(v.voucher_id)} className="px-2 py-1 rounded border text-rose-600 text-xs">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
};

export default Vouchers;
