import React, { useEffect, useState } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { ProductWithDetails } from '@/types';
import { normalizeProducts } from '@/services/productMapper';

export const Wishlist: React.FC = () => {
  const { user } = useAuthStore();
  const [items, setItems] = useState<ProductWithDetails[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadWishlist = async () => {
      try {
        const list = await api.wishlist.get(user.user_id);
        const products = await api.products.list();
        const shops = await api.shops.list().catch(() => []);
        const productIds = (list || []).map((entry: any) => entry.product_id);
        const visibleProducts = normalizeProducts((products || []).filter((product: any) => productIds.includes(product.product_id)), shops || []);
        setItems(visibleProducts);
      } catch {
        setItems([]);
      }
    };

    loadWishlist();
  }, [user]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Wishlist của bạn</h1>
      {items.length === 0 ? (
        <div>Danh sách ưa thích trống.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(p => <ProductCard key={p.product_id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
