import React, { useState } from 'react';
import {
  Globe,
  Sparkles,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  User as UserIcon,
  Phone,
  Lock,
  Loader2,
  AlertCircle,
  Eye,
  Gift,
  Check,
} from 'lucide-react';
import { Language, User } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { signInWithGoogle, formatAlgerianPhoneNumber } from '../services/firebaseAuthService';
import { saveUserToFirestore } from '../services/firebaseService';
import imgHero from '../assets/images/hero_dalozi_luxury_1790546064797.jpg';

interface DaloziOnboardingFlowProps {
  isOpen: boolean;
  currentLang: Language;
  onSelectLanguage: (lang: Language) => void;
  onComplete: (user: User) => void;
}

export const DaloziOnboardingFlow: React.FC<DaloziOnboardingFlowProps> = ({
  isOpen,
  currentLang,
  onSelectLanguage,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [authMethod, setAuthMethod] = useState<'google' | 'phone'>('google');

  // Phone Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const t = TRANSLATIONS[currentLang];
  const isAr = currentLang === 'ar';

  /**
   * Screen 1: Language selection transition
   */
  const handleLanguageChoice = (lang: Language) => {
    onSelectLanguage(lang);
    setStep(2);
  };

  /**
   * Screen 3: Google 1-Click Sign-in
   */
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMessage('');

    try {
      const firebaseUser = await signInWithGoogle('popup');
      if (firebaseUser) {
        const newUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'زبون دالوزي المميز',
          email: firebaseUser.email || undefined,
          phone: firebaseUser.phoneNumber || undefined,
          avatarUrl: firebaseUser.photoURL || undefined,
          role: 'customer',
          provider: 'google',
          loyaltyPoints: 50,
          createdAt: new Date().toISOString(),
        };

        // Save persistently to Firestore
        await saveUserToFirestore(newUser);

        // Mark onboarding completed
        try {
          localStorage.setItem('dalozi_onboarding_completed', 'true');
        } catch {}

        onComplete(newUser);
      }
    } catch (error: any) {
      console.warn('Google Onboarding Sign-in note:', error);
      if (error?.code === 'auth/popup-closed-by-user') {
        setErrorMessage(isAr ? 'تم إغلاق نافذة تسجيل Google.' : 'Fenêtre de connexion Google fermée.');
      } else {
        setErrorMessage(
          isAr
            ? 'تعذر الاتصال بـ Google حالياً، يمكنك استخدام التسجيل برقم الهاتف أدناه فوراً.'
            : 'Impossible de joindre Google, utilisez l’inscription par téléphone ci-dessous.'
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  /**
   * Screen 3: Simplified Phone Registration (NO SMS required!)
   */
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || cleanName.length < 2) {
      setErrorMessage(isAr ? 'يرجى إدخال اسمكم الكريم.' : 'Veuillez renseigner votre nom complet.');
      return;
    }

    // Algerian phone validation: 05, 06, 07 or 9-10 digits
    const digitsOnly = cleanPhone.replace(/[\s\-\(\)\+]/g, '');
    if (digitsOnly.length < 9 || digitsOnly.length > 13) {
      setErrorMessage(
        isAr
          ? 'يرجى إدخال رقم هاتف جزائري صحيح (مثال: 0550123456 / 06 / 07).'
          : 'Veuillez saisir un numéro algérien valide (ex: 0550123456).'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedPhone = formatAlgerianPhoneNumber(cleanPhone);
      const generatedId = `cust-${Date.now()}-${digitsOnly.slice(-4)}`;

      const newUser: User = {
        id: generatedId,
        name: cleanName,
        phone: formattedPhone,
        role: 'customer',
        provider: 'phone',
        loyaltyPoints: 50,
        createdAt: new Date().toISOString(),
      };

      // Save customer profile straight into Firestore database
      await saveUserToFirestore(newUser);

      // Save locally
      try {
        localStorage.setItem('dalozi_onboarding_completed', 'true');
      } catch {}

      onComplete(newUser);
    } catch (err) {
      console.error('Error saving customer to Firestore:', err);
      setErrorMessage(
        isAr
          ? 'حدث خطأ أثناء حفظ الحساب، يرجى المحاولة مرة أخرى.'
          : 'Une erreur s’est produite lors de l’enregistrement.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-fadeIn select-none"
    >
      <div className="relative bg-[#0F0F14] border-2 border-[#D4AF37]/50 w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(212,175,55,0.3)] text-[#FAF8F5] my-auto">
        
        {/* Step Progress Bar */}
        <div className="bg-[#0A0A0E] px-6 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-['Playfair_Display',serif] text-sm font-bold text-gold-gradient tracking-wider">
              DALOZI STORE · ALGERIA
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#D4AF37]">
              {isAr ? `المرحلة ${step} من 3` : `Étape ${step} sur 3`}
            </span>
            <div className="flex gap-1.5">
              <div className={`w-6 h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-[#D4AF37]' : 'bg-white/20'}`} />
              <div className={`w-6 h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-[#D4AF37]' : 'bg-white/20'}`} />
              <div className={`w-6 h-1.5 rounded-full transition-all ${step >= 3 ? 'bg-[#D4AF37]' : 'bg-white/20'}`} />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SCREEN 1: Simple & Ultra-Luxurious Language Selection     */}
        {/* ========================================================= */}
        {step === 1 && (
          <div className="p-6 sm:p-10 space-y-8 text-center animate-fadeIn">
            {/* Brand Logo & Emblem */}
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-[#222230] via-[#161622] to-[#0D0D14] border-2 border-[#D4AF37]/60 flex items-center justify-center text-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-[#D4AF37]" />
              </div>

              <div>
                <h1 className="font-['Playfair_Display',serif] text-2xl sm:text-4xl font-black text-gold-gradient tracking-widest uppercase">
                  DALOZI STORE
                </h1>
                <p className="text-xs sm:text-sm text-[#D4AF37]/90 font-medium tracking-wide mt-1">
                  Haute Couture & Gastronomie Algérienne
                </p>
              </div>
            </div>

            {/* Instruction */}
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold font-['Cairo',sans-serif] text-[#FAF8F5]">
                اختر لغة التسوق المفضلة
              </h2>
              <p className="text-xs text-[#FAF8F5]/60">
                Choisissez votre langue de shopping pour continuer
              </p>
            </div>

            {/* Language Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              {/* Arabic Button */}
              <button
                type="button"
                onClick={() => handleLanguageChoice('ar')}
                className="group relative p-5 rounded-2xl bg-gradient-to-b from-[#181822] to-[#12121A] hover:from-[#242434] hover:to-[#181824] border-2 border-[#D4AF37]/40 hover:border-[#D4AF37] transition-all duration-300 text-start cursor-pointer hover:scale-[1.03] shadow-lg flex flex-col justify-between h-36"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">🇩🇿</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold border border-[#D4AF37]/30">
                    الأصالة الجزائرية
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#FAF8F5] group-hover:text-gold-gradient transition-colors">
                    العربية
                  </h3>
                  <p className="text-xs text-[#FAF8F5]/65 mt-0.5">
                    تصفح باللغة العربية مع تجربة تسوق جزائرية راقية
                  </p>
                </div>
              </button>

              {/* French Button */}
              <button
                type="button"
                onClick={() => handleLanguageChoice('fr')}
                className="group relative p-5 rounded-2xl bg-gradient-to-b from-[#181822] to-[#12121A] hover:from-[#242434] hover:to-[#181824] border-2 border-white/20 hover:border-[#D4AF37] transition-all duration-300 text-start cursor-pointer hover:scale-[1.03] shadow-lg flex flex-col justify-between h-36"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">🇫🇷</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-bold border border-white/20">
                    Boutique Officielle
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#FAF8F5] group-hover:text-gold-gradient transition-colors">
                    Français
                  </h3>
                  <p className="text-xs text-[#FAF8F5]/65 mt-0.5">
                    Explorez nos collections d'exception en langue française
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-[#FAF8F5]/40 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]/60" />
                <span>متجر دالوزي المعتمد · تسوق آمن ومحمي 100% في الجزائر</span>
              </span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 2: Luxurious Welcome & High Trust Guarantees       */}
        {/* ========================================================= */}
        {step === 2 && (
          <div className="p-6 sm:p-8 space-y-6 animate-fadeIn">
            {/* Banner with Showroom Image */}
            <div className="relative rounded-2xl overflow-hidden h-40 sm:h-48 border border-[#D4AF37]/30 shadow-md">
              <img
                src={imgHero}
                alt="Dalozi Luxury Collection"
                className="w-full h-full object-cover filter brightness-[0.7]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F14] via-[#0F0F14]/50 to-transparent" />
              <div className="absolute inset-x-5 bottom-3 text-start space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-[#0F0F12] text-[10px] font-black uppercase">
                  {isAr ? 'فخامة وأصالة جزائرية' : 'Excellence Algérienne'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-['Cairo',sans-serif] text-gold-gradient">
                  {isAr ? 'مرحباً بكم في دار دالوزي للفخامة' : 'Bienvenue chez Dalozi Store'}
                </h2>
                <p className="text-xs text-[#FAF8F5]/80">
                  {isAr
                    ? 'أرقى الأزياء الجزائرية، القفاطين، العطور والحلويات الملكية بأعلى معايير الإتقان.'
                    : 'Le raffinement de la haute couture, des caftans et de la gastronomie algérienne.'}
                </p>
              </div>
            </div>

            {/* Core Trust & Security Pillars (Algerian Customer Guarantees) */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>{isAr ? 'ضمانات الثقة والتسوق الآمن' : 'Nos Garanties de Confiance'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pillar 1: Cash on Delivery */}
                <div className="p-3.5 rounded-xl bg-[#161622] border border-white/10 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <span className="text-base font-black">💵</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#FAF8F5]">
                      {isAr ? 'الدفع عند الاستلام (COD)' : 'Paiement à la livraison'}
                    </h4>
                    <p className="text-[11px] text-[#FAF8F5]/70 mt-0.5 leading-relaxed">
                      {isAr
                        ? 'لا تدفع أي دينار مسبقاً؛ سدد قيمة مشترياتك نقداً عند استلام الطرد بيدك.'
                        : 'Aucun paiement en ligne requis, payez en espèces lors de la réception.'}
                    </p>
                  </div>
                </div>

                {/* Pillar 2: Inspection before Payment */}
                <div className="p-3.5 rounded-xl bg-[#161622] border border-amber-500/30 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Eye className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-400">
                      {isAr ? 'المعاينة والفحص قبل الدفع' : 'Inspection avant paiement'}
                    </h4>
                    <p className="text-[11px] text-[#FAF8F5]/70 mt-0.5 leading-relaxed">
                      {isAr
                        ? 'حق المعاينة الكامل؛ افتح الطرد وتأكد من جودة ومقاس القطعة قبل تسليم المبلغ.'
                        : 'Ouvrez et vérifiez votre colis avant de régler le livreur.'}
                    </p>
                  </div>
                </div>

                {/* Pillar 3: 58 Wilayas Delivery */}
                <div className="p-3.5 rounded-xl bg-[#161622] border border-white/10 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#FAF8F5]">
                      {isAr ? 'توصيل سريع لـ 58 ولاية' : 'Livraison dans 58 Wilayas'}
                    </h4>
                    <p className="text-[11px] text-[#FAF8F5]/70 mt-0.5 leading-relaxed">
                      {isAr
                        ? 'توصيل مضمون لباب منزلك أو لمكتب التوصيل في كافة ربوع الجزائر.'
                        : 'Expédition rapide et soignée à domicile ou en point relais.'}
                    </p>
                  </div>
                </div>

                {/* Pillar 4: 100% Authentic & Replacement */}
                <div className="p-3.5 rounded-xl bg-[#161622] border border-white/10 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#FAF8F5]">
                      {isAr ? 'ضمان الأصالة والاستبدال' : 'Garantie & Échange'}
                    </h4>
                    <p className="text-[11px] text-[#FAF8F5]/70 mt-0.5 leading-relaxed">
                      {isAr
                        ? 'منتجات أصلية 100% مع مرونة كاملة في الاستبدال لضمان رضاكم التام.'
                        : 'Produits 100% authentiques avec service après-vente dédié.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#FAF8F5]/60 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{isAr ? 'تغيير اللغة' : 'Changer de langue'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-[#D4AF37] text-[#0F0F12] font-black text-xs sm:text-sm shadow-[0_2px_20px_rgba(212,175,55,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{isAr ? 'متابعة وفتح الحساب' : 'Continuer vers l’inscription'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 3: Exclusive Account Creation (Google / Phone)      */}
        {/* ========================================================= */}
        {step === 3 && (
          <div className="p-6 sm:p-8 space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#D4AF37] text-xs font-bold">
                <Gift className="w-3.5 h-3.5" />
                <span>{isAr ? 'هدية ترحيبية: 50 نقطة ولاء مجانية 🎁' : 'Cadeau de bienvenue : +50 points'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-['Cairo',sans-serif] text-gold-gradient">
                {isAr ? 'إنشاء حساب الزبون ودخول المتجر' : 'Création de votre Compte Client'}
              </h2>
              <p className="text-xs text-[#FAF8F5]/70 max-w-md mx-auto">
                {isAr
                  ? 'خطوة أخيرة وسريعة للاستفادة من متابعة الطلبات وعروض التخفيض الحصرية.'
                  : 'Une dernière étape rapide pour suivre vos commandes et accéder aux offres privées.'}
              </p>
            </div>

            {/* Method Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#14141E] rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => setAuthMethod('google')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMethod === 'google'
                    ? 'bg-[#D4AF37] text-[#0F0F12] shadow-md font-black'
                    : 'text-[#FAF8F5]/70 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google (1-Click)</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMethod('phone')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMethod === 'phone'
                    ? 'bg-[#D4AF37] text-[#0F0F12] shadow-md font-black'
                    : 'text-[#FAF8F5]/70 hover:text-white'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>{isAr ? 'رقم الهاتف (بدون SMS)' : 'Téléphone (Sans SMS)'}</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Option A: Google 1-Click */}
            {authMethod === 'google' && (
              <div className="space-y-4 py-2">
                <div className="p-4 bg-[#14141E] rounded-2xl border border-white/10 text-center space-y-2">
                  <p className="text-xs text-[#FAF8F5]/80">
                    {isAr
                      ? 'سجل دخولك الآن بحساب Google بضغطة زر واحدة وآمنة دون الحاجة لملء أي استمارات.'
                      : 'Connectez-vous en un clic avec votre compte Google de manière instantanée et sécurisée.'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={googleLoading}
                  onClick={handleGoogleSignIn}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-sm shadow-[0_2px_15px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
                >
                  {googleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-900" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>
                    {googleLoading
                      ? (isAr ? 'جاري الاتصال بـ Google...' : 'Connexion à Google...')
                      : (isAr ? 'الدخول السريع بـ Google (1-Click)' : 'Continuer avec Google')}
                  </span>
                </button>

                <div className="text-center">
                  <span className="text-[11px] text-[#FAF8F5]/50">
                    {isAr
                      ? 'أو إذا كنت تفضل رقم الهاتف فقط، اختر التبويب الثاني أعلاه 👆'
                      : 'Ou préférez votre numéro de téléphone ci-dessus'}
                  </span>
                </div>
              </div>
            )}

            {/* Option B: Simplified Phone Registration (NO SMS) */}
            {authMethod === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>
                    {isAr
                      ? 'تسجيل مباشر وسريع برقم الهاتف، دون الحاجة لانتظار رمز الرسائل القصيرة (SMS)!'
                      : 'Inscription immédiate par téléphone, aucun code SMS requis !'}
                  </span>
                </div>

                {/* Field 1: Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>{isAr ? 'الاسم الكامل' : 'Nom et Prénom'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isAr ? 'مثال: محمد أمين بن علي' : 'Ex: Amine Benali'}
                    className="w-full bg-[#181822] border border-white/15 focus:border-[#D4AF37] rounded-xl py-3 px-4 text-xs sm:text-sm text-[#FAF8F5] focus:outline-none"
                  />
                </div>

                {/* Field 2: Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{isAr ? 'رقم الهاتف الجزائري' : 'Numéro de Téléphone Algérien'}</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute start-3.5 text-xs font-bold text-[#D4AF37] flex items-center gap-1">
                      <span>🇩🇿</span>
                      <span dir="ltr">+213</span>
                    </span>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05 XX XX XX XX / 06 / 07"
                      className="w-full bg-[#181822] border border-white/15 focus:border-[#D4AF37] rounded-xl py-3 ps-20 pe-4 text-xs sm:text-sm text-[#FAF8F5] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Submit Phone Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-[#D4AF37] text-[#0F0F12] font-black text-sm shadow-[0_2px_20px_rgba(212,175,55,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#0F0F12]" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>
                    {isSubmitting
                      ? (isAr ? 'جاري حفظ الحساب في القاعدة...' : 'Enregistrement...')
                      : (isAr ? 'إنشاء الحساب ودخول المتجر ✦' : 'Créer mon compte et entrer')}
                  </span>
                </button>
              </form>
            )}

            {/* Back Button */}
            <div className="pt-2 text-start">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-[#FAF8F5]/60 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                <span>{isAr ? 'الرجوع لصفحة الضمانات' : 'Retour aux garanties'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
