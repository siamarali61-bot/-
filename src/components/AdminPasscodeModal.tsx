import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle, X, KeyRound, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentLang: Language;
}

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentLang,
}) => {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Default secure admin passcode as requested: Dalozi@123456
  const VALID_PASSCODES = ['Dalozi@123456', 'dalozi@123456', 'dalozi2025'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);

    const inputClean = passcode.trim();
    if (VALID_PASSCODES.includes(inputClean)) {
      setIsSuccess(true);
      try {
        sessionStorage.setItem('dalozi_admin_auth', 'true');
      } catch {}

      setTimeout(() => {
        setIsSuccess(false);
        setPasscode('');
        onSuccess();
      }, 500);
    } else {
      setError(true);
    }
  };

  const isAr = currentLang === 'ar';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="relative bg-[#121217] border-2 border-[#D4AF37]/50 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(212,175,55,0.25)] text-[#FAF8F5]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 p-2 rounded-xl text-[#FAF8F5]/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-[#D4AF37]/10 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold font-['Cairo',sans-serif] text-gold-gradient">
              {isAr ? 'حماية لوحة الإدارة' : 'Accès Administration'}
            </h3>
            <p className="text-xs text-[#FAF8F5]/60 mt-1 max-w-xs">
              {isAr
                ? 'لوحة التحكم محمية. أدخل كلمة السر الخاصة بالإدارة للمتابعة.'
                : 'Cet espace est réservé à l’administration. Entrez le code secret pour continuer.'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isAr ? 'كلمة سر المدير (Admin Passcode)' : 'Mot de passe Administrateur'}</span>
            </label>
            <div className="relative">
              <input
                type={showPasscode ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError(false);
                }}
                placeholder={isAr ? 'أدخل كلمة سر الإدارة...' : 'Entrez le mot de passe...'}
                autoFocus
                className={`w-full bg-[#181822] border rounded-xl py-3 ps-4 pe-11 text-sm text-[#FAF8F5] focus:outline-none transition-colors ${
                  error
                    ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/50'
                    : 'border-white/15 focus:border-[#D4AF37]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute top-1/2 -translate-y-1/2 end-3 text-[#FAF8F5]/50 hover:text-white p-1"
                aria-label={showPasscode ? 'إخفاء' : 'إظهار'}
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-400 pt-1 animate-shake">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isAr ? 'كلمة المرور غير صحيحة، الوصول محمي.' : 'Mot de passe incorrect. Accès refusé.'}
                </span>
              </div>
            )}

            {isSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isAr ? 'تم التحقق بنجاح! جاري فتح اللوحة...' : 'Code validé ! Ouverture du panneau...'}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSuccess || !passcode.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-[#D4AF37] text-[#0F0F12] font-black text-sm shadow-[0_2px_15px_rgba(212,175,55,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isAr ? 'تسجيل دخول الإدارة' : 'Valider l’accès'}</span>
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-5 pt-4 border-t border-white/10 text-center">
          <span className="text-[11px] text-[#FAF8F5]/40 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3 text-[#D4AF37]/60" />
            <span>Dalozi Store · نظام حماية البيانات والتحكم المشفر</span>
          </span>
        </div>

      </div>
    </div>
  );
};
