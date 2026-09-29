import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, ArrowDown } from 'lucide-react';
import { CategoryId } from '../types';

import imgHeroMain from '../assets/images/hero_dalozi_luxury_1790546064797.jpg';
import imgAuraViolet from '../assets/images/aura_violet_qandoura_1790546077690.jpg';
import imgHudaAbaya from '../assets/images/huda_silk_abaya_1790546087932.jpg';
import imgSweets from '../assets/images/algerian_luxury_sweets_1790546109477.jpg';
import imgMensSuit from '../assets/images/mens_tailored_suit_1790546099162.jpg';

interface HeroSliderProps {
  onSelectCategory: (category: CategoryId) => void;
  onOpenQuickOrderForProduct?: (productId: string) => void;
}

interface SlideItem {
  id: string;
  image: string;
  badge: string;
  titleAr: string;
  subtitleAr: string;
  titleEn: string;
  category: CategoryId;
  targetProductId?: string;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ onSelectCategory }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: SlideItem[] = [
    {
      id: 'slide-aura',
      image: imgHeroMain,
      badge: 'الفخامة الجزائرية الحصرية · HAUTE COUTURE',
      titleAr: 'تشكيلة أورا الملكية - إبداع القندورة والقفطان الجزائري',
      subtitleAr: 'قطيفة فاخرة مطرزة يدوياً بخيوط الذهب الأصيل مع علب تقديم ملكية فاخرة تليق بأرقى مناسباتكم',
      titleEn: 'THE AURA COUTURE COLLECTION',
      category: 'women-fashion',
      targetProductId: 'aura-violet-velvet'
    },
    {
      id: 'slide-huda',
      image: imgHudaAbaya,
      badge: 'أزياء المحجبات الراقية · MODEST ELEGANCE',
      titleAr: 'عبايات حريرية فاخرة بنمط هدى حجاب وستوديو عبيرش',
      subtitleAr: 'أقمشة باستيل منسابة وحرير ناعم مع حجابات متناسقة مجاناً، صُممت للمرأة العصرية المعتزة بأصالتها',
      titleEn: 'HUDA HIJAB & ABIRACH EDITORIAL',
      category: 'women-fashion',
      targetProductId: 'huda-silk-abaya'
    },
    {
      id: 'slide-mens',
      image: imgMensSuit,
      badge: 'HM DALOZI HOMME · TAILORED LUXURY',
      titleAr: 'الأناقة الرجالية الفاخرة - تفصيل متقن وألوان متناسقة',
      subtitleAr: 'أطقم نصف رسمية من الصوف الخفيف والقطن المصري، مع أزرار محفورة وشحن فوري لـ 58 ولاية',
      titleEn: 'MENSWEAR TAILORED SUITS',
      category: 'mens-apparel',
      targetProductId: 'mens-tailored-ensemble'
    },
    {
      id: 'slide-sweets',
      image: imgSweets,
      badge: 'حلويات ملكية جزائرية · DALOZI PATISSERIE',
      titleAr: 'صناديق الضيافة الفاخرة - بقلاوة اللوز، مشوك، ومقروط العسل',
      subtitleAr: 'لوز صافي 100% وعسل البرتقال الطبيعي، محضرة طازجة يومياً بعلب هدايا راقية مع إمكانية التخصيص',
      titleEn: 'GOURMET ALGERIAN PASTRY',
      category: 'sweets-bakery',
      targetProductId: 'algerian-royal-sweets'
    },
    {
      id: 'slide-qandoura',
      image: imgAuraViolet,
      badge: 'إصدار محدود · LIMITED EDITION',
      titleAr: 'قندورة القطيفة البنفسجية الملكية - طرز مجبود يدوي',
      subtitleAr: 'القطعة الأكثر طلباً في الجزائر بمقاسات من S إلى XXL مع معاينة وفحص قبل الدفع عند الباب',
      titleEn: 'ROYAL VIOLET VELVET DRESS',
      category: 'women-fashion',
      targetProductId: 'aura-violet-velvet'
    }
  ];

  // Auto-slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const activeSlide = slides[currentSlide];

  const handleCtaClick = (category: CategoryId) => {
    onSelectCategory(category);
    const catalog = document.getElementById('catalog-section');
    if (catalog) {
      catalog.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full bg-[#0F0F12] overflow-hidden min-h-[560px] sm:min-h-[620px] lg:min-h-[700px] flex items-center border-b border-[#D4AF37]/20">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* Background image with high quality rendering */}
          <img
            src={slide.image}
            alt={slide.titleAr}
            className="w-full h-full object-cover object-center filter brightness-[0.70] contrast-[1.05] scale-105 transition-transform duration-[8000ms] ease-out"
          />
          {/* Cinematic dark luxury gradient scrims */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F12]/95 via-[#0F0F12]/75 to-transparent rtl:bg-gradient-to-l rtl:from-[#0F0F12]/95 rtl:via-[#0F0F12]/75 rtl:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-[#0F0F12]/30 to-transparent" />
        </div>
      ))}

      {/* Slide Content Layer */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <div className="max-w-2xl lg:max-w-3xl space-y-6">
          
          {/* Luxury Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181820]/90 border border-[#D4AF37]/40 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-xs font-semibold text-[#D4AF37] tracking-wider font-['Cairo',sans-serif]">
              {activeSlide.badge}
            </span>
          </div>

          {/* Titles */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#FAF8F5] leading-tight sm:leading-snug font-['Cairo',sans-serif]">
              {activeSlide.titleAr}
            </h1>
            <p className="text-xs sm:text-sm font-['Playfair_Display',serif] tracking-widest text-[#D4AF37]/90 font-medium">
              {activeSlide.titleEn}
            </p>
          </div>

          {/* Subtitle Description */}
          <p className="text-sm sm:text-base lg:text-lg text-[#FAF8F5]/80 font-normal leading-relaxed max-w-xl">
            {activeSlide.subtitleAr}
          </p>

          {/* Call to Actions (Gold CTAs as requested in prompt) */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => handleCtaClick(activeSlide.category)}
              className="px-6 sm:px-8 py-3.5 rounded-xl bg-gold-gradient text-[#0F0F12] font-bold text-sm sm:text-base shadow-[0_4px_20px_rgba(212,175,55,0.35)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              <span>تسوق الآن</span>
              <span className="text-lg leading-none">←</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 sm:px-7 py-3.5 rounded-xl bg-[#181820]/80 hover:bg-[#22222E] border border-[#D4AF37]/40 text-[#FAF8F5] font-semibold text-sm sm:text-base transition-all hover:border-[#D4AF37] backdrop-blur-sm"
            >
              إكتشف التشكيلة الكاملة
            </button>
          </div>

          {/* Quick Algerian Trust Guarantees */}
          <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#FAF8F5]/70 border-t border-[#D4AF37]/15">
            <div className="flex items-center gap-1.5">
              <span className="text-[#D4AF37]">✓</span>
              <span>الدفع عند الاستلام بعد المعاينة</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#D4AF37]">✓</span>
              <span>شحن سريع لـ 58 ولاية</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#D4AF37]">✓</span>
              <span>تغليف ملكي خاص بالهدايا مجاناً</span>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute bottom-8 start-8 z-30 flex items-center gap-2">
        <button
          onClick={goToPrev}
          aria-label="الشريحة السابقة"
          className="w-10 h-10 rounded-full bg-[#181820]/80 hover:bg-[#D4AF37] text-[#FAF8F5] hover:text-[#0F0F12] border border-[#D4AF37]/40 flex items-center justify-center transition-all backdrop-blur-sm"
        >
          <ChevronRight className="w-5 h-5 rtl:rotate-180" />
        </button>
        <button
          onClick={goToNext}
          aria-label="الشريحة التالية"
          className="w-10 h-10 rounded-full bg-[#181820]/80 hover:bg-[#D4AF37] text-[#FAF8F5] hover:text-[#0F0F12] border border-[#D4AF37]/40 flex items-center justify-center transition-all backdrop-blur-sm"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>

        {/* Indicators */}
        <div className="flex items-center gap-1.5 ms-4">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`شريحة رقم ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentSlide ? 'w-8 bg-[#D4AF37]' : 'w-2 bg-[#FAF8F5]/30 hover:bg-[#FAF8F5]/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Down indicator */}
      <button
        onClick={() => {
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        className="hidden md:flex absolute bottom-8 end-8 z-30 items-center gap-2 text-xs text-[#D4AF37] hover:text-[#FFF] transition-colors"
      >
        <span>تصفح الكتالوج</span>
        <ArrowDown className="w-4 h-4 animate-bounce" />
      </button>
    </section>
  );
};
