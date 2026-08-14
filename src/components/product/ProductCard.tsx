import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductWithDetails } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useToast } from '@/context/ToastContext';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: ProductWithDetails;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { toast } = useToast();

  const isFavorite = wishlist.some(p => p.product_id === product.product_id);
  const mainVariant = product.variants?.[0];
  const price = mainVariant?.price || 0;
  const originalPrice = mainVariant?.original_price;

  // Calculate discount percentage
  const discountPercent = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast('Please log in to add items to wishlist', 'info');
      navigate('/login');
      return;
    }
    const added = await toggleWishlist(user.user_id, product.product_id);
    toast(added ? 'Đã thêm vào danh sách yêu thích' : 'Đã xóa khỏi danh sách yêu thích', 'success');
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast('Please log in to add items to cart', 'info');
      navigate('/login');
      return;
    }
    if (mainVariant) {
      const result = await addItem(user.user_id, mainVariant.variant_id, 1);
      if (result.success) {
        toast('Added to cart successfully!', 'success');
      } else {
        toast(result.message || 'Failed to add item to cart.', 'error');
      }
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
    >
      <Link to={`/product/${product.slug || product.product_id}`} className="block flex-grow">
        
        {/* IMAGE CONTAINER */}
        <div className="relative aspect-square w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
          <img
            src={product.thumbnail || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&q=80'}
            alt={product.product_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* DISCOUNT BADGE */}
          {discountPercent > 0 && (
            <span className="absolute top-2.5 left-2.5 px-2 py-1 bg-primary text-[10px] font-extrabold text-white rounded-lg shadow-sm">
              -{discountPercent}% OFF
            </span>
          )}

          {/* FAVORITE BUTTON */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-2.5 right-2.5 h-8 w-8 rounded-full border bg-white/95 dark:bg-slate-900/95 flex items-center justify-center shadow-sm cursor-pointer border-slate-100 dark:border-slate-800 transition-colors ${
              isFavorite ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
            }`}
            aria-label={isFavorite ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
            title={isFavorite ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* DETAILS SECTION */}
        <div className="p-4 flex flex-col gap-1.5 justify-between">
          <div>
            {/* Category / Brand */}
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {product.brand?.brand_name || 'Generic'}
            </span>
            
            {/* Name */}
            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors line-clamp-2 h-8 leading-relaxed">
              {product.product_name}
            </h3>
          </div>

          <div>
            {/* Rating and Sold */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center text-amber-500 gap-0.5">
                <Star className="w-3 h-3 fill-amber-500" />
                <span className="text-[11px] font-bold mt-[1px]">
                  {product.average_rating > 0 ? product.average_rating : '5.0'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">|</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {product.sold_quantity > 0 ? `${product.sold_quantity} sold` : 'New'}
              </span>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline justify-between mt-3 gap-2">
              <div className="flex flex-col">
                {originalPrice && originalPrice > price && (
                  <span className="text-[10px] line-through text-slate-400 dark:text-slate-500">
                    ₫{originalPrice.toLocaleString('vi-VN')}
                  </span>
                )}
                <span className="font-extrabold text-sm text-primary">
                  ₫{price.toLocaleString('vi-VN')}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleFavoriteClick}
                  className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isFavorite
                      ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/30'
                      : 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                  aria-label={isFavorite ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
                  title={isFavorite ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={product.status === 'OUT_OF_STOCK'}
                  className="h-8 w-8 rounded-xl bg-primary-light text-primary hover:bg-primary hover:text-white dark:bg-primary/10 dark:text-primary dark:hover:bg-primary dark:hover:text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Thêm vào giỏ hàng"
                  title="Thêm vào giỏ hàng"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>

      </Link>
    </motion.div>
  );
};
export default ProductCard;
