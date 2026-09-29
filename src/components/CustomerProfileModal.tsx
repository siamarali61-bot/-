import React from 'react';
import { X, User as UserIcon, Award, ShieldCheck, LogOut, Package, Phone } from 'lucide-react';
import { User, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogout: () => void;
  currentLang: Language;
  onOpenAdmin?: () => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  currentLang,
  onOpenAdmin,
}) => {
  if (!isOpen || !currentUser) return null;

  const t = TRANSLATIONS[currentLang];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-profile-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-[#181820] border border-[#D4AF37]/40 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl my-6 text-[#FAF8F5]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#D4AF37]/20 bg-[#121217] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 id="customer-profile-title" className="text-sm sm:text-base font-bold text-[#FAF8F5]">
                {currentUser.name}
              </h2>
              <span className="text-[11px] text-[#D4AF37] font-medium">
                {currentUser.role === 'seller' ? '👑 تاجر وبائع معتمد' : '⭐️ زبون دالوزي المميز'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1F1F2A] hover:bg-[#D4AF37] text-[#FAF8F5] hover:text-[#0F0F12] flex items-center justify-center transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          
          {/* Loyalty Points Card */}
          <div className="p-4 bg-gradient-to-r from-[#1D1D2B] via-[#242436] to-[#1D1D2B] rounded-2xl border border-[#D4AF37]/35 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-[#FAF8F5]/60 block">رصيد نقاط الولاء (VIP Points)</span>
                <span className="text-lg font-black text-gold-gradient">
                  {currentUser.loyaltyPoints || 50} نقطة
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-bold rounded-lg">
              فئة VIP
            </span>
          </div>

          {/* User Details */}
          <div className="bg-[#121217] p-4 rounded-2xl border border-white/5 space-y-2.5 text-xs">
            {currentUser.phone && (
              <div className="flex items-center justify-between">
                <span className="text-[#FAF8F5]/60 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>رقم الهاتف:</span>
                </span>
                <span className="font-mono text-[#FAF8F5]" dir="ltr">{currentUser.phone}</span>
              </div>
            )}

            {currentUser.email && (
              <div className="flex items-center justify-between">
                <span className="text-[#FAF8F5]/60">البريد الإلكتروني:</span>
                <span className="text-[#FAF8F5] font-mono text-[11px]">{currentUser.email}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-[#FAF8F5]/60">طريقة التسجيل:</span>
              <span className="text-[#D4AF37] font-semibold uppercase">{currentUser.provider}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <span className="text-[#FAF8F5]/60">تاريخ الانضمام:</span>
              <span className="text-[#FAF8F5]/80">عضو موثق</span>
            </div>
          </div>

          {/* Orders Status */}
          <div className="p-3.5 bg-[#14141C] rounded-xl border border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#D4AF37]" />
              <span>الطلبيات النشطة:</span>
            </div>
            <span className="text-[#FAF8F5]/70 text-[11px]">يتم تحديثها تلقائياً عبر رقم هاتفك</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#FAF8F5]/60 px-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span>حسابك مؤهل لخدمة الدفع عند الاستلام والمعاينة المجانية عبر 58 ولاية.</span>
          </div>

          {/* Admin Dashboard shortcut */}
          {onOpenAdmin && (
            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-[#D4AF37] text-[#0F0F12] rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>لوحة تحكم المالك (Admin Dashboard)</span>
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-red-950/40 hover:bg-red-950/70 border border-red-500/30 text-red-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.signOut}</span>
          </button>

        </div>
      </div>
    </div>
  );
};
