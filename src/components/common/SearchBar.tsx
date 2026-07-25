import React, { useEffect, useState, useRef } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import searchService from '@/services/search';

interface Props {
  initial?: string;
}

const SearchBar: React.FC<Props> = ({ initial = '' }) => {
  const [query, setQuery] = useState(initial);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const nav = useNavigate();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const s = searchService.autocompleteProducts(query, 6);
      setSuggestions(s);
      setShowSuggestions(true);
    }, 180);
  }, [query]);

  const submit = (q?: string) => {
    const finalQ = (q ?? query).trim();
    if (!finalQ) {
      nav('/products');
      return;
    }
    nav(`/search?q=${encodeURIComponent(finalQ)}`);
    setShowSuggestions(false);
  };

  return (
    <div className="relative flex-1 max-w-md mx-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Search premium goods..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
          onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
          className="w-full pl-4 pr-11 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
        />
        <button onClick={() => submit()} className="absolute right-1 top-1 h-8 w-8 rounded-lg bg-primary text-white hover:bg-primary-dark flex items-center justify-center transition-all cursor-pointer active:scale-95">
          <SearchIcon className="w-4 h-4" />
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg shadow-lg z-50">
          {suggestions.map(s => (
            <div key={s.product_id} className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-3" onClick={() => { nav(`/product/${s.slug}`); setShowSuggestions(false); }}>
              <img src={s.thumbnail} alt={s.product_name} className="w-10 h-10 object-cover rounded" />
              <div className="flex-1">
                <div className="text-sm font-semibold truncate">{s.product_name}</div>
                <div className="text-xs text-gray-500">{s.shop?.shop_name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
