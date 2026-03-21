import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, ChevronDown, Search as SearchIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ProductCard';

const sortOptions = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name: A-Z', value: 'name_asc' },
  { label: 'Name: Z-A', value: 'name_desc' },
];

export default function AllProductsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';
  const initialCategory = searchParams.get('category') || null;

  const [selectedCat, setSelectedCat] = useState<string | null>(initialCategory);
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOpen, setSortOpen] = useState(false);
  const [query, setQuery] = useState('');

  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  const filtered = useMemo(() => {
    let result = [...products];

    // Text search
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCat) {
      result = result.filter(p => p.category === selectedCat);
    }

    // Section filter
    if (activeFilter === 'deals') {
      result = result.filter(p => p.discount >= 20);
    } else if (activeFilter === 'popular') {
      result = result.slice(6, 12);
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return result;
  }, [products, query, selectedCat, activeFilter, sortBy]);

  const filterTabs = [
    { label: 'All Products', value: 'all' },
    { label: 'Flash Deals', value: 'deals' },
    { label: 'Recommended', value: 'recommended' },
    { label: 'Popular', value: 'popular' },
  ];

  const pageTitle = activeFilter === 'deals'
    ? 'Flash Deals'
    : activeFilter === 'recommended'
      ? 'Recommended for You'
      : activeFilter === 'popular'
        ? 'Popular Products'
        : 'All Products';

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 py-4"
        >
          <button
            onClick={() => navigate(-1)}
            className="text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-display font-bold text-foreground">{pageTitle}</h1>
            <p className="text-xs text-muted-foreground">{filtered.length} products</p>
          </div>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 mb-4"
        >
          <SearchIcon size={16} className="text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </motion.div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
          {filterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => { setActiveFilter(tab.value); setSelectedCat(null); }}
              className={cn(
                'text-xs font-medium px-4 py-2 rounded-full border shrink-0 transition-all duration-200',
                activeFilter === tab.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:border-primary/40'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category pills + Sort */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
            <SlidersHorizontal size={14} className="text-muted-foreground shrink-0" />
            <button
              onClick={() => setSelectedCat(null)}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-full border shrink-0 transition-colors',
                !selectedCat ? 'bg-foreground text-background border-foreground' : 'bg-card border-border text-muted-foreground'
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
                  selectedCat === c.id
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card border-border text-muted-foreground'
                )}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setSortOpen(prev => !prev)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground hover:border-primary/40 transition-colors"
            >
              Sort
              <ChevronDown size={12} className={cn('transition-transform', sortOpen && 'rotate-180')} />
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1.5 w-48 bg-card border border-border/60 rounded-xl shadow-xl overflow-hidden z-20"
                >
                  {sortOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                      className={cn(
                        'w-full text-left text-xs px-4 py-2.5 transition-colors',
                        sortBy === opt.value
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground hover:bg-muted/50'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border/60 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <div className="p-3">
                    <div className="h-2.5 bg-muted rounded w-1/3 mb-2" />
                    <div className="h-3 bg-muted rounded w-3/4 mb-1" />
                    <div className="h-3 bg-muted rounded w-1/2 mb-3" />
                    <div className="h-4 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : filtered.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <span className="text-5xl">🔍</span>
              <p className="text-sm text-muted-foreground mt-3">No products found</p>
              <button
                onClick={() => { setQuery(''); setSelectedCat(null); setActiveFilter('all'); }}
                className="text-xs font-medium text-primary mt-2 hover:underline"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
