import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { ProductWithDetails, Category } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/common/Skeleton';
import { normalizeProducts, fallbackCategories } from '@/services/productMapper';
import {
  Sparkles,
  Flame,
  Clock,
  ShieldCheck,
  Truck,
  RefreshCw,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  
  // Infinite Scroll State
  const [displayedProducts, setDisplayedProducts] = useState<ProductWithDetails[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollTriggerRef = useRef<HTMLDivElement>(null);

  // Flash Sale Timer State
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 12 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, categoriesRes, shopsRes] = await Promise.all([
          api.products.list(),
          api.client.get('/categories').catch(() => ({ data: fallbackCategories })),
          api.shops.list().catch(() => []),
        ]);

        const normalizedProducts = normalizeProducts(productsRes || [], shopsRes || []);
        setProducts(normalizedProducts);
        setDisplayedProducts(normalizedProducts.slice(0, 4));
        setCategories((categoriesRes?.data || fallbackCategories).slice(0, 8));
      } catch {
        setProducts([]);
        setDisplayedProducts([]);
        setCategories(fallbackCategories);
      }
    };

    loadData();

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Infinite Scroll simulation
  useEffect(() => {
    if (!scrollTriggerRef.current || products.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoadingMore && hasMore) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(scrollTriggerRef.current);
    return () => observer.disconnect();
  }, [products, displayedProducts, isLoadingMore, hasMore]);

  const loadMoreItems = () => {
    if (displayedProducts.length >= products.length) {
      setHasMore(false);
      return;
    }

    setIsLoadingMore(true);
    // Simulate API network latency of 1s
    setTimeout(() => {
      const currentLength = displayedProducts.length;
      const nextBatch = products.slice(currentLength, currentLength + 4);
      setDisplayedProducts(prev => [...prev, ...nextBatch]);
      setIsLoadingMore(false);
      
      if (currentLength + nextBatch.length >= products.length) {
        setHasMore(false);
      }
    }, 1000);
  };

  const padZero = (num: number) => num.toString().padStart(2, '0');

  // Filter lists for sections
  const flashSaleProducts = products.filter((_, idx) => idx % 2 === 0).slice(0, 4);
  const bestSellers = [...products].sort((a,b) => b.sold_quantity - a.sold_quantity).slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. HERO BANNER */}
      <section className="relative w-full overflow-hidden bg-slate-950 py-16 sm:py-24">
        {/* Decorative Radial Backgrounds */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,91,55,0.15),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(79,70,229,0.12),transparent_45%)]" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 flex flex-col items-start text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/10 text-primary font-bold text-xs mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Grand Opening Special Promotion
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none mb-6">
              Discover Next-Gen <br />
              <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-400 bg-clip-text text-transparent">
                Marketplace
              </span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Explore curated original designs, high performance gadgets, activewear, and skincare essentials. Pure craftsmanship delivered to your doorstep.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="py-3 px-6 rounded-xl bg-primary text-white hover:bg-primary-dark font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all cursor-pointer active:scale-98"
              >
                Shop Catalogue
              </Link>
              <Link
                to="/store/register"
                className="py-3 px-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-sm hover:text-white transition-all cursor-pointer"
              >
                Become Seller
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full relative max-w-md">
            <div className="aspect-video sm:aspect-square w-full rounded-3xl overflow-hidden shadow-2xl relative border border-slate-800 bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"
                alt="Lumina Keyboard Promo"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[10px] font-extrabold tracking-wider text-primary uppercase">Trending Gadgets</span>
                <h3 className="text-lg font-bold text-white mt-1">Lumina Mechanical Pro</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Triple-mode hot-swappable keycaps typing excellence.</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-extrabold text-primary">₫1.450.000</span>
                  <Link to="/product/lumina-pro-wireless-mechanical-keyboard" className="flex items-center gap-1.5 text-xs text-white hover:text-primary transition-colors font-semibold">
                    Explore Item <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPS BAR */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 py-6 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-primary"><ShieldCheck className="w-5 h-5" /></div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">100% Genuine</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Authorised brand partners only</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-primary"><Truck className="w-5 h-5" /></div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Fast Logistics</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Prompt cross-provincial courier</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-primary"><RefreshCw className="w-5 h-5" /></div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">7 Days Refund</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Hassle-free return policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-primary"><Sparkles className="w-5 h-5" /></div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Secure Checkout</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Protected financial gateways</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES GRID */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Browse Categories</h2>
            <p className="text-xs text-slate-400 mt-1">Discover items curated by departments</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((c) => (
            <Link
              key={c.category_id}
              to={`/category/${c.category_id}`}
              className="group p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="h-14 w-14 rounded-full overflow-hidden bg-slate-50 dark:bg-slate-950 mb-3 relative group-hover:scale-105 transition-transform duration-200">
                <img
                  src={c.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&q=80'}
                  alt={c.category_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors truncate w-full">
                {c.category_name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FLASH SALE SECTION */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-r from-primary/5 via-orange-500/5 to-amber-500/5 rounded-3xl mb-12 border border-primary/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-primary/10">
          <div className="flex items-center gap-3.5">
            <div className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-md animate-pulse"><Flame className="w-5 h-5 fill-white" /></div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Flash Sale</h2>
              <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Limited quantities only, buy now!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" /> Ends in:</span>
            <div className="flex items-center gap-1 text-xs font-extrabold text-white">
              <span className="bg-slate-900 dark:bg-slate-950 px-2.5 py-1.5 rounded-lg">{padZero(timeLeft.hours)}</span>
              <span className="text-slate-800 dark:text-slate-200">:</span>
              <span className="bg-slate-900 dark:bg-slate-950 px-2.5 py-1.5 rounded-lg">{padZero(timeLeft.minutes)}</span>
              <span className="text-slate-800 dark:text-slate-200">:</span>
              <span className="bg-slate-900 dark:bg-slate-950 px-2.5 py-1.5 rounded-lg">{padZero(timeLeft.seconds)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-4">
          {flashSaleProducts.map(p => (
            <ProductCard key={p.product_id} product={p} />
          ))}
        </div>
      </section>

      {/* 5. BEST SELLERS */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-4 mb-12">
        <div className="flex justify-between items-end mb-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-violet-500 text-white flex items-center justify-center shadow-md shadow-violet-500/10"><TrendingUp className="w-5 h-5" /></div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Best Sellers</h2>
              <p className="text-xs text-slate-400 mt-1">Most ordered products on Lumina</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {bestSellers.map(p => (
            <ProductCard key={p.product_id} product={p} />
          ))}
        </div>
      </section>

      {/* 6. RECOMMENDED FOR YOU (INFINITE SCROLL) */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 mb-16">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Recommended For You</h2>
          <p className="text-xs text-slate-400 mt-1">Personalized products based on your activity</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {displayedProducts.map(p => (
            <ProductCard key={p.product_id} product={p} />
          ))}
          
          {/* Skeleton Loaders for scrolling */}
          {isLoadingMore && (
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          )}
        </div>

        {/* Trigger intersection point */}
        <div ref={scrollTriggerRef} className="w-full text-center py-10 mt-6">
          {isLoadingMore ? (
            <p className="text-xs text-slate-400 font-medium">Fetching premium products...</p>
          ) : hasMore ? (
            <p className="text-xs text-slate-400 font-medium">Scroll down to see more recommendations</p>
          ) : (
            <p className="text-xs text-slate-400 font-semibold mt-4">You have reached the end of the collection.</p>
          )}
        </div>
      </section>

    </div>
  );
};
export default Home;
