import React, { useState, useId } from 'react';
import { X, Phone, User as UserIcon, Store, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Check } from 'lucide-react';
import { Language, User, UserRole, CategoryId, SellerStore } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { ALGERIA_WILAYAS } from '../data/wilayas';
import {
  signInWithGoogle,
  signInWithFacebook,
  formatAlgerianPhoneNumber,
} from '../services/firebaseAuthService';
import { saveUserToFirestore } from '../services/firebaseService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  defaultRole?: UserRole;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  defaultRole = 'customer',
  onLoginSuccess,
}) => {
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [method, setMethod] = useState<'phone' | 'google'>('phone');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Seller Store details
  const [storeName, setStoreName] = useState('');
  const [storeBio, setStoreBio] = useState('');
  const [storeCategory, setStoreCategory] = useState<CategoryId>('women-fashion');
  const [storeWilaya, setStoreWilaya] = useState<number>(16); // Alger default
  const [storeWhatsapp, setStoreWhatsapp] = useState('');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingAction, setSubmittingAction] = useState<string>('');

  const phoneId = useId();
  const fullNameId = useId();
  const storeNameId = useId();
  const storeBioId = useId();
  const storeCategoryId = useId();
  const storeWilayaId = useId();
  const storeWhatsappId = useId();

  if (!isOpen) return null;

  const t = TRANSLATIONS[currentLang];
  const isAr = currentLang === 'ar';

  const validatePhone = (p: string) => {
    const cleaned = p.replace(/[\s\-\(\)\+]/g, '');
    return cleaned.length >= 9 && cleaned.length <= 13;
  };

  /**
   * Helper to build SellerStore if user selects seller role
   */
  const buildSellerStore = (userId: string, userPhone?: string): SellerStore | undefined => {
    if (role !== 'seller') return undefined;
    return {
      id: `store-${userId}`,
      storeName: storeName.trim() || (fullName.trim() ? `بوتيك ${fullName}` : 'بوتيك دالوزي الفاخر'),
      storeBio: storeBio.trim() || 'بوتيك فاخر معتمد على منصة دالوزي',
      category: storeCategory,
      wilayaCode: storeWilaya,
      whatsapp: storeWhatsapp.trim() || userPhone || '213672330936',
      phone: userPhone || phone.trim() || '0672330936',
      rating: 5.0,
      verified: true,
      totalSales: 0,
    };
  };

  /**
   * Official Real Firebase Google Sign-In (Direct 1-Click)
   */
  const handleGoogleLogin = async () => {
    setMethod('google');
    setIsSubmitting(true);
    setSubmittingAction('google');
    setErrorMessage('');

    try {
      localStorage.setItem('dalozi_pending_auth_role', role);
      if (role === 'seller') {
        localStorage.setItem(
          'dalozi_pending_seller_info',
          JSON.stringify(buildSellerStore('pending', phone))
        );
      }
    } catch {}

    try {
      const firebaseUser = await signInWithGoogle('popup');

      if (firebaseUser) {
        const sellerStore = buildSellerStore(firebaseUser.uid, firebaseUser.phoneNumber || undefined);

        const newUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || fullName.trim() || (isAr ? 'زبون Google' : 'Client Google'),
          email: firebaseUser.email || undefined,
          phone: firebaseUser.phoneNumber || undefined,
          avatarUrl: firebaseUser.photoURL || undefined,
          role,
          provider: 'google',
          loyaltyPoints: role === 'customer' ? 50 : 0,
          sellerStore,
          createdAt: new Date().toISOString(),
        };

        // Save persistently in Firestore
        await saveUserToFirestore(newUser);

        try {
          localStorage.setItem('dalozi_current_user_v1', JSON.stringify(newUser));
          localStorage.setItem('dalozi_onboarding_completed', 'true');
        } catch {}

        setIsSubmitting(false);
        onLoginSuccess(newUser);
        onClose();
      }
    } catch (error: any) {
      setIsSubmitting(false);
      console.warn('Google Firebase Auth Error:', error);

      if (error?.code === 'auth/popup-closed-by-user') {
        setErrorMessage(isAr ? 'تم إغلاق نافذة تسجيل الدخول بـ Google.' : 'Connexion Google annulée.');
      } else if (error?.code === 'auth/cancelled-popup-request') {
        setErrorMessage(isAr ? 'تم إلغاء الطلب.' : 'Requête annulée.');
      } else {
        setErrorMessage(
          isAr
            ? 'تعذر الاتصال بـ Google حالياً، يرجى التسجيل برقم الهاتف أدناه مباشرة وبدون SMS.'
            : 'Impossible de joindre Google, utilisez l’inscription par téléphone ci-dessous.'
        );
      }
    }
  };

  /**
   * Official Real Firebase Facebook Sign-In
   */
  const handleFacebookLogin = async () => {
    setIsSubmitting(true);
    setSubmittingAction('facebook');
    setErrorMessage('');

    try {
      const firebaseUser = await signInWithFacebook();
      const sellerStore = buildSellerStore(firebaseUser.uid, firebaseUser.phoneNumber || undefined);

      const newUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || fullName.trim() || 'مستخدم Facebook',
        email: firebaseUser.email || undefined,
        phone: firebaseUser.phoneNumber || undefined,
        avatarUrl: firebaseUser.photoURL || undefined,
        role,
        provider: 'facebook',
        loyaltyPoints: 50,
        sellerStore,
        createdAt: new Date().toISOString(),
      };

      await saveUserToFirestore(newUser);

      try {
        localStorage.setItem('dalozi_current_user_v1', JSON.stringify(newUser));
        localStorage.setItem('dalozi_onboarding_completed', 'true');
      } catch {}

      setIsSubmitting(false);
      onLoginSuccess(newUser);
      onClose();
    } catch (error: any) {
      setIsSubmitting(false);
      console.warn('Facebook Login Error:', error);
      setErrorMessage(isAr ? 'تعذر تسجيل الدخول بـ Facebook.' : 'Erreur de connexion Facebook.');
    }
  };

  /**
   * Ultra-Simplified Phone Registration (NO SMS required!)
   * Directly saves customer/seller profile to Firestore database and enters the store!
   */
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || cleanName.length < 2) {
      setErrorMessage(isAr ? 'يرجى إدخال اسمكم الكريم.' : 'Veuillez entrer votre nom complet.');
      return;
    }

    if (!validatePhone(cleanPhone)) {
      setErrorMessage(
        isAr
          ? 'يرجى إدخال رقم هاتف جزائري صحيح (مثال: 0555123456 أو 06 / 07...)'
          : 'Veuillez saisir un numéro algérien valide (05 / 06 / 07...)'
      );
      return;
    }

    if (role === 'seller' && !storeName.trim()) {
      setErrorMessage(isAr ? 'يرجى إدخال اسم المتجر أو البوتيك.' : 'Veuillez entrer le nom de la boutique.');
      return;
    }

    setIsSubmitting(true);
    setSubmittingAction('phone');

    try {
      const formattedPhone = formatAlgerianPhoneNumber(cleanPhone);
      const digitsOnly = cleanPhone.replace(/[\s\-\(\)\+]/g, '');
      const userId = `${role === 'seller' ? 'seller' : 'cust'}-${Date.now()}-${digitsOnly.slice(-4)}`;
      const sellerStore = buildSellerStore(userId, formattedPhone);

      const newUser: User = {
        id: userId,
        name: cleanName,
        phone: formattedPhone,
        role,
        provider: 'phone',
        loyaltyPoints: role === 'customer' ? 50 : 0,
        sellerStore,
        createdAt: new Date().toISOString(),
      };

      // Direct persistent save to Firestore database
      await saveUserToFirestore(newUser);

      // Save locally
      try {
        localStorage.setItem('dalozi_current_user_v1', JSON.stringify(newUser));
        localStorage.setItem('dalozi_onboarding_completed', 'true');
      } catch {}

      setIsSubmitting(false);
      onLoginSuccess(newUser);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      console.error('Error saving user to Firestore:', err);
      setErrorMessage(
        isAr
          ? 'حدث خطأ أثناء حفظ الحساب في قاعدة البيانات، يرجى المحاولة مرة أخرى.'
          : 'Erreur lors de l’enregistrement. Veuillez réessayer.'
      );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-[#181820] border border-[#D4AF37]/40 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl my-6 text-[#FAF8F5]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#D4AF37]/20 bg-[#121217] flex items-center justify-between">
          <div>
            <span className="font-['Playfair_Display',serif] text-xs font-bold text-[#D4AF37] tracking-wider block">
              DALOZI STORE · FIRESTORE AUTH
            </span>
            <h2 id="auth-modal-title" className="text-lg sm:text-xl font-bold font-['Cairo',sans-serif] text-gold-gradient">
              {role === 'customer' ? t.customerAccount : t.sellerAccount}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#FAF8F5]/60 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs (Customer vs Seller) */}
        <div className="p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#121217] rounded-2xl border border-[#D4AF37]/30">
            <button
              type="button"
              onClick={() => {
                setRole('customer');
                setErrorMessage('');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                role === 'customer'
                  ? 'bg-gold-gradient text-[#0F0F12] shadow-md font-black'
                  : 'text-[#FAF8F5]/70 hover:text-white'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>{t.customerAccount}</span>
              <span className="text-[10px] opacity-75">(+50 نقطة)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('seller');
                setErrorMessage('');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                role === 'seller'
                  ? 'bg-gold-gradient text-[#0F0F12] shadow-md font-black'
                  : 'text-[#FAF8F5]/70 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>{t.sellerAccount}</span>
              <span className="text-[10px] opacity-75">(بائع معتمد)</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-950/70 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Social Sign-In Buttons */}
          <div className="space-y-2.5">
            {/* Primary Google Login Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleGoogleLogin}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 text-xs sm:text-sm font-bold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isSubmitting && submittingAction === 'google' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-gray-900" />
                  <span>{isAr ? 'جاري الاتصال بـ Google...' : 'Connexion à Google...'}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isAr ? 'الدخول السريع بـ Google (1-Click)' : 'Continuer avec Google'}</span>
                </>
              )}
            </button>

            {/* Facebook */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFacebookLogin}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/30 text-[#FAF8F5] text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="text-[#1877F2] font-black text-sm">f</span>
              <span>{t.loginWithFacebook}</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#181820] px-3 text-[11px] text-[#D4AF37] font-bold shrink-0">
              {isAr ? 'أو التسجيل السريع برقم الهاتف (مبسط بدون SMS)' : 'Ou par téléphone (Sans SMS)'}
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          {/* Simplified Phone Registration Form (NO SMS required!) */}
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label htmlFor={fullNameId} className="block text-xs font-bold text-[#D4AF37] mb-1">
                {t.fullName} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#D4AF37] absolute top-3 start-3" />
                <input
                  id={fullNameId}
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isAr ? 'مثال: ياسمين بن علي' : 'Ex: Yassine Benali'}
                  className="w-full bg-[#121217] border border-[#D4AF37]/30 rounded-xl py-2.5 ps-9 pe-3 text-xs sm:text-sm text-[#FAF8F5] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor={phoneId} className="block text-xs font-bold text-[#D4AF37] mb-1">
                {t.phoneNumber} <span className="text-red-400">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute start-3 text-xs font-bold text-[#D4AF37] flex items-center gap-1">
                  <span>🇩🇿</span>
                  <span dir="ltr">+213</span>
                </span>
                <input
                  id={phoneId}
                  type="tel"
                  dir="ltr"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05 / 06 / 07 XX XX XX"
                  className="w-full bg-[#121217] border border-[#D4AF37]/30 rounded-xl py-2.5 ps-18 pe-3 text-xs sm:text-sm text-[#FAF8F5] focus:outline-none focus:border-[#D4AF37] font-mono"
                />
              </div>
            </div>

            {/* Seller Specific Setup Fields */}
            {role === 'seller' && (
              <div className="pt-3 border-t border-[#D4AF37]/20 space-y-3 bg-[#121217] p-4 rounded-2xl border border-[#D4AF37]/30">
                <div className="flex items-center gap-1.5 text-xs text-[#D4AF37] font-bold">
                  <Store className="w-4 h-4" />
                  <span>بيانات المتجر والبوتيك الخاص بك:</span>
                </div>

                <div>
                  <label htmlFor={storeNameId} className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                    {t.storeName} <span className="text-red-400">*</span>
                  </label>
                  <input
                    id={storeNameId}
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="مثال: بوتيك الأناقة السطايفية"
                    className="w-full bg-[#181820] border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor={storeCategoryId} className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                      التخصص الرئيسي
                    </label>
                    <select
                      id={storeCategoryId}
                      value={storeCategory}
                      onChange={(e) => setStoreCategory(e.target.value as CategoryId)}
                      className="w-full bg-[#181820] border border-[#D4AF37]/30 rounded-xl py-2 px-2 text-xs text-[#FAF8F5] focus:outline-none"
                    >
                      <option value="women-fashion">أزياء نسائية وقندورات</option>
                      <option value="mens-apparel">أزياء رجالية</option>
                      <option value="sweets-bakery">حلويات ومخبوزات</option>
                      <option value="catering-buffet">مملحات وبوفيهات</option>
                      <option value="beauty-cosmetics">عناية وتجميل</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor={storeWilayaId} className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                      ولاية المتجر
                    </label>
                    <select
                      id={storeWilayaId}
                      value={storeWilaya}
                      onChange={(e) => setStoreWilaya(Number(e.target.value))}
                      className="w-full bg-[#181820] border border-[#D4AF37]/30 rounded-xl py-2 px-2 text-xs text-[#FAF8F5] focus:outline-none"
                    >
                      {ALGERIA_WILAYAS.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.code} - {w.nameAr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor={storeBioId} className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                    نبذة المتجر (Bio)
                  </label>
                  <input
                    id={storeBioId}
                    type="text"
                    value={storeBio}
                    onChange={(e) => setStoreBio(e.target.value)}
                    placeholder="نبذة تظهر للزبائن في صفحة المتجر..."
                    className="w-full bg-[#181820] border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label htmlFor={storeWhatsappId} className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                    رقم واتساب المتجر لتلقي الطلبيات
                  </label>
                  <input
                    id={storeWhatsappId}
                    type="tel"
                    dir="ltr"
                    value={storeWhatsapp}
                    onChange={(e) => setStoreWhatsapp(e.target.value)}
                    placeholder="213672330936"
                    className="w-full bg-[#181820] border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            )}

            {/* Direct Submit Button: "إنشاء الحساب والدخول للمتجر" */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gold-gradient text-[#0F0F12] font-black text-sm sm:text-base shadow-[0_4px_20px_rgba(212,175,55,0.35)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && submittingAction === 'phone' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isAr ? 'جاري حفظ الحساب في Firestore...' : 'Enregistrement...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>{isAr ? 'إنشاء الحساب والدخول للمتجر ✦' : 'Créer mon compte et entrer'}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#FAF8F5]/60 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>
                {isAr
                  ? 'حفظ فوري في قاعدة بيانات Firestore · بدون انتظار رمز SMS'
                  : 'Enregistrement direct dans Firestore · Aucun code SMS requis'}
              </span>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
