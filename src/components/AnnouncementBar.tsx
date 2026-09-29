import React from 'react';
import { Phone, ShieldCheck, Sparkles } from 'lucide-react';
import { STORE_WHATSAPP_NUMBER } from '../data/products';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-[#121217] border-b border-[#D4AF37]/20 text-[#FAF8F5] text-xs py-2 px-4 relative overflow-hidden z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Mobile Marquee / Desktop Centers */}
        <div className="flex-1 flex items-center justify-center gap-6 overflow-x-auto no-scrollbar font-medium">
          <div className="flex items-center gap-2 text-[#D4AF37] shrink-0">
            <span className="text-sm">🇩🇿</span>
            <span>توصيل سريع ومضمون لجميع 58 ولاية</span>
          </div>

          <span className="text-[#D4AF37]/40 hidden sm:inline" aria-hidden="true">•</span>

          <div className="flex items-center gap-1.5 shrink-0 text-[#FAF8F5]/90">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>الدفع عند الاستلام (COD) مع إمكانية المعاينة</span>
          </div>

          <span className="text-[#D4AF37]/40 hidden md:inline" aria-hidden="true">•</span>

          <div className="items-center gap-1.5 shrink-0 hidden md:flex text-[#FAF8F5]/90">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>منتجات أصلية وفاخرة 100% | تغليف ملكي مجاني</span>
          </div>
        </div>

        {/* Quick WhatsApp Contact Link */}
        <a
          href={`https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent('مرحباً دالوزي ستور، أود الاستفسار عن المنتجات والتوصيل.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 hidden lg:flex items-center gap-1.5 text-xs text-[#D4AF37] hover:text-[#FFF6DF] transition-colors font-medium border-s border-[#D4AF37]/30 ps-4"
        >
          <Phone className="w-3 h-3" />
          <span>خدمة الزبائن VIP</span>
        </a>
      </div>
    </div>
  );
};
