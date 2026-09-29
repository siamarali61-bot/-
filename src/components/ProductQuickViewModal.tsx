import React, { useState } from 'react';
import { X, Star, ShieldCheck, Truck, RefreshCw, ShoppingBag, Check, Instagram, ExternalLink } from 'lucide-react';
import { Product, ProductVariantColor } from '../types';
import { formatDZD, createProductWhatsAppUrl } from '../utils/helpers';
import { ALGERIA_WILAYAS } from '../data/wilayas';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, color?: ProductVariantColor, size?: string, quantity?: number) => void;
  onBuyNow: (product: Product, color?: ProductVariantColor, size?: string, quantity?: number) => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ProductVariantColor | undefined>(
    product.colors && product.colors.length > 0 ? product.colors[0] : undefined
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [previewWilayaCode, setPreviewWilayaCode] = useState<number>(16); // Alger default
  const [addedSuccess, setAddedSuccess] = useState(false);

  const selectedWilaya = ALGERIA_WILAYAS.find((w) => w.code === previewWilayaCode) || ALGERIA_WILAYAS[15];

  const handleAddCart = () => {
    onAddToCart(product, selectedColor, selectedSize, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 1500);
  };

  const handleWhatsApp = () => {
    const url = createProductWhatsAppUrl(
      product,
      selectedColor,
      selectedSize,
      quantity,
      selectedWilaya.nameAr
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quickview-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-[#181820] border border-[#D4AF37]/40 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl my-8 text-[#FAF8F5]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 z-20 w-10 h-10 rounded-full bg-[#0F0F12]/80 hover:bg-[#D4AF37] text-[#FAF8F5] hover:text-[#0F0F12] border border-[#D4AF37]/30 flex items-center justify-center transition-all"
          aria-label="إغلاق النافذة"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 p-5 sm:p-8">
          
          {/* Left: Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] bg-[#121217] rounded-xl overflow-hidden border border-[#D4AF37]/20">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.titleAr}
                className="w-full h-full object-cover object-center"
              />
              {product.badge && (
                <span className="absolute top-3 start-3 px-3 py-1 bg-gold-gradient text-[#0F0F12] font-bold text-xs rounded shadow">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx ? 'border-[#D4AF37] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`صورة مصغرة ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Guarantee Pills */}
            <div className="bg-[#121217] p-3.5 rounded-xl border border-[#D4AF37]/20 space-y-2 text-xs text-[#FAF8F5]/80">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#D4AF37]" />
                <span>شحن متوفر لجميع 58 ولاية جزائرية خلال 24 - 72 ساعة</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>الدفع عند الاستلام مع إمكانية فحص المنتج قبل السداد</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#D4AF37]" />
                <span>إمكانية التبديل أو الإرجاع في حال وجود أي عيب مصنعي</span>
              </div>
            </div>
          </div>

          {/* Right: Info & Selectors */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              {product.collection && (
                <p className="text-xs font-semibold text-[#D4AF37] tracking-widest uppercase mb-1">
                  {product.collection}
                </p>
              )}

              <h2 id="quickview-title" className="text-xl sm:text-2xl font-bold font-['Cairo',sans-serif] leading-snug">
                {product.titleAr}
              </h2>

              {/* Reviews */}
              <div className="flex items-center gap-2 mt-2 text-xs">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-[#D4AF37] text-[#D4AF37]'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-[#D4AF37]">{product.rating}</span>
                <span className="text-[#FAF8F5]/50">({product.reviewsCount} تقييم حقيقي من الجزائر)</span>
              </div>

              {/* Price */}
              <div className="mt-4 p-3 bg-[#121217] rounded-xl border border-[#D4AF37]/25 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-gold-gradient font-['Cairo',sans-serif]">
                    {formatDZD(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-[#FAF8F5]/40 line-through ms-3">
                      {formatDZD(product.originalPrice)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800">
                  تخفيض موسمي حصري
                </span>
              </div>

              {/* Description */}
              <p className="mt-4 text-sm text-[#FAF8F5]/85 leading-relaxed">
                {product.descriptionAr}
              </p>

              {/* Instagram Creator & Direct Post Button */}
              {(product.instagramHandle || product.instagramPostUrl) && (
                <div className="mt-3.5 p-3 rounded-xl bg-gradient-to-r from-[#18121f] via-[#201428] to-[#18121f] border border-[#E1306C]/40 flex flex-wrap items-center justify-between gap-2.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white flex items-center justify-center shrink-0 shadow">
                      <Instagram className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs">
                      <span className="text-[#FAF8F5]/60 block text-[10px]">مالكة ومصممة القطعة:</span>
                      <span className="font-bold text-pink-300 font-mono">
                        {product.instagramHandle || '@dalozi.store'}
                      </span>
                    </div>
                  </div>

                  <a
                    href={product.instagramPostUrl || (product.instagramHandle ? `https://instagram.com/${product.instagramHandle.replace('@','')}` : 'https://instagram.com')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-pink-600 via-[#E1306C] to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_2px_10px_rgba(225,48,108,0.3)] hover:scale-102 active:scale-98"
                  >
                    <span>شاهد المنشور الأصلي على إنستغرام</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Features List */}
              {product.features && (
                <ul className="mt-3 space-y-1.5 text-xs text-[#FAF8F5]/75">
                  {product.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-[#D4AF37]">✦</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Color Swatches */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#FAF8F5]/80">اللون المختار:</span>
                    <span className="text-[#D4AF37] font-bold">{selectedColor?.nameAr}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${
                          selectedColor?.name === c.name
                            ? 'border-white scale-110 ring-2 ring-[#D4AF37]'
                            : 'border-white/20 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.nameAr}
                        aria-label={c.nameAr}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#FAF8F5]/80">المقاس / الحجم:</span>
                    <span className="text-[#D4AF37] font-bold">{selectedSize}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          selectedSize === s
                            ? 'bg-[#D4AF37] text-[#0F0F12] shadow-md'
                            : 'bg-[#121217] text-[#FAF8F5]/80 border border-white/10 hover:border-[#D4AF37]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-4 flex items-center gap-4">
                <span className="text-xs font-semibold text-[#FAF8F5]/80">الكمية:</span>
                <div className="flex items-center border border-[#D4AF37]/40 rounded-lg overflow-hidden bg-[#121217]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 hover:bg-[#20202B] text-sm text-[#D4AF37] font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-sm font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 hover:bg-[#20202B] text-sm text-[#D4AF37] font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Quick Shipping Estimator */}
              <div className="mt-4 p-3 bg-[#121217] rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#FAF8F5]/70">حساب سعر التوصيل التقريبي:</span>
                  <select
                    value={previewWilayaCode}
                    onChange={(e) => setPreviewWilayaCode(Number(e.target.value))}
                    className="bg-[#181820] border border-[#D4AF37]/30 text-[#D4AF37] text-xs rounded px-2 py-1 focus:outline-none"
                  >
                    {ALGERIA_WILAYAS.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} - {w.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-[11px] text-[#FAF8F5]/60 flex items-center justify-between">
                  <span>توصيل للمنزل: <strong className="text-[#FAF8F5]">{formatDZD(selectedWilaya.homeDeliveryPrice)}</strong></span>
                  <span>المدة: <strong className="text-[#D4AF37]">{selectedWilaya.deliveryDays}</strong></span>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-4">
              <button
                onClick={() => onBuyNow(product, selectedColor, selectedSize, quantity)}
                className="w-full py-3.5 px-4 rounded-xl bg-gold-gradient hover:opacity-95 text-[#0F0F12] font-black text-sm sm:text-base transition-all shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
              >
                شراء سريع الآن (الدفع عند الاستلام) ⚡
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddCart}
                  className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border ${
                    addedSuccess
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-[#1F1F2A] hover:bg-[#282838] text-[#FAF8F5] border-[#D4AF37]/40'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تمت الإضافة!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                      <span>إضافة إلى السلة</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="py-3 px-3 rounded-xl font-bold text-xs sm:text-sm bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/50 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>💬</span>
                  <span>طلب بالواتساب</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
