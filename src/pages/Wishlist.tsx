import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, LoaderCircle, ShoppingBag, Trash2 } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { api } from '@/services/api';
import { ProductWithDetails } from '@/types';
import { normalizeProducts } from '@/services/productMapper';
import { useToast } from '@/context/ToastContext';

export const Wishlist: React.FC = () => {
  const { user } = useAuthStore();
  const { wishlist, isLoading, loadWishlist, removeWishlistItem } = useWishlistStore();
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProducts([]);
      setIsLoadingProducts(false);
      return;
    }

    const loadData = async () => {
      setIsLoadingProducts(true);
      try {
        await loadWishlist(user.user_id);
        const [allProducts, shops] = await Promise.all([
          api.products.list(),
          api.shops.list().catch(() => []),
        ]);
        setProducts(normalizeProducts(allProducts || [], shops || []));
      } catch {
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    void loadData();
  }, [user, loadWishlist]);

  const items = useMemo(() => {
    const ids = new Set(wishlist.map((item) => item.product_id));
    return products.filter((product) => ids.has(product.product_id));
  }, [products, wishlist]);

  const handleRemove = async (productId: string) => {
    if (!user) return;
    setRemovingId(productId);
    const removed = await removeWishlistItem(user.user_id, productId);
    setRemovingId(null);
    toast(removed ? 'Đã xóa sản phẩm khỏi danh sách yêu thích' : 'Không thể xóa sản phẩm. Vui lòng thử lại.', removed ? 'success' : 'error');
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/30">
          <Heart className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Đăng nhập để xem danh sách yêu thích</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">Lưu lại sản phẩm bạn thích để mua sắm thuận tiện hơn.</p>
        <Link to="/login" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md shadow-primary/20">
          Đăng nhập
        </Link>
      </div>
    );
  }

  const loading = isLoading || isLoadingProducts;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-rose-500">
            <Heart className="h-5 w-5 fill-rose-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Sản phẩm đã lưu</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white">Danh sách yêu thích</h1>
          {!loading && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{items.length} sản phẩm đang được lưu</p>}
        </div>
        <Link to="/products" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-primary hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <ShoppingBag className="h-4 w-4" /> Tiếp tục mua sắm
        </Link>
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center text-slate-500">
          <LoaderCircle className="mr-2 h-5 w-5 animate-spin text-primary" /> Đang tải danh sách yêu thích...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
          <Heart className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">Danh sách yêu thích đang trống</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Nhấn biểu tượng trái tim ở bất kỳ sản phẩm nào để lưu lại tại đây.</p>
          <Link to="/products" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">Khám phá sản phẩm</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((product) => (
            <div key={product.product_id} className="group relative">
              <ProductCard product={product} />
              <button
                type="button"
                onClick={() => void handleRemove(product.product_id)}
                disabled={removingId === product.product_id}
                className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1 text-[11px] font-semibold text-slate-500 opacity-0 shadow-sm transition-opacity hover:text-rose-500 group-hover:opacity-100 disabled:opacity-70 dark:bg-slate-900/95 dark:text-slate-300"
                aria-label={`Xóa ${product.product_name} khỏi danh sách yêu thích`}
              >
                {removingId === product.product_id ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Xóa
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
