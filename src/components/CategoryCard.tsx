import { Category } from '@/types';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function CategoryCard({ category }: { category: Category }) {
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate(`/category/${category.id}`)}
      className="flex flex-col items-center gap-1.5"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-border/30 transition-shadow hover:shadow-md"
        style={{ backgroundColor: category.color }}
      >
        {category.image}
      </div>
      <span className="text-[11px] font-medium text-foreground text-center leading-tight w-16">
        {category.name}
      </span>
    </motion.button>
  );
}
