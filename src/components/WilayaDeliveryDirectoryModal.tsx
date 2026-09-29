import React, { useState, useId } from 'react';
import { X, Search, Truck, Building, Clock } from 'lucide-react';
import { ALGERIA_WILAYAS } from '../data/wilayas';
import { formatDZD } from '../utils/helpers';

interface WilayaDeliveryDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWilaya?: (code: number) => void;
}

export const WilayaDeliveryDirectoryModal: React.FC<WilayaDeliveryDirectoryModalProps> = ({
  isOpen,
  onClose,
  onSelectWilaya,
}) => {
  const [search, setSearch] = useState('');
  const searchId = useId();

  if (!isOpen) return null;

  const filteredWilayas = ALGERIA_WILAYAS.filter(
    (w) =>
      w.nameAr.includes(search) ||
      w.nameFr.toLowerCase().includes(search.toLowerCase()) ||
      w.code.toString() === search.trim()
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wilayas-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-[#181820] border border-[#D4AF37]/40 w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl my-8 text-[#FAF8F5] flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#D4AF37]/20 bg-[#121217] space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇩🇿</span>
              <div>
                <h2 id="wilayas-title" className="text-lg font-bold font-['Cairo',sans-serif] text-gold-gradient">
                  دليل أسعار التوصيل لجميع 58 ولاية جزائرية
                </h2>
                <p className="text-xs text-[#FAF8F5]/60">
                  توصيل سريع وآمن مع الدفع عند الاستلام (COD) وفحص السلعة قبل السداد
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#1F1F2A] hover:bg-[#D4AF37] text-[#FAF8F5] hover:text-[#0F0F12] flex items-center justify-center transition-colors"
              aria-label="إغلاق دليل الولايات"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[#D4AF37] absolute top-3 start-3.5" />
            <label htmlFor={searchId} className="sr-only">
              ابحث برقم الولاية أو اسمها (مثال: 16 أو الجزائر، وهران، سطيف...)
            </label>
            <input
              id={searchId}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث برقم الولاية أو اسمها (مثال: 16 أو الجزائر، وهران، سطيف...)"
              className="w-full bg-[#181820] border border-[#D4AF37]/30 rounded-xl py-2 ps-10 pe-3 text-xs text-[#FAF8F5] placeholder-[#FAF8F5]/40 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        {/* List of 58 Wilayas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredWilayas.map((wilaya) => (
              <div
                key={wilaya.code}
                onClick={() => {
                  if (onSelectWilaya) onSelectWilaya(wilaya.code);
                  onClose();
                }}
                className="bg-[#121217] p-3 rounded-xl border border-white/5 hover:border-[#D4AF37]/60 transition-all cursor-pointer hover:bg-[#1A1A24] space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-black flex items-center justify-center border border-[#D4AF37]/30">
                      {wilaya.code.toString().padStart(2, '0')}
                    </span>
                    <span className="font-bold text-sm text-[#FAF8F5] group-hover:text-[#D4AF37] transition-colors">
                      {wilaya.nameAr}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#FAF8F5]/40 font-mono">
                    {wilaya.nameFr}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-white/5 text-[11px]">
                  <div className="flex items-center gap-1 text-[#FAF8F5]/80">
                    <Truck className="w-3 h-3 text-[#D4AF37]" />
                    <span>للمنزل: <strong className="text-[#FAF8F5]">{formatDZD(wilaya.homeDeliveryPrice)}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-[#FAF8F5]/80">
                    <Building className="w-3 h-3 text-[#D4AF37]" />
                    <span>للمكتب: <strong className="text-[#FAF8F5]">{formatDZD(wilaya.deskDeliveryPrice)}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-[#D4AF37]/80">
                  <Clock className="w-3 h-3" />
                  <span>المدة: {wilaya.deliveryDays}</span>
                </div>
              </div>
            ))}
          </div>

          {filteredWilayas.length === 0 && (
            <p className="text-center py-8 text-xs text-[#FAF8F5]/50">
              لم نجد أي ولاية تطابق البحث.
            </p>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-[#121217] border-t border-[#D4AF37]/20 text-center text-xs text-[#FAF8F5]/60 shrink-0">
          ✨ توصيل مجاني تلقائي لجميع الولايات عند تجاوز قيمة الطلب 30,000 د.ج
        </div>
      </div>
    </div>
  );
};
