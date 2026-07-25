import React from 'react';
import { useParams } from 'react-router-dom';
import { db } from '@/services/mockDb';

export const ProductReviews: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? db.getProduct(slug) : null;
  const reviews = db.get<any[]>('lumina_reviews').filter(r => r.product_id === (product?.product_id || ''));
  const users = db.getUsers();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Đánh giá: {product?.product_name || '—'}</h1>
      {reviews.length === 0 ? (
        <div>Chưa có đánh giá nào cho sản phẩm này.</div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => {
            const u = users.find(us => us.user_id === r.user_id);
            return (
              <div key={r.review_id} className="border rounded p-3">
                <div className="flex items-center gap-3">
                  <img src={u?.avatar} alt={u?.full_name} className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-semibold">{u?.full_name}</div>
                    <div className="text-sm text-yellow-600">Rating: {r.rating}★</div>
                  </div>
                </div>
                <p className="mt-2">{r.comment}</p>
                <div className="text-xs text-gray-400 mt-1">{new Date(r.created_at).toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
