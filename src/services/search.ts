import { ProductWithDetails } from '@/types';
import { db } from '@/services/mockDb';

const tokenize = (text: string) => text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

const nameMatchScore = (queryTokens: string[], name: string) => {
  const nameTokens = tokenize(name);
  if (queryTokens.length === 0) return 0;
  // exact substring boost
  const q = queryTokens.join(' ');
  if (name.toLowerCase().includes(q)) return 1;

  // token overlap ratio
  const matched = queryTokens.filter(t => nameTokens.includes(t)).length;
  return matched / Math.max(queryTokens.length, nameTokens.length);
};

const normalize = (val: number, min: number, max: number) => {
  if (max === min) return 0;
  return (val - min) / (max - min);
};

export const searchProducts = (query: string, sort: 'relevance' | 'sold' | 'rating' | 'price_low' | 'price_high' | 'newest' = 'relevance') => {
  const q = (query || '').trim();
  const products = db.getProducts();
  if (!q) {
    // default ordering
    if (sort === 'sold') return products.slice().sort((a,b) => b.sold_quantity - a.sold_quantity);
    if (sort === 'rating') return products.slice().sort((a,b) => (b.average_rating || 0) - (a.average_rating || 0));
    if (sort === 'newest') return products.slice().sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return products;
  }

  const qTokens = tokenize(q);

  // compute sold and rating ranges
  const solds = products.map(p => p.sold_quantity || 0);
  const ratings = products.map(p => p.average_rating || 0);
  const prices = products.map(p => Math.min(...p.variants.map(v => v.price || Infinity)));
  const soldMin = Math.min(...solds); const soldMax = Math.max(...solds);
  const ratingMin = Math.min(...ratings); const ratingMax = Math.max(...ratings);
  const priceMin = Math.min(...prices); const priceMax = Math.max(...prices);

  const scored = products.map(p => {
    const nm = nameMatchScore(qTokens, p.product_name);
    const soldNorm = normalize(p.sold_quantity || 0, soldMin, soldMax);
    const ratingNorm = normalize(p.average_rating || 0, ratingMin, ratingMax);
    const price = Math.min(...p.variants.map(v => v.price || Infinity));

    // final score: name match heavy + popularity + rating
    const score = nm * 0.6 + soldNorm * 0.25 + ratingNorm * 0.15;
    return { product: p, score, price };
  });

  let sorted = scored.sort((a,b) => b.score - a.score);

  if (sort === 'sold') sorted = scored.sort((a,b) => (b.product.sold_quantity || 0) - (a.product.sold_quantity || 0));
  if (sort === 'rating') sorted = scored.sort((a,b) => (b.product.average_rating || 0) - (a.product.average_rating || 0));
  if (sort === 'price_low') sorted = scored.sort((a,b) => a.price - b.price);
  if (sort === 'price_high') sorted = scored.sort((a,b) => b.price - a.price);
  if (sort === 'newest') sorted = scored.sort((a,b) => new Date(b.product.created_at).getTime() - new Date(a.product.created_at).getTime());

  return sorted.map(s => s.product);
};

export const autocompleteProducts = (prefix: string, limit = 6) => {
  const q = (prefix || '').trim().toLowerCase();
  if (!q) return [] as ProductWithDetails[];
  const products = db.getProducts();
  const starts = products.filter(p => p.product_name.toLowerCase().startsWith(q));
  const includes = products.filter(p => p.product_name.toLowerCase().includes(q) && !p.product_name.toLowerCase().startsWith(q));
  return starts.concat(includes).slice(0, limit);
};

export default { searchProducts, autocompleteProducts };
