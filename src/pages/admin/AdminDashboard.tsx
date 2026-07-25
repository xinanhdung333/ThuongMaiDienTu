import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { User } from '@/types';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  const load = () => {
    api.users.getAll().then((all) => setUsers(all)).catch(() => setUsers([]));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleBlock = (u: User) => {
    const status = u.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    api.users.update(u.user_id, { status: status as any }).then(() => load()).catch(() => {});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Admin Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
          <h2 className="font-extrabold text-sm mb-3">Users</h2>
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.user_id} className="p-3 rounded-lg border border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm">{u.full_name}</div>
                  <div className="text-xs text-slate-400">{u.email} • Roles: {u.roles.join(', ')}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-xs px-2 py-1 rounded ${u.status === 'BLOCKED' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>{u.status}</div>
                  <button onClick={() => toggleBlock(u)} className="text-xs px-3 py-1 rounded border">{u.status === 'BLOCKED' ? 'Unblock' : 'Block'}</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 lg:col-span-2">
          <h2 className="font-extrabold text-sm mb-3">Products & Shops</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <h3 className="text-xs font-bold mb-2">Products</h3>
              <ProductsAdmin />
            </div>
            <div>
              <h3 className="text-xs font-bold mb-2">Shops</h3>
              <ShopsAdmin />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;

const ProductsAdmin: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);

  const load = () => {
    api.products.list().then((all) => setProducts(all)).catch(() => setProducts([]));
  };

  useEffect(() => load(), []);

  const toggleStatus = (p: any) => {
    const next = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    api.products.update(p.product_id, { status: next }).then(() => load()).catch(() => {});
  };

  return (
    <div className="space-y-2">
      {products.map(p => (
        <div key={p.product_id} className="p-2 rounded border flex items-center justify-between">
          <div className="min-w-0">
            <div className="font-bold text-sm truncate">{p.product_name}</div>
            <div className="text-xs text-slate-400">{p.shop?.shop_name}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-xs px-2 py-1 rounded ${p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>{p.status}</div>
            <button onClick={() => toggleStatus(p)} className="text-xs px-2 py-1 rounded border">Toggle</button>
          </div>
        </div>
      ))}
    </div>
  );
};

const ShopsAdmin: React.FC = () => {
  const [shops, setShops] = useState<any[]>([]);

  const load = () => {
    api.shops.list().then((s) => setShops(s)).catch(() => setShops([]));
  };

  useEffect(() => load(), []);

  const toggleShopStatus = (shopId: string) => {
    const shop = shops.find(s => s.shop_id === shopId);
    if (!shop) return;
    const next = shop.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    api.shops.update(shopId, { status: next }).then(() => load()).catch(() => {});
  };

  return (
    <div className="space-y-2">
      {shops.map(s => (
        <div key={s.shop_id} className="p-2 rounded border flex items-center justify-between">
          <div>
            <div className="font-bold text-sm">{s.shop_name}</div>
            <div className="text-xs text-slate-400">Owner: {s.owner_id}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-xs px-2 py-1 rounded ${s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>{s.status}</div>
            <button onClick={() => toggleShopStatus(s.shop_id)} className="text-xs px-2 py-1 rounded border">Toggle</button>
          </div>
        </div>
      ))}
    </div>
  );
};
