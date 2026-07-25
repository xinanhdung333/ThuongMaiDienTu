import React, { useEffect, useState } from 'react';
import { db } from '@/services/mockDb';

const ManageProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);

  const load = () => setProducts(db.getProducts());

  useEffect(() => load(), []);

  const toggleApprove = (productId: string) => {
    const p = db.getProduct(productId);
    if (!p) return;
    const next = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    db.updateProduct(productId, { status: next });
    load();
  };

  const removeProduct = (productId: string) => {
    if (!confirm('Xóa sản phẩm này vĩnh viễn?')) return;
    db.deleteProduct(productId);
    load();
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-900 border rounded-2xl">
      <h2 className="font-bold mb-3">Manage Products</h2>
      <div className="space-y-2">
        {products.map(p => (
          <div key={p.product_id} className="flex items-center justify-between p-2 border rounded">
            <div>
              <div className="font-semibold">{p.product_name}</div>
              <div className="text-xs text-slate-400">{p.shop?.shop_name}</div>
            </div>
              <div className="flex items-center gap-2">
              <div className={`text-xs px-2 py-1 rounded ${p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>{p.status}</div>
              <button onClick={() => toggleApprove(p.product_id)} className="px-2 py-1 rounded border text-xs">{p.status === 'ACTIVE' ? 'Unapprove' : 'Approve'}</button>
              <button onClick={() => removeProduct(p.product_id)} className="px-2 py-1 rounded border text-xs text-rose-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageProducts;
