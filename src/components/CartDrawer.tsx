import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag, ShieldCheck, Award, Crown } from 'lucide-react';
import { CartItem } from '../types';
import { formatDZD } from '../utils/helpers';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onOpenCheckout: () => void;
  appliedPromo: string | null;
  onApplyPromo: (code: string) => boolean;
}

const FREE_SHIPPING_THRESHOLD = 30000; // 30,000 DA for free shipping

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
  appliedPromo,
  onApplyPromo,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = appliedPromo ? Math.round(subtotal * 0.1) : 0;
  const finalSubtotal = subtotal - discountAmount;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  // Dalozi Loyalty Points System: 1 Point for every 100 DA
  const earnedPoints = Math.floor(finalSubtotal / 100);
  const nextMilestone = earnedPoints < 100 ? 100 : earnedPoints < 250 ? 250 : earnedPoints < 500 ? 500 : 1000;
  const loyaltyProgress = Math.min(100, Math.round((earnedPoints / nextMilestone) * 100));
  const pointsRemaining = Math.max(0, nextMilestone - earnedPoints);
  const currentTier = earnedPoints >= 500 ? 'VIP الماسي' : earnedPoints >= 250 ? 'VIP الذهبي' : earnedPoints >= 100 ? 'الفئة الفضية' : 'الفئة البرونزية';
  const rewardLabel = nextMilestone === 100 ? 'هدية عينة فاخرة' : nextMilestone === 250 ? 'قسيمة خصم 1,500 د.ج' : nextMilestone === 500 ? 'توصيل مجاني دائم + صندوق هدايا' : 'عضوية النخبة';

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const ok = onApplyPromo(promoInput.trim());
    if (ok) {
      setPromoSuccess(true);
      setPromoError('');
    } else {
      setPromoError('الرمز الترويجي غير صالح أو منتهي');
      setPromoSuccess(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="fixed inset-y-0 start-0 max-w-full flex"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-[#181820] border-e border-[#D4AF37]/30 text-[#FAF8F5] shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#D4AF37]/20 flex items-center justify-between bg-[#121217]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              <h2 id="cart-drawer-title" className="text-lg font-bold font-['Cairo',sans-serif]">
                حقيبة التسوق الفاخرة
              </h2>
              <span className="text-xs text-[#FAF8F5]/60 bg-[#1D1D26] px-2 py-0.5 rounded-full border border-white/10">
                {items.reduce((sum, item) => sum + item.quantity, 0)} قطعة
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#1F1F2A] hover:bg-[#D4AF37] text-[#FAF8F5] hover:text-[#0F0F12] flex items-center justify-center transition-colors"
              aria-label="إغلاق حقيبة التسوق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free shipping bar */}
          <div className="px-5 py-3 bg-[#13131A] border-b border-[#D4AF37]/15 text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="text-[#FAF8F5]/80 mb-1.5">
                أضف ما قيمته <strong className="text-[#D4AF37]">{formatDZD(remainingForFreeShipping)}</strong> للحصول على توصيل مجاني! 🚚
              </p>
            ) : (
              <p className="text-emerald-400 font-bold mb-1.5 flex items-center gap-1">
                <span>🎉 مبروك! طلبيتك مؤهلة للتوصيل المجاني إلى باب دارك</span>
              </p>
            )}
            <div className="w-full bg-[#20202C] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold-gradient transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Dalozi Loyalty Points System Tracker */}
          {items.length > 0 && (
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#171722] via-[#1A1A26] to-[#171722] border-b border-[#D4AF37]/30 text-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                    <Crown className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-[#FAF8F5] block text-xs">
                      نقاط ولاء دالوزي (Dalozi Loyalty)
                    </span>
                    <span className="text-[10px] text-[#D4AF37]/90 font-medium">
                      المستوى: {currentTier}
                    </span>
                  </div>
                </div>

                <div className="text-end">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] font-black text-xs shadow-sm">
                    +{earnedPoints} نقطة VIP
                  </span>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-[#101016] h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4AF37] via-[#F3E7C4] to-[#B8860B] transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                    style={{ width: `${loyaltyProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#FAF8F5]/70 pt-0.5">
                  <span>
                    {pointsRemaining > 0 ? (
                      <>
                        تبقّى <strong className="text-[#D4AF37] font-bold">{pointsRemaining} نقطة</strong> لفتح: {rewardLabel}
                      </>
                    ) : (
                      <span className="text-emerald-400 font-semibold">
                        🎉 مبروك! حققت أعلى رصيد مكافآت لهذه الفئة
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-[10px] text-[#FAF8F5]/40">{earnedPoints}/{nextMilestone}</span>
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-[#FAF8F5]/50">
                <span>✦ كل 100 د.ج = 1 نقطة ولاء</span>
                <span className="text-[#D4AF37]/90">تُستبدل بخصومات وهدايا استثنائية 🎁</span>
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#121217] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-[#FAF8F5]">حقيبتك فارغة حالياً</p>
                  <p className="text-xs text-[#FAF8F5]/50">تصفح تشكيلاتنا الفاخرة واختر ما يناسب ذوقك الرفيع</p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-[#0F0F12] font-bold text-xs shadow-md"
                >
                  استعراض المنتجات
                </button>
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={`${item.product.id}-${index}`}
                  className="bg-[#121217] p-3 rounded-xl border border-[#D4AF37]/20 flex gap-3 relative group"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.images[0]}
                    alt={item.product.titleAr}
                    className="w-20 h-24 object-cover rounded-lg bg-[#181820] shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#FAF8F5] line-clamp-1 leading-snug">
                        {item.product.titleAr}
                      </h4>

                      {/* Variant tags */}
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#FAF8F5]/60">
                        {item.selectedColor && (
                          <div className="flex items-center gap-1">
                            <span
                              className="w-3 h-3 rounded-full border border-white/20"
                              style={{ backgroundColor: item.selectedColor.hex }}
                            />
                            <span>{item.selectedColor.nameAr}</span>
                          </div>
                        )}
                        {item.selectedSize && (
                          <span className="bg-[#181820] px-1.5 py-0.5 rounded border border-white/10">
                            مقاس: {item.selectedSize}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                      <span className="text-sm font-bold text-[#D4AF37]">
                        {formatDZD(item.product.price * item.quantity)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-[#D4AF37]/30 rounded-lg overflow-hidden bg-[#181820]">
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-[#FAF8F5] hover:bg-[#252535]"
                          aria-label="إنقاص الكمية"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-[#FAF8F5] hover:bg-[#252535]"
                          aria-label="زيادة الكمية"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(index)}
                    className="absolute top-2 end-2 text-[#FAF8F5]/40 hover:text-red-400 p-1 transition-colors"
                    title="حذف المنتج"
                    aria-label="حذف المنتج"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#D4AF37]/25 bg-[#121217] space-y-3">
              
              {/* Promo code */}
              <form onSubmit={handlePromoSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-[#D4AF37] absolute top-3 start-3" />
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="كود الخصم (جرب: DALOZI10)"
                    className="w-full bg-[#181820] border border-[#D4AF37]/30 rounded-lg py-2 ps-8 pe-3 text-xs text-[#FAF8F5] placeholder-[#FAF8F5]/40 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-2 bg-[#20202B] hover:bg-[#282838] border border-[#D4AF37]/40 rounded-lg text-xs font-semibold text-[#D4AF37]"
                >
                  تطبيق
                </button>
              </form>

              {promoSuccess && (
                <p className="text-[11px] text-emerald-400">✓ تم تطبيق خصم 10% بنجاح!</p>
              )}
              {promoError && (
                <p className="text-[11px] text-red-400">{promoError}</p>
              )}

              {/* Price summary */}
              <div className="space-y-1.5 text-xs text-[#FAF8F5]/70 pt-1">
                <div className="flex justify-between">
                  <span>المجموع الفرعي للمنتجات:</span>
                  <span className="font-semibold text-[#FAF8F5]">{formatDZD(subtotal)}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-emerald-400">
                    <span>خصم الكوبون (10%):</span>
                    <span>-{formatDZD(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-[#FAF8F5]/60">
                  <span>التوصيل (58 ولاية):</span>
                  <span>يُحدد عند خطوة العنوان (COD)</span>
                </div>
                <div className="flex justify-between items-center text-xs text-[#D4AF37] bg-[#161622] px-2.5 py-1.5 rounded-lg border border-[#D4AF37]/20">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>نقاط الولاء المكتسبة لهذه الطلبية:</span>
                  </span>
                  <span className="font-bold text-xs">+{earnedPoints} نقطة VIP</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#FAF8F5] pt-2 border-t border-white/10">
                  <span>الإجمالي المبدئي:</span>
                  <span className="text-gold-gradient font-black text-lg">{formatDZD(finalSubtotal)}</span>
                </div>
              </div>

              {/* Proceed to COD Checkout button */}
              <button
                onClick={() => {
                  onClose();
                  onOpenCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gold-gradient text-[#0F0F12] font-black text-sm sm:text-base shadow-[0_4px_20px_rgba(212,175,55,0.35)] hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <span>متابعة الطلب السريع (الدفع عند الاستلام)</span>
                <ArrowLeft className="w-4 h-4 rtl:rotate-0" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#FAF8F5]/50">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>لا حاجة لبطاقة بنكية - ادفع نقداً لمندوب التوصيل</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
