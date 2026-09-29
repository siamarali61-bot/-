import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { HeroSlider } from './components/HeroSlider';
import { NestedCategoryNav } from './components/NestedCategoryNav';
import { ProductCard } from './components/ProductCard';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { QuickOrderModal } from './components/QuickOrderModal';
import { SearchModal } from './components/SearchModal';
import { WilayaDeliveryDirectoryModal } from './components/WilayaDeliveryDirectoryModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { ReviewsSection } from './components/ReviewsSection';
import { Footer } from './components/Footer';

// New Multilingual & Multi-Role Components
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { WelcomeGateModal } from './components/WelcomeGateModal';
import { DaloziOnboardingFlow } from './components/DaloziOnboardingFlow';
import { AdminPasscodeModal } from './components/AdminPasscodeModal';
import { AuthModal } from './components/AuthModal';
import { SellerDashboardModal } from './components/SellerDashboardModal';
import { CustomerProfileModal } from './components/CustomerProfileModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { DaloziAIChatModal } from './components/DaloziAIChatModal';

// Firebase Firestore Services
import {
  subscribeToProducts,
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveOrderToFirestore,
  saveUserToFirestore,
  subscribeToOrders,
} from './services/firebaseService';
import { signOutFromFirebase, checkRedirectResult } from './services/firebaseAuthService';

import { PRODUCTS, STORE_WHATSAPP_NUMBER } from './data/products';
import { Product, ProductVariantColor, CartItem, CategoryId, OrderData, Language, User, UserRole } from './types';
import { TRANSLATIONS } from './data/translations';
import { Sparkles, ShoppingBag, ShieldCheck, MapPin, Truck, Phone } from 'lucide-react';

const CART_STORAGE_KEY = 'dalozi_store_cart_v1';
const USER_STORAGE_KEY = 'dalozi_current_user_v1';
const SELLER_PRODUCTS_STORAGE_KEY = 'dalozi_seller_custom_products_v1';
const LANG_STORAGE_KEY = 'dalozi_app_language_v1';

