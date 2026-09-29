import React from 'react';
import { CategoryId } from '../types';
import { CATEGORIES_LIST, PRODUCTS } from '../data/products';

interface CategoryFilterTabsProps {
  selectedCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
}

export const CategoryFilterTabs: React.FC<CategoryFilterTabsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const getCount = (categoryId: CategoryId) => {
    if (categoryId === 'all') return PRODUCTS.length;
    return PRODUCTS.filter((p) => p.category === categoryId).length;
  };

  return (
    <div className="w-full border-b border-[#D4AF37]/20 pb-4">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
        {CATEGORIES_LIST.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = getCount(cat.id);

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-[#1D1D26] text-[#FAF8F5] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.18)] font-bold'
                  : 'bg-[#14141A] text-[#FAF8F5]/70 border-white/5 hover:border-[#D4AF37]/40 hover:text-[#FAF8F5]'
              }`}
            >
              <span>{cat.labelAr}</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-md ${
                  isSelected
                    ? 'bg-[#D4AF37] text-[#0F0F12] font-black'
                    : 'bg-[#22222D] text-[#FAF8F5]/50'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
