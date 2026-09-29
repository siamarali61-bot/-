import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronLeft,
  X,
  Layers,
  Sun,
  Snowflake,
  Filter,
  Check,
} from 'lucide-react';
import { CategoryId, Product } from '../types';
import {
  CATEGORIES_TAXONOMY,
  CategoryTaxonomy,
  SubCategoryGroup,
  SubCategoryItem,
  findSubCategoryById,
} from '../data/categoriesTaxonomy';

interface NestedCategoryNavProps {
  selectedCategory: CategoryId;
  selectedSubCategory: string | null;
  onSelectCategory: (category: CategoryId) => void;
  onSelectSubCategory: (subCategoryId: string | null) => void;
  allProducts: Product[];
  currentLang?: string;
}

export const NestedCategoryNav: React.FC<NestedCategoryNavProps> = ({
  selectedCategory,
  selectedSubCategory,
  onSelectCategory,
  onSelectSubCategory,
  allProducts,
  currentLang = 'ar',
}) => {
  const isAr = currentLang === 'ar';

  // Active category taxonomy
  const activeTaxonomy = CATEGORIES_TAXONOMY.find((c) => c.id === selectedCategory);

  // Active subcategory details
  const activeSubItem = selectedSubCategory ? findSubCategoryById(selectedSubCategory) : null;

  // Active group state (for accordion/season switching)
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  // Calculate product counts
  const getCategoryCount = (catId: CategoryId) => {
    if (catId === 'all') return allProducts.length;
    return allProducts.filter((p) => p.category === catId).length;
  };

  const getSubCategoryCount = (subId: string) => {
    return allProducts.filter((p) => p.subCategoryId === subId).length;
  };

  return (
    <div className="w-full bg-[#121218] border border-[#D4AF37]/30 rounded-3xl p-4 sm:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gold-gradient text-[#0F0F12] flex items-center justify-center shadow-md">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gold-gradient font-['Cairo',sans-serif]">
              {isAr ? 'الأقسام والتشكيلات الحصرية ✦' : 'Rayons & Collections Exclusives ✦'}
            </h3>
            <span className="text-[10px] bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] px-2 py-0.5 rounded-full font-mono">
              قائمة شجرية ذكية
            </span>
          </div>
          <p className="text-xs text-[#FAF8F5]/65 mt-1">
            {isAr
              ? 'تصفح حسب المواسم (ربيعي/صيفي أو شتوي/خريفي)، المناسبات والأعراس، والتشكيلات الملكية بدقة'
              : 'Filtrez par saison, mariages, événements et collections haute couture'}
          </p>
        </div>

        {/* Reset / All items button */}
        <div className="flex items-center gap-2">
          {selectedCategory !== 'all' && (
            <button
              onClick={() => {
                onSelectCategory('all');
                onSelectSubCategory(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-[#FAF8F5]/80 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-red-400" />
              <span>{isAr ? 'إلغاء التحديد وعرض الكل' : 'Afficher tout'}</span>
            </button>
          )}

          <button
            onClick={() => {
              onSelectCategory('all');
              onSelectSubCategory(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-gold-gradient text-[#0F0F12] shadow-md'
                : 'bg-[#181822] text-[#FAF8F5]/80 hover:text-[#D4AF37] border border-white/10'
            }`}
          >
            {isAr ? 'جميع المعروضات' : 'Toute la boutique'} ({allProducts.length})
          </button>
        </div>
      </div>

      {/* Level 1: Primary Category Tabs (With rich icons & count) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {CATEGORIES_TAXONOMY.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = getCategoryCount(cat.id);

          return (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                onSelectSubCategory(null);
                setActiveGroupId(null);
              }}
              className={`p-3 sm:p-3.5 rounded-2xl text-start transition-all relative group flex flex-col justify-between cursor-pointer border ${
                isSelected
                  ? 'bg-gradient-to-br from-[#241E30] via-[#1D1728] to-[#14121C] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.25)] ring-1 ring-[#D4AF37]/50'
                  : 'bg-[#161622] border-white/10 hover:border-[#D4AF37]/40 hover:bg-[#1B1B2A]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl">{cat.icon}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isSelected
                      ? 'bg-[#D4AF37] text-[#0F0F12]'
                      : 'bg-black/40 text-[#FAF8F5]/60'
                  }`}
                >
                  {count}
                </span>
              </div>

              <div className="mt-2.5">
                <div
                  className={`text-xs sm:text-sm font-bold leading-tight ${
                    isSelected ? 'text-[#D4AF37]' : 'text-[#FAF8F5]'
                  }`}
                >
                  {isAr ? cat.labelAr : cat.labelFr}
                </div>
                <div className="text-[10px] text-[#FAF8F5]/50 mt-1 line-clamp-1">
                  {cat.taglineAr}
                </div>
              </div>

              {isSelected && (
                <div className="absolute -bottom-1 inset-x-6 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
              )}
            </button>
          );
        })}
      </div>

      {/* Level 2: Nested Subcategories Tree (Shown when a main category is active) */}
      {activeTaxonomy && (
        <div className="pt-3 border-t border-white/10 space-y-4 animate-fadeIn">
          {/* Active Category Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 px-3.5 rounded-xl bg-[#181824] border border-[#D4AF37]/20 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">{activeTaxonomy.icon}</span>
              <span className="font-bold text-[#D4AF37]">
                {isAr ? activeTaxonomy.labelAr : activeTaxonomy.labelFr}
              </span>
              <span className="text-[#FAF8F5]/40">·</span>
              <span className="text-[#FAF8F5]/70 text-[11px]">{activeTaxonomy.taglineAr}</span>
            </div>

            {selectedSubCategory && (
              <button
                onClick={() => onSelectSubCategory(null)}
                className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>عرض كل منتجات {isAr ? activeTaxonomy.labelAr : ''}</span>
                <X className="w-3 h-3 text-red-400" />
              </button>
            )}
          </div>

          {/* Subcategory Groups (Seasons or Sub-sections) */}
          <div className="space-y-4">
            {activeTaxonomy.groups.map((group) => {
              const isSeasonGroup = group.season === 'spring-summer' || group.season === 'autumn-winter';

              return (
                <div
                  key={group.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-[#151520] border border-white/10 space-y-3"
                >
                  {/* Group Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{group.icon}</span>
                      <h4 className="text-xs sm:text-sm font-bold text-[#FAF8F5] flex items-center gap-2">
                        <span>{isAr ? group.labelAr : group.labelFr}</span>
                        {group.season === 'spring-summer' && (
                          <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.2 rounded-full font-sans flex items-center gap-1">
                            <Sun className="w-2.5 h-2.5" />
                            <span>موسم الربيع والصيف</span>
                          </span>
                        )}
                        {group.season === 'autumn-winter' && (
                          <span className="text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.2 rounded-full font-sans flex items-center gap-1">
                            <Snowflake className="w-2.5 h-2.5" />
                            <span>موسم الخريف والشتاء</span>
                          </span>
                        )}
                      </h4>
                    </div>

                    <span className="text-[10px] text-[#FAF8F5]/50">
                      {group.items.length} {isAr ? 'فئات فرعية' : 'sous-catégories'}
                    </span>
                  </div>

                  {/* Nested Subcategory Items Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {group.items.map((item) => {
                      const isItemActive = selectedSubCategory === item.id;
                      const count = getSubCategoryCount(item.id);

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (isItemActive) {
                              onSelectSubCategory(null);
                            } else {
                              onSelectSubCategory(item.id);
                            }
                          }}
                          className={`p-2.5 sm:p-3 rounded-xl text-start transition-all cursor-pointer border flex items-center justify-between gap-2 ${
                            isItemActive
                              ? 'bg-gold-gradient text-[#0F0F12] border-[#D4AF37] font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                              : 'bg-[#1C1C28] hover:bg-[#252536] text-[#FAF8F5]/85 border-white/10 hover:border-[#D4AF37]/40'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isItemActive ? 'bg-[#0F0F12]' : 'bg-[#D4AF37]'
                              }`}
                            />
                            <div className="truncate">
                              <div className="text-xs truncate">
                                {isAr ? item.labelAr : item.labelFr}
                              </div>
                              {item.badge && (
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono inline-block mt-0.5 ${
                                    isItemActive
                                      ? 'bg-black/20 text-[#0F0F12]'
                                      : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          </div>

                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                              isItemActive
                                ? 'bg-black/30 text-white'
                                : 'bg-black/50 text-[#FAF8F5]/60'
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
            })}
          </div>
        </div>
      )}

      {/* Active Filter Breadcrumbs Trail */}
      {(selectedCategory !== 'all' || selectedSubCategory) && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-[#171424] via-[#1E1A30] to-[#171424] border border-[#D4AF37]/35 flex flex-wrap items-center justify-between gap-2.5 text-xs text-[#FAF8F5]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#D4AF37] font-bold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{isAr ? 'المسار النشط:' : 'Filtre actif:'}</span>
            </span>

            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
              {activeTaxonomy ? (isAr ? activeTaxonomy.labelAr : activeTaxonomy.labelFr) : 'الكل'}
            </span>

            {activeSubItem && (
              <>
                <span className="text-[#D4AF37]">✦</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/50 font-bold flex items-center gap-1">
                  <span>{isAr ? activeSubItem.labelAr : activeSubItem.labelFr}</span>
                </span>
              </>
            )}
          </div>

          <button
            onClick={() => {
              onSelectCategory('all');
              onSelectSubCategory(null);
            }}
            className="text-[11px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>{isAr ? 'مسح الفلتر والعودة للكل' : 'Réinitialiser le filtre'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
