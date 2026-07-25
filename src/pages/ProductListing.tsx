import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { api } from '@/services/api';
import { ProductWithDetails, Category, Brand } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/common/Skeleton';
import { normalizeProducts, buildBrandOptions, fallbackCategories } from '@/services/productMapper';
import { 
  Filter, SearchX, SlidersHorizontal, Star, ChevronDown, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ProductListing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categoryId } = useParams<{ categoryId: string }>();
  
  const query = searchParams.get('q') || '';
  const sortParam = searchParams.get('sort') || 'recommended';

  // DB States
  const [allProducts, setAllProducts] = useState<ProductWithDetails[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categoryId ? [categoryId] : []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState<number | null>(null);

  // UI States
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState(sortParam);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes, shopsRes] = await Promise.all([
          api.products.list(),
          api.client.get('/categories').catch(() => ({ data: fallbackCategories })),
          api.shops.list().catch(() => []),
        ]);

        const normalizedProducts = normalizeProducts(productsRes || [], shopsRes || []);
        setAllProducts(normalizedProducts);
        setCategories((categoriesRes?.data || fallbackCategories).slice(0, 8));
        setBrands(buildBrandOptions(normalizedProducts));
      } catch {
        setAllProducts([]);
        setCategories(fallbackCategories);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update selected category if categoryId param changes
  useEffect(() => {
    if (categoryId) {
      setSelectedCategories([categoryId]);
    } else {
      setSelectedCategories([]);
    }
  }, [categoryId]);

  // Main Filter & Sort Logic
  useEffect(() => {
    if (allProducts.length === 0) return;

    let result = [...allProducts];

    // 1. Text Search query
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(p => 
        p.product_name.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q) ||
        p.brand?.brand_name.toLowerCase().includes(q)
      );
    }

    // 2. Categories Filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => p.category_id && selectedCategories.includes(p.category_id));
    }

    // 3. Brands Filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => p.brand_id && selectedBrands.includes(p.brand_id));
    }

    // 4. Price range
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) {
      result = result.filter(p => {
        const itemPrice = p.variants?.[0]?.price || 0;
        return itemPrice >= min;
      });
    }
    if (!isNaN(max)) {
      result = result.filter(p => {
        const itemPrice = p.variants?.[0]?.price || 0;
        return itemPrice <= max;
      });
    }

    // 5. Rating filter
    if (minRating !== null) {
      result = result.filter(p => p.average_rating >= minRating);
    }

    // 6. Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => (a.variants?.[0]?.price || 0) - (b.variants?.[0]?.price || 0));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.average_rating - a.average_rating);
    } else if (sortBy === 'sales') {
      result.sort((a, b) => b.sold_quantity - a.sold_quantity);
    } else {
      // recommended / default
      result.sort((a, b) => b.sold_quantity - a.sold_quantity);
    }

    setFilteredProducts(result);
  }, [allProducts, query, selectedCategories, selectedBrands, minPrice, maxPrice, minRating, sortBy]);

  const handleCategoryToggle = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleBrandToggle = (id: string) => {
    setSelectedBrands(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMinPrice('');
    setMaxPrice('');
    setMinRating(null);
    setSearchParams({});
  };

  const activeCategoryObject = categories.find(c => c.category_id === categoryId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white">
            {activeCategoryObject ? activeCategoryObject.category_name : query ? `Search Results for "${query}"` : 'Browse Catalogue'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Showing {filteredProducts.length} premium products
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Sort by:</label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                const next = new URLSearchParams(searchParams);
                next.set('sort', e.target.value);
                setSearchParams(next);
              }}
              className="pl-3 pr-8 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer text-slate-800 dark:text-slate-200"
            >
              <option value="recommended">Best Recommended</option>
              <option value="sales">Top Sellers</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
          
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-primary flex items-center justify-center cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden md:flex flex-col gap-6 w-60 shrink-0 sticky top-24 p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-800">
            <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-primary" /> Filter Options
            </span>
            <button
              onClick={clearFilters}
              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Categories list */}
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Departments</h4>
            <div className="flex flex-col gap-2.5">
              {categories.map(c => {
                const active = selectedCategories.includes(c.category_id);
                return (
                  <button
                    key={c.category_id}
                    onClick={() => handleCategoryToggle(c.category_id)}
                    className={`flex items-center justify-between text-left text-xs font-bold transition-colors ${
                      active ? 'text-primary' : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <span>{c.category_name}</span>
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[8px] font-extrabold ${
                      active ? 'border-primary bg-primary text-white' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'
                    }`}>
                      {active && '✓'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brands list */}
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Brands</h4>
            <div className="flex flex-col gap-2.5">
              {brands.map(b => {
                const active = selectedBrands.includes(b.brand_id);
                return (
                  <button
                    key={b.brand_id}
                    onClick={() => handleBrandToggle(b.brand_id)}
                    className={`flex items-center justify-between text-left text-xs font-bold transition-colors ${
                      active ? 'text-primary' : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <span>{b.brand_name}</span>
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[8px] font-extrabold ${
                      active ? 'border-primary bg-primary text-white' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'
                    }`}>
                      {active && '✓'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Price Range (₫)</h4>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full text-center px-2 py-1.5 border border-slate-100 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full text-center px-2 py-1.5 border border-slate-100 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Customer Rating */}
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Minimum Rating</h4>
            <div className="flex flex-col gap-2">
              {[5, 4, 3, 2].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setMinRating(minRating === stars ? null : stars)}
                  className={`flex items-center gap-1.5 text-xs text-left font-semibold ${
                    minRating === stars ? 'text-primary' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <div className="flex text-amber-500 gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < stars ? 'fill-amber-500' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <span>{stars === 5 ? 'Only' : '& up'}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <div className="flex-1 w-full">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-sm">
              <div className="h-16 w-16 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <SearchX className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No products found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                No matches fit the selected filters. Please adjust pricing, departments, or keyword searches.
              </p>
              <button
                onClick={clearFilters}
                className="mt-5 py-2.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md shadow-primary/10 cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(p => (
                <ProductCard key={p.product_id} product={p} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* MOBILE FILTERS SIDE DRAWER */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 max-w-xs w-full bg-white dark:bg-slate-900 shadow-2xl p-6 overflow-y-auto z-50 flex flex-col justify-between"
            >
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-extrabold text-sm text-slate-950 dark:text-white">Filters</span>
                  <button onClick={() => setShowMobileFilters(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600">Close</button>
                </div>

                {/* Categories list */}
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Departments</h4>
                  <div className="flex flex-col gap-2.5">
                    {categories.map(c => {
                      const active = selectedCategories.includes(c.category_id);
                      return (
                        <button
                          key={c.category_id}
                          onClick={() => handleCategoryToggle(c.category_id)}
                          className="flex items-center justify-between text-left text-xs font-semibold"
                        >
                          <span className={active ? 'text-primary' : 'text-slate-600 dark:text-slate-400'}>{c.category_name}</span>
                          <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[8px] font-extrabold ${active ? 'border-primary bg-primary text-white' : 'border-slate-200 dark:border-slate-800'}`}>{active && '✓'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Price Range (₫)</h4>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full text-center py-1.5 border border-slate-100 dark:border-slate-850 rounded-lg text-xs bg-slate-50 dark:bg-slate-950"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full text-center py-1.5 border border-slate-100 dark:border-slate-850 rounded-lg text-xs bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <button
                  onClick={() => {
                    clearFilters();
                    setShowMobileFilters(false);
                  }}
                  className="flex-1 py-2.5 text-center text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 py-2.5 text-center text-xs font-bold bg-primary text-white rounded-xl shadow-md"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
export default ProductListing;