export default function App() {
  // Trilingual State (Arabic, French, English)
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      return (saved as Language) || 'ar';
    } catch {
      return 'ar';
    }
  });

  const t = TRANSLATIONS[currentLang];

  // Sync Language and Direction (RTL / LTR)
  useEffect(() => {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem(LANG_STORAGE_KEY, currentLang);
    } catch {}
  }, [currentLang]);

  // Dalozi Onboarding Flow (Compulsory for all new visitors)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    try {
      const completed = localStorage.getItem('dalozi_onboarding_completed');
      return !completed;
    } catch {
      return true;
    }
  });

  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('dalozi_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminPasscodeModalOpen, setIsAdminPasscodeModalOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Trigger admin login or dashboard based on auth
  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminPasscodeModalOpen(true);
    }
  };

  // Check URL params for secret admin access: ?admin=Dalozi@123456 or ?admin=true or #admin
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const adminVal = params.get('admin');
      const hasAdminQuery = params.has('admin') || window.location.hash === '#admin';

      if (adminVal === 'Dalozi@123456' || adminVal === 'dalozi@123456') {
        sessionStorage.setItem('dalozi_admin_auth', 'true');
        setIsAdminAuthenticated(true);
        setIsAdminDashboardOpen(true);
        return;
      }

      if (hasAdminQuery) {
        if (sessionStorage.getItem('dalozi_admin_auth') === 'true') {
          setIsAdminAuthenticated(true);
          setIsAdminDashboardOpen(true);
        } else {
          setIsAdminPasscodeModalOpen(true);
        }
      }
    } catch {}
  }, []);

  // User Account State (Customer or Seller)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Real-time Products loaded from Firebase Firestore
  const [firestoreProducts, setFirestoreProducts] = useState<Product[]>([]);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

  // Subscribe to real-time products directly from Firebase Firestore
  useEffect(() => {
    const unsubscribe = subscribeToProducts((prods) => {
      setFirestoreProducts(prods);
      setIsFirebaseConnected(true);
    });
    return () => unsubscribe();
  }, []);

  // Check for returning user from Firebase Google signInWithRedirect
  useEffect(() => {
    checkRedirectResult().then(async (firebaseUser) => {
      if (firebaseUser) {
        console.log('✅ Returned from Firebase Google Redirect:', firebaseUser.email);
        const savedRole = (localStorage.getItem('dalozi_pending_auth_role') as UserRole) || 'customer';
        let sellerStore = undefined;
        try {
          const savedStore = localStorage.getItem('dalozi_pending_seller_info');
          if (savedStore) sellerStore = JSON.parse(savedStore);
        } catch {}

        const newUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'مستخدم Google',
          email: firebaseUser.email || undefined,
          phone: firebaseUser.phoneNumber || undefined,
          avatarUrl: firebaseUser.photoURL || undefined,
          role: savedRole,
          provider: 'google',
          loyaltyPoints: savedRole === 'customer' ? 50 : 0,
          sellerStore,
          createdAt: new Date().toISOString(),
        };

        await handleLoginSuccess(newUser);
        localStorage.removeItem('dalozi_pending_auth_role');
        localStorage.removeItem('dalozi_pending_seller_info');
      }
    }).catch((err) => {
      console.warn('Firebase Redirect check note:', err);
    });
  }, []);

  // Combine Firestore Products (falls back to initial luxury catalog if loading)
  const allCatalogProducts = useMemo(() => {
    if (firestoreProducts && firestoreProducts.length > 0) {
      return firestoreProducts;
    }
    return PRODUCTS;
  }, [firestoreProducts]);

  // Navigation & Filtering
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  // Cart State (Persisted in localStorage)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  // Modals State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWilayasOpen, setIsWilayasOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderData | null>(null);

  // Multi-Role & Multilingual Modals
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultRole, setAuthDefaultRole] = useState<UserRole>('customer');
  const [isSellerDashboardOpen, setIsSellerDashboardOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [orders, setOrders] = useState<OrderData[]>([]);

  // Real-time Firestore orders listener for Admin notifications and order tracking
  useEffect(() => {
    const unsub = subscribeToOrders((newOrders) => {
      setOrders(newOrders);
    });
    return () => unsub();
  }, []);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => !o.status || o.status === 'pending').length;
  }, [orders]);

  // Sync Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  // Total items in cart
  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  // Filtered Products
  const displayedProducts = useMemo(() => {
    let prods = allCatalogProducts;
    if (selectedCategory !== 'all') {
      prods = prods.filter((p) => p.category === selectedCategory);
    }
    if (selectedSubCategory) {
      prods = prods.filter((p) => p.subCategoryId === selectedSubCategory);
    }
    return prods;
  }, [selectedCategory, selectedSubCategory, allCatalogProducts]);

  // Add To Cart Handler
  const handleAddToCart = (
    product: Product,
    selectedColor?: ProductVariantColor,
    selectedSize?: string,
    quantity = 1
  ) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor?.name === selectedColor?.name &&
          item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            product,
            selectedColor,
            selectedSize,
            quantity,
          },
        ];
      }
    });

    setIsCartOpen(true);
  };

  // 1-Click Buy Now
  const handleQuickBuyNow = (
    product: Product,
    selectedColor?: ProductVariantColor,
    selectedSize?: string,
    quantity = 1
  ) => {
    handleAddToCart(product, selectedColor, selectedSize, quantity);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Update Cart Item Quantity
  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
    } else {
      setCartItems((prev) => {
        const updated = [...prev];
        updated[index].quantity = newQty;
        return updated;
      });
    }
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Promo Code Validation
  const handleApplyPromo = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === 'DALOZI10' || clean === 'VIP10' || clean === 'AURA10') {
      setAppliedPromo(clean);
      return true;
    }
    return false;
  };

  // Order Success Handler with direct Firebase Firestore storage
  const handleOrderSuccess = async (orderData: OrderData) => {
    setCompletedOrder(orderData);
    setIsCheckoutOpen(false);
    setCartItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}

    // Persist real order data to Firebase Firestore
    await saveOrderToFirestore(orderData);

    // Immediately reflect in App state so notification badges and admin update in 0ms
    setOrders((prev) => [orderData, ...prev.filter((o) => o.orderId !== orderData.orderId)]);

    // Credit loyalty points to current user if logged in and sync with Firestore
    if (currentUser) {
      const earned = Math.floor(orderData.total / 100);
      const updatedUser: User = {
        ...currentUser,
        loyaltyPoints: (currentUser.loyaltyPoints || 0) + earned,
      };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      } catch {}
      await saveUserToFirestore(updatedUser);
    }
  };

  // Auth Handlers with direct Firebase Firestore storage
  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch {}

    // Save or update user in Firebase Firestore
    await saveUserToFirestore(user);

    if (user.role === 'seller') {
      setIsSellerDashboardOpen(true);
    }
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {}
    await signOutFromFirebase();
  };

  // Seller Product Publishing directly to Firebase Firestore
  const handlePublishSellerProduct = async (newProduct: Product) => {
    setFirestoreProducts((prev) => [newProduct, ...prev.filter((p) => p.id !== newProduct.id)]);
    await saveProductToFirestore(newProduct);
  };

  const handleDeleteSellerProduct = async (productId: string) => {
    setFirestoreProducts((prev) => prev.filter((p) => p.id !== productId));
    await deleteProductFromFirestore(productId);
  };

  const handleUpdateStoreProfile = async (updatedUser: User) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    } catch {}
    await saveUserToFirestore(updatedUser);
  };

  return (
    <div className={`min-h-screen bg-[#0F0F12] text-[#FAF8F5] flex flex-col font-['Tajawal',sans-serif] ${currentLang === 'ar' ? 'rtl' : 'ltr'}`}>
      
      {/* 1. Top Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Sticky Luxury Navbar with Trilingual and Auth Support */}
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWilayaSelector={() => setIsWilayasOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedSubCategory(null);
        }}
        currentLang={currentLang}
        onOpenLanguageSelector={() => setIsLangModalOpen(true)}
        currentUser={currentUser}
        onOpenAuth={(role) => {
          setAuthDefaultRole(role || 'customer');
          setIsAuthModalOpen(true);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenSellerDashboard={() => setIsSellerDashboardOpen(true)}
        onOpenAdminDashboard={handleOpenAdmin}
        onOpenWelcomeGate={() => setIsOnboardingOpen(true)}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        pendingOrdersCount={pendingOrdersCount}
        isAdminAuthenticated={isAdminAuthenticated}
      />

      {/* 3. Hero Visual Banner with Auto-slide */}
      <HeroSlider
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedSubCategory(null);
        }}
      />

      {/* 4. Boutique Ouatine Style Trust Strip */}
      <section className="bg-[#121217] border-y border-[#D4AF37]/25 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            
            <div className="p-3 rounded-xl bg-[#181820]/70 border border-[#D4AF37]/15 flex flex-col items-center justify-center space-y-1">
              <Truck className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#FAF8F5]">
                {currentLang === 'ar' ? 'توصيل 58 ولاية' : currentLang === 'fr' ? 'Livraison 58 Wilayas' : '58 Wilayas Delivery'}
              </h3>
              <p className="text-[11px] text-[#FAF8F5]/60">
                {currentLang === 'ar' ? 'شحن سريع لباب الدار أو المكتب' : currentLang === 'fr' ? 'Livraison à domicile ou Stop Desk' : 'Home and desk delivery'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#181820]/70 border border-[#D4AF37]/15 flex flex-col items-center justify-center space-y-1">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#FAF8F5]">
                {t.cashOnDelivery}
              </h3>
              <p className="text-[11px] text-[#FAF8F5]/60">
                {currentLang === 'ar' ? 'افحص طلبك وتأكد منه قبل السداد' : currentLang === 'fr' ? 'Vérification avant paiement' : 'Inspect before paying'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#181820]/70 border border-[#D4AF37]/15 flex flex-col items-center justify-center space-y-1">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#FAF8F5]">
                {currentLang === 'ar' ? 'تغليف ملكي فاخر' : currentLang === 'fr' ? 'Emballage Royal' : 'Luxury Packaging'}
              </h3>
              <p className="text-[11px] text-[#FAF8F5]/60">
                {currentLang === 'ar' ? 'علب هدايا خاصة تحمل شعار DALOZI' : currentLang === 'fr' ? 'Coffrets cadeaux DALOZI' : 'Branded DALOZI gift boxes'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#181820]/70 border border-[#D4AF37]/15 flex flex-col items-center justify-center space-y-1">
              <Phone className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#FAF8F5]">
                {currentLang === 'ar' ? 'طلب فوري بالواتساب' : currentLang === 'fr' ? 'Commande WhatsApp' : 'WhatsApp Order'}
              </h3>
              <p className="text-[11px] text-[#FAF8F5]/60">
                {currentLang === 'ar' ? 'تأكيد فوري للطلبيات والمقاسات' : currentLang === 'fr' ? 'Confirmation instantanée VIP' : 'Instant VIP confirmation'}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Main Catalog & Products Section */}
      <main id="catalog-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#D4AF37] font-semibold tracking-wider">
              <span>✦</span>
              <span>{t.brandTagline}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-['Cairo',sans-serif] text-gold-gradient">
              {t.allCatalog} ({allCatalogProducts.length})
            </h2>
            <p className="text-xs sm:text-sm text-[#FAF8F5]/70 max-w-xl">
              {currentLang === 'ar'
                ? 'تصفحي تشكيلة أورا الملكية، عبايات هدى حجاب، الحلويات التقليدية، وبوفيهات المناسبات مع خيارات الألوان والمقاسات المتنوعة.'
                : currentLang === 'fr'
                ? 'Découvrez les collections Aura, les abayas de luxe, la haute gastronomie et les créations de nos artisans certifiés.'
                : 'Explore our Aura Collection, luxury abayas, traditional gourmet sweets, and certified artisan boutiques.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentUser?.role === 'seller' && (
              <button
                onClick={() => setIsSellerDashboardOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-gradient text-[#0F0F12] font-black text-xs shadow-md"
              >
                <span>+ {t.publishNewProduct}</span>
              </button>
            )}

            <button
              onClick={() => setIsWilayasOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181820] hover:bg-[#22222E] border border-[#D4AF37]/30 text-xs font-semibold text-[#D4AF37] transition-all"
            >
              <MapPin className="w-4 h-4" />
              <span>{t.wilayaGuide}</span>
            </button>
          </div>
        </div>

        {/* Luxury Nested Tree Taxonomy Navigation */}
        <NestedCategoryNav
          selectedCategory={selectedCategory}
          selectedSubCategory={selectedSubCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSelectedSubCategory(null);
          }}
          onSelectSubCategory={(subId) => setSelectedSubCategory(subId)}
          allProducts={allCatalogProducts}
          currentLang={currentLang}
        />

        {/* Product Cards Grid (2 to 4 columns responsive with Framer Motion fade-in-up) */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {displayedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{
                  duration: 0.4,
                  delay: Math.min(index * 0.05, 0.25),
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="h-full flex flex-col"
              >
                <ProductCard
                  product={product}
                  onAddToCart={(p, color, size) => handleAddToCart(p, color, size)}
                  onQuickView={(p) => setQuickViewProduct(p)}
                  onQuickBuyNow={(p, color, size) => handleQuickBuyNow(p, color, size)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {displayedProducts.length === 0 && (
          <div className="py-16 text-center text-[#FAF8F5]/60 space-y-3">
            <p className="text-base">
              {currentLang === 'ar' ? 'لا توجد منتجات متوفرة حالياً في هذا القسم.' : 'Aucun produit disponible dans cette catégorie.'}
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-4 py-2 bg-gold-gradient text-[#0F0F12] rounded-lg text-xs font-bold"
            >
              {t.allCatalog}
            </button>
          </div>
        )}

      </main>

      {/* 6. Customer Reviews & Social Proof */}
      <ReviewsSection />

      {/* 7. Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenWilayas={() => setIsWilayasOpen(true)}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* ================= MODALS & DRAWERS ================= */}

      {/* 1. Compulsory Dalozi Onboarding Flow (Screen 1: Language -> Screen 2: Guarantees -> Screen 3: Register) */}
      <DaloziOnboardingFlow
        isOpen={isOnboardingOpen}
        currentLang={currentLang}
        onSelectLanguage={(lang) => setCurrentLang(lang)}
        onComplete={(user) => {
          setCurrentUser(user);
          try {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
            localStorage.setItem('dalozi_onboarding_completed', 'true');
          } catch {}
          setIsOnboardingOpen(false);
        }}
      />

      {/* 1b. Admin Passcode Gate Modal */}
      <AdminPasscodeModal
        isOpen={isAdminPasscodeModalOpen}
        currentLang={currentLang}
        onClose={() => setIsAdminPasscodeModalOpen(false)}
        onSuccess={() => {
          setIsAdminAuthenticated(true);
          setIsAdminPasscodeModalOpen(false);
          setIsAdminDashboardOpen(true);
        }}
      />

      {/* 2. Trilingual Language Switcher Modal */}
      <LanguageSelectorModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        currentLang={currentLang}
        onSelectLanguage={(lang) => setCurrentLang(lang)}
      />

      {/* 3. Authentication & Account Registration Modal (Phone, Google, Facebook & Customer / Seller) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentLang={currentLang}
        defaultRole={authDefaultRole}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 4. Seller Boutique Management & Product Publishing Dashboard */}
      <SellerDashboardModal
        isOpen={isSellerDashboardOpen}
        onClose={() => setIsSellerDashboardOpen(false)}
        currentUser={currentUser}
        onUpdateStore={handleUpdateStoreProfile}
        onPublishProduct={handlePublishSellerProduct}
        sellerProducts={allCatalogProducts.filter(
          (p) => p.collection === currentUser?.sellerStore?.storeName || p.id.startsWith('prod-')
        )}
        onDeleteProduct={handleDeleteSellerProduct}
      />

      {/* 5. Customer Profile & Loyalty Points Modal */}
      <CustomerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        currentLang={currentLang}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* 5b. Owner & Admin Dashboard (Connected to Firebase Firestore) */}
      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        products={allCatalogProducts}
        onProductUpdated={handlePublishSellerProduct}
        onProductDeleted={handleDeleteSellerProduct}
        orders={orders}
      />

      {/* 6. Cart Drawer (with Dalozi Loyalty Points Tracker) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOpenCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        appliedPromo={appliedPromo}
        onApplyPromo={handleApplyPromo}
      />

      {/* 7. Product Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(p, color, size, qty) => {
          handleAddToCart(p, color, size, qty);
          setQuickViewProduct(null);
        }}
        onBuyNow={(p, color, size, qty) => {
          handleQuickBuyNow(p, color, size, qty);
          setQuickViewProduct(null);
        }}
      />

      {/* 8. One-Page Checkout / Quick Order Modal (Boutique Ouatine COD) */}
      <QuickOrderModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        appliedPromo={appliedPromo}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* 9. Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => setQuickViewProduct(p)}
      />

      {/* 10. 58 Wilayas Directory Modal */}
      <WilayaDeliveryDirectoryModal
        isOpen={isWilayasOpen}
        onClose={() => setIsWilayasOpen(false)}
      />

      {/* 11. Order Success & Tracking Simulation */}
      <OrderSuccessModal
        orderData={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />

      {/* 12. Dalozi Gemini AI Stylist & Concierge Modal */}
      <DaloziAIChatModal
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        currentLang={currentLang}
        currentUser={currentUser}
      />

      {/* 13. Floating Luxury AI Concierge Trigger (Desktop & Mobile) */}
      <div className="fixed bottom-20 end-3 sm:bottom-6 sm:end-6 z-40">
        <button
          onClick={() => setIsAIChatOpen(true)}
          className="group relative flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-[#14141E] via-[#20182C] to-[#14141E] hover:from-[#261C38] hover:to-[#261C38] border-2 border-[#D4AF37] rounded-full shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(212,175,55,0.65)] hover:scale-105 active:scale-95 transition-all cursor-pointer text-[#FAF8F5]"
          title="مستشار دالوزي الذكي - AI Shopping Concierge"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />
            <span className="absolute -top-0.5 -end-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="flex flex-col text-start">
            <span className="text-xs font-black text-gold-gradient font-['Cairo',sans-serif] leading-tight">
              {currentLang === 'ar' ? 'المستشار الذكي' : 'Styliste IA'}
            </span>
            <span className="text-[10px] text-[#FAF8F5]/60 leading-tight hidden sm:inline">
              Gemini · 58 Wilayas
            </span>
          </div>
        </button>
      </div>

      {/* 14. Mobile Floating Sticky Action Button (WhatsApp Quick Order & Cart Bar) */}
      <div className="sm:hidden fixed bottom-3 inset-x-3 z-40 flex items-center gap-2 p-1.5 bg-[#121217]/95 border border-[#D4AF37]/40 rounded-2xl backdrop-blur-md shadow-2xl">
        <a
          href={`https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent('مرحباً دالوزي ستور، أود الاستفسار وطلب منتجات فاخرة.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2.5 px-3 bg-[#25D366] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow"
        >
          <span>💬 {currentLang === 'ar' ? 'طلب فوري بالواتساب' : 'WhatsApp VIP'}</span>
        </a>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative py-2.5 px-4 bg-gold-gradient text-[#0F0F12] rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t.cart}</span>
          {cartCount > 0 && (
            <span className="w-5 h-5 bg-[#0F0F12] text-[#D4AF37] rounded-full text-[10px] flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </button>
      </div>

    </div>
  );
}
