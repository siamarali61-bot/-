export type CategoryId = 'all' | 'women-fashion' | 'mens-apparel' | 'sweets-bakery' | 'catering-buffet' | 'beauty-cosmetics';

export interface ProductVariantColor {
  name: string;
  nameAr: string;
  hex: string;
}

export interface Product {
  id: string;
  title: string;
  titleAr: string;
  collection?: string;
  category: CategoryId;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  badge?: 'جديد' | 'الأكثر مبيعاً' | 'حصري' | 'الأكثر طلباً' | '100% طبيعي';
  badgeEn?: 'NEW' | 'BEST SELLER' | 'EXCLUSIVE' | 'POPULAR' | 'NATURAL';
  images: string[];
  descriptionAr: string;
  descriptionEn: string;
  sizes?: string[];
  colors?: ProductVariantColor[];
  customerQuote?: {
    text: string;
    author: string;
    city: string;
  };
  features: string[];
  inStock: boolean;
  preparationTime?: string; // For sweets / catering
  instagramHandle?: string; // Instagram username/handle of product creator (e.g., @dalozi.creations)
  instagramPostUrl?: string; // Direct link to original Instagram post or reel
  subCategoryId?: string; // Nested subcategory ID
  season?: 'spring-summer' | 'autumn-winter' | 'all-season';
}

export interface CartItem {
  product: Product;
  selectedColor?: ProductVariantColor;
  selectedSize?: string;
  quantity: number;
}

export interface Wilaya {
  code: number;
  nameAr: string;
  nameFr: string;
  homeDeliveryPrice: number;
  deskDeliveryPrice: number;
  deliveryDays: string;
}

export type OrderStatus = 'confirmed' | 'pending' | 'contacted' | 'shipped' | 'delivered' | 'cancelled';

export type DeliveryCompanyId = 'hhd' | 'ecom' | 'andersen';

export interface DeliveryCompanyConfig {
  id: DeliveryCompanyId;
  name: string;
  nameAr: string;
  apiKey: string;
  partnerCode: string;
  endpointUrl: string;
  active: boolean;
  trackingPrefix: string;
}

export interface DeliverySettings {
  defaultCompany: DeliveryCompanyId;
  companies: {
    hhd: DeliveryCompanyConfig;
    ecom: DeliveryCompanyConfig;
    andersen: DeliveryCompanyConfig;
  };
}

export interface OrderData {
  orderId: string;
  customerName: string;
  phone: string;
  wilaya: Wilaya;
  commune: string;
  address?: string;
  deliveryType: 'home' | 'desk';
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: 'COD';
  status?: OrderStatus;
  statusUpdatedAt?: string;
  deliveryCompany?: string;
  deliveryTrackingNumber?: string;
  deliveryDispatchedAt?: string;
  deliveryApiPayload?: any;
  deliveryApiResponse?: any;
  notes?: string;
  createdAt: string;
}

export type Language = 'ar' | 'fr' | 'en';

export type UserRole = 'customer' | 'seller' | 'admin';

export interface SellerStore {
  id: string;
  storeName: string;
  storeBio: string;
  category: CategoryId;
  wilayaCode: number;
  whatsapp: string;
  phone: string;
  bannerImage?: string;
  rating: number;
  verified: boolean;
  totalSales: number;
}

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: UserRole;
  provider: 'phone' | 'google' | 'facebook';
  avatarUrl?: string;
  loyaltyPoints?: number;
  sellerStore?: SellerStore;
  createdAt: string;
}

