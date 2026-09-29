import React, { useState, useId } from 'react';
import { X, CheckCircle2, ShieldCheck, Truck, Phone, User, MapPin, Building, AlertCircle } from 'lucide-react';
import { CartItem, OrderData, Wilaya } from '../types';
import { ALGERIA_WILAYAS, COMMUNE_PRESETS } from '../data/wilayas';
import { formatDZD, createCartWhatsAppUrl } from '../utils/helpers';
import { saveOrderToFirestore } from '../services/firebaseService';

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  appliedPromo: string | null;
  onOrderSuccess: (orderData: OrderData) => void;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  isOpen,
  onClose,
  items,
  appliedPromo,
  onOrderSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState<number>(16); // 16 = Alger default
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<'home' | 'desk'>('home');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const fullNameId = useId();
  const phoneId = useId();
  const wilayaId = useId();
  const communeId = useId();
  const addressId = useId();
  const notesId = useId();

  if (!isOpen) return null;

  const currentWilaya: Wilaya =
    ALGERIA_WILAYAS.find((w) => w.code === selectedWilayaCode) || ALGERIA_WILAYAS[15];

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = appliedPromo ? Math.round(subtotal * 0.1) : 0;
  
  // Free delivery threshold: >= 30,000 DA
  const isFreeDelivery = subtotal >= 30000;
  const baseDeliveryFee = deliveryType === 'home' ? currentWilaya.homeDeliveryPrice : currentWilaya.deskDeliveryPrice;
  const deliveryFee = isFreeDelivery ? 0 : baseDeliveryFee;
  const finalTotal = subtotal - discount + deliveryFee;

  const suggestedCommunes = COMMUNE_PRESETS[selectedWilayaCode] || [];

  const validatePhone = (p: string) => {
    // Clean spaces/dashes
    const cleaned = p.replace(/[\s-]/g, '');
    // Algerian format: 05xx, 06xx, 07xx with 10 digits, or +213 / 00213
    return /^((0[567][0-9]{8})|(\+?213[567][0-9]{8}))$/.test(cleaned);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!fullName.trim() || fullName.trim().length < 3) {
      setValidationError('يرجى إدخال الاسم واللقب بشكل صحيح.');
      return;
    }

    if (!validatePhone(phone)) {
      setValidationError('يرجى إدخال رقم هاتف جزائري صحيح (مثال: 0555123456 أو 0661234567).');
      return;
    }

    if (!commune.trim()) {
      setValidationError('يرجى إدخال اسم البلدية أو العنوان الدقيق للتوصيل.');
      return;
    }

    setIsSubmitting(true);

    const generatedOrderId = `DLZ-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderData: OrderData = {
      orderId: generatedOrderId,
      customerName: fullName.trim(),
      phone: phone.trim(),
      wilaya: currentWilaya,
      commune: commune.trim(),
      address: address.trim(),
      deliveryType,
      items,
      subtotal,
      deliveryFee,
      discount,
      total: finalTotal,
      paymentMethod: 'COD',
      status: 'pending',
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await saveOrderToFirestore(orderData);
    } catch (err) {
      console.warn('⚠️ Order saving fallback:', err);
    } finally {
      setIsSubmitting(false);
      onOrderSuccess(orderData);
    }
  };

  const handleDirectWhatsAppCheckout = () => {
    if (!fullName.trim() || !phone.trim() || !commune.trim()) {
      setValidationError('يرجى ملء الاسم، رقم الهاتف والبلدية لإنشاء رسالة الواتساب الدقيقة.');
      return;
    }

    const url = createCartWhatsAppUrl(
      items,
      fullName.trim(),
      phone.trim(),
      currentWilaya,
      commune.trim(),
      finalTotal
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-order-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-[#181820] border border-[#D4AF37]/40 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl my-6 text-[#FAF8F5]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#121217] p-4 sm:p-6 border-b border-[#D4AF37]/25 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🇩🇿</span>
              <h2 id="quick-order-title" className="text-lg sm:text-xl font-bold font-['Cairo',sans-serif] text-gold-gradient">
                تأكيد الطلب السريع - الدفع عند الاستلام
              </h2>
            </div>
            <p className="text-xs text-[#FAF8F5]/60 mt-1">
              املأ استمارة التوصيل السريع لـ 58 ولاية، والدفع نقداً بعد استلام الطرد ومعاينته
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#1F1F2A] hover:bg-[#D4AF37] text-[#FAF8F5] hover:text-[#0F0F12] flex items-center justify-center transition-colors"
            aria-label="إغلاق استمارة الطلب"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 space-y-5">
          
          {/* Validation Alert */}
          {validationError && (
            <div className="p-3 bg-red-950/70 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Customer Personal Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>معلومات المستلم</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor={fullNameId} className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                  الاسم الكامل (الاسم واللقب) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id={fullNameId}
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: ياسمين بن علي"
                    className="w-full bg-[#121217] border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-sm text-[#FAF8F5] placeholder-[#FAF8F5]/30 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={phoneId} className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                  رقم الهاتف (للاتصال والتأكيد) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#D4AF37] absolute top-3 start-3" />
                  <input
                    id={phoneId}
                    type="tel"
                    dir="ltr"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05 / 06 / 07 XX XX XX"
                    className="w-full bg-[#121217] border border-[#D4AF37]/30 rounded-xl py-2.5 ps-9 pe-3 text-sm text-[#FAF8F5] placeholder-[#FAF8F5]/30 text-start focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Location Section */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>عنوان التوصيل (58 ولاية)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Wilaya Dropdown */}
              <div>
                <label htmlFor={wilayaId} className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                  الولاية <span className="text-red-400">*</span>
                </label>
                <select
                  id={wilayaId}
                  value={selectedWilayaCode}
                  onChange={(e) => {
                    setSelectedWilayaCode(Number(e.target.value));
                    setCommune('');
                  }}
                  className="w-full bg-[#121217] border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#D4AF37]"
                >
                  {ALGERIA_WILAYAS.map((w) => (
                    <option key={w.code} value={w.code} className="bg-[#181820]">
                      {w.code} - {w.nameAr} ({w.nameFr})
                    </option>
                  ))}
                </select>
              </div>

              {/* Commune / Municipality */}
              <div>
                <label htmlFor={communeId} className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                  البلدية <span className="text-red-400">*</span>
                </label>
                <input
                  id={communeId}
                  type="text"
                  required
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  placeholder="مثال: حيدرة، بئر مراد رايس..."
                  list="communes-list"
                  className="w-full bg-[#121217] border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-sm text-[#FAF8F5] placeholder-[#FAF8F5]/30 focus:outline-none focus:border-[#D4AF37]"
                />
                {suggestedCommunes.length > 0 && (
                  <datalist id="communes-list">
                    {suggestedCommunes.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                )}
              </div>
            </div>

            {/* Address Details */}
            <div>
              <label htmlFor={addressId} className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                العنوان بالتفصيل أو الحي (اختياري)
              </label>
              <input
                id={addressId}
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="رقم العمارة، الشارع أو نقطة دالة لتسهيل وصول المندوب..."
                className="w-full bg-[#121217] border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#FAF8F5] placeholder-[#FAF8F5]/30 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Delivery Type Option */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  deliveryType === 'home'
                    ? 'bg-[#222230] border-[#D4AF37] shadow-sm'
                    : 'bg-[#121217] border-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-xs font-bold text-[#FAF8F5]">توصيل إلى باب المنزل</span>
                  </div>
                  <input
                    type="radio"
                    name="deliveryType"
                    checked={deliveryType === 'home'}
                    onChange={() => setDeliveryType('home')}
                    className="accent-[#D4AF37]"
                  />
                </div>
                <div className="mt-2 text-[11px] text-[#D4AF37] font-semibold">
                  {isFreeDelivery ? 'مجاناً (عرض الطلبات الكبيرة)' : formatDZD(currentWilaya.homeDeliveryPrice)}
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  deliveryType === 'desk'
                    ? 'bg-[#222230] border-[#D4AF37] shadow-sm'
                    : 'bg-[#121217] border-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-xs font-bold text-[#FAF8F5]">استلام من المكتب (Stop Desk)</span>
                  </div>
                  <input
                    type="radio"
                    name="deliveryType"
                    checked={deliveryType === 'desk'}
                    onChange={() => setDeliveryType('desk')}
                    className="accent-[#D4AF37]"
                  />
                </div>
                <div className="mt-2 text-[11px] text-[#D4AF37] font-semibold">
                  {isFreeDelivery ? 'مجاناً' : formatDZD(currentWilaya.deskDeliveryPrice)}
                </div>
              </label>
            </div>
          </div>

          {/* Special Notes */}
          <div>
            <label htmlFor={notesId} className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
              ملاحظات إضافية (أوقات الاتصال المفضلة أو تفاصيل المقاس)
            </label>
            <input
              id={notesId}
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: يرجى الاتصال بعد الساعة الواحدة ظهراً"
              className="w-full bg-[#121217] border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#FAF8F5] placeholder-[#FAF8F5]/30 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Items Summary Preview */}
          <div className="bg-[#121217] p-3.5 rounded-xl border border-[#D4AF37]/20 space-y-2">
            <div className="text-xs font-bold text-[#FAF8F5]/80 mb-1">ملخص الطلبية:</div>
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs text-[#FAF8F5]/70">
                <span className="truncate max-w-[240px]">
                  {item.quantity} × {item.product.titleAr}
                  {item.selectedSize && ` (${item.selectedSize})`}
                </span>
                <span className="font-semibold text-[#FAF8F5]">
                  {formatDZD(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Final Cost Breakdown */}
          <div className="bg-[#14141C] p-4 rounded-xl border border-[#D4AF37]/30 space-y-2">
            <div className="flex justify-between text-xs text-[#FAF8F5]/70">
              <span>المجموع الفرعي:</span>
              <span>{formatDZD(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-xs text-emerald-400">
                <span>خصم الكوبون:</span>
                <span>-{formatDZD(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-[#FAF8F5]/70">
              <span>
                سعر التوصيل إلى {currentWilaya.nameAr} ({deliveryType === 'home' ? 'للمنزل' : 'للمكتب'}):
              </span>
              <span className={isFreeDelivery ? 'text-emerald-400 font-bold' : ''}>
                {isFreeDelivery ? 'مجاني 0 د.ج' : formatDZD(deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-black text-[#FAF8F5] pt-2 border-t border-white/10">
              <span>المبلغ الإجمالي عند الاستلام:</span>
              <span className="text-gold-gradient text-xl sm:text-2xl font-black font-['Cairo',sans-serif]">
                {formatDZD(finalTotal)}
              </span>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="flex items-center justify-around text-[11px] text-[#FAF8F5]/70 py-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>الدفع نقداً عند الاستلام (COD)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>فحص السلعة قبل دفع الثمن</span>
            </div>
          </div>

          {/* CTA Confirmation Button */}
          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-gold-gradient text-[#0F0F12] font-black text-base shadow-[0_4px_25px_rgba(212,175,55,0.4)] hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>جاري تسجيل طلبك الفاخر...</span>
              ) : (
                <>
                  <span>تأكيد الطلب الفاخر والدفع عند الاستلام</span>
                  <span className="text-xl leading-none">✓</span>
                </>
              )}
            </button>

            {/* Alternative Direct WhatsApp button */}
            <button
              type="button"
              onClick={handleDirectWhatsAppCheckout}
              className="w-full py-2.5 px-4 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <span>أو أرسل بيانات طلبك مباشرة عبر الواتساب VIP 💬</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
