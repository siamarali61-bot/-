import React, { useState } from 'react';
import { ShoppingBag, Eye, Star, Check, Instagram } from 'lucide-react';
import { Product, ProductVariantColor } from '../types';
import { formatDZD, createProductWhatsAppUrl } from '../utils/helpers';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, selectedColor?: ProductVariantColor, selectedSize?: string) => void;
  onQuickView: (product: Product) => void;
  onQuickBuyNow: (product: Product, selectedColor?: ProductVariantColor, selectedSize?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
  onQuickBuyNow,
}) => {
  const [selectedColor, setSelectedColor] = useState<ProductVariantColor | undefined>(
    product.colors && product.colors.length > 0 ? product.colors[0] : undefined
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const hasSecondaryImage = product.images.length > 1;

  const handleAddCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedColor, selectedSize);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = createProductWhatsAppUrl(product, selectedColor, selectedSize, 1);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="group relative bg-[#181820] rounded-2xl overflow-hidden border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 transition-all duration-300 flex flex-col h-full hover:shadow-[0_8px_30px_rgba(212,175,55,0.12)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with secondary hover-flip */}
      <div
        className="relative w-full aspect-[4/5] bg-[#121217] overflow-hidden cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        {/* Primary Image */}
        <img
          src={product.images[0]}
          alt={product.titleAr}
          className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${
            hasSecondaryImage && isHovered ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
          loading="lazy"
        />

        {/* Secondary Flip Image on Hover */}
        {hasSecondaryImage && (
          <img
            src={product.images[1]}
            alt={`${product.titleAr} - تفاصيل`}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
              isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
            loading="lazy"
          />
        )}

        {/* Subtle Scrim for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#181820] via-transparent to-black/20 opacity-70 pointer-events-none" />

        {/* Metallic Gold Badges */}
        {product.badge && (
          <div className="absolute top-3 start-3 z-10">
            <span className="inline-block px-3 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#0F0F12] shadow-md">
              {product.badge}
            </span>
          </div>
        )}

        {/* Quick View Overlay Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute top-3 end-3 z-10 w-9 h-9 rounded-full bg-[#0F0F12]/80 hover:bg-[#D4AF37] text-[#FAF8F5] hover:text-[#0F0F12] border border-[#D4AF37]/30 flex items-center justify-center transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 backdrop-blur-sm"
          title="معاينة سريعة"
          aria-label="معاينة سريعة"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Collection Name Tag Bottom-Start */}
        {product.collection && (
          <div className="absolute bottom-3 start-3 z-10">
            <span className="text-[11px] font-medium tracking-wider text-[#D4AF37] bg-[#0F0F12]/80 backdrop-blur-md px-2.5 py-0.5 rounded border border-[#D4AF37]/30">
              {product.collection}
            </span>
          </div>
        )}
      </div>

      {/* Product Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        
        {/* Rating & Review Count */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 text-[#D4AF37]">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.rating)
                      ? 'fill-[#D4AF37] text-[#D4AF37]'
                      : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="font-bold ms-1 text-[#FAF8F5]">{product.rating}</span>
            <span className="text-[#FAF8F5]/40 text-[10px]">({product.reviewsCount})</span>
          </div>

          {product.inStock ? (
            <div className="flex items-center gap-1.5">
              {product.instagramHandle && (
                <span className="flex items-center gap-1 text-[10px] text-pink-400 bg-pink-950/40 px-1.5 py-0.5 rounded border border-pink-500/30 font-mono">
                  <Instagram className="w-2.5 h-2.5" />
                  <span>{product.instagramHandle}</span>
                </span>
              )}
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                متوفر حالياً
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-red-400 font-medium">غير متوفر</span>
          )}
        </div>

        {/* Title */}
        <h3
          onClick={() => onQuickView(product)}
          className="text-base sm:text-lg font-bold text-[#FAF8F5] hover:text-[#D4AF37] transition-colors cursor-pointer line-clamp-2 leading-snug font-['Cairo',sans-serif]"
          title={product.titleAr}
        >
          {product.titleAr}
        </h3>

        {/* Customer Quote Badge */}
        {product.customerQuote && (
          <div className="text-[11px] bg-[#121217] p-2 rounded-lg border border-[#D4AF37]/15 text-[#FAF8F5]/80 italic line-clamp-1 flex items-center gap-1.5">
            <span className="text-[#D4AF37] text-xs font-serif">“</span>
            <span>{product.customerQuote.text}</span>
          </div>
        )}

        {/* Interactive Color Palette Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-[#FAF8F5]/70">
              <span>اللون المختار:</span>
              <span className="text-[#D4AF37] font-medium">{selectedColor?.nameAr || selectedColor?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {product.colors.map((color) => {
                const isSelected = selectedColor?.name === color.name;
                return (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full transition-transform border ${
                      isSelected
                        ? 'ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-[#181820] scale-110 border-white'
                        : 'border-white/20 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={`${color.nameAr} (${color.name})`}
                    aria-label={`اختيار لون ${color.nameAr}`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Interactive Size Selector */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-[#FAF8F5]/70">
              <span>المقاس / الحجم:</span>
              <span className="text-[#D4AF37] font-medium">{selectedSize}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {product.sizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors font-medium ${
                      isSelected
                        ? 'bg-[#D4AF37] text-[#0F0F12] font-bold shadow-sm'
                        : 'bg-[#121217] text-[#FAF8F5]/75 hover:text-[#FAF8F5] border border-white/10 hover:border-[#D4AF37]/50'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price Section */}
        <div className="pt-2 border-t border-[#D4AF37]/15 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-gold-gradient font-['Cairo',sans-serif]">
              {formatDZD(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs sm:text-sm text-[#FAF8F5]/40 line-through">
                {formatDZD(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Dual Quick Action Buttons (Boutique Ouatine Style) */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {/* 1. Add to Cart Button */}
          <button
            onClick={handleAddCart}
            disabled={!product.inStock}
            className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 border ${
              addedAnimation
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-[#1F1F2A] hover:bg-[#282838] text-[#FAF8F5] border-[#D4AF37]/35 hover:border-[#D4AF37]'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>تمت الإضافة!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                <span className="truncate">أضف للسلة</span>
              </>
            )}
          </button>

          {/* 2. Direct WhatsApp Order Button */}
          <button
            onClick={handleWhatsAppClick}
            className="py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 hover:border-[#25D366] text-[#25D366] transition-all flex items-center justify-center gap-1.5"
            title="طلب فوري عبر الواتساب"
          >
            <span className="font-bold text-sm">💬</span>
            <span className="truncate">طلب بالواتساب</span>
          </button>
        </div>

        {/* Fast 1-Click Buy Now COD */}
        <button
          onClick={() => onQuickBuyNow(product, selectedColor, selectedSize)}
          className="w-full py-2 px-3 rounded-lg text-xs font-bold text-[#0F0F12] bg-gold-gradient hover:opacity-95 transition-all shadow-sm"
        >
          شراء مباشر (الدفع عند الاستلام) ⚡
        </button>

      </div>
    </div>
  );
};
