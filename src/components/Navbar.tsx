import React, { useState } from 'react';
import { Search, ShoppingBag, Menu, X, MapPin, Globe, User as UserIcon, Store, Sparkles, ShieldCheck } from 'lucide-react';
import { CategoryId, Language, User } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenWilayaSelector: () => void;
  selectedCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
  currentLang: Language;
  onOpenLanguageSelector: () => void;
  currentUser: User | null;
  onOpenAuth: (defaultRole?: 'customer' | 'seller') => void;
  onOpenProfile: () => void;
  onOpenSellerDashboard: () => void;
  onOpenAdminDashboard: () => void;
  onOpenWelcomeGate: () => void;
  onOpenAIChat?: () => void;
  pendingOrdersCount?: number;
  isAdminAuthenticated?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenSearch,
  onOpenWilayaSelector,
  selectedCategory,
  onSelectCategory,
  currentLang,
  onOpenLanguageSelector,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onOpenSellerDashboard,
  onOpenAdminDashboard,
  onOpenWelcomeGate,
  onOpenAIChat,
  pendingOrdersCount = 0,
  isAdminAuthenticated = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[currentLang];

  const flagMap: Record<Language, string> = {
    ar: '🇩🇿',
    fr: '🇫🇷',
    en: '🇬🇧',
  };

  const navLinks: { id: CategoryId; label: string }[] = [
    { id: 'women-fashion', label: t.womenFashion },
    { id: 'mens-apparel', label: t.mensApparel },
    { id: 'sweets-bakery', label: t.sweetsBakery },
    { id: 'catering-buffet', label: t.cateringBuffet },
    { id: 'beauty-cosmetics', label: t.beautyCosmetics },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0F0F12]/95 backdrop-blur-md border-b border-[#D4AF37]/25 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Mobile Menu & Search Button */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#FAF8F5] hover:text-[#D4AF37] focus-visible:outline-none"
            aria-label="القائمة الرئيسية"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <button
            onClick={onOpenSearch}
            className="p-2 text-[#FAF8F5] hover:text-[#D4AF37] focus-visible:outline-none"
            aria-label="البحث"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onSelectCategory('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex flex-col items-start select-none group"
          >
            <span className="font-['Playfair_Display',serif] tracking-wider text-xl sm:text-2xl lg:text-3xl font-bold text-gold-gradient group-hover:opacity-90 transition-opacity">
              DALOZI STORE
            </span>
            <span className="text-[10px] sm:text-xs text-[#D4AF37]/80 tracking-widest font-['Cairo',sans-serif] uppercase font-semibold">
              {t.brandTagline.split('·')[0]}
            </span>
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs xl:text-sm font-medium text-[#FAF8F5]/85">
          <button
            onClick={() => {
              onSelectCategory('all');
            }}
            className={`transition-colors pb-1 relative hover:text-[#D4AF37] ${
              selectedCategory === 'all'
                ? 'text-[#D4AF37] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#D4AF37]'
                : ''
            }`}
          >
            {t.home}
          </button>
          
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onSelectCategory(link.id);
                const el = document.getElementById('catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`transition-colors pb-1 relative hover:text-[#D4AF37] ${
                selectedCategory === link.id
                  ? 'text-[#D4AF37] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#D4AF37]'
                  : ''
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* Language Switcher Button */}
          <button
            onClick={onOpenLanguageSelector}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#181820] hover:bg-[#22222E] border border-[#D4AF37]/30 text-xs font-bold text-[#FAF8F5] transition-all"
            title="تغيير اللغة / Changer de langue / Switch Language"
          >
            <span className="text-sm">{flagMap[currentLang]}</span>
            <span className="uppercase text-[11px] font-mono text-[#D4AF37]">{currentLang}</span>
            <Globe className="w-3 h-3 text-[#D4AF37]/70 ms-0.5" />
          </button>

          {/* Dalozi AI Concierge & Stylist Trigger */}
          {onOpenAIChat && (
            <button
              onClick={onOpenAIChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#1c1828] via-[#241c30] to-[#1c1828] hover:border-[#D4AF37] border border-[#D4AF37]/50 text-[#D4AF37] hover:text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(212,175,55,0.25)] cursor-pointer"
              title="مستشار دالوزي الذكي - Gemini AI Concierge"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#D4AF37]" />
              <span className="hidden lg:inline">{currentLang === 'ar' ? 'المستشار الذكي' : 'Styliste IA'}</span>
              <span className="text-[9px] bg-[#D4AF37]/20 px-1 py-0.2 rounded text-[#D4AF37] font-mono">AI</span>
            </button>
          )}

          {/* Welcome / Trust Gate trigger */}
          <button
            onClick={onOpenWelcomeGate}
            className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/10 border border-[#D4AF37]/20 transition-colors"
            title="نبذة الضمان والترحيب الفاخر"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>نادي الثقة</span>
          </button>

          {/* Owner / Admin Dashboard Trigger (Only visible if admin is authenticated) */}
          {isAdminAuthenticated && (
            <button
              onClick={onOpenAdminDashboard}
              className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-[#D4AF37] text-[#0F0F12] font-black text-xs shadow-[0_2px_15px_rgba(212,175,55,0.35)] hover:scale-105 transition-all cursor-pointer"
              title="لوحة تحكم المالك وإدارة الكتالوج والطلبيات في Firestore"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">لوحة الإدارة (Admin)</span>
              <span className="md:hidden">Admin</span>
              {pendingOrdersCount > 0 && (
                <span className="absolute -top-1.5 -end-1.5 flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-black shadow-lg animate-pulse border border-white/50">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
          )}

          {/* User Account / Auth / Seller Button */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              {currentUser.role === 'seller' ? (
                <button
                  onClick={onOpenSellerDashboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-gradient text-[#0F0F12] font-black text-xs shadow-md hover:opacity-95 transition-all"
                  title="فتح لوحة تحكم المتجر"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.sellerDashboard}</span>
                </button>
              ) : null}

              <button
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#181820] hover:bg-[#242432] border border-[#D4AF37]/40 text-[#FAF8F5] text-xs font-bold transition-all"
                title="الملف الشخصي"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden md:inline max-w-[90px] truncate">{currentUser.name}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuth('customer')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181820] hover:bg-[#242432] border border-[#D4AF37]/35 text-[#FAF8F5] text-xs font-semibold transition-all"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden sm:inline">{t.signIn}</span>
              </button>

              <button
                onClick={() => onOpenAuth('seller')}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#20202C] hover:bg-[#2A2A3A] border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-bold transition-all"
                title="فتح متجر بائع وشريك معتمد"
              >
                <Store className="w-3.5 h-3.5" />
                <span>{t.openStore}</span>
              </button>
            </div>
          )}

          {/* Wilayas Guide Button */}
          <button
            onClick={onOpenWilayaSelector}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#FAF8F5]/80 hover:text-[#D4AF37] hover:bg-[#181820] border border-white/10 transition-colors"
            title="أسعار التوصيل لـ 58 ولاية"
          >
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden md:inline">58 ولاية</span>
          </button>

          {/* Shopping Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center justify-center p-2.5 rounded-xl bg-[#181820] hover:bg-[#23232E] border border-[#D4AF37]/40 text-[#D4AF37] transition-all hover:scale-105"
            aria-label="حقيبة التسوق"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 bg-[#D4AF37] text-[#0F0F12] text-[11px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#121217] border-b border-[#D4AF37]/30 px-6 py-5 space-y-4 animate-fadeIn">
          
          {/* Mobile Auth and Seller Actions */}
          <div className="flex items-center justify-between p-3 bg-[#181822] rounded-2xl border border-[#D4AF37]/25">
            {currentUser ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#FAF8F5] block">{currentUser.name}</span>
                    <span className="text-[10px] text-[#D4AF37]">{currentUser.role === 'seller' ? 'تاجر معتمد' : 'زبون مميز'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentUser.role === 'seller' && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenSellerDashboard();
                      }}
                      className="px-2.5 py-1 bg-gold-gradient text-[#0F0F12] font-black text-xs rounded-lg"
                    >
                      المتجر
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenProfile();
                    }}
                    className="px-2.5 py-1 bg-[#121217] border border-white/20 text-xs rounded-lg"
                  >
                    حسابي
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 w-full">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('customer');
                  }}
                  className="py-2 px-3 bg-[#222230] border border-[#D4AF37]/40 rounded-xl text-xs font-bold text-[#FAF8F5]"
                >
                  {t.signIn}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('seller');
                  }}
                  className="py-2 px-3 bg-gold-gradient text-[#0F0F12] rounded-xl text-xs font-black"
                >
                  {t.openStore}
                </button>
              </div>
            )}

            {/* Mobile AI Stylist Button */}
            {onOpenAIChat && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAIChat();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#1C1828] border border-[#D4AF37]/50 text-[#D4AF37] rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>{currentLang === 'ar' ? 'مستشار دالوزي الذكي (Gemini AI Concierge)' : 'Styliste Personnel IA Dalozi'}</span>
              </button>
            )}

            {/* Mobile Admin Dashboard Button (Only if authenticated as admin) */}
            {isAdminAuthenticated && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminDashboard();
                }}
                className="w-full flex items-center justify-between py-2.5 px-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-[#D4AF37] text-[#0F0F12] rounded-xl text-xs font-black shadow-md"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>لوحة تحكم المالك (Admin Dashboard)</span>
                </div>
                {pendingOrdersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black shadow-sm">
                    {pendingOrdersCount} جديدة
                  </span>
                )}
              </button>
            )}
          </div>

          <div className="text-xs text-[#D4AF37] font-semibold tracking-wider uppercase mb-2">
            الأقسام والتشكيلات الحصرية
          </div>
          <div className="flex flex-col space-y-3 text-base">
            <button
              onClick={() => {
                onSelectCategory('all');
                setMobileMenuOpen(false);
              }}
              className={`text-start py-1 ${selectedCategory === 'all' ? 'text-[#D4AF37] font-bold' : 'text-[#FAF8F5]/80'}`}
            >
              {t.allCatalog}
            </button>
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onSelectCategory(link.id);
                  setMobileMenuOpen(false);
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`text-start py-1 ${selectedCategory === link.id ? 'text-[#D4AF37] font-bold' : 'text-[#FAF8F5]/80'}`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-[#D4AF37]/20 flex items-center justify-between text-xs text-[#FAF8F5]/60">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLanguageSelector();
              }}
              className="text-[#D4AF37] flex items-center gap-1 font-semibold"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>اللغة: {currentLang.toUpperCase()} ({flagMap[currentLang]})</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenWilayaSelector();
              }}
              className="text-[#D4AF37] underline"
            >
              دليل 58 ولاية
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
