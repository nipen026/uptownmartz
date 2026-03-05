import { useParams, useNavigate } from 'react-router-dom';
import { categories, products } from '@/data/mock';
import { ProductCard } from '@/components/ProductCard';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

export default function CategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const category = categories.find(c => c.id === id);
  const categoryProducts = products.filter(p => p.category === id);
  const [sort, setSort] = useState<'default' | 'low' | 'high' | 'discount'>('default');

  const sorted = useMemo(() => {
    const arr = [...categoryProducts];
    if (sort === 'low') return arr.sort((a, b) => a.price - b.price);
    if (sort === 'high') return arr.sort((a, b) => b.price - a.price);
    if (sort === 'discount') return arr.sort((a, b) => b.discount - a.discount);
    return arr;
  }, [categoryProducts, sort]);

  if (!category) return <div className="p-4 text-center text-muted-foreground">Category not found</div>;

  const sortOptions = [
    { key: 'default' as const, label: 'Relevance' },
    { key: 'low' as const, label: 'Price: Low' },
    { key: 'high' as const, label: 'Price: High' },
    { key: 'discount' as const, label: 'Discount' },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 py-4">
          <button onClick={() => navigate(-1)} className="text-foreground hover:text-primary transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-display font-bold text-foreground">{category.name}</h1>
            <p className="text-xs text-muted-foreground">{sorted.length} products</p>
          </div>
        </motion.div>

        {/* Sort */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
          <SlidersHorizontal size={14} className="text-muted-foreground shrink-0" />
          {sortOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-full border shrink-0 transition-colors',
                sort === opt.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {sorted.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
        {sorted.length === 0 && (
          <div className="text-center mt-20">
            <span className="text-5xl">📦</span>
            <p className="text-sm text-muted-foreground mt-3">No products in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
