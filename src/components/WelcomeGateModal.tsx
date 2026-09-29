import React from 'react';
import { ShieldCheck, Truck, Sparkles, ArrowRight, ArrowLeft, Store, Globe, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import imgHero from '../assets/images/hero_dalozi_luxury_1790546064797.jpg';

interface WelcomeGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onSelectLanguage: (lang: Language) => void;
  onOpenAuth: (defaultRole?: 'customer' | 'seller') => void;
}

export const WelcomeGateModal: React.FC<WelcomeGateModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onSelectLanguage,
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[currentLang];
  const isRtl = currentLang === 'ar';

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'ar', label: 'العربية', flag: '🇩🇿' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-gate-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
    >
      <div className="relative bg-[#121217] border-2 border-[#D4AF37]/50 w-full max-w-3xl rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(212,175,55,0.25)] text-[#FAF8F5] my-6">
        
        {/* Top Language Bar Selector */}
        <div className="bg-[#0D0D12] border-b border-[#D4AF37]/25 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-semibold">
            <Globe className="w-4 h-4" />
            <span>{t.chooseLanguage}</span>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#181822] rounded-xl border border-[#D4AF37]/30">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => onSelectLanguage(l.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentLang === l.code
                    ? 'bg-[#D4AF37] text-[#0F0F12] shadow-sm'
                    : 'text-[#FAF8F5]/70 hover:text-[#FAF8F5] hover:bg-white/5'
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hero Visual Area with Scrim */}
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <img
            src={imgHero}
            alt="Dalozi Luxury Showroom"
            className="w-full h-full object-cover filter brightness-[0.65]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-[#121217]/50 to-transparent" />
          
          <div className="absolute inset-x-6 bottom-4 text-center sm:text-start space-y-1">
            <span className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-black text-gold-gradient tracking-widest block">
              DALOZI STORE · HM DALOZI
            </span>
            <p className="text-xs sm:text-sm text-[#D4AF37] font-semibold">
              {t.brandTagline}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Main Title & Welcome */}
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A1A24] border border-[#D4AF37]/30 text-xs text-[#D4AF37] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Algerian Haute Couture & Gastronomy</span>
            </div>

            <h2 id="welcome-gate-title" className="text-2xl sm:text-3xl font-black font-['Cairo',sans-serif] text-gold-gradient">
              {t.welcomeTitle}
            </h2>

            <p className="text-xs sm:text-sm text-[#FAF8F5]/80 leading-relaxed">
              {t.welcomeSubtitle}
            </p>
          </div>

          {/* 3 Trust Pillars - Building Confidence */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            
            <div className="bg-[#171722] p-4 rounded-2xl border border-[#D4AF37]/25 space-y-2 text-center sm:text-start">
              <div className="w-10 h-10 mx-auto sm:mx-0 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#FAF8F5]">
                {t.welcomeTrust1Title}
              </h3>
              <p className="text-[11px] text-[#FAF8F5]/65 leading-relaxed">
                {t.welcomeTrust1Desc}
              </p>
            </div>

            <div className="bg-[#171722] p-4 rounded-2xl border border-[#D4AF37]/25 space-y-2 text-center sm:text-start">
              <div className="w-10 h-10 mx-auto sm:mx-0 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#FAF8F5]">
                {t.welcomeTrust2Title}
              </h3>
              <p className="text-[11px] text-[#FAF8F5]/65 leading-relaxed">
                {t.welcomeTrust2Desc}
              </p>
            </div>

            <div className="bg-[#171722] p-4 rounded-2xl border border-[#D4AF37]/25 space-y-2 text-center sm:text-start">
              <div className="w-10 h-10 mx-auto sm:mx-0 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#FAF8F5]">
                {t.welcomeTrust3Title}
              </h3>
              <p className="text-[11px] text-[#FAF8F5]/65 leading-relaxed">
                {t.welcomeTrust3Desc}
              </p>
            </div>

          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#FAF8F5]/70 py-1 border-y border-white/5">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
              <span>58 Wilayas COD</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
              <span>+15,000 Satisfied Clients</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
              <span>Verified Artisans</span>
            </div>
          </div>

          {/* Action Gate Buttons */}
          <div className="space-y-3 pt-2">
            
            {/* 1. Enter Store Directly */}
            <button
              onClick={onClose}
              className="w-full py-4 px-6 rounded-2xl bg-gold-gradient text-[#0F0F12] font-black text-base shadow-[0_4px_25px_rgba(212,175,55,0.4)] hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t.enterStore}</span>
              {isRtl ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </button>

            {/* 2. Dual Register / Login / Seller Option */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth('customer');
                }}
                className="py-3 px-4 rounded-xl bg-[#1A1A24] hover:bg-[#222230] border border-[#D4AF37]/35 text-[#FAF8F5] text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <span>👤 {t.signIn} ({t.customerAccount})</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenAuth('seller');
                }}
                className="py-3 px-4 rounded-xl bg-[#1A1A24] hover:bg-[#222230] border border-[#D4AF37]/35 text-[#D4AF37] text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4 text-[#D4AF37]" />
                <span>{t.joinAsSeller}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
