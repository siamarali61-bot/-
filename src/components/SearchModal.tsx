import React, { useState, useMemo, useId } from 'react';
import { X, Search, Sparkles } from 'lucide-react';
import { Product, CategoryId } from '../types';
import { PRODUCTS, CATEGORIES_LIST } from '../data/products';
import { formatDZD } from '../utils/helpers';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [maxPrice, setMaxPrice] = useState<number>(25000);
  const searchInputId = useId();

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchQuery =
        !query.trim() ||
        product.titleAr.toLowerCase().includes(query.toLowerCase()) ||
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.descriptionAr.toLowerCase().includes(query.toLowerCase()) ||
        (product.collection && product.collection.toLowerCase().includes(query.toLowerCase()));

      const matchCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      const matchPrice = product.price <= maxPrice;

      return matchQuery && matchCategory && matchPrice;
    });
  }, [query, selectedCategory, maxPrice]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-[#181820] border border-[#D4AF37]/40 w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl my-8 text-[#FAF8F5]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Search Bar */}
        <div className="p-4 sm:p-5 border-b border-[#D4AF37]/20 bg-[#121217] space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="search-modal-title" className="text-base font-bold font-['Cairo',sans-serif] flex items-center gap-2 text-gold-gradient">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>البحث الذكي في المتجر</span>
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1F1F2A] hover:bg-[#D4AF37] text-[#FAF8F5] hover:text-[#0F0F12] flex items-center justify-center transition-colors"
              aria-label="إغلاق البحث"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <label htmlFor={searchInputId} className="sr-only">
              ابحث عن قندورة، عباية، بدلة رجالية، حلويات، أو منتجات HM Dalozi...
            </label>
            <Search className="w-5 h-5 text-[#D4AF37] absolute top-3.5 start-4" />
            <input
              id={searchInputId}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن قندورة، عباية، بدلة رجالية، حلويات، أو منتجات HM Dalozi..."
              autoFocus
              className="w-full bg-[#181820] border border-[#D4AF37]/40 rounded-xl py-3 ps-12 pe-4 text-sm text-[#FAF8F5] placeholder-[#FAF8F5]/40 focus:outline-none focus:border-[#D4AF37] shadow-inner"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES_LIST.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#D4AF37] text-[#0F0F12] font-bold shadow'
                    : 'bg-[#181820] text-[#FAF8F5]/70 hover:text-[#FAF8F5] border border-white/10'
                }`}
              >
                {cat.labelAr}
              </button>
            ))}
          </div>

          {/* Price Range Slider */}
          <div className="flex items-center justify-between text-xs text-[#FAF8F5]/70 pt-1">
            <span>الحد الأقصى للسعر: <strong className="text-[#D4AF37]">{formatDZD(maxPrice)}</strong></span>
            <input
              type="range"
              min="4000"
              max="25000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-36 sm:w-48 accent-[#D4AF37] cursor-pointer"
            />
          </div>
        </div>

        {/* Results Body */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-3">
          <div className="text-xs text-[#FAF8F5]/50 flex justify-between">
            <span>النتائج المتطابقة ({filteredProducts.length})</span>
            {query && <span>البحث عن: "{query}"</span>}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-[#FAF8F5]/50 space-y-2">
              <Search className="w-10 h-10 mx-auto text-[#D4AF37]/30" />
              <p className="text-sm">لم يتم العثور على أي منتج يطابق معايير البحث.</p>
              <p className="text-xs">جرب كلمات أخرى مثل: "قندورة", "عباية", "حلويات", "بدلة", "سيروم"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="bg-[#121217] p-3 rounded-xl border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all cursor-pointer flex gap-3 group hover:bg-[#1A1A24]"
                >
                  <img
                    src={product.images[0]}
                    alt={product.titleAr}
                    className="w-16 h-20 object-cover rounded-lg bg-[#181820] shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-[#D4AF37] font-semibold">
                        {product.collection || product.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-[#FAF8F5] group-hover:text-[#D4AF37] transition-colors line-clamp-1 leading-snug">
                        {product.titleAr}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-gold-gradient">
                        {formatDZD(product.price)}
                      </span>
                      <span className="text-[11px] text-[#D4AF37] group-hover:underline">
                        عرض التفاصيل ←
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
