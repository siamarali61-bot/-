import React from 'react';
import { X, Check, Globe } from 'lucide-react';
import { Language } from '../types';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onSelectLanguage: (lang: Language) => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onSelectLanguage,
}) => {
  if (!isOpen) return null;

  const languages: { code: Language; name: string; nativeName: string; flag: string; dir: 'rtl' | 'ltr' }[] = [
    { code: 'ar', name: 'Arabic', nativeName: 'العربية (الجزائر)', flag: '🇩🇿', dir: 'rtl' },
    { code: 'fr', name: 'French', nativeName: 'Français (Algérie)', flag: '🇫🇷', dir: 'ltr' },
    { code: 'en', name: 'English', nativeName: 'English (Global)', flag: '🇬🇧', dir: 'ltr' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-[#181820] border border-[#D4AF37]/40 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl text-[#FAF8F5]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D4AF37]/20 bg-[#121217] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <Globe className="w-5 h-5" />
            <h2 id="lang-modal-title" className="text-base font-bold font-['Cairo',sans-serif]">
              اختيار اللغة / Choisir la langue / Select Language
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1F1F2A] hover:bg-[#D4AF37] text-[#FAF8F5] hover:text-[#0F0F12] flex items-center justify-center transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language Options */}
        <div className="p-5 space-y-3">
          {languages.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  onSelectLanguage(lang.code);
                  onClose();
                }}
                className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-[#222230] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                    : 'bg-[#121217] border-white/10 hover:border-[#D4AF37]/50 hover:bg-[#1A1A24]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-start">
                    <span className="block font-bold text-sm text-[#FAF8F5]">
                      {lang.nativeName}
                    </span>
                    <span className="block text-xs text-[#FAF8F5]/50">
                      {lang.name}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#0F0F12] flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-[#121217] border-t border-white/5 text-center text-xs text-[#FAF8F5]/50">
          تغيير اللغة يُعدل واجهة الموقع واتجاه القراءة (RTL / LTR) فوراً
        </div>
      </div>
    </div>
  );
};
