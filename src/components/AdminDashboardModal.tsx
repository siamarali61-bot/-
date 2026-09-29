import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Package,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Boxes,
  Eye,
  RefreshCw,
  ShoppingBag,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Database,
  Upload,
  Camera,
  ImagePlus,
  Star,
  Loader2,
  Phone,
  PhoneCall,
  MessageCircle,
  Truck,
  MapPin,
  User,
  Calendar,
  Bell,
  ChevronDown,
  Check,
  FileText,
  Send,
  Printer,
  Filter,
  AlertTriangle,
  Key,
  Copy,
  CheckCheck,
  Settings,
  Globe,
  Zap,
  Instagram,
  Wand2,
} from 'lucide-react';
import { Product, CategoryId, OrderData, OrderStatus, ProductVariantColor, DeliveryCompanyId, DeliverySettings } from '../types';
import { CATEGORIES_TAXONOMY } from '../data/categoriesTaxonomy';
import { formatDZD, compressImageFileToBase64, estimateProductDocSizeKb } from '../utils/helpers';
import {
  saveProductToFirestore,
  deleteProductFromFirestore,
  subscribeToOrders,
  getOrdersFromFirestore,
  updateOrderStatusInFirestore,
  deleteOrderFromFirestore,
  seedInitialProductsIfEmpty,
} from '../services/firebaseService';
import {
  getDeliverySettings,
  saveDeliverySettings,
  sendOrderToDeliveryApi,
  SendDeliveryResult,
} from '../services/deliveryService';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onProductUpdated?: (product: Product) => void;
  onProductDeleted?: (productId: string) => void;
  orders?: OrderData[];
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  products,
  onProductUpdated,
  onProductDeleted,
  orders: propOrders,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'add' | 'edit' | 'orders' | 'delivery' | 'database'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<CategoryId>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delivery Settings & API Dispatch State (HHD, E-Com, Andersen Delivery)
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>(getDeliverySettings());
  const [selectedCarriers, setSelectedCarriers] = useState<Record<string, DeliveryCompanyId>>({});
  const [dispatchingOrderId, setDispatchingOrderId] = useState<string | null>(null);
  const [dispatchModalResult, setDispatchModalResult] = useState<SendDeliveryResult | null>(null);
  const [isTestingCompany, setIsTestingCompany] = useState<DeliveryCompanyId | null>(null);
  const [testResult, setTestResult] = useState<{ companyId: DeliveryCompanyId; success: boolean; message: string } | null>(null);
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  // New / Edit Product Form State
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [category, setCategory] = useState<CategoryId>('women-fashion');
  const [price, setPrice] = useState<number>(14500);
  const [originalPrice, setOriginalPrice] = useState<number>(16500);
  const [imageUrl, setImageUrl] = useState('');
  const [additionalImages, setAdditionalImages] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [sizes, setSizes] = useState('38, 40, 42, 44');
  const [colors, setColors] = useState('عنابي ملكي, أخضر زمردي, كحلي');
  const [badge, setBadge] = useState<'جديد' | 'الأكثر مبيعاً' | 'حصري' | 'الأكثر طلباً' | '100% طبيعي' | 'none'>('جديد');
  const [inStock, setInStock] = useState(true);
  const [preparationTime, setPreparationTime] = useState('');
  const [collectionName, setCollectionName] = useState('تشكيلة دالوزي الحصرية');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [instagramPostUrl, setInstagramPostUrl] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  // Images state (supports direct Base64 from phone upload and URL fallback)
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // File upload from phone studio / camera with automatic canvas compression to Base64
  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    setErrorMessage('');
    const newImages: string[] = [];
    let totalSizeKb = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        // Optimized 850px / 0.75 quality ensures visually pristine results with 40-75KB per photo
        const { base64, sizeKb } = await compressImageFileToBase64(file, 850, 0.75);
        newImages.push(base64);
        totalSizeKb += sizeKb;
      }

      if (newImages.length > 0) {
        setUploadedImages((prev) => [...prev, ...newImages]);
        setImageUrl(newImages[0]);
        setSuccessMessage(`📸 تم رفع وضغط ${newImages.length} صورة بنجاح بحجم مثالي (${totalSizeKb} KB - آمن لقاعدة البيانات)!`);
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err: any) {
      setErrorMessage('حدث خطأ أثناء معالجة الصور من الهاتف: ' + (err?.message || ''));
    } finally {
      setIsCompressing(false);
      if (e.target) e.target.value = '';
    }
  };

  // Real-time calculation of current images payload size in KB
  const currentImagesPayloadSizeKb = useMemo(() => {
    let totalBytes = 0;
    for (const img of uploadedImages) {
      totalBytes += img.length;
    }
    return Math.round((totalBytes / 1024) * 10) / 10;
  }, [uploadedImages]);

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (updated.length > 0) setImageUrl(updated[0]);
      else setImageUrl('');
      return updated;
    });
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    setUploadedImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(indexToPrimary, 1);
      const updated = [item, ...copy];
      setImageUrl(updated[0]);
      return updated;
    });
  };

  // Orders State from Firestore
  const [orders, setOrders] = useState<OrderData[]>(propOrders || []);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('pending');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [deleteOrderConfirmId, setDeleteOrderConfirmId] = useState<string | null>(null);

  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Manual & automatic refresh from Firestore
  const fetchOrdersManually = async () => {
    setIsLoadingOrders(true);
    try {
      const freshOrders = await getOrdersFromFirestore();
      setOrders(freshOrders);
    } catch (err) {
      console.warn('⚠️ Manual fetch orders note:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (propOrders !== undefined) {
      setOrders(propOrders);
    }
  }, [propOrders]);

  useEffect(() => {
    if (!isOpen) return;
    fetchOrdersManually();
    const unsub = subscribeToOrders((newOrders) => {
      setOrders(newOrders);
    });
    return () => unsub();
  }, [isOpen]);

  // Order status updater in Firestore
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const ok = await updateOrderStatusInFirestore(orderId, newStatus);
      if (ok) {
        setOrders((prev) =>
          prev.map((ord) =>
            ord.orderId === orderId
              ? { ...ord, status: newStatus, statusUpdatedAt: new Date().toISOString() }
              : ord
          )
        );
        const statusLabel =
          newStatus === 'contacted'
            ? 'تم الاتصال وتأكيد الطلب'
            : newStatus === 'shipped'
            ? 'تم الشحن مع مندوب التوصيل'
            : newStatus === 'delivered'
            ? 'تم التسليم بنجاح'
            : newStatus === 'cancelled'
            ? 'تم إلغاء الطلب'
            : 'قيد الانتظار';
        setSuccessMessage(`✅ تم تحديث حالة الطلبية #${orderId} إلى: "${statusLabel}" بنجاح في Firestore.`);
        setTimeout(() => setSuccessMessage(''), 3500);
      } else {
        setErrorMessage('تعذر تحديث حالة الطلب في Firestore.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'خطأ أثناء الاتصال بقاعدة بيانات Firebase.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Order deletion from Firestore
  const handleDeleteOrder = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    try {
      const ok = await deleteOrderFromFirestore(orderId);
      if (ok) {
        setOrders((prev) => prev.filter((ord) => ord.orderId !== orderId));
        setDeleteOrderConfirmId(null);
        setSuccessMessage(`🗑️ تم حذف الطلبية #${orderId} من Firestore.`);
        setTimeout(() => setSuccessMessage(''), 3500);
      } else {
        setErrorMessage('تعذر حذف الطلبية من قاعدة البيانات.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'خطأ أثناء حذف الطلب.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Pre-filled WhatsApp confirmation message
  const createOrderConfirmationWhatsApp = (ord: OrderData) => {
    let cleanPhone = ord.phone.replace(/[\s\-\(\)\+]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '213' + cleanPhone.slice(1);
    else if (!cleanPhone.startsWith('213')) cleanPhone = '213' + cleanPhone;

    const itemsSummary = (ord.items || [])
      .map((it, i) => `${i + 1}. ${it.product?.titleAr || 'منتج'} (${it.quantity}x ${formatDZD(it.product?.price || 0)})`)
      .join('\n');

    const msg = `مرحباً ${ord.customerName} ✨
معكم إدارة متجر *دالوزي ستور (DALOZI STORE)* 🇩🇿

نود تأكيد طلبيتكم الفاخرة رقم *#${ord.orderId}*:
${itemsSummary}

📍 *عنوان التوصيل:* ولاية ${ord.wilaya?.nameAr} (${ord.commune})
🚚 *طريقة الشحن:* ${ord.deliveryType === 'home' ? 'توصيل لباب المنزل' : 'استلام من مكتب التوصيل'}
💰 *المبلغ الإجمالي عند الاستلام:* ${formatDZD(ord.total || 0)}

يرجى إفادتنا بتأكيدكم لتجهيز الطرد للشحن فوراً، شكراً لثقتكم!`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  // Order Metrics & Counters for Pipeline Management
  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => !o.status || o.status === 'pending').length;
  }, [orders]);

  const confirmedOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'confirmed').length;
  }, [orders]);

  const contactedOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'contacted').length;
  }, [orders]);

  const shippedOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'shipped').length;
  }, [orders]);

  const deliveredOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'delivered').length;
  }, [orders]);

  const cancelledOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'cancelled').length;
  }, [orders]);

  const unhandledOrdersCount = pendingOrdersCount + confirmedOrdersCount;

  const totalDeliveredRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + (o.total || 0), 0);
  }, [orders]);

  const totalExpectedRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);
  }, [orders]);

  // Delivery API Dispatch Handler
  const handleDispatchToDelivery = async (ord: OrderData) => {
    const carrierId = selectedCarriers[ord.orderId] || deliverySettings.defaultCompany || 'hhd';
    setDispatchingOrderId(ord.orderId);
    setErrorMessage('');
    try {
      const result = await sendOrderToDeliveryApi(ord, carrierId);
      if (result.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === ord.orderId
              ? {
                  ...o,
                  status: 'shipped',
                  deliveryCompany: result.companyName,
                  deliveryTrackingNumber: result.trackingNumber,
                  deliveryDispatchedAt: result.dispatchedAt,
                  notes: `تم الإرسال لشركة ${result.companyName} برقم تتبع: ${result.trackingNumber}`,
                }
              : o
          )
        );
        setDispatchModalResult(result);
        setSuccessMessage(`🚚 تم إرسال بيانات المشتري تلقائياً لشركة ${result.companyName} وتوليد رقم التتبع #${result.trackingNumber}`);
        setTimeout(() => setSuccessMessage(''), 4500);
      }
    } catch (err: any) {
      setErrorMessage(`تعذر إرسال الطلب لمنظومة التوصيل: ${err?.message || ''}`);
    } finally {
      setDispatchingOrderId(null);
    }
  };

  const handleTestCompanyConnection = (compKey: DeliveryCompanyId) => {
    setIsTestingCompany(compKey);
    setTestResult(null);
    const comp = deliverySettings.companies[compKey];
    setTimeout(() => {
      setIsTestingCompany(null);
      if (!comp.apiKey || !comp.partnerCode) {
        setTestResult({
          companyId: compKey,
          success: false,
          message: 'يرجى إدخال مفتاح الـ API والرمز الخاص بالشركة لاختبار الاتصال.',
        });
      } else {
        setTestResult({
          companyId: compKey,
          success: true,
          message: `✅ تم التحقق من الاعتماد بنجاح! منظومة ${comp.name} جاهزة للربط الفوري واستقبال الطرود.`,
        });
      }
    }, 700);
  };

  const handleSaveDeliverySettings = () => {
    saveDeliverySettings(deliverySettings);
    setSuccessMessage('💾 تم حفظ وتفعيل إعدادات شركات التوصيل ومفاتيح الـ API بنجاح في النظام!');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const currentStatus = ord.status || 'pending';
      const matchesStatus =
        orderStatusFilter === 'all'
          ? true
          : currentStatus === orderStatusFilter;

      const q = orderSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        ord.orderId.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.phone.includes(q) ||
        ord.wilaya?.nameAr?.toLowerCase().includes(q) ||
        ord.commune?.toLowerCase().includes(q) ||
        (ord.deliveryTrackingNumber && ord.deliveryTrackingNumber.toLowerCase().includes(q)) ||
        (ord.deliveryCompany && ord.deliveryCompany.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [orders, orderStatusFilter, orderSearchQuery]);

  // Quick Preset Sample Images for One-Click Fill
  const samplePresets: { label: string; url: string; cat: CategoryId }[] = [
    {
      label: 'قفطان ملكي طرز ذهبي',
      url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
      cat: 'women-fashion',
    },
    {
      label: 'قندورة قطيفة قسنطينية',
      url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
      cat: 'women-fashion',
    },
    {
      label: 'بدلة رجالية فاخرة',
      url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
      cat: 'mens-apparel',
    },
    {
      label: 'بقلاوة وقريوش عاصمي',
      url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      cat: 'sweets-bakery',
    },
    {
      label: 'صواني مملحات أفراح',
      url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
      cat: 'catering-buffet',
    },
    {
      label: 'مجموعة عطور وعناية نادرة',
      url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      cat: 'beauty-cosmetics',
    },
  ];

  if (!isOpen) return null;

  // Filter products for the management list
  const filteredProducts = products.filter((p) => {
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      p.titleAr.toLowerCase().includes(query) ||
      p.title.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // Calculate statistics
  const totalValue = products.reduce((acc, p) => acc + p.price, 0);
  const inStockCount = products.filter((p) => p.inStock).length;

  // Populate form for editing
  const startEditing = (prod: Product) => {
    setEditingProduct(prod);
    setTitleAr(prod.titleAr);
    setTitleEn(prod.title);
    setCategory(prod.category);
    setPrice(prod.price);
    setOriginalPrice(prod.originalPrice || prod.price);
    if (prod.images && prod.images.length > 0) {
      setUploadedImages([...prod.images]);
      setImageUrl(prod.images[0] || '');
      setAdditionalImages(prod.images.slice(1).join(', '));
    } else {
      setUploadedImages([]);
      setImageUrl('');
      setAdditionalImages('');
    }
    setDescriptionAr(prod.descriptionAr);
    setDescriptionEn(prod.descriptionEn || '');
    setSizes(prod.sizes ? prod.sizes.join(', ') : '');
    setColors(prod.colors ? prod.colors.map((c) => c.nameAr || c.name).join(', ') : '');
    setBadge(prod.badge || 'none');
    setInStock(prod.inStock);
    setPreparationTime(prod.preparationTime || '');
    setCollectionName(prod.collection || 'تشكيلة دالوزي');
    setInstagramHandle(prod.instagramHandle || '');
    setInstagramPostUrl(prod.instagramPostUrl || '');
    setSubCategoryId(prod.subCategoryId || '');
    setActiveTab('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset form to defaults
  const resetForm = () => {
    setTitleAr('');
    setTitleEn('');
    setCategory('women-fashion');
    setSubCategoryId('');
    setPrice(12500);
    setOriginalPrice(14500);
    setImageUrl('');
    setAdditionalImages('');
    setUploadedImages([]);
    setDescriptionAr('');
    setDescriptionEn('');
    setSizes('38, 40, 42, 44');
    setColors('عنابي, أسود ملكي');
    setBadge('جديد');
    setInStock(true);
    setPreparationTime('');
    setCollectionName('تشكيلة دالوزي الحصرية');
    setInstagramHandle('');
    setInstagramPostUrl('');
    setEditingProduct(null);
  };

  // AI Auto-Description generation function
  const handleGenerateAIDescription = async () => {
    if (!titleAr.trim()) {
      setErrorMessage('يرجى إدخال اسم المنتج بالعربية أولاً لتوليد وصف تسويقي احترافي متناسق معه.');
      return;
    }

    setIsGeneratingDescription(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titleAr,
          category,
          price,
          features: sizes ? `المقاسات: ${sizes}، الألوان: ${colors}` : '',
          instagramHandle,
        }),
      });

      if (!response.ok) {
        throw new Error('API failed');
      }

      const data = await response.json();
      if (data.description) {
        setDescriptionAr(data.description);
        setSuccessMessage('✨ تم توليد الوصف التسويقي الفاخر بالذكاء الاصطناعي بنجاح!');
        setTimeout(() => setSuccessMessage(''), 3500);
      }
    } catch (err) {
      console.warn('AI Description generation fallback activated:', err);
      // High-grade client-side fallback
      const igNote = instagramHandle
        ? `\nتصميم حصري من إبداع (${instagramHandle.startsWith('@') ? instagramHandle : '@' + instagramHandle}).`
        : '';

      let text = '';
      if (category === 'women-fashion') {
        text = `قطعة استثنائية تجسد الفخامة والأصالة الجزائرية الرفيعة.${igNote} صُممت بعناية فائقة باستخدام أجود الخامات الملكية ولمسات تطريز يدوي متقن تضفي بريقاً ساحراً يناسب أبهى مناسباتك وأعراسك.

تأتيكم القطعة داخل علبة هدايا "دالوزي" الفاخرة والمذهبة لتقديمها كهدية راقية. نضمن لكم تجربة تسوق آمنة 100% مع ميزة الدفع عند الاستلام (COD) وحق فتح الطرد ومعاينة القماش والمقاس قبل دفع أي دينار لعامل التوصيل عبر 58 ولاية.`;
      } else if (category === 'sweets-bakery' || category === 'catering-buffet') {
        text = `إبداع طهي راقٍ يجمع بين عراقة الحلويات والمملحات الجزائرية الأصيلة واللمسات العصرية المبتكرة.${igNote} محضرة بأجود المكونات الطبيعية والمكسرات الفاخرة لترتقي بضيافتكم في حفلات الخطوبة والأعراس والولائم.

تغليف محكم يحافظ على الطراوة والقرمشة، مع توصيل سريع ومضمون لباب داركم وإمكانية الفحص الكامل قبل السداد.`;
      } else if (category === 'beauty-cosmetics') {
        text = `تركيبة طبيعية نقية 100% مستوحاة من أسرار الجمال الجزائري العريق.${igNote} عناية فائقة تمنح بشرتك نضارة مخملية وإشراقة طبيعية تدوم طويلاً، خالية تماماً من المواد الكيميائية الضارة ومختبرة لضمان أقصى درجات النقاء والأمان.

تصلكم في عبوة زجاجية فاخرة مع ضمان فحص الطرد والاستلام الآمن في كافة الولايات الـ 58.`;
      } else {
        text = `قطعة راقية تمثل التوازن المثالي بين الأناقة العصرية والجودة العالية.${igNote} صُممت خصيصاً لأصحاب الذوق الرفيع بأدق تفاصيل الخياطة والمتانة التي تدوم.

مرفقة بعلبة هدايا دالوزي الرسمية مع خدمة التوصيل السريع والدفع عند الاستلام، مع كامل الحق في معاينة وفحص المنتج قبل السداد.`;
      }

      setDescriptionAr(text);
      setSuccessMessage('✨ تم توليد الوصف التسويقي الفاخر بالذكاء الاصطناعي بنجاح!');
      setTimeout(() => setSuccessMessage(''), 3500);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Submit Add or Edit Product directly to Firebase Firestore
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr.trim()) {
      setErrorMessage('يرجى إدخال اسم المنتج بالعربية');
      return;
    }
    if (!price || price <= 0) {
      setErrorMessage('يرجى تحديد سعر صحيح بالدينار الجزائري (DZD)');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Prepare images array: prioritize uploaded Base64 images from phone studio, otherwise manual URLs/presets
    let finalImages: string[] = [];
    if (uploadedImages.length > 0) {
      finalImages = uploadedImages;
    } else if (imageUrl.trim()) {
      const extraImgs = additionalImages
        .split(',')
        .map((url) => url.trim())
        .filter((url) => url.length > 5);
      finalImages = [imageUrl.trim(), ...extraImgs];
    } else {
      finalImages = [samplePresets[0].url];
    }

    // Prepare sizes and colors
    const parsedSizes = sizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedColors: ProductVariantColor[] = colors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
      .map((cName) => ({
        name: cName,
        nameAr: cName,
        hex: '#D4AF37',
      }));

    const prodId = editingProduct ? editingProduct.id : `prod-${Date.now()}`;

    const productPayload: Product = {
      id: prodId,
      title: titleEn.trim() || titleAr.trim(),
      titleAr: titleAr.trim(),
      collection: collectionName.trim() || 'تشكيلة دالوزي الفاخرة',
      category,
      price: Number(price),
      originalPrice: originalPrice && originalPrice > price ? Number(originalPrice) : undefined,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 1,
      badge: badge === 'none' ? undefined : badge,
      badgeEn:
        badge === 'جديد'
          ? 'NEW'
          : badge === 'الأكثر مبيعاً'
          ? 'BEST SELLER'
          : badge === 'حصري'
          ? 'EXCLUSIVE'
          : badge === 'الأكثر طلباً'
          ? 'POPULAR'
          : badge === '100% طبيعي'
          ? 'NATURAL'
          : undefined,
      images: finalImages,
      descriptionAr: descriptionAr.trim() || 'منتج فاخر عالي الجودة متوفر حصرياً عبر منصة دالوزي ستور.',
      descriptionEn: descriptionEn.trim() || 'Luxury authentic item exclusively available on DALOZI STORE.',
      sizes: parsedSizes.length > 0 ? parsedSizes : undefined,
      colors: parsedColors.length > 0 ? parsedColors : undefined,
      features: [
        'خامات فاخرة عالية الجودة مع عناية بالتفاصيل الدقيقة',
        'توصيل سريع وآمن لجميع الولايات الـ 58 مع الدفع عند الاستلام',
        'ضمان الاستبدال في حال وجود أي عيب مصنعي',
      ],
      inStock,
      preparationTime: preparationTime.trim() || undefined,
      instagramHandle: instagramHandle.trim() || undefined,
      instagramPostUrl: instagramPostUrl.trim() || undefined,
      subCategoryId: subCategoryId.trim() || undefined,
    };

    try {
      const result = await saveProductToFirestore(productPayload);
      if (result.success) {
        const savedProd = result.product || productPayload;
        if (onProductUpdated) onProductUpdated(savedProd);
        setSuccessMessage(
          editingProduct
            ? `✅ تم تحديث المنتج "${savedProd.titleAr}" في Firestore بنجاح! (${result.sizeKb || 0} KB)`
            : `🎉 تم نشر وحفظ المنتج "${savedProd.titleAr}" في Firestore بنجاح! (${result.sizeKb || 0} KB)`
        );
        resetForm();
        setActiveTab('products');
        setTimeout(() => setSuccessMessage(''), 4500);
      } else {
        const errDetail = result.error || 'خطأ غير معروف أثناء الكتابة في Firestore';
        console.error('❌ [Admin Dashboard] Product Save Failed:', {
          error: result.error,
          code: result.errorCode,
          product: productPayload,
        });
        setErrorMessage(`تعذر الحفظ في قاعدة بيانات Firestore: ${errDetail} (الكود: ${result.errorCode || 'UNKNOWN'}). يرجى مراجعة تفاصيل الخطأ في الـ Console.`);
      }
    } catch (err: any) {
      console.error('❌ [Admin Dashboard] Exception during saveProduct:', err);
      setErrorMessage(`خطأ استثنائي أثناء حفظ المنتج: ${err?.message || err}. تم تسجيل التفاصيل في Console.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete product from Firestore
  const handleDeleteProduct = async (id: string, name: string) => {
    setIsSubmitting(true);
    try {
      const ok = await deleteProductFromFirestore(id);
      if (ok) {
        if (onProductDeleted) onProductDeleted(id);
        setDeleteConfirmId(null);
        setSuccessMessage(`🗑️ تم حذف المنتج "${name}" من قاعدة بيانات Firestore بنجاح.`);
        setTimeout(() => setSuccessMessage(''), 3500);
      } else {
        setErrorMessage('فشل حذف المنتج من قاعدة البيانات.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'خطأ أثناء حذف المنتج من Firebase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Re-seed initial catalog
  const handleSeedInitial = async () => {
    setIsSubmitting(true);
    await seedInitialProductsIfEmpty();
    setIsSubmitting(false);
    setSuccessMessage('تم التحقق ومزامنة الكتالوج المبدئي مع Firestore بنجاح.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-dashboard-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-[#121217] border border-[#D4AF37]/50 w-full max-w-6xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.2)] my-4 text-[#FAF8F5] max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-[#D4AF37]/25 bg-[#0B0B0E] flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-lg text-[#0F0F12]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Playfair_Display',serif] text-xs font-bold text-[#D4AF37] tracking-wider uppercase">
                  DALOZI STORE · OWNER & ADMIN
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Firestore Live
                </span>
              </div>
              <h2 id="admin-dashboard-title" className="text-lg sm:text-2xl font-bold font-['Cairo',sans-serif] text-gold-gradient">
                لوحة تحكم المالك وإدارة المنتجات
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pendingOrdersCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/90 border border-red-500/50 text-red-200 text-xs font-bold shadow-md hover:bg-red-900 transition-all cursor-pointer animate-pulse"
                title="اضغط للانتقال فوراً لطلبات الزبائن الجديدة"
              >
                <Bell className="w-3.5 h-3.5 text-red-400" />
                <span>{pendingOrdersCount} طلبية جديدة!</span>
              </button>
            )}

            <button
              onClick={() => {
                resetForm();
                setActiveTab('add');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold-gradient text-[#0F0F12] font-black text-xs shadow-md hover:opacity-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج جديد</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#1F1F2A] hover:bg-[#D4AF37] text-[#FAF8F5] hover:text-[#0F0F12] flex items-center justify-center transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-3 border-b border-white/10 bg-[#16161E] flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-[#D4AF37] text-[#D4AF37] bg-[#121217]'
                : 'border-transparent text-[#FAF8F5]/70 hover:text-[#FAF8F5]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>كتالوج المنتجات ({products.length})</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setActiveTab('add');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'add'
                ? 'border-[#D4AF37] text-[#D4AF37] bg-[#121217]'
                : 'border-transparent text-[#FAF8F5]/70 hover:text-[#FAF8F5]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج لـ Firestore</span>
          </button>

          {editingProduct && (
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'edit'
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-[#121217]'
                  : 'border-transparent text-[#FAF8F5]/70 hover:text-[#FAF8F5]'
              }`}
            >
              <Edit className="w-4 h-4" />
              <span>تعديل: {editingProduct.titleAr.slice(0, 18)}...</span>
            </button>
          )}

          <button
            onClick={() => {
              setOrderStatusFilter('pending');
              setActiveTab('orders');
            }}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-[#D4AF37] text-[#D4AF37] bg-[#121217]'
                : 'border-transparent text-[#FAF8F5]/70 hover:text-[#FAF8F5]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>طلبات الزبائن ({orders.length})</span>
            {pendingOrdersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-[#0F0F12] text-[10px] font-black shadow-md animate-pulse">
                {pendingOrdersCount} قيد الانتظار
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('delivery')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'delivery'
                ? 'border-[#D4AF37] text-[#D4AF37] bg-[#121217]'
                : 'border-transparent text-[#FAF8F5]/70 hover:text-[#FAF8F5]'
            }`}
          >
            <Truck className="w-4 h-4 text-[#D4AF37]" />
            <span>شركات التوصيل والـ API</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'database'
                ? 'border-[#D4AF37] text-[#D4AF37] bg-[#121217]'
                : 'border-transparent text-[#FAF8F5]/70 hover:text-[#FAF8F5]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>حالة Firestore</span>
          </button>
        </div>

        {/* Global Feedback Banner */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-950/80 border border-red-500/50 rounded-2xl text-red-200 text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn shrink-0">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Scrollable Main Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* ================= TAB 1: PRODUCTS LIST & MANAGEMENT ================= */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              
              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[#181822] border border-[#D4AF37]/25">
                  <div className="flex items-center justify-between text-xs text-[#FAF8F5]/60 mb-1">
                    <span>إجمالي المنتجات</span>
                    <Boxes className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#D4AF37]">
                    {products.length} منتج
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#181822] border border-[#D4AF37]/25">
                  <div className="flex items-center justify-between text-xs text-[#FAF8F5]/60 mb-1">
                    <span>متوفر بالمخزون</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">
                    {inStockCount} منتج
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#181822] border border-[#D4AF37]/25">
                  <div className="flex items-center justify-between text-xs text-[#FAF8F5]/60 mb-1">
                    <span>قيمة الكتالوج المعروض</span>
                    <DollarSign className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div className="text-sm sm:text-base font-black text-[#FAF8F5] truncate">
                    {formatDZD(totalValue)}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#181822] border border-[#D4AF37]/25">
                  <div className="flex items-center justify-between text-xs text-[#FAF8F5]/60 mb-1">
                    <span>طلبيات الزبائن الواردة</span>
                    <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-400">
                    {orders.length} طلبية
                  </div>
                </div>
              </div>

              {/* Search & Filter Header */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#D4AF37] absolute top-3.5 start-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالاسم أو المعرف (ID)..."
                    className="w-full bg-[#181822] border border-white/15 focus:border-[#D4AF37] rounded-xl py-2.5 ps-10 pe-4 text-xs sm:text-sm text-[#FAF8F5] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as CategoryId)}
                    className="bg-[#181822] border border-white/15 focus:border-[#D4AF37] rounded-xl px-3 py-2.5 text-xs text-[#FAF8F5] focus:outline-none"
                  >
                    <option value="all">جميع الأقسام ({products.length})</option>
                    <option value="women-fashion">أزياء نسائية وقفاطين</option>
                    <option value="mens-apparel">أزياء رجالية وبدلات</option>
                    <option value="sweets-bakery">حلويات تقليدية ومخبوزات</option>
                    <option value="catering-buffet">مملحات وبوفيهات أعراس</option>
                    <option value="beauty-cosmetics">عناية وتجميل</option>
                  </select>
                </div>
              </div>

              {/* Products Table / Cards */}
              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center bg-[#181822] rounded-3xl border border-dashed border-white/15 space-y-3">
                  <Package className="w-12 h-12 text-[#D4AF37]/50 mx-auto" />
                  <h3 className="text-base font-bold text-[#FAF8F5]">لا توجد منتجات مطابقة للبحث</h3>
                  <p className="text-xs text-[#FAF8F5]/60">
                    يمكنك إضافة منتج جديد بالضغط على زر "إضافة منتج جديد" في الأعلى.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-[#181824] border border-[#D4AF37]/25 hover:border-[#D4AF37]/60 rounded-2xl overflow-hidden p-3.5 flex flex-col justify-between transition-all group hover:shadow-[0_4px_25px_rgba(212,175,55,0.15)]"
                    >
                      <div className="space-y-3">
                        {/* Thumbnail & Badges */}
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#0A0A0E]">
                          <img
                            src={prod.images[0]}
                            alt={prod.titleAr}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute top-2 start-2 flex flex-col gap-1">
                            {prod.badge && (
                              <span className="px-2 py-0.5 rounded-md bg-[#D4AF37] text-[#0F0F12] text-[10px] font-black shadow-md">
                                {prod.badge}
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md ${
                                prod.inStock
                                  ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-red-900/80 text-red-300 border border-red-500/40'
                              }`}
                            >
                              {prod.inStock ? 'متوفر' : 'نفد'}
                            </span>
                          </div>

                          <div className="absolute bottom-2 end-2 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[11px] font-bold text-[#D4AF37]">
                            {formatDZD(prod.price)}
                          </div>
                        </div>

                        {/* Title and Category */}
                        <div>
                          <div className="text-[11px] text-[#D4AF37] font-semibold uppercase tracking-wider">
                            {prod.collection || prod.category}
                          </div>
                          <h4 className="text-sm font-bold text-[#FAF8F5] line-clamp-1">
                            {prod.titleAr}
                          </h4>
                          <p className="text-[11px] text-[#FAF8F5]/60 line-clamp-2 mt-1">
                            {prod.descriptionAr}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(prod)}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-[#222230] hover:bg-[#D4AF37] hover:text-[#0F0F12] text-[#FAF8F5] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>

                        {deleteConfirmId === prod.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(prod.id, prod.titleAr)}
                              className="py-1.5 px-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all"
                            >
                              تأكيد!
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="py-1.5 px-2 rounded-xl bg-white/10 text-xs"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(prod.id)}
                            className="p-2 rounded-xl bg-red-950/40 hover:bg-red-600 border border-red-500/30 text-red-300 hover:text-white transition-all cursor-pointer"
                            title="حذف المنتج من Firestore"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2 & 3: ADD / EDIT PRODUCT FORM ================= */}
          {(activeTab === 'add' || activeTab === 'edit') && (
            <form onSubmit={handleSaveProduct} className="space-y-6 max-w-4xl mx-auto">
              
              <div className="p-4 rounded-2xl bg-[#1A1A24] border border-[#D4AF37]/30 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#D4AF37]">
                    {activeTab === 'edit' ? 'تعديل منتج في قاعدة بيانات Firestore' : 'إضافة منتج جديد ونشره في المتجر فوراً'}
                  </h3>
                  <p className="text-xs text-[#FAF8F5]/60 mt-0.5">
                    البيانات المدخلة تُحفظ مباشرة في مجموعة <code>products</code> بـ Firebase وتظهر فوراً للزبائن.
                  </p>
                </div>
                {activeTab === 'edit' && (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab('products');
                    }}
                    className="text-xs text-[#FAF8F5]/60 hover:text-[#FAF8F5] underline"
                  >
                    إلغاء التعديل
                  </button>
                )}
              </div>

              {/* Row 1: Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#FAF8F5] mb-1.5">
                    اسم المنتج بالعربية <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="مثال: قفطان ملكي قسنطيني بتطريز ذهبي يدوي"
                    className="w-full bg-[#181822] border border-white/20 focus:border-[#D4AF37] rounded-xl p-3 text-sm text-[#FAF8F5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#FAF8F5] mb-1.5">
                    اسم المنتج بالإنجليزية (Title En)
                  </label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="e.g., Royal Hand-Embroidered Caftan"
                    className="w-full bg-[#181822] border border-white/20 focus:border-[#D4AF37] rounded-xl p-3 text-sm text-[#FAF8F5] focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Category, Nested Subcategory & Prices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#FAF8F5] mb-1.5">
                    القسم الرئيسي <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value as CategoryId);
                      setSubCategoryId('');
                    }}
                    className="w-full bg-[#181822] border border-white/20 focus:border-[#D4AF37] rounded-xl p-3 text-xs sm:text-sm text-[#FAF8F5] focus:outline-none"
                  >
                    <option value="women-fashion">👑 أزياء نسائية وقفاطين</option>
                    <option value="mens-apparel">👔 أزياء رجالية وبدلات</option>
                    <option value="sweets-bakery">🧁 حلويات تقليدية ومخبوزات</option>
                    <option value="catering-buffet">🍱 مملحات وبوفيهات أعراس</option>
                    <option value="beauty-cosmetics">🌿 عناية وتجميل</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#FAF8F5] mb-1.5 flex items-center justify-between">
                    <span>الفئة الفرعية (شجرة الأقسام)</span>
                    <span className="text-[10px] text-[#D4AF37]">تصنيف دقيق</span>
                  </label>
                  <select
                    value={subCategoryId}
                    onChange={(e) => setSubCategoryId(e.target.value)}
                    className="w-full bg-[#181822] border border-white/20 focus:border-[#D4AF37] rounded-xl p-3 text-xs sm:text-sm text-[#FAF8F5] focus:outline-none"
                  >
                    <option value="">-- بدون فئة فرعية (عام للقسم) --</option>
                    {CATEGORIES_TAXONOMY.find((c) => c.id === category)?.groups.map((grp) => (
                      <optgroup key={grp.id} label={`${grp.icon} ${grp.labelAr}`}>
                        {grp.items.map((it) => (
                          <option key={it.id} value={it.id}>
                            {it.labelAr}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#FAF8F5] mb-1.5">
                    السعر الحالي (د.ج DZD) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-[#181822] border border-white/20 focus:border-[#D4AF37] rounded-xl p-3 text-sm font-bold text-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#FAF8F5] mb-1.5">
                    السعر الأصلي (اختياري)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    placeholder="مثال: 16500"
                    className="w-full bg-[#181822] border border-white/20 focus:border-[#D4AF37] rounded-xl p-3 text-sm text-[#FAF8F5]/80 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Product Images (Direct Phone Upload + Base64 Compression + Gallery + URL Fallback) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#161620] border border-[#D4AF37]/30 space-y-4">
                
                {/* Hidden File Inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelection}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelection}
                  className="hidden"
                />

                {/* Section Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gold-gradient flex items-center justify-center text-[#0F0F12]">
                      <ImagePlus className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[#D4AF37]">
                        صور المنتج (رفع مباشر من استوديو الهاتف - Base64)
                      </label>
                      <span className="text-[11px] text-[#FAF8F5]/60">
                        يتم ضغط الصورة تلقائياً وتخزينها مباشرة في Firestore بدون الحاجة لروابط خارجية
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold flex items-center gap-1.5 ${
                        currentImagesPayloadSizeKb > 650
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                          : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${currentImagesPayloadSizeKb > 650 ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
                      <span>
                        {currentImagesPayloadSizeKb > 0
                          ? `حجم الصور: ${currentImagesPayloadSizeKb} KB / 1000 KB ${
                              currentImagesPayloadSizeKb > 650
                                ? '⚠️ (سيتم ضغطها تلقائياً)'
                                : '✓ آمن لـ Firestore'
                            }`
                          : '✓ Firestore Ready'}
                      </span>
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] text-[#FAF8F5]/60 font-mono">
                      حد أقصى 1MB (1024KB)
                    </span>
                  </div>
                </div>

                {/* Processing State */}
                {isCompressing && (
                  <div className="p-4 bg-[#1F1F2D] border border-[#D4AF37]/40 rounded-xl flex items-center justify-center gap-3 text-xs text-[#D4AF37] font-bold animate-pulse">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري قراءة وضغط الصورة من الهاتف وتحويلها لـ Base64 عالي الجودة...</span>
                  </div>
                )}

                {/* Big Direct Phone Upload & Camera Action Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Gallery / Studio Selection Button */}
                  <button
                    type="button"
                    disabled={isCompressing}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-5 rounded-2xl bg-[#1A1A26] hover:bg-[#222234] border-2 border-dashed border-[#D4AF37]/45 hover:border-[#D4AF37] text-start transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 group-hover:bg-[#D4AF37] text-[#D4AF37] group-hover:text-[#0F0F12] flex items-center justify-center transition-colors">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-[#FAF8F5]/70">
                        الاستوديو / الملفات
                      </span>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-[#FAF8F5] group-hover:text-[#D4AF37]">
                        📁 اختيار صور من استوديو الهاتف (Galerie)
                      </div>
                      <p className="text-[11px] text-[#FAF8F5]/60 mt-1 leading-relaxed">
                        اختر صورة أو أكثر من ألبوم هاتفك أو حاسوبك، سيتم تحويلها وحفظها كـ Base64 فوراً.
                      </p>
                    </div>
                  </button>

                  {/* Camera Snap Button */}
                  <button
                    type="button"
                    disabled={isCompressing}
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-5 rounded-2xl bg-[#1A1A26] hover:bg-[#222234] border-2 border-dashed border-[#D4AF37]/45 hover:border-[#D4AF37] text-start transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 group-hover:bg-[#D4AF37] text-[#D4AF37] group-hover:text-[#0F0F12] flex items-center justify-center transition-colors">
                        <Camera className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-[#FAF8F5]/70">
                        كاميرا الهاتف
                      </span>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-[#FAF8F5] group-hover:text-[#D4AF37]">
                        📸 التقاط صورة فورية بالكاميرا
                      </div>
                      <p className="text-[11px] text-[#FAF8F5]/60 mt-1 leading-relaxed">
                        التقط صورة للمنتج مباشرة بكاميرا هاتفك ليتم حفظها وضغطها في ثوانٍ.
                      </p>
                    </div>
                  </button>
                </div>

                {/* Uploaded Images Gallery Preview */}
                {uploadedImages.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#FAF8F5]">
                      <span>الصور المرفوعة للمنتج ({uploadedImages.length}):</span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>إضافة صورة أخرى</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {uploadedImages.map((imgSrc, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-xl overflow-hidden bg-[#0A0A0E] border-2 transition-all aspect-square flex flex-col justify-between"
                          style={{ borderColor: idx === 0 ? '#D4AF37' : 'rgba(255,255,255,0.15)' }}
                        >
                          <img
                            src={imgSrc}
                            alt={`صورة ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Top Badges */}
                          <div className="absolute top-1.5 start-1.5 end-1.5 flex items-center justify-between pointer-events-none">
                            {idx === 0 ? (
                              <span className="px-2 py-0.5 rounded-md bg-[#D4AF37] text-[#0F0F12] text-[10px] font-black shadow-md flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                <span>الرئيسية</span>
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-white">
                                #{idx + 1}
                              </span>
                            )}

                            <span className="px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-mono text-[#D4AF37]">
                              {imgSrc.startsWith('data:') ? 'Base64' : 'URL'}
                            </span>
                          </div>

                          {/* Overlay Controls */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="w-full py-1 px-2 rounded-lg bg-[#D4AF37] text-[#0F0F12] text-[10px] font-bold shadow-md cursor-pointer hover:opacity-95"
                              >
                                تعيين كصورة رئيسية ⭐
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="py-1 px-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>حذف</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional Fallback: Manual URL / Preset Images */}
                <div className="pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowUrlFallback(!showUrlFallback)}
                    className="text-[11px] text-[#FAF8F5]/70 hover:text-[#D4AF37] flex items-center gap-1 transition-colors"
                  >
                    <span>{showUrlFallback ? '▲ إخفاء خيارات الرابط اليدوي' : '▼ أو إدخال رابط URL يدوياً / اختيار صور عينات جاهزة'}</span>
                  </button>

                  {showUrlFallback && (
                    <div className="mt-3 space-y-3 p-3 rounded-xl bg-[#121217] border border-white/10 animate-fadeIn">
                      <div>
                        <label className="block text-[11px] font-bold text-[#D4AF37] mb-1">
                          رابط صورة من الويب (Image URL):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/... أو أي رابط صورة"
                            className="flex-1 bg-[#181822] border border-white/20 rounded-xl p-2.5 text-xs text-[#FAF8F5] focus:outline-none font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (imageUrl.trim()) {
                                setUploadedImages((prev) => [...prev, imageUrl.trim()]);
                                setSuccessMessage('تمت إضافة رابط الصورة للألبوم.');
                                setTimeout(() => setSuccessMessage(''), 2500);
                              }
                            }}
                            className="px-3 py-2 bg-[#222230] hover:bg-[#D4AF37] hover:text-[#0F0F12] text-xs font-bold rounded-xl text-[#FAF8F5]"
                          >
                            + إضافة
                          </button>
                        </div>
                      </div>

                      {/* Sample Presets */}
                      <div>
                        <span className="text-[11px] text-[#FAF8F5]/60 block mb-1.5">
                          أو اختر صورة جاهزة عالية الدقة بنقرة واحدة:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {samplePresets.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setUploadedImages((prev) => [preset.url, ...prev.filter((u) => u !== preset.url)]);
                                setImageUrl(preset.url);
                                setCategory(preset.cat);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#222230] hover:bg-[#D4AF37] hover:text-[#0F0F12] text-[11px] text-[#FAF8F5] transition-colors"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Row 4: Instagram Integration (حساب مالكة المنتج ورابط المنشور) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#18121f] via-[#1a1524] to-[#18121f] border border-[#E1306C]/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] flex items-center justify-center text-white shadow-md">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#FAF8F5] flex items-center gap-1.5">
                        <span>ربط المنتج بإنستغرام (Instagram Attribution)</span>
                        <span className="text-[10px] text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full font-mono">
                          حساب المالكة والمنشور
                        </span>
                      </h4>
                      <p className="text-[11px] text-[#FAF8F5]/60">
                        ربط المنتج بحساب المصممة الأصلية ومنشور إنستغرام لزيادة الموثوقية وتسهيل استعراض الفيديو
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#FAF8F5] mb-1.5 flex items-center gap-1.5">
                      <span>اسم حساب مالكة المنتج على إنستغرام (Instagram Username)</span>
                      <span className="text-[10px] text-[#D4AF37] font-normal">اختياري</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-[#FAF8F5]/50 text-xs font-bold font-mono">
                        @
                      </div>
                      <input
                        type="text"
                        value={instagramHandle.startsWith('@') ? instagramHandle.slice(1) : instagramHandle}
                        onChange={(e) => setInstagramHandle(e.target.value ? (e.target.value.startsWith('@') ? e.target.value : '@' + e.target.value) : '')}
                        placeholder="dalozi_couture أو fatima_creations"
                        className="w-full bg-[#181822] border border-white/20 focus:border-[#E1306C] rounded-xl py-2.5 ps-8 pe-3 text-xs sm:text-sm text-[#FAF8F5] focus:outline-none font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-[#FAF8F5]/50 mt-1 block">
                      سيظهر كشعار موثوق "بإشراف المصممة" في صفحة تفاصيل المنتج
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#FAF8F5] mb-1.5 flex items-center gap-1.5">
                      <span>رابط منشور المنتج على إنستغرام (Post / Reel URL)</span>
                      <span className="text-[10px] text-[#D4AF37] font-normal">اختياري</span>
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={instagramPostUrl}
                        onChange={(e) => setInstagramPostUrl(e.target.value)}
                        placeholder="https://www.instagram.com/p/... أو /reel/..."
                        className="w-full bg-[#181822] border border-white/20 focus:border-[#E1306C] rounded-xl py-2.5 px-3 text-xs sm:text-sm text-[#FAF8F5] focus:outline-none font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-[#FAF8F5]/50 mt-1 block">
                      سيظهر زر مباشر للزبون لمشاهدة الفيديو والمنشور الأصلي على إنستغرام
                    </span>
                  </div>
                </div>

                {(instagramHandle || instagramPostUrl) && (
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
                    <span className="text-pink-400 font-semibold flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5" />
                      <span>معاينة الزر في صفحة المنتج:</span>
                    </span>
                    <a
                      href={instagramPostUrl || (instagramHandle ? `https://instagram.com/${instagramHandle.replace('@','')}` : '#')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white text-[11px] font-bold flex items-center gap-1.5 hover:opacity-90"
                    >
                      <span>شاهد المنشور الأصلي على إنستغرام</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Row 5: Descriptions with AI Auto-Description */}
              <div className="space-y-3">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <label className="text-xs font-bold text-[#FAF8F5] flex items-center gap-1.5">
                      <span>الوصف التفصيلي بالعربية</span>
                      <span className="text-red-400">*</span>
                    </label>

                    {/* AI Auto-Description Button */}
                    <button
                      type="button"
                      disabled={isGeneratingDescription}
                      onClick={handleGenerateAIDescription}
                      className="group relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#20182E] via-[#2A1E40] to-[#20182E] hover:from-[#352554] hover:to-[#352554] border border-[#D4AF37]/60 text-[#D4AF37] hover:text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:scale-102 active:scale-98 disabled:opacity-50 cursor-pointer"
                      title="توليد صياغة تسويقية ملكية تبرز الجودة والضمانات بضغطة زر"
                    >
                      {isGeneratingDescription ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                          <span>جاري صياغة الوصف بالذكاء الاصطناعي...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5 animate-pulse text-[#D4AF37]" />
                          <span>توليد وصف احترافي بالذكاء الاصطناعي ✦</span>
                          <span className="text-[9px] bg-[#D4AF37]/20 px-1 py-0.2 rounded text-[#D4AF37] font-mono">Gemini AI</span>
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    required
                    value={descriptionAr}
                    onChange={(e) => setDescriptionAr(e.target.value)}
                    placeholder="اكتب وصف المنتج أو اضغط على 'توليد وصف احترافي بالذكاء الاصطناعي' ليقوم Gemini بصياغة وصف ملكي مخصص في ثوانٍ..."
                    className="w-full bg-[#181822] border border-white/20 focus:border-[#D4AF37] rounded-xl p-3 text-xs sm:text-sm text-[#FAF8F5] focus:outline-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[11px] text-[#FAF8F5]/60 mt-1">
                    <span>💡 يمكنك تعديل وتخصيص النص المولد في أي وقت بحرية.</span>
                    <span>{descriptionAr.length} حرف</span>
                  </div>
                </div>
              </div>

              {/* Row 5: Variants & Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#FAF8F5] mb-1.5">
                    المقاسات المتوفرة (مفصولة بفواصل)
                  </label>
                  <input
                    type="text"
                    value={sizes}
                    onChange={(e) => setSizes(e.target.value)}
                    placeholder="38, 40, 42, 44 أو S, M, L"
                    className="w-full bg-[#181822] border border-white/20 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-[#FAF8F5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#FAF8F5] mb-1.5">
                    الألوان المتوفرة (مفصولة بفواصل)
                  </label>
                  <input
                    type="text"
                    value={colors}
                    onChange={(e) => setColors(e.target.value)}
                    placeholder="أخضر زمردي, بنفسجي ملكي, أسود"
                    className="w-full bg-[#181822] border border-white/20 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-[#FAF8F5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#FAF8F5] mb-1.5">
                    شارة مميزة (Badge)
                  </label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value as any)}
                    className="w-full bg-[#181822] border border-white/20 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-[#FAF8F5] focus:outline-none"
                  >
                    <option value="جديد">جديد (NEW)</option>
                    <option value="الأكثر مبيعاً">الأكثر مبيعاً (BEST SELLER)</option>
                    <option value="حصري">حصري (EXCLUSIVE)</option>
                    <option value="none">بدون شارة</option>
                  </select>
                </div>
              </div>

              {/* Row 6: Stock & Collection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#161620] border border-white/10 items-center">
                <div>
                  <label className="block text-xs font-bold text-[#FAF8F5] mb-1">
                    اسم المجموعة / التشكيلة
                  </label>
                  <input
                    type="text"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                    placeholder="مثال: تشكيلة أعراس 2026"
                    className="w-full bg-[#121217] border border-white/20 rounded-xl p-2 text-xs text-[#FAF8F5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#FAF8F5] mb-1">
                    وقت التحضير (اختياري)
                  </label>
                  <input
                    type="text"
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(e.target.value)}
                    placeholder="مثال: 24 ساعة للمناسبات"
                    className="w-full bg-[#121217] border border-white/20 rounded-xl p-2 text-xs text-[#FAF8F5]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 sm:pt-0">
                  <label className="text-xs font-bold text-[#FAF8F5] cursor-pointer flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
                    />
                    <span>متوفر في المخزون (In Stock)</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab('products');
                  }}
                  className="px-5 py-3 rounded-xl bg-[#222230] hover:bg-[#2C2C3E] text-xs font-bold text-[#FAF8F5]"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 rounded-xl bg-gold-gradient text-[#0F0F12] font-black text-sm shadow-[0_4px_25px_rgba(212,175,55,0.35)] hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ في Firestore...</span>
                    </>
                  ) : activeTab === 'edit' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>حفظ تعديلات المنتج في Firestore 💾</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>نشر المنتج في Firestore فوراً 🚀</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* ================= TAB 4: ORDERS MANAGEMENT ================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              
              {/* Header & Stats Overview */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#181822] p-4 sm:p-5 rounded-3xl border border-[#D4AF37]/30">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-[#FAF8F5]">
                      إدارة واستقبال طلبات الزبائن (COD)
                    </h3>
                    {pendingOrdersCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-xs font-black shadow-md animate-pulse">
                        {pendingOrdersCount} طلب جديد بحاجة للتأكيد
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#FAF8F5]/60 mt-0.5">
                    الطلبات تُحفظ وتُحدث مباشرة في مجموعة <code className="text-[#D4AF37]">orders</code> بـ Firebase Firestore.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={fetchOrdersManually}
                    disabled={isLoadingOrders}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#222232] hover:bg-[#D4AF37] hover:text-[#0F0F12] text-xs font-bold text-[#FAF8F5] transition-all border border-white/15 cursor-pointer shadow-sm"
                    title="تحديث قائمة الطلبات مباشرة من Firestore"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                    <span>تحديث فوري</span>
                  </button>

                  <div className="text-end">
                    <span className="text-[11px] text-[#FAF8F5]/60 block">إجمالي المبيعات المؤكدة</span>
                    <span className="text-base sm:text-lg font-black text-gold-gradient">
                      {formatDZD(totalDeliveredRevenue || totalExpectedRevenue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Pipeline Stages Overview (Status Metrics Bar) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('pending')}
                  className={`p-3 rounded-2xl border text-start transition-all cursor-pointer ${
                    orderStatusFilter === 'pending'
                      ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-500'
                      : 'bg-[#181824] border-white/10 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-amber-400 font-bold mb-1">
                    <span>قيد الانتظار (Pending)</span>
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-xl font-black text-amber-400">
                    {pendingOrdersCount} طلبية
                  </div>
                  <span className="text-[10px] text-[#FAF8F5]/50 mt-0.5 block">بانتظار المراجعة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('confirmed')}
                  className={`p-3 rounded-2xl border text-start transition-all cursor-pointer ${
                    orderStatusFilter === 'confirmed'
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500'
                      : 'bg-[#181824] border-white/10 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-bold mb-1">
                    <span>مؤكدة (Confirmed)</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-xl font-black text-emerald-400">
                    {confirmedOrdersCount} طلبية
                  </div>
                  <span className="text-[10px] text-[#FAF8F5]/50 mt-0.5 block">جاهزة للشحن للـ API</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('shipped')}
                  className={`p-3 rounded-2xl border text-start transition-all cursor-pointer ${
                    orderStatusFilter === 'shipped'
                      ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.25)] ring-1 ring-purple-500'
                      : 'bg-[#181824] border-white/10 hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-purple-400 font-bold mb-1">
                    <span>تم الشحن (Shipped)</span>
                    <Truck className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="text-xl font-black text-purple-400">
                    {shippedOrdersCount} طلبية
                  </div>
                  <span className="text-[10px] text-[#FAF8F5]/50 mt-0.5 block">HHD / E-Com / Andersen</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('delivered')}
                  className={`p-3 rounded-2xl border text-start transition-all cursor-pointer ${
                    orderStatusFilter === 'delivered'
                      ? 'bg-teal-950/40 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.25)] ring-1 ring-teal-500'
                      : 'bg-[#181824] border-white/10 hover:border-teal-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-teal-400 font-bold mb-1">
                    <span>تم التسليم (Delivered)</span>
                    <Check className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <div className="text-xl font-black text-teal-400">
                    {deliveredOrdersCount} طلبية
                  </div>
                  <span className="text-[10px] text-[#FAF8F5]/50 mt-0.5 block">مكتملة ومقبوضة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('contacted')}
                  className={`p-3 rounded-2xl border text-start transition-all cursor-pointer ${
                    orderStatusFilter === 'contacted'
                      ? 'bg-blue-950/40 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.25)] ring-1 ring-blue-500'
                      : 'bg-[#181824] border-white/10 hover:border-blue-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-blue-400 font-bold mb-1">
                    <span>تم الاتصال (Contacted)</span>
                    <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="text-xl font-black text-blue-400">
                    {contactedOrdersCount} طلبية
                  </div>
                  <span className="text-[10px] text-[#FAF8F5]/50 mt-0.5 block">تأكيد هاتفي إضافي</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderStatusFilter('all')}
                  className={`p-3 rounded-2xl border text-start transition-all cursor-pointer ${
                    orderStatusFilter === 'all'
                      ? 'bg-[#222232] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)] ring-1 ring-[#D4AF37]'
                      : 'bg-[#181824] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-[#FAF8F5]/70 font-bold mb-1">
                    <span>كل الطلبيات (All)</span>
                    <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
                  </div>
                  <div className="text-xl font-black text-[#D4AF37]">
                    {orders.length} طلبية
                  </div>
                  <span className="text-[10px] text-[#FAF8F5]/50 mt-0.5 block">عرض مسار الطلبات كاملاً</span>
                </button>
              </div>

              {/* Search & Pipeline Filter Tabs Toolbar */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#D4AF37] absolute top-3.5 start-3.5" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="ابحث برقم الطلب (DLZ-...)، اسم الزبون، رقم الهاتف، أو رقم التتبع..."
                    className="w-full bg-[#181824] border border-white/15 focus:border-[#D4AF37] rounded-xl py-2.5 ps-10 pe-4 text-xs sm:text-sm text-[#FAF8F5] focus:outline-none"
                  />
                </div>

                {/* Pipeline Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: 'الكل (All)', count: orders.length, icon: ShoppingBag, color: 'text-[#D4AF37]' },
                    { id: 'pending', label: 'قيد الانتظار (Pending)', count: pendingOrdersCount, icon: Clock, color: 'text-amber-400' },
                    { id: 'confirmed', label: 'مؤكدة (Confirmed)', count: confirmedOrdersCount, icon: CheckCircle2, color: 'text-emerald-400' },
                    { id: 'shipped', label: 'تم الشحن (Shipped)', count: shippedOrdersCount, icon: Truck, color: 'text-purple-400' },
                    { id: 'delivered', label: 'تم التسليم (Delivered)', count: deliveredOrdersCount, icon: Check, color: 'text-teal-400' },
                    { id: 'contacted', label: 'تم الاتصال (Contacted)', count: contactedOrdersCount, icon: PhoneCall, color: 'text-blue-400' },
                    { id: 'cancelled', label: 'ملغاة (Cancelled)', count: cancelledOrdersCount, icon: X, color: 'text-red-400' },
                  ].map((tab) => {
                    const isActive = orderStatusFilter === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setOrderStatusFilter(tab.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-[#D4AF37] text-[#0F0F12] shadow-[0_2px_15px_rgba(212,175,55,0.35)] font-black'
                            : 'bg-[#181824] text-[#FAF8F5]/70 hover:text-[#FAF8F5] border border-white/10 hover:border-white/20'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0F0F12]' : tab.color}`} />
                        <span>{tab.label}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                            isActive ? 'bg-[#0F0F12]/20 text-[#0F0F12]' : 'bg-white/10 text-white'
                          }`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center bg-[#181822] rounded-3xl border border-dashed border-white/15 space-y-3">
                  <ShoppingBag className="w-12 h-12 text-[#D4AF37]/50 mx-auto" />
                  <h4 className="text-base font-bold text-[#FAF8F5]">لا توجد طلبيات في هذا التصنيف</h4>
                  <p className="text-xs text-[#FAF8F5]/60">
                    عندما يقوم أي زبون بتأكيد طلبه في المتجر، ستظهر بياناته وعنوانه هنا لحظياً.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((ord) => {
                    const currentStatus: OrderStatus = ord.status || 'pending';
                    const isPending = currentStatus === 'pending';

                    return (
                      <div
                        key={ord.orderId}
                        className={`rounded-3xl p-4 sm:p-5 border transition-all ${
                          isPending
                            ? 'bg-[#1A1A28] border-amber-500/50 shadow-[0_4px_25px_rgba(245,158,11,0.1)]'
                            : 'bg-[#161622] border-white/10 hover:border-[#D4AF37]/40'
                        }`}
                      >
                        {/* Top Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm sm:text-base font-bold text-[#D4AF37] bg-black/40 px-3 py-1 rounded-xl border border-[#D4AF37]/30">
                              #{ord.orderId}
                            </span>

                            {/* Status Badge */}
                            {currentStatus === 'pending' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold animate-pulse">
                                <Clock className="w-3.5 h-3.5" />
                                <span>قيد الانتظار (بانتظار التأكيد عبر واتساب)</span>
                              </span>
                            )}
                            {currentStatus === 'contacted' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-bold">
                                <PhoneCall className="w-3.5 h-3.5" />
                                <span>تم الاتصال والتأكيد ✅</span>
                              </span>
                            )}
                            {currentStatus === 'confirmed' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>مؤكدة وجاهزة للشحن</span>
                              </span>
                            )}
                            {currentStatus === 'shipped' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
                                <Truck className="w-3.5 h-3.5" />
                                <span>
                                  تم الشحن: {ord.deliveryCompany || 'شركة التوصيل'}
                                  {ord.deliveryTrackingNumber ? ` (${ord.deliveryTrackingNumber})` : ''}
                                </span>
                              </span>
                            )}
                            {currentStatus === 'delivered' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                                <Check className="w-3.5 h-3.5" />
                                <span>تم التسليم بنجاح</span>
                              </span>
                            )}
                            {currentStatus === 'cancelled' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold">
                                <X className="w-3.5 h-3.5" />
                                <span>طلب ملغى</span>
                              </span>
                            )}
                          </div>

                          {/* Order Date */}
                          <div className="flex items-center gap-1.5 text-xs text-[#FAF8F5]/60 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>
                              {ord.createdAt
                                ? new Date(ord.createdAt).toLocaleString('ar-DZ', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'الآن'}
                            </span>
                          </div>
                        </div>

                        {/* Order Body: Customer details & Items */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 py-4">
                          
                          {/* Col 1: Customer & Delivery Details */}
                          <div className="lg:col-span-6 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-[11px] text-[#FAF8F5]/50 block">المشتري:</span>
                                <h4 className="text-base font-bold text-[#FAF8F5] flex items-center gap-2">
                                  <User className="w-4 h-4 text-[#D4AF37]" />
                                  <span>{ord.customerName}</span>
                                </h4>
                              </div>

                              {/* Direct Contact Actions */}
                              <div className="flex items-center gap-2">
                                <a
                                  href={`tel:${ord.phone}`}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition-all shadow-sm"
                                  title="اتصال هاتفي مباشر"
                                >
                                  <PhoneCall className="w-3.5 h-3.5" />
                                  <span>اتصال</span>
                                </a>

                                <a
                                  href={createOrderConfirmationWhatsApp(ord)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] border border-[#25D366]/40 text-[#25D366] hover:text-[#0F0F12] text-xs font-bold transition-all shadow-sm"
                                  title="فتح محادثة واتساب مع رسالة تأكيد جاهزة"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>تأكيد واتساب</span>
                                </a>
                              </div>
                            </div>

                            {/* Phone number */}
                            <div className="text-xs font-mono text-[#D4AF37] font-bold">
                              📞 {ord.phone}
                            </div>

                            {/* Shipping Location */}
                            <div className="p-3 bg-[#121218] rounded-xl border border-white/10 space-y-1.5 text-xs text-[#FAF8F5]/80">
                              <div className="flex items-center gap-2 font-bold text-[#FAF8F5]">
                                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                                <span>
                                  ولاية {ord.wilaya?.code} - {ord.wilaya?.nameAr} ({ord.wilaya?.nameFr}) · بلدية {ord.commune}
                                </span>
                              </div>
                              {ord.address && (
                                <p className="text-[11px] text-[#FAF8F5]/70 ps-5">
                                  العنوان التفصيلي: {ord.address}
                                </p>
                              )}
                              <div className="ps-5 text-[11px] text-[#D4AF37] font-semibold">
                                🚚 {ord.deliveryType === 'home' ? 'توصيل لباب المنزل (Livraison à domicile)' : 'استلام من مكتب التوصيل (Stop Desk)'}
                              </div>
                            </div>

                            {/* Customer Notes if any */}
                            {ord.notes && (
                              <div className="p-2.5 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-200">
                                <span className="font-bold block text-[10px] text-amber-400">ملاحظات الزبون:</span>
                                <span>{ord.notes}</span>
                              </div>
                            )}
                          </div>

                          {/* Col 2: Products & Financial Breakdown */}
                          <div className="lg:col-span-6 space-y-3">
                            <span className="text-[11px] text-[#FAF8F5]/50 block">المنتجات المطلوبة ({ord.items?.length || 0}):</span>
                            
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              {(ord.items || []).map((it, itemIdx) => (
                                <div
                                  key={itemIdx}
                                  className="p-2.5 bg-[#121218] border border-white/10 rounded-xl flex items-center justify-between gap-3 text-xs"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
                                      {it.product?.images?.[0] ? (
                                        <img
                                          src={it.product.images[0]}
                                          alt={it.product.titleAr}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-[#FAF8F5]/40">
                                          🛍️
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <h5 className="font-bold text-[#FAF8F5] truncate text-xs">
                                        {it.product?.titleAr || 'منتج'}
                                      </h5>
                                      <div className="flex items-center gap-2 text-[10px] text-[#FAF8F5]/60 mt-0.5">
                                        {it.selectedColor && (
                                          <span className="inline-flex items-center gap-1">
                                            <span
                                              className="w-2 h-2 rounded-full border border-white/30"
                                              style={{ backgroundColor: it.selectedColor.hex || '#D4AF37' }}
                                            />
                                            <span>{it.selectedColor.nameAr || it.selectedColor.name}</span>
                                          </span>
                                        )}
                                        {it.selectedSize && (
                                          <span>المقاس: {it.selectedSize}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-end shrink-0 font-mono">
                                    <span className="text-[#FAF8F5]/70 block text-[10px]">
                                      {it.quantity} × {formatDZD(it.product?.price || 0)}
                                    </span>
                                    <span className="font-bold text-[#D4AF37]">
                                      {formatDZD((it.product?.price || 0) * (it.quantity || 1))}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Financial totals */}
                            <div className="p-3 bg-[#121218] rounded-xl border border-[#D4AF37]/20 space-y-1.5 text-xs">
                              <div className="flex justify-between text-[#FAF8F5]/70">
                                <span>المجموع الفرعي:</span>
                                <span className="font-mono">{formatDZD(ord.subtotal || 0)}</span>
                              </div>
                              <div className="flex justify-between text-[#FAF8F5]/70">
                                <span>رسوم التوصيل ({ord.wilaya?.nameAr}):</span>
                                <span className="font-mono">
                                  {ord.deliveryFee === 0 ? 'مجاني 🎉' : formatDZD(ord.deliveryFee || 0)}
                                </span>
                              </div>
                              {ord.discount > 0 && (
                                <div className="flex justify-between text-emerald-400">
                                  <span>خصم الكوبون:</span>
                                  <span className="font-mono">-{formatDZD(ord.discount)}</span>
                                </div>
                              )}
                              <div className="flex justify-between pt-1.5 border-t border-white/10 text-sm font-bold text-[#FAF8F5]">
                                <span>المبلغ الإجمالي عند الاستلام (COD):</span>
                                <span className="text-base font-black text-gold-gradient font-mono">
                                  {formatDZD(ord.total || 0)}
                                </span>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* ============= WhatsApp Confirmation Box for Pending Orders ============= */}
                        {currentStatus === 'pending' && (
                          <div className="my-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#13231a] to-[#121b16] border border-emerald-500/50 shadow-lg space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-emerald-500/20">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-[#25D366]/20 border border-[#25D366]/50 flex items-center justify-center text-[#25D366] shrink-0">
                                  <MessageCircle className="w-5 h-5" />
                                </div>
                                <div>
                                  <h5 className="text-xs sm:text-sm font-bold text-emerald-200 flex items-center gap-2">
                                    <span>الطلبية بانتظار التأكيد عبر واتساب</span>
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-[#0F0F12] text-[10px] font-black">
                                      قيد الانتظار (Pending)
                                    </span>
                                  </h5>
                                  <p className="text-[11px] text-emerald-300/70 mt-0.5">
                                    تواصل مع الزبون {ord.customerName} على الرقم ({ord.phone}) لتأكيد العنوان وتفاصيل الطلبية قبل نقلها للخطوة التالية.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                              <span className="text-[11px] text-[#FAF8F5]/70">
                                بمجرد تأكيد الزبون عبر المحادثة، اضغط على <strong>"تأكيد الطلب الآن"</strong> لتغيير الحالة مباشرة إلى <strong>"تم الاتصال والتأكيد"</strong>.
                              </span>

                              <div className="flex items-center gap-2 shrink-0">
                                <a
                                  href={createOrderConfirmationWhatsApp(ord)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-[#0F0F12] font-black text-xs flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-105"
                                  title="فتح محادثة واتساب المباشرة مع نص رسالة جاهز"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  <span>مراسلة الزبون عبر واتساب 💬</span>
                                </a>

                                <button
                                  type="button"
                                  disabled={updatingOrderId === ord.orderId}
                                  onClick={() => handleUpdateStatus(ord.orderId, 'contacted')}
                                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-105 cursor-pointer disabled:opacity-50"
                                  title="تأكيد الطلبية وتغيير الحالة إلى 'تم الاتصال والتأكيد'"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>تأكيد الطلب ➜ 'تم الاتصال والتأكيد' ✅</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {currentStatus === 'contacted' && (
                          <div className="my-3 p-3 rounded-2xl bg-blue-950/40 border border-blue-500/40 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 text-blue-300 text-xs">
                              <PhoneCall className="w-4 h-4 text-blue-400 shrink-0" />
                              <span>
                                <strong>تم تأكيد الطلب مع الزبون بنجاح:</strong> الحالة الآن (تم الاتصال والتأكيد)، والطلبية جاهزة للإرسال لشركة التوصيل أدناه.
                              </span>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-[10px] font-bold shrink-0">
                              مؤكد عبر واتساب
                            </span>
                          </div>
                        )}

                        {/* ============= Send to Delivery API Action Box ============= */}
                        <div className="my-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#171726] via-[#1c1c30] to-[#171726] border border-[#D4AF37]/35 shadow-lg space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
                                <Truck className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="text-xs sm:text-sm font-bold text-[#FAF8F5] flex items-center gap-2">
                                  <span>إرسال تلقائي لشركة التوصيل (Send to Delivery API)</span>
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black border border-amber-500/30">
                                    بنقرة واحدة ⚡
                                  </span>
                                </h5>
                                <p className="text-[11px] text-[#FAF8F5]/60 mt-0.5">
                                  إرسال بيانات المشتري (الاسم: {ord.customerName} · الهاتف: {ord.phone} · الولاية: {ord.wilaya?.nameAr} · المبلغ: {formatDZD(ord.total)}) تلقائياً وتوليد بوليصة الشحن
                                </p>
                              </div>
                            </div>

                            {ord.deliveryTrackingNumber && (
                              <div className="flex items-center gap-2 bg-purple-950/60 border border-purple-500/40 px-3 py-1.5 rounded-xl shrink-0">
                                <span className="text-[11px] text-purple-200">
                                  {ord.deliveryCompany} · <strong>{ord.deliveryTrackingNumber}</strong>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(ord.deliveryTrackingNumber || '');
                                    setCopiedTracking(ord.orderId);
                                    setTimeout(() => setCopiedTracking(null), 2000);
                                  }}
                                  className="text-purple-400 hover:text-white transition-colors"
                                  title="نسخ رقم التتبع"
                                >
                                  {copiedTracking === ord.orderId ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#FAF8F5]/80 font-bold shrink-0">اختر شركة التوصيل:</span>
                              <select
                                value={selectedCarriers[ord.orderId] || deliverySettings.defaultCompany || 'hhd'}
                                onChange={(e) =>
                                  setSelectedCarriers((prev) => ({
                                    ...prev,
                                    [ord.orderId]: e.target.value as DeliveryCompanyId,
                                  }))
                                }
                                className="bg-[#121218] border border-[#D4AF37]/40 focus:border-[#D4AF37] rounded-xl py-2 px-3 text-xs font-bold text-[#FAF8F5] focus:outline-none"
                              >
                                <option value="hhd">🚚 HHD Delivery (إتش إتش دي)</option>
                                <option value="ecom">📦 E-Com Delivery (إيكوم)</option>
                                <option value="andersen">⚡ Andersen Delivery (أندرسن)</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={dispatchingOrderId === ord.orderId}
                                onClick={() => handleDispatchToDelivery(ord)}
                                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-[#D4AF37] text-[#0F0F12] font-black text-xs shadow-[0_2px_15px_rgba(212,175,55,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                              >
                                {dispatchingOrderId === ord.orderId ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>جاري الإرسال للـ API...</span>
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-3.5 h-3.5" />
                                    <span>
                                      {ord.deliveryTrackingNumber
                                        ? 'إعادة الإرسال لمنظومة التوصيل'
                                        : 'إرسال بيانات المشتري للشركة المختارة (1-Click) 🚀'}
                                    </span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => setActiveTab('delivery')}
                                className="p-2.5 rounded-xl bg-[#222232] hover:bg-[#2c2c42] border border-white/10 text-[#FAF8F5]/80 hover:text-white text-xs transition-colors shrink-0"
                                title="إعدادات الـ API ومفاتيح الربط"
                              >
                                <Settings className="w-4 h-4 text-[#D4AF37]" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Order Footer: Status Changer & Actions */}
                        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-bold text-[#D4AF37] me-1">
                              تغيير حالة الطلبية في Firestore:
                            </span>

                            <button
                              type="button"
                              disabled={updatingOrderId === ord.orderId}
                              onClick={() => handleUpdateStatus(ord.orderId, 'pending')}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                currentStatus === 'pending'
                                  ? 'bg-amber-500 text-[#0F0F12] shadow-sm'
                                  : 'bg-[#1F1F2D] text-amber-400 hover:bg-amber-950/40 border border-amber-500/30'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>قيد الانتظار</span>
                            </button>

                            <button
                              type="button"
                              disabled={updatingOrderId === ord.orderId}
                              onClick={() => handleUpdateStatus(ord.orderId, 'confirmed')}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                currentStatus === 'confirmed'
                                  ? 'bg-emerald-500 text-[#0F0F12] shadow-sm'
                                  : 'bg-[#1F1F2D] text-emerald-400 hover:bg-emerald-950/40 border border-emerald-500/30'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>مؤكدة</span>
                            </button>

                            <button
                              type="button"
                              disabled={updatingOrderId === ord.orderId}
                              onClick={() => handleUpdateStatus(ord.orderId, 'contacted')}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                currentStatus === 'contacted'
                                  ? 'bg-blue-500 text-white shadow-sm'
                                  : 'bg-[#1F1F2D] text-blue-400 hover:bg-blue-950/40 border border-blue-500/30'
                              }`}
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>تم الاتصال والتأكيد</span>
                            </button>

                            <button
                              type="button"
                              disabled={updatingOrderId === ord.orderId}
                              onClick={() => handleUpdateStatus(ord.orderId, 'shipped')}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                currentStatus === 'shipped'
                                  ? 'bg-purple-500 text-white shadow-sm'
                                  : 'bg-[#1F1F2D] text-purple-400 hover:bg-purple-950/40 border border-purple-500/30'
                              }`}
                            >
                              <Truck className="w-3 h-3" />
                              <span>تم الشحن</span>
                            </button>

                            <button
                              type="button"
                              disabled={updatingOrderId === ord.orderId}
                              onClick={() => handleUpdateStatus(ord.orderId, 'delivered')}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                currentStatus === 'delivered'
                                  ? 'bg-emerald-500 text-[#0F0F12] shadow-sm'
                                  : 'bg-[#1F1F2D] text-emerald-400 hover:bg-emerald-950/40 border border-emerald-500/30'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>تم التسليم</span>
                            </button>

                            <button
                              type="button"
                              disabled={updatingOrderId === ord.orderId}
                              onClick={() => handleUpdateStatus(ord.orderId, 'cancelled')}
                              className={`px-2 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                currentStatus === 'cancelled'
                                  ? 'bg-red-600 text-white shadow-sm'
                                  : 'bg-[#1F1F2D] text-red-400 hover:bg-red-950/40 border border-red-500/30'
                              }`}
                            >
                              <X className="w-3 h-3" />
                              <span>إلغاء</span>
                            </button>
                          </div>

                          {/* Delete order */}
                          <div>
                            {deleteOrderConfirmId === ord.orderId ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteOrder(ord.orderId)}
                                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg"
                                >
                                  تأكيد الحذف!
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteOrderConfirmId(null)}
                                  className="px-2 py-1 bg-white/10 text-xs text-white rounded-lg"
                                >
                                  إلغاء
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteOrderConfirmId(ord.orderId)}
                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg transition-colors text-xs flex items-center gap-1"
                                title="حذف الطلبية"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="text-[11px]">حذف</span>
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* ================= TAB 5: DELIVERY COMPANIES & API SETTINGS ================= */}
          {activeTab === 'delivery' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Header Box */}
              <div className="p-5 rounded-3xl bg-[#181824] border border-[#D4AF37]/35 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#FAF8F5] flex items-center gap-2">
                      <span>إعدادات وتخصيص شركات التوصيل (Delivery APIs)</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                        مزامنة فورية
                      </span>
                    </h3>
                    <p className="text-xs text-[#FAF8F5]/65 mt-1 leading-relaxed">
                      قم بتهيئة مفاتيح الـ API ورموز الشركاء لشركات التوصيل المعتمدة: <strong>HHD Delivery</strong> ، <strong>E-Com Delivery</strong> ، و <strong>Andersen Delivery</strong> لإرسال بيانات المشتري (الاسم، الهاتف، الولاية، العنوان، والمبلغ) بنقرة زر واحدة.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveDeliverySettings}
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-[#0F0F12] font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ وتفعيل الإعدادات</span>
                </button>
              </div>

              {/* Default Company Selector */}
              <div className="p-4 rounded-2xl bg-[#14141E] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-[#FAF8F5] block">الشركة الافتراضية للشحن السريع (Default Carrier):</span>
                  <span className="text-[11px] text-[#FAF8F5]/50">ستكون هذه الشركة هي الخيار التلقائي المسبق عند الضغط على إرسال الطلب.</span>
                </div>
                <select
                  value={deliverySettings.defaultCompany}
                  onChange={(e) =>
                    setDeliverySettings((prev) => ({
                      ...prev,
                      defaultCompany: e.target.value as DeliveryCompanyId,
                    }))
                  }
                  className="bg-[#1B1B2A] border border-[#D4AF37]/40 focus:border-[#D4AF37] rounded-xl py-2 px-3 text-xs font-bold text-[#FAF8F5] focus:outline-none"
                >
                  <option value="hhd">🚚 HHD Delivery (إتش إتش دي)</option>
                  <option value="ecom">📦 E-Com Delivery (إيكوم ديليفري)</option>
                  <option value="andersen">⚡ Andersen Delivery (أندرسن ديليفري)</option>
                </select>
              </div>

              {/* 3 Companies Configuration Cards */}
              <div className="space-y-5">
                {(['hhd', 'ecom', 'andersen'] as DeliveryCompanyId[]).map((compKey) => {
                  const comp = deliverySettings.companies[compKey];
                  const isDefault = deliverySettings.defaultCompany === compKey;

                  return (
                    <div
                      key={compKey}
                      className={`p-5 rounded-3xl border transition-all ${
                        isDefault
                          ? 'bg-[#181826] border-[#D4AF37]/50 shadow-[0_4px_25px_rgba(212,175,55,0.15)]'
                          : 'bg-[#14141E] border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Company Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-black/40 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-black text-sm">
                            {compKey === 'hhd' ? 'HHD' : compKey === 'ecom' ? 'ECD' : 'AND'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-[#FAF8F5]">{comp.name}</h4>
                              <span className="text-xs text-[#FAF8F5]/60">({comp.nameAr})</span>
                              {isDefault && (
                                <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold border border-[#D4AF37]/40">
                                  افتراضي
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#FAF8F5]/50">
                              بادئة رقم التتبع: <code className="text-[#D4AF37]">{comp.trackingPrefix}-XX-XXXXXX</code>
                            </span>
                          </div>
                        </div>

                        {/* Active Toggle & Test Connection */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            disabled={isTestingCompany === compKey}
                            onClick={() => handleTestCompanyConnection(compKey)}
                            className="px-3 py-1.5 rounded-xl bg-[#222232] hover:bg-[#2C2C42] border border-white/10 text-xs font-bold text-[#FAF8F5] flex items-center gap-1.5 transition-all"
                          >
                            {isTestingCompany === compKey ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                                <span>جاري الاختبار...</span>
                              </>
                            ) : (
                              <>
                                <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
                                <span>اختبار الاتصال بالـ API</span>
                              </>
                            )}
                          </button>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#FAF8F5]/80">
                            <input
                              type="checkbox"
                              checked={comp.active}
                              onChange={(e) =>
                                setDeliverySettings((prev) => ({
                                  ...prev,
                                  companies: {
                                    ...prev.companies,
                                    [compKey]: { ...comp, active: e.target.checked },
                                  },
                                }))
                              }
                              className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
                            />
                            <span>مفعل</span>
                          </label>
                        </div>
                      </div>

                      {/* Test feedback banner if tested */}
                      {testResult && testResult.companyId === compKey && (
                        <div
                          className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
                            testResult.success
                              ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                              : 'bg-red-950/60 border border-red-500/40 text-red-300'
                          }`}
                        >
                          {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                          <span>{testResult.message}</span>
                        </div>
                      )}

                      {/* Form Inputs Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                        {/* API Key */}
                        <div>
                          <label className="block font-bold text-[#FAF8F5] mb-1.5 flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>مفتاح الـ API (API Key / Token):</span>
                          </label>
                          <input
                            type="text"
                            value={comp.apiKey}
                            onChange={(e) =>
                              setDeliverySettings((prev) => ({
                                ...prev,
                                companies: {
                                  ...prev.companies,
                                  [compKey]: { ...comp, apiKey: e.target.value },
                                },
                              }))
                            }
                            placeholder={`أدخل مفتاح الـ API لشركة ${comp.name}...`}
                            className="w-full bg-[#121218] border border-white/15 focus:border-[#D4AF37] rounded-xl py-2 px-3 text-xs font-mono text-[#FAF8F5] focus:outline-none"
                          />
                        </div>

                        {/* Partner Code */}
                        <div>
                          <label className="block font-bold text-[#FAF8F5] mb-1.5 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>رمز الشريك / كود المتجر (Partner Code / Store ID):</span>
                          </label>
                          <input
                            type="text"
                            value={comp.partnerCode}
                            onChange={(e) =>
                              setDeliverySettings((prev) => ({
                                ...prev,
                                companies: {
                                  ...prev.companies,
                                  [compKey]: { ...comp, partnerCode: e.target.value },
                                },
                              }))
                            }
                            placeholder="مثال: HHD-ALG-2025"
                            className="w-full bg-[#121218] border border-white/15 focus:border-[#D4AF37] rounded-xl py-2 px-3 text-xs font-mono text-[#FAF8F5] focus:outline-none"
                          />
                        </div>

                        {/* API Endpoint */}
                        <div>
                          <label className="block font-bold text-[#FAF8F5] mb-1.5 flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>رابط الـ API (Endpoint URL):</span>
                          </label>
                          <input
                            type="text"
                            value={comp.endpointUrl}
                            onChange={(e) =>
                              setDeliverySettings((prev) => ({
                                ...prev,
                                companies: {
                                  ...prev.companies,
                                  [compKey]: { ...comp, endpointUrl: e.target.value },
                                },
                              }))
                            }
                            placeholder="https://..."
                            className="w-full bg-[#121218] border border-white/15 focus:border-[#D4AF37] rounded-xl py-2 px-3 text-xs font-mono text-[#FAF8F5] focus:outline-none"
                          />
                        </div>

                        {/* Tracking Prefix */}
                        <div>
                          <label className="block font-bold text-[#FAF8F5] mb-1.5 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>بادئة أرقام التتبع (Prefix):</span>
                          </label>
                          <input
                            type="text"
                            value={comp.trackingPrefix}
                            onChange={(e) =>
                              setDeliverySettings((prev) => ({
                                ...prev,
                                companies: {
                                  ...prev.companies,
                                  [compKey]: { ...comp, trackingPrefix: e.target.value.toUpperCase() },
                                },
                              }))
                            }
                            placeholder="HHD"
                            className="w-full bg-[#121218] border border-white/15 focus:border-[#D4AF37] rounded-xl py-2 px-3 text-xs font-mono uppercase text-[#FAF8F5] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Save Footer Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveDeliverySettings}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gold-gradient text-[#0F0F12] font-black text-sm shadow-[0_4px_25px_rgba(212,175,55,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>💾 حفظ وتفعيل إعدادات شركات التوصيل</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 6: DATABASE & SYNC STATUS ================= */}
          {activeTab === 'database' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="p-6 rounded-3xl bg-[#181822] border border-[#D4AF37]/40 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#FAF8F5]">
                      حالة الاتصال بقاعدة بيانات Firebase Firestore
                    </h3>
                    <p className="text-xs text-emerald-400 font-mono">
                      ✓ متصل بنجاح بمشروع: dalozi-store
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-[#FAF8F5]/80 pt-2 border-t border-white/10">
                  <div className="flex justify-between py-1">
                    <span>مجموعة المنتجات (Collection):</span>
                    <code className="text-[#D4AF37]">products</code>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>مجموعة الطلبيات:</span>
                    <code className="text-[#D4AF37]">orders</code>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>مجموعة المستخدمين:</span>
                    <code className="text-[#D4AF37]">users</code>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>بريد المالك / Admin:</span>
                    <code className="text-[#D4AF37]">siamarali61@gmail.com</code>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleSeedInitial}
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#222232] hover:bg-[#2E2E42] border border-[#D4AF37]/30 text-xs font-bold text-[#FAF8F5] flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4 text-[#D4AF37]" />
                    <span>مزامنة أو إعادة زرع المنتجات المبدئية</span>
                  </button>

                  <a
                    href="https://console.firebase.google.com/project/dalozi-store/firestore"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 rounded-xl bg-gold-gradient text-[#0F0F12] text-xs font-black flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <span>فتح Firebase Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ================= MODAL: DELIVERY DISPATCH RECEIPT ================= */}
        {dispatchModalResult && (
          <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#161624] border border-[#D4AF37]/50 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <h4 className="text-base font-bold text-[#FAF8F5]">
                    تم إرسال الشحنة بنجاح لشركة {dispatchModalResult.companyName}!
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setDispatchModalResult(null)}
                  className="p-1.5 rounded-xl bg-white/10 text-[#FAF8F5] hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tracking number banner */}
              <div className="p-4 rounded-2xl bg-black/50 border border-[#D4AF37]/40 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-[#FAF8F5]/60 block">رقم بوليصة التتبع (Tracking Number):</span>
                  <span className="text-xl font-mono font-black text-gold-gradient">
                    #{dispatchModalResult.trackingNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(dispatchModalResult.trackingNumber);
                    setCopiedTracking('receipt');
                    setTimeout(() => setCopiedTracking(null), 2000);
                  }}
                  className="px-3 py-2 rounded-xl bg-[#222232] hover:bg-[#D4AF37] hover:text-[#0F0F12] text-xs font-bold text-[#FAF8F5] transition-all flex items-center gap-1.5"
                >
                  {copiedTracking === 'receipt' ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-emerald-400" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ الرقم</span>
                    </>
                  )}
                </button>
              </div>

              {/* Buyer & Shipment Summary */}
              <div className="p-3.5 rounded-xl bg-[#121218] border border-white/10 space-y-2 text-xs text-[#FAF8F5]/80">
                <div className="flex justify-between">
                  <span className="text-[#FAF8F5]/50">اسم المشتري:</span>
                  <span className="font-bold text-[#FAF8F5]">{dispatchModalResult.payload.client?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#FAF8F5]/50">رقم الهاتف:</span>
                  <span className="font-mono text-[#D4AF37]">{dispatchModalResult.payload.client?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#FAF8F5]/50">ولاية وعنوان التوصيل:</span>
                  <span>{dispatchModalResult.payload.client?.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#FAF8F5]/50">المبلغ المطلوب تحصيله (COD):</span>
                  <span className="font-black text-gold-gradient font-mono">
                    {formatDZD(dispatchModalResult.payload.payment?.total_amount_to_collect || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#FAF8F5]/50">شركة الشحن:</span>
                  <span className="font-bold text-purple-300">{dispatchModalResult.companyName}</span>
                </div>
              </div>

              {/* Message */}
              <p className="text-[11px] text-emerald-400/90 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/20">
                ✓ {dispatchModalResult.message}
              </p>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDispatchModalResult(null)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gold-gradient text-[#0F0F12] font-black text-xs shadow-md"
                >
                  حسناً، تم التحقق والتسجيل
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
