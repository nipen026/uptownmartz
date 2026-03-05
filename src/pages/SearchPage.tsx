import { Search as SearchIcon, TrendingUp, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { products, categories } from '@/data/mock';
import { ProductCard } from '@/components/ProductCard';
import { useNavigate } from 'react-router-dom';

const trending = ['Milk', 'Bananas', 'Bread', 'Eggs', 'Maggi', 'Coke'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      categories.find(c => c.id === p.category)?.name.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-lg mx-auto px-4">
        <div className="py-4">
          <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
            <SearchIcon size={18} className="text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for groceries..."
              className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-muted-foreground">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {!query.trim() ? (
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              Trending Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {trending.map(t => (
                <button
                  key={t}
                  onClick={() => setQuery(t)}
                  className="bg-card border border-border rounded-full px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {results.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center mt-20">
            <span className="text-5xl">🔍</span>
            <p className="text-sm text-muted-foreground mt-3">No results for "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
