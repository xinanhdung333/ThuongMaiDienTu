import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { ProductWithDetails, ProductVariantWithInventory, ProductReviewWithUser } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useToast } from '@/context/ToastContext';
import ProductCard from '@/components/product/ProductCard';
import { ProductDetailSkeleton } from '@/components/common/Skeleton';
import { normalizeProduct, normalizeProducts } from '@/services/productMapper';
import { 
  Star, Heart, ShoppingCart, Plus, Minus, Store, ChevronRight, Award
} from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { toast } = useToast();

  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Gallery states
  const [activeImage, setActiveImage] = useState('');
  const [isZooming, setIsZooming] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Purchase configurations
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantWithInventory | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<ProductReviewWithUser[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<ProductWithDetails[]>([]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const loadProduct = async () => {
      try {
        const [productRes, reviewsRes, productsRes, shopsRes] = await Promise.all([
          api.products.get(slug).catch(() => null),
          api.reviews.list(slug).catch(() => []),
          api.products.list().catch(() => []),
          api.shops.list().catch(() => []),
        ]);

        const match = productRes ? normalizeProduct(productRes, shopsRes || []) : null;
        if (match) {
          setProduct(match);
          setActiveImage(match.thumbnail || '');
          setReviews((reviewsRes || []).map((review: any) => ({ ...review, user: review.user || { user_id: '', full_name: 'Anonymous' } })) as ProductReviewWithUser[]);

          if (match.variants && match.variants.length > 0) {
            setSelectedVariant(match.variants[0]);
          }

          const related = (productsRes || []).filter((p: any) => p.category_id === match.category_id && p.product_id !== match.product_id).slice(0, 4);
          setRelatedProducts(normalizeProducts(related, shopsRes || []));
        } else {
          toast('Product not found.', 'error');
          navigate('/');
        }
      } catch {
        toast('Unable to load product.', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug, navigate, toast]);

  if (loading || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ProductDetailSkeleton />
      </div>
    );
  }

  const isFavorite = wishlist.some(p => p.product_id === product.product_id);
  const price = selectedVariant?.price || 0;
  const originalPrice = selectedVariant?.original_price;
  const maxAvailable = selectedVariant?.inventory
    ? selectedVariant.inventory.quantity - selectedVariant.inventory.reserved_quantity
    : selectedVariant?.status === 'ACTIVE'
      ? 99
      : 0;
  const isOutOfStock = !selectedVariant || maxAvailable <= 0;

  // Zoom Math
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      toast('Please login to edit wishlist', 'info');
      navigate('/login');
      return;
    }
    const added = await toggleWishlist(user.user_id, product.product_id);
    toast(added ? 'Added to Wishlist!' : 'Removed from Wishlist', 'success');
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast('Please login to add to cart', 'info');
      navigate('/login');
      return;
    }
    if (selectedVariant) {
      const result = await addItem(user.user_id, selectedVariant.variant_id, quantity);
      if (result.success) {
        toast('Added to cart successfully!', 'success');
      } else {
        toast(result.message || 'Could not add this item to the cart.', 'error');
      }
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast('Please login to buy now', 'info');
      navigate('/login');
      return;
    }
    if (selectedVariant) {
      const result = await addItem(user.user_id, selectedVariant.variant_id, quantity, true);
      if (result.success) {
        navigate('/checkout');
      } else {
        toast(result.message || 'Could not add this item to the cart.', 'error');
      }
    }
  };

  // Group attributes for cleaner display
  const allAttributesMap: Record<string, string[]> = {};
  product.variants?.forEach(v => {
    v.attributeValues?.forEach(av => {
      if (!allAttributesMap[av.attribute_name]) {
        allAttributesMap[av.attribute_name] = [];
      }
      if (!allAttributesMap[av.attribute_name].includes(av.value_name)) {
        allAttributesMap[av.attribute_name].push(av.value_name);
      }
    });
  });

  const isSelectedValue = (attrName: string, valName: string) => {
    return selectedVariant?.attributeValues?.some(av => av.attribute_name === attrName && av.value_name === valName);
  };

  const getVariantLabel = (variant: ProductVariantWithInventory) => {
    if (variant.attributeValues && variant.attributeValues.length > 0) {
      return variant.attributeValues.map(av => av.value_name).join(' / ');
    }
    if (variant.sku) {
      return variant.sku;
    }
    return `Variant ${product.variants?.findIndex(v => v.variant_id === variant.variant_id) + 1}`;
  };

  const selectVariantByAttr = (attrName: string, valName: string) => {
    // Find variant matches for selected values
    const currentValues = selectedVariant?.attributeValues || [];
    const targetValues = currentValues.map(av => {
      if (av.attribute_name === attrName) {
        return { attribute_name: attrName, value_name: valName };
      }
      return av;
    });

    const match = product.variants.find(v => {
      return targetValues.every(tv => v.attributeValues?.some(av => av.attribute_name === tv.attribute_name && av.value_name === tv.value_name));
    });

    if (match) {
      setSelectedVariant(match);
      setQuantity(1); // reset qty
    } else {
      // Find any variant that matches this selection directly
      const fallback = product.variants.find(v => v.attributeValues?.some(av => av.attribute_name === attrName && av.value_name === valName));
      if (fallback) {
        setSelectedVariant(fallback);
        setQuantity(1);
      }
    }
  };

  const selectVariantById = (variantId: string) => {
    const variant = product.variants.find(v => v.variant_id === variantId);
    if (variant) {
      setSelectedVariant(variant);
      setQuantity(1);
    }
  };

  const changeQty = (amount: number) => {
    const next = quantity + amount;
    if (next > 0 && next <= maxAvailable) {
      setQuantity(next);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6 font-medium">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/category/${product.category_id}`} className="hover:text-primary transition-colors">{product.category.category_name}</Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600 dark:text-slate-300 truncate max-w-xs">{product.product_name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        
        {/* LEFT: GALLERY & ZOOM */}
        <div className="flex flex-col gap-4">
          <div
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            className="relative aspect-square w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden cursor-crosshair"
          >
            <img
              src={activeImage}
              alt={product.product_name}
              className={`w-full h-full object-cover transition-transform duration-75 origin-center ${isZooming ? 'scale-[2]' : 'scale-100'}`}
              style={
                isZooming
                  ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` }
                  : undefined
              }
            />

            {/* Favorite button wrapper */}
            <button
              onClick={handleFavoriteToggle}
              className={`absolute top-4 right-4 h-10 w-10 rounded-full border bg-white dark:bg-slate-900 shadow-md flex items-center justify-center cursor-pointer border-slate-100 dark:border-slate-800 transition-colors ${
                isFavorite ? 'text-rose-500 border-rose-100 dark:border-rose-950 bg-rose-50/50 dark:bg-rose-950/20' : 'text-slate-400 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Sub Thumbnails */}
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map(img => (
                <button
                  key={img.image_id}
                  onClick={() => setActiveImage(img.image_url)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 bg-white dark:bg-slate-900 cursor-pointer ${
                    activeImage === img.image_url ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: DETAILS BUYING WRAPPER */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-primary-light text-primary text-[9px] font-extrabold uppercase border border-primary/10">Official</span>
              {product.brand && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{product.brand.brand_name}</span>}
            </div>
            
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white leading-tight">
              {product.product_name}
            </h1>
            
            {/* Rating counts */}
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
              <div className="flex items-center text-amber-500 gap-0.5">
                <span className="font-bold border-b border-amber-500 leading-none">{product.average_rating > 0 ? product.average_rating : '5.0'}</span>
                <div className="flex items-center gap-0.5 ml-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                </div>
              </div>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 dark:text-slate-400">
                <span className="font-bold border-b border-slate-300 text-slate-800 dark:text-slate-200">{product.review_count}</span> Reviews
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-800 dark:text-slate-200">{product.sold_quantity}</span> Sold
              </span>
            </div>
          </div>

          {/* Pricing area */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black text-primary">₫{price.toLocaleString('vi-VN')}</span>
              {originalPrice && originalPrice > price && (
                <>
                  <span className="text-xs line-through text-slate-400 dark:text-slate-500">₫{originalPrice.toLocaleString('vi-VN')}</span>
                  <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-black rounded">
                    -{Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 dark:bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <Award className="w-3.5 h-3.5" /> Lowest price guaranteed
            </div>
          </div>

          {/* Product description brief */}
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {product.description}
          </p>

          {/* Variants Selectors */}
          {Object.keys(allAttributesMap).length > 0 ? (
            <div className="flex flex-col gap-4 py-2 border-y border-slate-100 dark:border-slate-800/80">
              {Object.keys(allAttributesMap).map(attrName => (
                <div key={attrName} className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 sm:w-24 shrink-0 uppercase tracking-wide">{attrName}:</span>
                  <div className="flex flex-wrap gap-2">
                    {allAttributesMap[attrName].map(valName => {
                      const active = isSelectedValue(attrName, valName);
                      return (
                        <button
                          key={valName}
                          onClick={() => selectVariantByAttr(attrName, valName)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                            active
                              ? 'border-primary bg-primary-light text-primary dark:bg-primary/10'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                          }`}
                        >
                          {valName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : product.variants.length > 1 ? (
            <div className="py-4 border-y border-slate-100 dark:border-slate-800/80">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Choose a variant</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.variants.map(variant => (
                  <button
                    key={variant.variant_id}
                    onClick={() => selectVariantById(variant.variant_id)}
                    className={`w-full text-left p-4 rounded-2xl border text-xs font-bold transition-all ${
                      selectedVariant?.variant_id === variant.variant_id
                        ? 'border-primary bg-primary-light/10 text-primary dark:bg-primary/5'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{getVariantLabel(variant)}</span>
                      <span className="font-black">₫{Number(variant.price || 0).toLocaleString('vi-VN')}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                      SKU: {variant.sku || 'N/A'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Quantity selector & Inventory check */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 sm:w-24 shrink-0 uppercase tracking-wide">Quantity:</span>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
                <button
                  onClick={() => changeQty(-1)}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="h-9 w-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  {isOutOfStock ? 0 : quantity}
                </span>
                <button
                  onClick={() => changeQty(1)}
                  disabled={quantity >= maxAvailable || isOutOfStock}
                  className="h-9 w-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-medium">
                {isOutOfStock ? (
                  <span className="text-rose-500 font-bold">Out of stock</span>
                ) : (
                  `${maxAvailable} pieces available`
                )}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1 py-3.5 px-4 rounded-xl bg-primary-light text-primary hover:bg-primary hover:text-white dark:bg-primary/10 dark:text-primary dark:hover:bg-primary dark:hover:text-white text-xs font-bold border border-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              Add To Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="flex-1 py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md shadow-primary/15 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          </div>

        </div>

      </div>

      {/* SHOP METRICS PANEL */}
      {product.shop && (
        <section className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
              <img src={product.shop.logo} alt={product.shop.shop_name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                {product.shop.shop_name}
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[8px] uppercase font-bold">Active</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1 max-w-sm">{product.shop.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-6 md:pt-0 md:pl-6 w-full md:w-auto justify-around">
            <div>
              <span className="block font-black text-slate-900 dark:text-white text-sm">{product.shop.rating} / 5.0</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 block">Store Rating</span>
            </div>
            <div>
              <span className="block font-black text-slate-900 dark:text-white text-sm">{(product.shop.total_followers / 1000).toFixed(1)}k</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 block">Followers</span>
            </div>
            <Link
              to={`/seller-store/${product.shop_id}`}
              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary hover:text-primary text-xs font-bold transition-all text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <Store className="w-4 h-4" /> Visit Store
            </Link>
          </div>
        </section>
      )}

      {/* REVIEWS SECTION */}
      <section className="mb-12">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">Customer Reviews ({reviews.length})</h2>
        </div>

        {reviews.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
            No reviews have been written for this product yet.
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div
                key={r.review_id}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800/80 rounded-2xl flex gap-4"
              >
                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                  <img src={r.user.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User'} alt="user" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{r.user.full_name}</span>
                    <span className="text-[10px] text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  {/* stars */}
                  <div className="flex text-amber-500 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-500' : 'text-slate-200'}`} />
                    ))}
                  </div>

                  {r.variant_name && (
                    <span className="inline-block mt-1 text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">
                      Variant: {r.variant_name}
                    </span>
                  )}

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                    {r.comment}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="mb-8">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">Related Products</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
export default ProductDetail;
