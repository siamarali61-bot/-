import React, { useState } from 'react';
import { X, Store, Plus, Package, Edit, Trash2, CheckCircle2, TrendingUp, Phone, MapPin, Eye } from 'lucide-react';
import { User, Product, CategoryId } from '../types';
import { ALGERIA_WILAYAS } from '../data/wilayas';
import { formatDZD } from '../utils/helpers';

interface SellerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUpdateStore: (updatedUser: User) => void;
  onPublishProduct: (product: Product) => void;
  sellerProducts: Product[];
  onDeleteProduct: (productId: string) => void;
}

export const SellerDashboardModal: React.FC<SellerDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateStore,
  onPublishProduct,
  sellerProducts,
  onDeleteProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'publish' | 'settings'>('products');

  // Store Edit Form State
  const [storeName, setStoreName] = useState(currentUser?.sellerStore?.storeName || '');
  const [storeBio, setStoreBio] = useState(currentUser?.sellerStore?.storeBio || '');
  const [storeCategory, setStoreCategory] = useState<CategoryId>(currentUser?.sellerStore?.category || 'women-fashion');
  const [storeWilaya, setStoreWilaya] = useState<number>(currentUser?.sellerStore?.wilayaCode || 16);
  const [storeWhatsapp, setStoreWhatsapp] = useState(currentUser?.sellerStore?.whatsapp || '');
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // New Product Form State
  const [newTitleAr, setNewTitleAr] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryId>('women-fashion');
  const [newPrice, setNewPrice] = useState<number>(12500);
  const [newOriginalPrice, setNewOriginalPrice] = useState<number>(14500);
  const [newDescAr, setNewDescAr] = useState('');
  const [newSizes, setNewSizes] = useState<string>('S, M, L, XL');
  const [newColors, setNewColors] = useState<string>('أخضر زمردي, بنفسجي ملكي, كحلي');
  const [publishSuccess, setPublishSuccess] = useState(false);

  if (!isOpen || !currentUser || currentUser.role !== 'seller') return null;

  const currentWilaya = ALGERIA_WILAYAS.find((w) => w.code === storeWilaya) || ALGERIA_WILAYAS[15];

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.sellerStore) return;

    const updatedUser: User = {
      ...currentUser,
      sellerStore: {
        ...currentUser.sellerStore,
        storeName: storeName.trim(),
        storeBio: storeBio.trim(),
        category: storeCategory,
        wilayaCode: storeWilaya,
        whatsapp: storeWhatsapp.trim(),
      },
    };

    onUpdateStore(updatedUser);
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 2000);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleAr.trim() || newPrice <= 0) return;

    const parsedSizes = newSizes.split(',').map((s) => s.trim()).filter(Boolean);
    const parsedColors = newColors.split(',').map((c) => ({
      name: c.trim(),
      nameAr: c.trim(),
      hex: '#D4AF37',
    }));

    // Choose default high-res sample image based on category
    const sampleImages: Record<CategoryId, string> = {
      'women-fashion': sellerProducts[0]?.images[0] || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
      'mens-apparel': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
      'sweets-bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      'catering-buffet': 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
      'beauty-cosmetics': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'all': 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    };

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      title: newTitleEn.trim() || newTitleAr.trim(),
      titleAr: newTitleAr.trim(),
      collection: currentUser.sellerStore?.storeName || 'بوتيك معتمد',
      category: newCategory,
      price: Number(newPrice),
      originalPrice: Number(newOriginalPrice) || undefined,
      rating: 5.0,
      reviewsCount: 1,
      badge: 'جديد',
      badgeEn: 'NEW',
      images: [sampleImages[newCategory] || sampleImages['women-fashion']],
      descriptionAr: newDescAr.trim() || 'منتج فاخر عالي الجودة متوفر حصرياً عبر متجر دالوزي مع الدفع عند الاستلام.',
      descriptionEn: 'Exclusive handcrafted luxury piece delivered with 58 Wilayas cash on delivery guarantee.',
      sizes: parsedSizes.length > 0 ? parsedSizes : ['S', 'M', 'L'],
      colors: parsedColors.length > 0 ? parsedColors : undefined,
      features: [
        'منتج أصلي معتمد من الحرفي مباشرة',
        'توصيل لـ 58 ولاية والدفع بعد المعاينة',
        'تغليف فاخر مجاني خاص بالهدايا'
      ],
      inStock: true,
    };

    onPublishProduct(newProduct);
    setPublishSuccess(true);
    setNewTitleAr('');
    setNewTitleEn('');
    setNewDescAr('');

    setTimeout(() => {
      setPublishSuccess(false);
      setActiveTab('products');
    }, 1500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="seller-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-[#181820] border border-[#D4AF37]/40 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl my-6 text-[#FAF8F5] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#D4AF37]/25 bg-[#121217] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-gradient text-[#0F0F12] flex items-center justify-center font-black">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="seller-modal-title" className="text-base sm:text-xl font-bold font-['Cairo',sans-serif] text-gold-gradient">
                  {currentUser.sellerStore?.storeName || 'لوحة تحكم البائع'}
                </h2>
                <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>بائع موثق 🇩🇿</span>
                </span>
              </div>
              <p className="text-xs text-[#FAF8F5]/60 mt-0.5">
                ولاية {currentWilaya.nameAr} · تغطية لجميع الـ 58 ولاية جزائرية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#1F1F2A] hover:bg-[#D4AF37] text-[#FAF8F5] hover:text-[#0F0F12] flex items-center justify-center transition-colors"
            aria-label="إغلاق لوحة التحكم"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center border-b border-white/10 bg-[#14141C] px-6 shrink-0">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'products'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-[#FAF8F5]/60 hover:text-[#FAF8F5]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>منتجاتي المعروضة ({sellerProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('publish')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'publish'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-[#FAF8F5]/60 hover:text-[#FAF8F5]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>نشر منتج جديد ✦</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-[#FAF8F5]/60 hover:text-[#FAF8F5]'
            }`}
          >
            <Edit className="w-4 h-4" />
            <span>تعديل بيانات المتجر</span>
          </button>
        </div>

        {/* Tab 1: Products List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {activeTab === 'products' && (
            <div className="space-y-4">
              
              {/* Stats overview */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#121217] p-3.5 rounded-xl border border-white/10 text-center">
                  <span className="block text-xl font-bold text-gold-gradient">{sellerProducts.length}</span>
                  <span className="text-[11px] text-[#FAF8F5]/60">إجمالي المنتجات</span>
                </div>
                <div className="bg-[#121217] p-3.5 rounded-xl border border-white/10 text-center">
                  <span className="block text-xl font-bold text-emerald-400">100%</span>
                  <span className="text-[11px] text-[#FAF8F5]/60">نسبة التوفر</span>
                </div>
                <div className="bg-[#121217] p-3.5 rounded-xl border border-white/10 text-center">
                  <span className="block text-xl font-bold text-[#D4AF37]">5.0 ★</span>
                  <span className="text-[11px] text-[#FAF8F5]/60">تقييم المتجر</span>
                </div>
              </div>

              {/* Products Table / Cards */}
              <div className="flex items-center justify-between pt-2">
                <h3 className="text-sm font-bold text-[#FAF8F5]">المعروضات الحية في المتجر:</h3>
                <button
                  onClick={() => setActiveTab('publish')}
                  className="px-3 py-1.5 rounded-lg bg-gold-gradient text-[#0F0F12] font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة منتج جديد</span>
                </button>
              </div>

              {sellerProducts.length === 0 ? (
                <div className="py-12 text-center text-[#FAF8F5]/50 space-y-3 bg-[#121217] rounded-2xl border border-dashed border-white/10 p-6">
                  <Package className="w-10 h-10 mx-auto text-[#D4AF37]/30" />
                  <p className="text-sm font-medium">لم تنشر أي منتجات في متجرك بعد.</p>
                  <p className="text-xs">اضغط على زر "نشر منتج جديد" لإضافة أول قندورة، عباية أو حلوى فاخرة إلى كتالوج دالوزي!</p>
                  <button
                    onClick={() => setActiveTab('publish')}
                    className="px-4 py-2 bg-gold-gradient text-[#0F0F12] rounded-xl text-xs font-bold shadow-md"
                  >
                    ابدأ النشر الآن
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sellerProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-[#121217] p-3 rounded-2xl border border-[#D4AF37]/20 flex gap-3 relative group"
                    >
                      <img
                        src={prod.images[0]}
                        alt={prod.titleAr}
                        className="w-16 h-20 rounded-xl object-cover bg-[#181820] shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-[#D4AF37] font-semibold">
                            {prod.collection || 'متجر معتمد'}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-[#FAF8F5] line-clamp-1">
                            {prod.titleAr}
                          </h4>
                          <span className="text-xs font-bold text-gold-gradient block mt-1">
                            {formatDZD(prod.price)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <span className="text-[10px] text-emerald-400">متوفر في المتجر ✓</span>
                          <button
                            onClick={() => onDeleteProduct(prod.id)}
                            className="p-1 text-[#FAF8F5]/40 hover:text-red-400 transition-colors"
                            title="حذف المنتج"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* Tab 2: Publish New Product */}
          {activeTab === 'publish' && (
            <form onSubmit={handlePublish} className="space-y-4 max-w-2xl mx-auto">
              {publishSuccess && (
                <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>تم نشر منتجك الفاخر بنجاح! يظهر الآن مباشرة لجميع زبائن المتجر في الـ 58 ولاية.</span>
                </div>
              )}

              <div className="space-y-1">
                <h3 className="text-base font-bold text-gold-gradient font-['Cairo',sans-serif]">
                  نشر قطعة جديدة في الكتالوج الملكي
                </h3>
                <p className="text-xs text-[#FAF8F5]/60">
                  املأ تفاصيل المنتج، وسيتم إدراجه فوراً مع دعم الدفع عند الاستلام والتوصيل السريع.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                    اسم المنتج بالعربية <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitleAr}
                    onChange={(e) => setNewTitleAr(e.target.value)}
                    placeholder="مثال: قندورة قطيفة قسنطينية بالطرز الذهبي"
                    className="w-full bg-[#121217] border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                    اسم المنتج بالإنجليزية أو اللاتينية
                  </label>
                  <input
                    type="text"
                    value={newTitleEn}
                    onChange={(e) => setNewTitleEn(e.target.value)}
                    placeholder="Ex: Royal Velvet Embroidered Dress"
                    className="w-full bg-[#121217] border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                    القسم
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CategoryId)}
                    className="w-full bg-[#121217] border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#FAF8F5] focus:outline-none"
                  >
                    <option value="women-fashion">أزياء نسائية وقندورات</option>
                    <option value="mens-apparel">أزياء رجالية</option>
                    <option value="sweets-bakery">حلويات ومخبوزات</option>
                    <option value="catering-buffet">مملحات وبوفيهات</option>
                    <option value="beauty-cosmetics">عناية وتجميل</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                    السعر بالدينار (د.ج) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    step="100"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-[#121217] border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                    السعر الأصلي قبل الخصم (اختياري)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={newOriginalPrice}
                    onChange={(e) => setNewOriginalPrice(Number(e.target.value))}
                    className="w-full bg-[#121217] border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#FAF8F5] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                    المقاسات المتوفرة (مفصولة بفاصلة)
                  </label>
                  <input
                    type="text"
                    value={newSizes}
                    onChange={(e) => setNewSizes(e.target.value)}
                    placeholder="S, M, L, XL, XXL"
                    className="w-full bg-[#121217] border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#FAF8F5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                    الألوان المتوفرة (مفصولة بفاصلة)
                  </label>
                  <input
                    type="text"
                    value={newColors}
                    onChange={(e) => setNewColors(e.target.value)}
                    placeholder="بنفسجي, أسود, أخضر زمردي"
                    className="w-full bg-[#121217] border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#FAF8F5] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                  الوصف والمواصفات
                </label>
                <textarea
                  rows={3}
                  value={newDescAr}
                  onChange={(e) => setNewDescAr(e.target.value)}
                  placeholder="نوع القماش، تفاصيل الطرز، أو مكونات الحلويات والمملحات..."
                  className="w-full bg-[#121217] border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gold-gradient text-[#0F0F12] font-black text-sm shadow-md hover:opacity-95 transition-all cursor-pointer"
              >
                نشر المنتج فوراً في المتجر ✦
              </button>
            </form>
          )}

          {/* Tab 3: Store Settings */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveStoreSettings} className="space-y-4 max-w-2xl mx-auto">
              {settingsSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>تم حفظ وتحديث بيانات متجرك بنجاح!</span>
                </div>
              )}

              <div className="space-y-1">
                <h3 className="text-base font-bold text-gold-gradient font-['Cairo',sans-serif]">
                  تعديل معلومات وهوية المتجر
                </h3>
                <p className="text-xs text-[#FAF8F5]/60">
                  يمكنك تعديل اسم البوتيك، النبذة ورقم الواتساب لتلقي طلبات واستفسارات الزبائن.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                  اسم المتجر / العلامة التجارية
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-[#121217] border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                    ولاية مقر المتجر
                  </label>
                  <select
                    value={storeWilaya}
                    onChange={(e) => setStoreWilaya(Number(e.target.value))}
                    className="w-full bg-[#121217] border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#FAF8F5] focus:outline-none"
                  >
                    {ALGERIA_WILAYAS.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} - {w.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                    رقم الواتساب الخاص بالمتجر
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={storeWhatsapp}
                    onChange={(e) => setStoreWhatsapp(e.target.value)}
                    placeholder="213672330936"
                    className="w-full bg-[#121217] border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#FAF8F5] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#FAF8F5]/80 mb-1">
                  نبذة عن المتجر والحرفية
                </label>
                <textarea
                  rows={3}
                  value={storeBio}
                  onChange={(e) => setStoreBio(e.target.value)}
                  className="w-full bg-[#121217] border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gold-gradient text-[#0F0F12] font-black text-xs sm:text-sm shadow-md hover:opacity-95 transition-all cursor-pointer"
              >
                حفظ التعديلات
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
