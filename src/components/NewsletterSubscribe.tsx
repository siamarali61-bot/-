import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, Sparkles, Send } from 'lucide-react';

const NEWSLETTER_STORAGE_KEY = 'dalozi_subscribed_email';

export const NewsletterSubscribe: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(() => {
    try {
      const stored = localStorage.getItem(NEWSLETTER_STORAGE_KEY);
      return stored ? 'success' : 'idle';
    } catch {
      return 'idle';
    }
  });
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (val: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(val.trim());
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setStatus('error');
      setErrorMessage('يرجى كتابة بريدك الإلكتروني للاشتراك.');
      return;
    }

    if (!validateEmail(email)) {
      setStatus('error');
      setErrorMessage('صيغة البريد الإلكتروني غير صحيحة (مثال: name@example.com).');
      return;
    }

    setStatus('loading');

    setTimeout(() => {
      try {
        localStorage.setItem(NEWSLETTER_STORAGE_KEY, email.trim());
      } catch {}
      setStatus('success');
      setEmail('');
    }, 600);
  };

  return (
    <div className="bg-gradient-to-r from-[#14141C] via-[#1A1A24] to-[#14141C] border border-[#D4AF37]/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Decorative subtle gold glow */}
      <div className="absolute top-0 end-0 -mt-8 -me-8 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left: Text Info */}
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F1F2A] border border-[#D4AF37]/30 text-xs text-[#D4AF37] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>نادي دالوزي VIP · الأسبقية للجديد</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black font-['Cairo',sans-serif] text-gold-gradient">
            اشترك في النشرة البريدية الفاخرة
          </h3>

          <p className="text-xs sm:text-sm text-[#FAF8F5]/75 leading-relaxed">
            كوني أول من يكتشف الإصدارات الحصرية من تشكيلة أورا (Aura Collection)، أزياء المناسبات الملكية، وعروض التوصيل المجاني عبر الـ 58 ولاية.
          </p>
        </div>

        {/* Right: Subscription Form & Feedback */}
        <div className="w-full lg:max-w-md">
          {status === 'success' ? (
            <div className="bg-[#121217] border border-emerald-500/40 p-4 rounded-xl flex items-start gap-3 text-start animate-fadeIn">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-bold text-[#FAF8F5] block">
                  مرحباً بك في نادي دالوزي VIP!
                </span>
                <p className="text-xs text-emerald-300/90 leading-relaxed">
                  تم تسجيل اشتراكك بنجاح. يمكنك استخدام كود الترحيب الحصري <strong className="text-white bg-emerald-950 px-1.5 py-0.5 rounded font-mono">DALOZI10</strong> للحصول على خصم 10% عند إتمام أي طلب.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-[#D4AF37] absolute top-3.5 start-3.5 pointer-events-none" />
                  <input
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    placeholder="name@example.com"
                    className={`w-full bg-[#121217] border rounded-xl py-3 ps-10 pe-3 text-xs sm:text-sm text-[#FAF8F5] placeholder-[#FAF8F5]/30 focus:outline-none transition-all ${
                      status === 'error'
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-[#D4AF37]/40 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-6 py-3 rounded-xl bg-gold-gradient text-[#0F0F12] font-black text-xs sm:text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {status === 'loading' ? (
                    <span>جاري التأكيد...</span>
                  ) : (
                    <>
                      <span>انضمام VIP</span>
                      <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                    </>
                  )}
                </button>
              </div>

              {/* Error State */}
              {status === 'error' && (
                <div className="flex items-center gap-1.5 text-xs text-red-400 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Privacy Disclaimer */}
              <p className="text-[10px] text-[#FAF8F5]/50 pt-0.5">
                🔒 خصوصيتك مضمونة تماماً. لا نرسل رسائل مزعجة، فقط التشكيلات الحصرية وأكواد التخفيض.
              </p>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
