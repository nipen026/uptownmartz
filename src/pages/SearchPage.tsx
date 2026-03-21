import { Search as SearchIcon, TrendingUp, X, SlidersHorizontal } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const trending = ['Milk', 'Bananas', 'Bread', 'Eggs', 'Maggi', 'Coke', 'Butter', 'Rice'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  const results = useMemo(() => {
    let filtered = products;
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    if (selectedCat) {
      filtered = filtered.filter(p => p.category === selectedCat);
    }
    return filtered;
  }, [query, selectedCat, products]);

  const showResults = query.trim() || selectedCat;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-6xl mx-auto px-4">
        <div className="py-4">
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3.5 shadow-sm">
            <SearchIcon size={18} className="text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for groceries..."
              className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={16} />
              </button>
            )}
          </motion.div>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
          <SlidersHorizontal size={14} className="text-muted-foreground shrink-0" />
          <button
            onClick={() => setSelectedCat(null)}
            className={cn(
              'text-xs font-medium px-3 py-1.5 rounded-full border shrink-0 transition-colors',
              !selectedCat ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground'
            )}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(selectedCat === c.id ? null : c.id)}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-full border shrink-0 transition-colors',
                selectedCat === c.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground'
              )}
            >
              {c.image} {c.name}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div key="trending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" />
                Trending Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {trending.map((t, i) => (
                  <motion.button
                    key={t}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setQuery(t)}
                    className="bg-card border border-border rounded-full px-4 py-2 text-xs font-medium text-foreground hover:border-primary/50 transition-colors"
                  >
                    {t}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border p-3 animate-pulse">
                  <div className="h-24 bg-muted rounded-xl mb-2" />
                  <div className="h-3 bg-muted rounded w-3/4 mb-1" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ))}
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-xs text-muted-foreground mb-3">{results.length} result{results.length > 1 ? 's' : ''} found</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {results.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center mt-20">
              <span className="text-5xl">🔍</span>
              <p className="text-sm text-muted-foreground mt-3">No results for "{query}"</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
