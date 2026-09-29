import { Language } from '../types';

export interface Translations {
  appName: string;
  brandTagline: string;
  // Navigation
  home: string;
  womenFashion: string;
  mensApparel: string;
  sweetsBakery: string;
  cateringBuffet: string;
  beautyCosmetics: string;
  allCatalog: string;
  wilayaGuide: string;
  cart: string;
  searchPlaceholder: string;
  // Auth & Roles
  signIn: string;
  signOut: string;
  myAccount: string;
  sellerDashboard: string;
  openStore: string;
  customerAccount: string;
  sellerAccount: string;
  customerDesc: string;
  sellerDesc: string;
  loginWithPhone: string;
  loginWithGoogle: string;
  loginWithFacebook: string;
  phoneNumber: string;
  fullName: string;
  storeName: string;
  storeBio: string;
  wilaya: string;
  // Trust & Welcome
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeTrust1Title: string;
  welcomeTrust1Desc: string;
  welcomeTrust2Title: string;
  welcomeTrust2Desc: string;
  welcomeTrust3Title: string;
  welcomeTrust3Desc: string;
  enterStore: string;
  joinAsSeller: string;
  chooseLanguage: string;
  // COD & Delivery
  delivery58Wilayas: string;
  cashOnDelivery: string;
  freeShippingOver30k: string;
  // Seller Dashboard
  manageStore: string;
  publishNewProduct: string;
  myProducts: string;
  storeSettings: string;
  salesStats: string;
  productTitle: string;
  productPrice: string;
  productCategory: string;
  productStock: string;
  saveChanges: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  ar: {
    appName: "متجر دالوزي الفاخر",
    brandTagline: "الفخامة والأصالة الجزائرية · توصيل لـ 58 ولاية",
    home: "الرئيسية",
    womenFashion: "أزياء نسائية وقندورات",
    mensApparel: "أزياء رجالية راقية",
    sweetsBakery: "حلويات وكيك فاخر",
    cateringBuffet: "مملحات وبوفيهات",
    beautyCosmetics: "العناية والتجميل",
    allCatalog: "جميع المعروضات",
    wilayaGuide: "دليل 58 ولاية",
    cart: "السلة",
    searchPlaceholder: "بحث في المعروضات الفاخرة...",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    myAccount: "حسابي الشخصي",
    sellerDashboard: "لوحة تحكم البائع",
    openStore: "افتح متجرك الآن",
    customerAccount: "حساب زبون (مشتري)",
    sellerAccount: "حساب تاجر وبائع معتمد",
    customerDesc: "شراء وتتبع الطلبيات، جمع نقاط الولاء، والدفع عند الاستلام بعد المعاينة",
    sellerDesc: "افتتاح بوتيك رقمي، تعديل الهوية، نشر المنتجات والوصول لزبائن 58 ولاية",
    loginWithPhone: "تسجيل برقم الهاتف الجزائري",
    loginWithGoogle: "متابعة عبر حساب Google",
    loginWithFacebook: "متابعة عبر فيسبوك",
    phoneNumber: "رقم الهاتف (05 / 06 / 07)",
    fullName: "الاسم واللقب",
    storeName: "اسم المتجر أو العلامة",
    storeBio: "نبذة عن المتجر وتخصصك",
    wilaya: "الولاية",
    welcomeTitle: "أهلاً بكم في متجر دالوزي الفاخر",
    welcomeSubtitle: "الوجهة الأولى للأصالة الحرفية الجزائرية، القندورة الملكية، الحلويات الراقية والبوفيهات",
    welcomeTrust1Title: "حرفية جزائرية 100% موثقة",
    welcomeTrust1Desc: "أقمشة قطيفة كورية أصلية، خيوط الذهب، وطهاة حلويات محترفون",
    welcomeTrust2Title: "الدفع عند الاستلام مع المعاينة",
    welcomeTrust2Desc: "افحص طلبيتك ومقاسك وجودتها قبل تسليم أي دينار للمندوب",
    welcomeTrust3Title: "حماية تامة للمشتري والبائع",
    welcomeTrust3Desc: "شحن سريع لـ 58 ولاية مع ضمان استبدال مجاني في حال أي عيب",
    enterStore: "الدخول إلى المتجر الفاخر",
    joinAsSeller: "انضم إلينا كبائع أو شريك حرفي",
    chooseLanguage: "اختر لغتك المفضلة / Choisir la langue / Select language",
    delivery58Wilayas: "توصيل سريع ومضمون لجميع 58 ولاية 🇩🇿",
    cashOnDelivery: "الدفع نقداً عند الاستلام (COD)",
    freeShippingOver30k: "توصيل مجاني للطلبات فوق 30,000 د.ج",
    manageStore: "إدارة المتجر والمنتجات",
    publishNewProduct: "نشر منتج جديد في المتجر",
    myProducts: "منتجاتي المعروضة",
    storeSettings: "إعدادات المتجر ومعلومات التواصل",
    salesStats: "إحصائيات المبيعات",
    productTitle: "عنوان المنتج",
    productPrice: "السعر بالدينار الجزائري (د.ج)",
    productCategory: "القسم / الصنف",
    productStock: "الكمية المتوفرة",
    saveChanges: "حفظ التعديلات",
  },
  fr: {
    appName: "Dalozi Store Luxe",
    brandTagline: "Haute Couture & Gastronomie Algérienne · 58 Wilayas",
    home: "Accueil",
    womenFashion: "Mode Femme & Gandouras",
    mensApparel: "Mode Homme Élégante",
    sweetsBakery: "Pâtisserie & Gâteaux de Fête",
    cateringBuffet: "Salés & Buffets d'Événements",
    beautyCosmetics: "Soins & Beauté HM Dalozi",
    allCatalog: "Tout le Catalogue",
    wilayaGuide: "Guide 58 Wilayas",
    cart: "Panier",
    searchPlaceholder: "Rechercher un produit d'exception...",
    signIn: "Connexion / Inscription",
    signOut: "Déconnexion",
    myAccount: "Mon Compte",
    sellerDashboard: "Espace Vendeur",
    openStore: "Ouvrir ma Boutique",
    customerAccount: "Compte Client (Acheteur)",
    sellerAccount: "Compte Vendeur & Artisan Certifié",
    customerDesc: "Commandez avec paiement à la livraison après vérification, cumulez des points de fidélité",
    sellerDesc: "Créez votre boutique de luxe, personnalisez votre profil et publiez vos créations pour 58 Wilayas",
    loginWithPhone: "Connexion par Téléphone Algérien",
    loginWithGoogle: "Continuer avec Google",
    loginWithFacebook: "Continuer avec Facebook",
    phoneNumber: "Numéro de téléphone (05 / 06 / 07)",
    fullName: "Nom et Prénom",
    storeName: "Nom de votre Boutique",
    storeBio: "Description et spécialité de l'atelier",
    wilaya: "Wilaya",
    welcomeTitle: "Bienvenue chez Dalozi Store",
    welcomeSubtitle: "L'excellence de la haute couture, des gandouras de velours brodées et de la pâtisserie fine algérienne",
    welcomeTrust1Title: "Artisanat d'Exception 100% Authentique",
    welcomeTrust1Desc: "Broderies artisanales au fil d'or (Tarz Majboud), velours royal et ingrédients nobles",
    welcomeTrust2Title: "Paiement à la Livraison avec Vérification",
    welcomeTrust2Desc: "Ouvrez et vérifiez votre colis avant tout paiement au livreur",
    welcomeTrust3Title: "Protection Acheteurs & Vendeurs",
    welcomeTrust3Desc: "Réseau logistique couvrant 58 Wilayas avec garantie d'échange rapide",
    enterStore: "Entrer dans la Boutique de Luxe",
    joinAsSeller: "Rejoindre en tant que Vendeur Partenaire",
    chooseLanguage: "Choisissez votre langue / Select your language",
    delivery58Wilayas: "Livraison rapide et sécurisée dans les 58 Wilayas 🇩🇿",
    cashOnDelivery: "Paiement à la réception (Cash on Delivery)",
    freeShippingOver30k: "Livraison gratuite dès 30.000 DA d'achats",
    manageStore: "Gérer ma Boutique & Produits",
    publishNewProduct: "Publier un Nouveau Produit",
    myProducts: "Mes Produits en Ligne",
    storeSettings: "Paramètres de la Boutique",
    salesStats: "Statistiques des Ventes",
    productTitle: "Titre du Produit",
    productPrice: "Prix en Dinars Algériens (DA)",
    productCategory: "Catégorie",
    productStock: "Quantité en Stock",
    saveChanges: "Enregistrer les Modifications",
  },
  en: {
    appName: "Dalozi Luxury Store",
    brandTagline: "Algerian Luxury Haute Couture & Gourmet · 58 Wilayas",
    home: "Home",
    womenFashion: "Women's Fashion & Abayas",
    mensApparel: "Men's Tailored Apparel",
    sweetsBakery: "Pastries & Event Cakes",
    cateringBuffet: "Savory Party Buffets",
    beautyCosmetics: "Beauty & Skincare",
    allCatalog: "All Collections",
    wilayaGuide: "58 Wilayas Guide",
    cart: "Shopping Bag",
    searchPlaceholder: "Search luxury collections...",
    signIn: "Sign In / Register",
    signOut: "Sign Out",
    myAccount: "My Account",
    sellerDashboard: "Seller Dashboard",
    openStore: "Open Your Boutique",
    customerAccount: "Customer Account (Buyer)",
    sellerAccount: "Verified Merchant & Artisan",
    customerDesc: "Shop authentic luxury with Cash on Delivery and inspection upon arrival",
    sellerDesc: "Launch your luxury boutique, publish products and reach clients across all 58 Wilayas",
    loginWithPhone: "Sign In with Algerian Phone",
    loginWithGoogle: "Continue with Google",
    loginWithFacebook: "Continue with Facebook",
    phoneNumber: "Phone Number (05 / 06 / 07)",
    fullName: "Full Name",
    storeName: "Boutique / Brand Name",
    storeBio: "About your boutique and craft",
    wilaya: "Wilaya",
    welcomeTitle: "Welcome to Dalozi Luxury Store",
    welcomeSubtitle: "The premier destination for authentic Algerian heritage, royal velvet Qandouras, and gourmet celebrations",
    welcomeTrust1Title: "100% Authentic Handcrafted Heritage",
    welcomeTrust1Desc: "Heavy pure gold bullion embroidery (Tarz Majboud), royal velvet, and master pâtisserie",
    welcomeTrust2Title: "Cash on Delivery with Inspection",
    welcomeTrust2Desc: "Inspect your items and verify fit before paying the courier at your doorstep",
    welcomeTrust3Title: "Complete Buyer & Seller Protection",
    welcomeTrust3Desc: "Fast logistics across all 58 Algerian Wilayas with verified guarantee",
    enterStore: "Enter the Luxury Boutique",
    joinAsSeller: "Join as an Artisan / Seller Partner",
    chooseLanguage: "Select Language / اختر لغتك",
    delivery58Wilayas: "Fast & reliable delivery to all 58 Wilayas 🇩🇿",
    cashOnDelivery: "Cash on Delivery (COD) Guaranteed",
    freeShippingOver30k: "Free Shipping on orders above 30,000 DA",
    manageStore: "Manage Boutique & Catalog",
    publishNewProduct: "Publish New Luxury Product",
    myProducts: "My Active Products",
    storeSettings: "Boutique Settings & Contacts",
    salesStats: "Sales & Performance",
    productTitle: "Product Title",
    productPrice: "Price in Algerian Dinars (DZD)",
    productCategory: "Category",
    productStock: "Units in Stock",
    saveChanges: "Save Changes",
  }
};
