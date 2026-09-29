import React from 'react';
import { Star, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  city: string;
  wilayaCode: number;
  productTitle: string;
  comment: string;
  rating: number;
  date: string;
}

const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    name: 'دليلة بوخالفة',
    city: 'الجزائر العاصمة',
    wilayaCode: 16,
    productTitle: 'قندورة القطيفة البنفسجية الملكية (Aura Collection)',
    comment: 'وصلتني في 24 ساعة للدار، التغليف الملكي فخم لدرجة ما تصورتهاش! الطرز ثقيل ومتقون والقطيفة شابة بزاف. يعطيك الصحة دالوزي.',
    rating: 5,
    date: 'منذ يومين'
  },
  {
    id: 'rev-2',
    name: 'أمين كراشني',
    city: 'وهران',
    wilayaCode: 31,
    productTitle: 'طقم رجالي فاخر نصف رسمي (HM Dalozi Man)',
    comment: 'Coupe impeccable et tissu de très haute facture. La livraison à Oran était ultra rapide et le livreur a patienté le temps que je vérifie.',
    rating: 5,
    date: 'منذ 4 أيام'
  },
  {
    id: 'rev-3',
    name: 'ياسمين مهري',
    city: 'قسنطينة',
    wilayaCode: 25,
    productTitle: 'عباية حريرية هدى حجاب / أزياء عبيرش',
    comment: 'اللون الشامبين يجنن والحجاب المرفق نوعية ممتازة مش من الشيفون الرخيص. هادي ثاني طلبيّة ليا من المتجر وأنصح به بشدة.',
    rating: 5,
    date: 'منذ أسبوع'
  },
  {
    id: 'rev-4',
    name: 'خديجة سواق',
    city: 'سطيف',
    wilayaCode: 19,
    productTitle: 'صندوق حلويات المناسبات الملكي (بقلاوة ومقروط اللوز)',
    comment: 'طلبتها لخطوبة بنتي، المعازيم كلهم سقساوني منين شريتها. اللوز 100% صافي وريحة ماء الزهر الأصيل تفوح منها ما شاء الله.',
    rating: 5,
    date: 'منذ أسبوع'
  }
];

export const ReviewsSection: React.FC = () => {
  return (
    <section className="py-16 bg-[#0B0B0E] border-t border-[#D4AF37]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181820] border border-[#D4AF37]/30 text-xs text-[#D4AF37] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>آراء زبائننا المعتمدين في الجزائر</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-['Cairo',sans-serif] text-gold-gradient">
            تجارب حقيقية تعكس ثقتكم في دالوزي ستور
          </h2>

          <p className="text-xs sm:text-sm text-[#FAF8F5]/70">
            أكثر من 15,000 زبون راضٍ عبر 58 ولاية بفضل التزامنا بأعلى معايير الجودة والتوصيل السريع والدفع بعد الفحص
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#14141C] p-5 rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                {/* Rating stars */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating
                          ? 'fill-[#D4AF37] text-[#D4AF37]'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-[#FAF8F5]/40 ms-2">{rev.date}</span>
                </div>

                {/* Comment quote */}
                <p className="text-xs sm:text-sm text-[#FAF8F5]/90 leading-relaxed font-normal italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author & Product */}
              <div className="pt-3 border-t border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-[#FAF8F5]">{rev.name}</span>
                    <span title="زبون موثق" className="inline-flex">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </span>
                  </div>
                  <span className="text-[10px] text-[#D4AF37] bg-[#181820] px-2 py-0.5 rounded border border-[#D4AF37]/20">
                    {rev.city} ({rev.wilayaCode.toString().padStart(2, '0')})
                  </span>
                </div>
                <div className="text-[10px] text-[#FAF8F5]/50 truncate">
                  {rev.productTitle}
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Global Statistics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#14141C] p-6 rounded-2xl border border-[#D4AF37]/25 text-center">
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-gold-gradient font-['Cairo',sans-serif]">58 / 58</span>
            <span className="block text-xs text-[#FAF8F5]/70">ولاية مشمولة بالتوصيل السريع</span>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-gold-gradient font-['Cairo',sans-serif]">99.4%</span>
            <span className="block text-xs text-[#FAF8F5]/70">نسبة رضا الزبائن عن جودة الأقمشة</span>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-gold-gradient font-['Cairo',sans-serif]">24 ساعة</span>
            <span className="block text-xs text-[#FAF8F5]/70">توصيل للجزائر، البليدة وبومرداس</span>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-gold-gradient font-['Cairo',sans-serif]">100% COD</span>
            <span className="block text-xs text-[#FAF8F5]/70">دفع نقدي آمن بعد الفحص والمعاينة</span>
          </div>
        </div>

      </div>
    </section>
  );
};
