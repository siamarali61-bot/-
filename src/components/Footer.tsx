import React from 'react';
import { Phone, MapPin, ShieldCheck, Truck, Clock } from 'lucide-react';
import { CategoryId } from '../types';
import { STORE_PHONE_NUMBER, STORE_WHATSAPP_NUMBER } from '../data/products';
import { NewsletterSubscribe } from './NewsletterSubscribe';

interface FooterProps {
  onSelectCategory: (category: CategoryId) => void;
  onOpenWilayas: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenWilayas, onOpenAdmin }) => {
  return (
    <footer className="bg-[#0A0A0D] border-t border-[#D4AF37]/30 text-[#FAF8F5] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* VIP Newsletter Subscription Banner */}
        <NewsletterSubscribe />

        {/* Main 4-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="font-['Playfair_Display',serif] text-2xl font-black text-gold-gradient tracking-wider block">
                DALOZI STORE
              </span>
              <span className="text-xs text-[#D4AF37]/80 font-bold block">
                متجر دالوزي الفاخر · الجزائر
              </span>
            </div>
            
            <p className="text-xs text-[#FAF8F5]/70 leading-relaxed">
              منصة التسوق الفاخرة الأولى في الجزائر للملابس الراقية، القندورات المطرزة، أزياء المحجبات، الحلويات الملكية وبوفيهات المناسبات. أصالة وحرفية تجمع التراث بالفخامة العصرية.
            </p>

            <div className="flex items-center gap-2 text-xs text-[#D4AF37]">
              <span>🇩🇿 صنع وتفصيل بحرفية جزائرية أصيلة</span>
            </div>
          </div>

          {/* Col 2: Categories Shortcuts */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              التشكيلات والأقسام
            </h3>
            <ul className="space-y-2 text-xs text-[#FAF8F5]/75">
              <li>
                <button
                  onClick={() => onSelectCategory('women-fashion')}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  تشكيلة أورا (Aura Collection) - قندورات قطيفة
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('women-fashion')}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  أزياء هدى حجاب وستوديو عبيرش الحريرية
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('mens-apparel')}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  أزياء رجالية وأطقم نصف رسمية (HM Man)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('sweets-bakery')}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  حلويات المناسبات الملكية والبقلاوة
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('catering-buffet')}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  مملحات وبوفيهات الأعراس الراقية
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('beauty-cosmetics')}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  مستحضرات العناية والتجميل (HM Dalozi)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Algerian Delivery & Guarantees */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              خدمات التوصيل والضمانات
            </h3>
            <ul className="space-y-2.5 text-xs text-[#FAF8F5]/75">
              <li className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>توصيل سريع يشمل جميع الـ 58 ولاية</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>الدفع عند الاستلام نقداً بعد فحص الطرد</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>توصيل خلال 24 ساعة للعاصمة والوسط</span>
              </li>
              <li className="pt-2">
                <button
                  onClick={onOpenWilayas}
                  className="inline-block px-3 py-1.5 rounded-lg bg-[#181820] border border-[#D4AF37]/35 text-[#D4AF37] text-xs font-semibold hover:bg-[#D4AF37] hover:text-[#0F0F12] transition-colors"
                >
                  جدول أسعار ومواعيد 58 ولاية ←
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & VIP Support */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              خدمة الزبائن VIP والطلبات الخاصة
            </h3>
            <p className="text-xs text-[#FAF8F5]/70">
              فريقنا متواجد 7 أيام / 7 للإجابة على استفساراتكم ومرافقتكم في اختيار المقاس المناسب.
            </p>

            <div className="space-y-2 pt-1">
              <a
                href={`https://wa.me/${STORE_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] text-xs font-bold transition-all"
              >
                <span>💬</span>
                <span>طلب واستفسار مباشر عبر الواتساب</span>
              </a>

              <a
                href={`tel:+${STORE_PHONE_NUMBER}`}
                className="flex items-center gap-2 p-2 rounded-xl bg-[#14141C] hover:bg-[#1E1E28] border border-[#D4AF37]/30 text-[#FAF8F5] text-xs font-medium transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span dir="ltr">+213 672 33 09 36</span>
              </a>

              <div className="flex items-center gap-2 text-[11px] text-[#FAF8F5]/60 pt-1">
                <MapPin className="w-3 h-3 text-[#D4AF37]" />
                <span>الجزائر العاصمة · وهران · قسنطينة</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF8F5]/60">
          <div className="flex items-center gap-3">
            <p>© {new Date().getFullYear()} DALOZI STORE (متجر دالوزي). جميع الحقوق محفوظة.</p>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="text-[#FAF8F5]/30 hover:text-[#D4AF37] transition-colors font-medium flex items-center gap-1 text-[11px]"
                title="بوابة إدارة المتجر (Admin Security Portal)"
              >
                <span>🔒</span>
                <span>بوابة الإدارة</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>🇩🇿 توصيل لـ 58 ولاية</span>
            <span>·</span>
            <span>الدفع عند الاستلام COD</span>
            <span>·</span>
            <span>تغليف ملكي فاخر</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
