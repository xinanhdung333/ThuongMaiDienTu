import React, { useEffect, useState } from 'react';
import { db } from '@/services/mockDb';

const ManageShops: React.FC = () => {
  const [shops, setShops] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all'|'pending'|'active'|'inactive'>('all');

  const load = () => {
    let s = db.getShops();
    if (filter === 'pending') s = s.filter((x:any) => x.status === 'PENDING');
    if (filter === 'active') s = s.filter((x:any) => x.status === 'ACTIVE');
    if (filter === 'inactive') s = s.filter((x:any) => x.status === 'INACTIVE');
    setShops(s);
  };

  useEffect(() => load(), [filter]);

  const approveShop = (shopId: string) => {
    db.updateShop(shopId, { status: 'ACTIVE' });
    db.recordAudit(db.getCurrentUser()?.user_id || null, `Approved shop ${shopId}`, 'SHOP_APPROVED');
    load();
  };

  const toggleShop = (shopId: string) => {
    const s = db.getShop(shopId);
    if (!s) return;
    const next = s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    db.updateShop(shopId, { status: next });
    db.recordAudit(db.getCurrentUser()?.user_id || null, `${next === 'ACTIVE' ? 'Activated' : 'Deactivated'} shop ${shopId}`, 'SHOP_STATUS_TOGGLED');
    load();
  };

  const deleteShop = (shopId: string) => {
    if (!confirm('Delete shop and ALL related products/variants? This will permanently remove data.')) return;
    db.deleteShopCascade(shopId);
    load();
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-900 border rounded-2xl">
      <h2 className="font-bold mb-3">Manage Shops / Sellers</h2>

      <div className="mb-3 flex items-center gap-2">
        <label className="text-sm">Filter:</label>
        <select value={filter} onChange={e => setFilter(e.target.value as any)} className="text-sm border rounded px-2 py-1">
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="space-y-3">
        {shops.map(s => (
          <div key={s.shop_id} className="flex items_center justify-between p-3 border rounded">
            <div>
              <div className="font-semibold">{s.shop_name}</div>
              <div className="text-xs text-slate-400">Owner: {s.owner_id} • {s.total_followers || 0} followers</div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`text-xs px-2 py-1 rounded ${s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-500' : s.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' : 'bg-rose-50 text-rose-500'}`}>{s.status}</div>
              {s.status === 'PENDING' && <button onClick={() => approveShop(s.shop_id)} className="px-2 py-1 rounded border text-xs bg-emerald-500 text-white">Approve</button>}
              <button onClick={() => toggleShop(s.shop_id)} className="px-2 py-1 rounded border text-xs">{s.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button>
              <button onClick={() => deleteShop(s.shop_id)} className="px-2 py-1 rounded border text-xs text-rose-700">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageShops;
