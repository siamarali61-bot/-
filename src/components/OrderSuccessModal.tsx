import React from 'react';
import { CheckCircle2, PackageCheck, Phone, ShieldCheck, MapPin } from 'lucide-react';
import { OrderData } from '../types';
import { formatDZD } from '../utils/helpers';
import { STORE_WHATSAPP_NUMBER } from '../data/products';

interface OrderSuccessModalProps {
  orderData: OrderData | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  orderData,
  onClose,
}) => {
  if (!orderData) return null;

  const handleWhatsAppContact = () => {
    const text = `مرحباً دالوزي ستور! لقد قمت للتو بتسجيل الطلب رقم #${orderData.orderId} باسم ${orderData.customerName} لولاية ${orderData.wilaya.nameAr}. أود تأكيد موعد الشحن.`;
    const url = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-success-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
    >
      <div className="relative bg-[#181820] border-2 border-[#D4AF37]/50 w-full max-w-xl rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.25)] text-[#FAF8F5] my-6">
        
        {/* Golden Crown Banner */}
        <div className="bg-gradient-to-r from-[#D4AF37] via-[#F3E7C4] to-[#B8860B] py-3 px-4 text-center">
          <span className="text-[#0F0F12] text-xs font-black tracking-widest uppercase">
            DALOZI STORE · طلب فاخر مسجل بنجاح
          </span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Success Check Icon */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950/80 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 id="order-success-title" className="text-2xl font-bold font-['Cairo',sans-serif] text-gold-gradient">
              تهانينا! تم تسجيل طلبك بنجاح
            </h2>
            <p className="text-xs sm:text-sm text-[#FAF8F5]/80">
              شكراً لاختيارك متجر دالوزي الفاخر. سيتصل بك فريقنا لتأكيد الشحن فوراً.
            </p>
          </div>

          {/* Order Reference Box */}
          <div className="bg-[#121217] p-4 rounded-xl border border-[#D4AF37]/30 text-center space-y-1">
            <div className="text-xs text-[#FAF8F5]/60">رقم تتبع الطلبية (Reference):</div>
            <div className="text-2xl font-mono font-black text-[#D4AF37] tracking-wider">
              #{orderData.orderId}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium">
              حالة الطلب: مؤكد وقيد التجهيز والتغليف الملكي 🎁
            </div>
          </div>

          {/* Delivery & Customer Summary */}
          <div className="bg-[#14141C] p-4 rounded-xl border border-white/5 space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-[#FAF8F5]/60">المستلم:</span>
              <strong className="text-[#FAF8F5]">{orderData.customerName}</strong>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-[#FAF8F5]/60">رقم الهاتف:</span>
              <span className="font-mono text-[#FAF8F5]" dir="ltr">{orderData.phone}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-[#FAF8F5]/60">الوجهة:</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>ولاية {orderData.wilaya.nameAr} - {orderData.commune}</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-[#FAF8F5]/60">نوع التوصيل:</span>
              <span>{orderData.deliveryType === 'home' ? 'توصيل لباب المنزل' : 'استلام من المكتب (Stop Desk)'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-[#FAF8F5]/60">رسوم التوصيل:</span>
              <span>{orderData.deliveryFee === 0 ? 'مجاني 0 د.ج' : formatDZD(orderData.deliveryFee)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-sm font-bold">
              <span>المبلغ الواجب سداده عند الاستلام (COD):</span>
              <span className="text-gold-gradient text-lg font-black">{formatDZD(orderData.total)}</span>
            </div>
          </div>

          {/* Process Timeline */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-[#FAF8F5]/70 pt-1">
            <div className="p-2 rounded-lg bg-[#121217] border border-[#D4AF37]/40 text-[#D4AF37]">
              <span className="block font-bold">1. التسجيل</span>
              <span>تم بنجاح ✓</span>
            </div>
            <div className="p-2 rounded-lg bg-[#121217] border border-white/10">
              <span className="block font-bold text-[#FAF8F5]">2. الاتصال</span>
              <span>تأكيد الموعد 📞</span>
            </div>
            <div className="p-2 rounded-lg bg-[#121217] border border-white/10">
              <span className="block font-bold text-[#FAF8F5]">3. الاستلام</span>
              <span>معاينة ودفع نقداً 📦</span>
            </div>
          </div>

          {/* COD Notice */}
          <div className="flex items-center gap-2 p-3 bg-[#121217] rounded-xl border border-[#D4AF37]/20 text-xs text-[#FAF8F5]/80">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>
              لا تدفع أي سنت مسبقاً! يحق لك فتح الطرد والتأكد من جودة المنتج والمقاس قبل تسليم المبلغ للمندوب.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleWhatsAppContact}
              className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Phone className="w-4 h-4" />
              <span>تواصل مع خدمة العملاء بالواتساب لتأكيد الشحن</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1F1F2A] hover:bg-[#2A2A3A] border border-[#D4AF37]/30 text-[#FAF8F5] text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <PackageCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>العودة إلى المتجر ومتابعة التسوق</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
