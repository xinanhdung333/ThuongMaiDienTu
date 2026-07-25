import React from 'react';
import ProductCard from '@/components/product/ProductCard';
import { db } from '@/services/mockDb';

export const FlashSale: React.FC = () => {
  const products = db.getProducts().slice(0,6);
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Flash Sale</h1>
      <p className="text-sm text-gray-500">Các ưu đãi có thời hạn ngắn (placeholder)</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {products.map(p => <ProductCard key={p.product_id} product={p} />)}
      </div>
    </div>
  );
};

export default FlashSale;
