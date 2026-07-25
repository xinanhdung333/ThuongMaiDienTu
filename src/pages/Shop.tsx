import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '@/components/product/ProductCard';
import { api } from '@/services/api';
import { normalizeProducts } from '@/services/productMapper';
import type { Shop as ShopType, ProductWithDetails } from '@/types';

export const Shop: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const [shop, setShop] = useState<ShopType | null>(null);
  const [products, setProducts] = useState<ProductWithDetails[]>([]);

  useEffect(() => {
    if (!shopId) return;

    const loadShop = async () => {
      try {
        const [shopRes, productsRes] = await Promise.all([
          api.shops.get(shopId).catch(() => null),
          api.products.list().catch(() => []),
        ]);

        setShop(shopRes);
        setProducts(normalizeProducts((productsRes || []).filter((product: any) => product.shop_id === shopId), shopRes ? [shopRes] : []));
      } catch {
        setShop(null);
        setProducts([]);
      }
    };

    loadShop();
  }, [shopId]);

  return (
    <div className="p-4">
      {shop ? (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <img src={shop.logo} alt={shop.shop_name} className="w-20 h-20 object-cover rounded" />
            <div>
              <h2 className="text-2xl font-bold">{shop.shop_name}</h2>
              <p className="text-sm text-gray-600">{shop.description}</p>
              <div className="text-sm text-gray-500">Rating: {shop.rating} • Followers: {shop.total_followers}</div>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-3">Sản phẩm của cửa hàng</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        </div>
      ) : (
        <div>Shop không tìm thấy.</div>
      )}
    </div>
  );
};

export default Shop;
