import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '@/components/product/ProductCard';
import { searchProducts } from '@/services/search';

export const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const sort = (searchParams.get('sort') as any) || 'relevance';
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const results = searchProducts(q, sort);
    setProducts(results);
  }, [q, sort]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Kết quả tìm kiếm: "{q || 'Tất cả sản phẩm'}"</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sắp xếp:</label>
          <select value={sort} onChange={e => setSearchParams({ q, sort: e.target.value })} className="border rounded px-2 py-1 text-sm">
            <option value="relevance">Phù hợp nhất</option>
            <option value="sold">Bán chạy</option>
            <option value="rating">Đánh giá cao</option>
            <option value="price_low">Giá thấp → cao</option>
            <option value="price_high">Giá cao → thấp</option>
            <option value="newest">Hàng mới</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <ProductCard key={p.product_id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default Search;
