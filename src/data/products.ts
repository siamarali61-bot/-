import { Product } from '../types';

import imgAuraViolet from '../assets/images/aura_violet_qandoura_1790546077690.jpg';
import imgAuraDetail from '../assets/images/aura_qandoura_detail_1790546142105.jpg';
import imgHudaAbaya from '../assets/images/huda_silk_abaya_1790546087932.jpg';
import imgHudaDetail from '../assets/images/huda_abaya_detail_1790546155664.jpg';
import imgMensSuit from '../assets/images/mens_tailored_suit_1790546099162.jpg';
import imgMensDetail from '../assets/images/mens_suit_detail_1790546167136.jpg';
import imgSweets from '../assets/images/algerian_luxury_sweets_1790546109477.jpg';
import imgPastryBox from '../assets/images/luxury_pastry_box_1790546176275.jpg';
import imgCatering from '../assets/images/catering_savory_buffet_1790546119546.jpg';
import imgSkincare from '../assets/images/hm_dalozi_skincare_1790546128691.jpg';

export const STORE_PHONE_NUMBER = "213672330936";
export const STORE_WHATSAPP_NUMBER = "213672330936";

export const PRODUCTS: Product[] = [
  {
    id: "aura-violet-velvet",
    title: "Aura Collection - Royal Violet Velvet Qandoura",
    titleAr: "تشكيلة أورا - قندورة قطيفة بنفسجية ملكية بالطرز الذهبي",
    collection: "Aura Collection",
    category: "women-fashion",
    subCategoryId: "women-winter-events",
    season: "autumn-winter",
    price: 18500,
    originalPrice: 22000,
    rating: 5.0,
    reviewsCount: 48,
    badge: "الأكثر مبيعاً",
    badgeEn: "BEST SELLER",
    images: [imgAuraViolet, imgAuraDetail],
    descriptionAr: "قطعة فاخرة وحصرية من تشكيلة أورا (Aura Collection). مصنوعة من أجود أنواع القطيفة الملكية الفاخرة مع طرز مجبود ذهبي يدوي متقن على الصدر والأكمام. تأتي في علبة هدايا دالوزي الفاخرة مع شهادة الأصالة.",
    descriptionEn: "Opulent royal violet velvet Algerian Qandoura featuring handcrafted gold bullion embroidery along the neckline and cuffs. Delivered in our signature luxury presentation box.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Royal Violet", nameAr: "بنفسجي ملكي", hex: "#4C1D95" },
      { name: "Emerald Green", nameAr: "أخضر زمردي", hex: "#064E3B" },
      { name: "Midnight Navy", nameAr: "كحلي داكن", hex: "#0F172A" },
      { name: "Bordeaux", nameAr: "عنابي ملكي", hex: "#831843" }
    ],
    customerQuote: {
      text: "Produit conforme et livraison très rapide! La finition est d'une élégance rare.",
      author: "دليلة ب.",
      city: "الجزائر العاصمة"
    },
    features: [
      "قطيفة ملكية كورية عالية الكثافة للمواسم الباردة",
      "طرز خيط الذهب الأصيل المقاوم للبهتان",
      "علبة هدايا سوداء ومذهبة مجانية",
      "توصيل آمن مع إمكانية الفحص قبل الدفع"
    ],
    inStock: true,
    instagramHandle: "@dalozi_couture",
    instagramPostUrl: "https://www.instagram.com/p/aura_violet/"
  },
  {
    id: "summer-ceremony-caftan",
    title: "Summer Silk Wedding & Graduation Caftan",
    titleAr: "قفطان صيفي حريري ملكي للمناسبات وحفلات التخرج والأعراس",
    collection: "Aura Summer Glow",
    category: "women-fashion",
    subCategoryId: "women-summer-events",
    season: "spring-summer",
    price: 17900,
    originalPrice: 21000,
    rating: 5.0,
    reviewsCount: 31,
    badge: "جديد",
    badgeEn: "NEW",
    images: [imgHudaAbaya, imgHudaDetail],
    descriptionAr: "قفطان صيفي خفيف من حرير الساتان الإيطالي الانسيابي، مصمم خصيصاً لأفراح الصيف وحفلات التخرج. يتميز بقصة مريحة وتطريز ناعم بخيوط الفضة والذهب مع حزام ملكي مدمج.",
    descriptionEn: "Lightweight summer Italian silk caftan designed for warm weather weddings, graduation ceremonies, and galas with refined metallic piping.",
    sizes: ["38", "40", "42", "44", "46"],
    colors: [
      { name: "Champagne Blush", nameAr: "شامبين صيفي", hex: "#EAD7C5" },
      { name: "Pastel Mint", nameAr: "أخضر نعناعي باستيل", hex: "#A7F3D0" },
      { name: "Sky Azure", nameAr: "أزرق سماوي", hex: "#BAE6FD" }
    ],
    features: [
      "حرير صيفي بارد وخفيف ومقاوم للحرارة",
      "تطريز خفيف لا يثقل الحركة في الحفلات",
      "حزام مجدول مذهب متناسق مجاناً"
    ],
    inStock: true,
    instagramHandle: "@dalozi_couture"
  },
  {
    id: "huda-silk-abaya",
    title: "Huda Hijab / Abirach Style - Silk Modest Abaya",
    titleAr: "عباية حريرية فاخرة وأطقم صلاة بنمط هدى حجاب / أزياء عبيرش",
    collection: "Huda Hijab & Modest",
    category: "women-fashion",
    subCategoryId: "women-summer-hijab-prayer",
    season: "spring-summer",
    price: 14500,
    originalPrice: 16800,
    rating: 4.9,
    reviewsCount: 36,
    badge: "الأكثر مبيعاً",
    badgeEn: "BEST SELLER",
    images: [imgHudaAbaya, imgHudaDetail],
    descriptionAr: "عباية حرير وميدنايت شيفون استثنائية مصممة بألوان الباستيل الهادئة والمريحة، مستوحاة من نمط هدى حجاب الأنيق وستوديو عبيرش. تتميز بحواف ذهبية ناعمة وانسيابية رائعة مع طرحة متناسقة وأطقم صلاة حريرية.",
    descriptionEn: "High-end modest luxury pastel champagne silk abaya with subtle gold piping, matching premium chiffon hijab, and fluid silhouette.",
    sizes: ["52", "54", "56", "58", "60"],
    colors: [
      { name: "Champagne Blush", nameAr: "شامبين بودري", hex: "#EAD7C5" },
      { name: "Pearl Rose", nameAr: "وردي لؤلؤي", hex: "#F3E8EE" },
      { name: "Sage Pastel", nameAr: "أخضر باستيل هادئ", hex: "#CBD5C0" },
      { name: "Soft Ivory", nameAr: "عاجي فاخر", hex: "#FAF8F5" }
    ],
    customerQuote: {
      text: "القماش روعة وخفيف، الحجاب متناسق تماماً والتغليف يفتح النفس ما شاء الله.",
      author: "ياسمين م.",
      city: "وهران"
    },
    features: [
      "حرير ميديوم مدعم ضد التكسر مناسب للربيع والصيف",
      "طقم حجاب شيفون تركي فاخر مدمج مجاناً",
      "قصّة مستقيمة وانسيابية تناسب كل المناسبات والصلوات"
    ],
    inStock: true
  },
  {
    id: "summer-bridal-homewear",
    title: "Luxury Silk Bridal Homewear & Robe Set",
    titleAr: "طقم ملابس منزلية وروب حريري للعرائس والعازبات",
    collection: "Dalozi Intimates",
    category: "women-fashion",
    subCategoryId: "women-summer-homewear",
    season: "spring-summer",
    price: 9800,
    originalPrice: 12000,
    rating: 4.9,
    reviewsCount: 18,
    badge: "جديد",
    badgeEn: "NEW",
    images: [imgHudaDetail, imgHudaAbaya],
    descriptionAr: "طقم منزلي فاخر يتكون من قطعتين (بيجامة حريرية انسيابية مع روب دانتيل فرنسي راقٍ). مخصص لجهاز العروس والراحة المنزلية للعازبات والمتزوجات بملمس فائق النعومة.",
    descriptionEn: "Luxury 2-piece silk loungewear and bridal robe crafted with French lace trims, designed for refined home comfort.",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Ivory Silk", nameAr: "حرير عاجي", hex: "#FAF8F5" },
      { name: "Blush Rose", nameAr: "وردي بودري", hex: "#FCE7F3" }
    ],
    features: [
      "حرير خفيف وناعم مناسب للأجواء الصيفية والمنزل",
      "دانتيل فرنسي مطرز على الأكمام والأطراف",
      "تغليف هدية راقٍ مخصص لجهاز العروس"
    ],
    inStock: true
  },
  {
    id: "mens-tailored-ensemble",
    title: "Men's Luxury Semi-Formal Outfit & Trousers",
    titleAr: "طقم رجالي فاخر نصف رسمي للعمل واللقاءات الرسمية",
    collection: "HM Dalozi Man",
    category: "mens-apparel",
    subCategoryId: "mens-formal-business",
    season: "all-season",
    price: 16900,
    originalPrice: 19500,
    rating: 4.9,
    reviewsCount: 42,
    badge: "حصري",
    badgeEn: "EXCLUSIVE",
    images: [imgMensSuit, imgMensDetail],
    descriptionAr: "إطلالة رجالية راقية تجمع بين السترة نصف الرسمية، والقميص الأبيض الفاخر من القطن المصري، والبنطال المستقيم المتقن. متوفرة في لوحات ألوان حصرية منسقة بعناية للمناسبات الرسمية وبيئات العمل الراقية.",
    descriptionEn: "Men's semi-formal tailored outfit pairing structured blazer, pure cotton shirt, and tailored trousers with custom curated palette swatches.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Bordeaux / Navy / White", nameAr: "عنابي / كحلي / أبيض", hex: "#581C87" },
      { name: "Olive / Forest / Beige", nameAr: "زيتي / أخضر غابي / بيج", hex: "#3F6212" },
      { name: "Earthy Brown / Tan / Espresso", nameAr: "بني ترابي / تان / إسبريسو", hex: "#78350F" }
    ],
    customerQuote: {
      text: "Costume de très haute qualité, coupe impeccable et tissu noble. Livraison en 24h à Alger.",
      author: "أمين ك.",
      city: "الجزائر العاصمة"
    },
    features: [
      "صوف خفيف مخلوط بالموهير مناسب لجميع الفصول",
      "قميص قطن مصري 100% مقاوم للتجعد",
      "قصة سليم فت عصرية مريحة مع تفصيل إيطالي",
      "أزرار محفورة بشعار DALOZI"
    ],
    inStock: true
  },
  {
    id: "mens-wedding-suit-gala",
    title: "Men's Italian Three-Piece Wedding & Gala Tuxedo",
    titleAr: "بدلة رجالية إيطالية ملكية 3 قطع للأعراس والمناسبات الفخمة",
    collection: "HM Dalozi Man VIP",
    category: "mens-apparel",
    subCategoryId: "mens-events-weddings",
    season: "all-season",
    price: 26500,
    originalPrice: 31000,
    rating: 5.0,
    reviewsCount: 27,
    badge: "الأكثر مبيعاً",
    badgeEn: "BEST SELLER",
    images: [imgMensDetail, imgMensSuit],
    descriptionAr: "بدلة أعراس ملكية متكاملة من 3 قطع (سترة، صدرية مطرزة، وبنطال) مصممة من الصوف الإيطالي الفاخر مع ياقة ساتان سوداء أنيقة تمنح العريس هيبة استثنائية في ليلة العمر.",
    descriptionEn: "Full 3-piece Italian tuxedo tailored with pure super 140s wool, satin peak lapels, and tailored vest for weddings and galas.",
    sizes: ["46", "48", "50", "52", "54", "56"],
    colors: [
      { name: "Midnight Black Tux", nameAr: "أسود ملكي سموكي", hex: "#000000" },
      { name: "Royal Navy Satin", nameAr: "كحلي ملكي بساتان", hex: "#0F172A" }
    ],
    features: [
      "تفصيل إيطالي متقن يعزز القوام",
      "صدرية متناسقة مع ربطة عنق حريرية مجاناً",
      "تعديل مجاني للمقاس في حال الطلب مسبقاً"
    ],
    inStock: true
  },
  {
    id: "mens-prayer-set-jabador",
    title: "Royal Traditional Algerian Jabador & Prayer Attire",
    titleAr: "جبادور وطقم صلاة رجالي فاخر مطرز بنمط وهراني وقسنطيني أصيل",
    collection: "HM Dalozi Heritage",
    category: "mens-apparel",
    subCategoryId: "mens-prayer-sets",
    season: "all-season",
    price: 15500,
    originalPrice: 18000,
    rating: 4.9,
    reviewsCount: 34,
    badge: "جديد",
    badgeEn: "NEW",
    images: [imgMensSuit, imgMensDetail],
    descriptionAr: "جبادور تقليدي أصيل مطرز بخيوط الحرير على الصدر والياقة مع سروال تقليدي متناسق وسجادة صلاة مبطنة. مثالي لصلاة الجمعة، الأعياد الدينية، ومناسبات عقد القران (الفاتحة).",
    descriptionEn: "Authentic Algerian Jabador embroidered with silk threads, paired with matching traditional trousers and padded prayer mat.",
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      { name: "Pure White Gold", nameAr: "أبيض ملكي مطرز بالذهب", hex: "#FFFFFF" },
      { name: "Creamy Beige", nameAr: "بيج كريمي فاخر", hex: "#F5F5DC" }
    ],
    features: [
      "قماش كريب صالوني بارد ومريح للصلاة والتحرك",
      "طرز يدوي متقن لا يبهت مع الغسيل",
      "مرفق بسجادة صلاة فاخرة مخملية كهدية"
    ],
    inStock: true
  },
  {
    id: "algerian-royal-sweets",
    title: "Royal Algerian Pastry & Sweets Hamper",
    titleAr: "صندوق حلويات الأعراس والخطوبة الملكي (بقلاوة، مشوك، ومقروط اللوز)",
    collection: "Dalozi Patisserie",
    category: "sweets-bakery",
    subCategoryId: "sweets-weddings",
    season: "all-season",
    price: 9800,
    originalPrice: 11500,
    rating: 5.0,
    reviewsCount: 64,
    badge: "الأكثر مبيعاً",
    badgeEn: "BEST SELLER",
    images: [imgSweets, imgPastryBox],
    descriptionAr: "تشكيلة أرستقراطية من أرقى الحلويات الجزائرية التقليدية المحضرة يدوياً بنسبة 100% من اللوز الصافي وعسل البرتقال الطبيعي. تحتوي على 36 قطعة مختارة (بقلاوة مورقة باللوز، مشوك ملكي، مقروط اللوز، وتشاراك مسكر).",
    descriptionEn: "Aristocratic selection of traditional Algerian handcrafted sweets made with 100% pure almonds, orange blossom honey, and toasted pistachios.",
    sizes: ["علبة 24 قطعة (صغير)", "علبة 36 قطعة (متوسط)", "علبة 50 قطعة (عائلي فاخر)"],
    customerQuote: {
      text: "حلوى أعراسنا كلها كانت من دالوزي، البقلاوة تذوب في الفم واللوز طري وريحته زهرية.",
      author: "خديجة س.",
      city: "قسنطينة"
    },
    features: [
      "100% لوز صافي مطحون ومحمص طبيعياً",
      "عسل طبيعي خالص وماء الزهر المقطر",
      "صندوق هدايا كرتوني أسود وذهبي مع شريط ساتان",
      "تحضير طازج يومياً عند الطلب"
    ],
    inStock: true,
    preparationTime: "تحضير فوري / طازج يومياً"
  },
  {
    id: "luxury-event-cake",
    title: "Custom Haute Couture Birthday & Event Cake",
    titleAr: "كيك وحلويات أعياد الميلاد والمناسبات الفاخرة - تصميم بالذهب",
    collection: "Dalozi Patisserie",
    category: "sweets-bakery",
    subCategoryId: "sweets-birthdays",
    season: "all-season",
    price: 12500,
    originalPrice: 14000,
    rating: 5.0,
    reviewsCount: 19,
    badge: "جديد",
    badgeEn: "NEW",
    images: [imgPastryBox, imgSweets],
    descriptionAr: "كيك احتفالي فاخر مصمم حسب رغبتكم للمناسبات الخاصة والخطوبات وأعياد الميلاد. طبقات من الكيك الرطب الغني بالبراليني وحشوة الجوز والكراميل المملح، مغطاة بكريمة سويسرية حريرية ولمسات الذهب الصالحة للأكل.",
    descriptionEn: "Bespoke luxury celebration and wedding cake with layers of moist sponge, roasted hazelnut praline, and edible gold leaf finish.",
    sizes: ["10 إلى 15 شخص", "20 إلى 25 شخص", "35 إلى 40 شخص"],
    customerQuote: {
      text: "الكيك كان نجم الحفلة، المذاق خفيف ومش حلو بزيادة، والديكور خيالي.",
      author: "سيرين ب.",
      city: "الجزائر العاصمة"
    },
    features: [
      "إمكانية كتابة الاسم وتخصيص الألوان والمذاق",
      "شوكولاتة بلجيكية فاخرة ومكسرات طازجة",
      "توصيل مبرد في سيارات مجهزة للحفاظ على قوام الكيك",
      "حجز مسبق مع استشارة مجانية لمصممة الحفل"
    ],
    inStock: true,
    preparationTime: "يتطلب الطلب قبل 48 ساعة"
  },
  {
    id: "sweets-graduation-hamper",
    title: "Success & Graduation Golden Sweets Hamper",
    titleAr: "صينية حلويات النجاح والتخرج باللوز والمجسمات الذهبية المبهجة",
    collection: "Dalozi Patisserie",
    category: "sweets-bakery",
    subCategoryId: "sweets-graduations",
    season: "all-season",
    price: 8900,
    originalPrice: 10500,
    rating: 5.0,
    reviewsCount: 23,
    badge: "الأكثر طلباً",
    badgeEn: "POPULAR",
    images: [imgSweets, imgPastryBox],
    descriptionAr: "صندوق احتفالي خاص بالناجحين والمتخرجين (شهادة البكالوريا، الماستر والدكتوراه)، يضم تشكيلة كرات الرافاييلو باللوز، الصابلي المذهب مع مجسمات قبعة التخرج بالشكولاطة البلجيكية.",
    descriptionEn: "Custom graduation celebratory sweets box decorated with chocolate graduation motifs and edible golden dust.",
    sizes: ["صينية 30 قطعة", "صينية 50 قطعة VIP"],
    features: [
      "تصميم مبهج مع بطاقة تهنئة مخصصة باسم المتخرج",
      "مكسرات منتقاة وشكولاطة بريميوم",
      "توصيل سريع لكافة الولايات للاحتفال في الوقت المناسب"
    ],
    inStock: true
  },
  {
    id: "gourmet-savory-buffet",
    title: "Luxury Event Buffet & Savory Trays (100 Pieces)",
    titleAr: "بوفيه مفتوح ملكي متكامل للمناسبات والأعراس (Open Buffet 100P)",
    collection: "Dalozi Catering",
    category: "catering-buffet",
    subCategoryId: "buffet-royal-open",
    season: "all-season",
    price: 13900,
    originalPrice: 15500,
    rating: 5.0,
    reviewsCount: 29,
    badge: "حصري",
    badgeEn: "EXCLUSIVE",
    images: [imgCatering],
    descriptionAr: "تشكيلة مقبلات ومملحات فاخرة مصممة لأرقى الحفلات، الخطوبات والاجتماعات الراقية. تتضمن ميني برغر باللحم المتبل والشيدر الذهبي، شو مالح بالسلمون المدخن، كورني مقرمش، وفيرين الغورميه المزينة بأوراق الذهب الصالحة للأكل.",
    descriptionEn: "Prestigious Algerian savory party buffet featuring artisanal mini burgers, smoked salmon salted choux, crispy cornettes, and gourmet verrines.",
    sizes: ["صينية 50 قطعة", "بوفيه 100 قطعة", "بوفيه مناسبات VIP 150 قطعة"],
    customerQuote: {
      text: "كل المعازيم عجبهم البوفيه! المنظر يحمّر الوجه والمذاق قمة في الرقي.",
      author: "نادية ر.",
      city: "البليدة"
    },
    features: [
      "مكونات طازجة عالية الجودة ومصدر موثوق",
      "تزيين راقٍ بلمسات الذهب الغذائي",
      "صواني تقديم حرارية تحافظ على القرمشة والحرارة",
      "خدمة التوصيل السريع إلى قاعات الحفلات والمنازل"
    ],
    inStock: true,
    preparationTime: "يُحضر حسب الطلب خلال 24 - 48 ساعة"
  },
  {
    id: "wedding-canapes-trays",
    title: "Prestigious Wedding Trays & Cold Finger Foods",
    titleAr: "صواني أفراح ومقبلات برستيج (كانابيه، ميني كيش، وتارتلات مالحة)",
    collection: "Dalozi Catering",
    category: "catering-buffet",
    subCategoryId: "buffet-wedding-trays",
    season: "all-season",
    price: 11500,
    originalPrice: 13000,
    rating: 4.9,
    reviewsCount: 16,
    badge: "جديد",
    badgeEn: "NEW",
    images: [imgCatering],
    descriptionAr: "صواني برستيج أنيقة مجهزة لتقديمها مباشرة على طاولات ضيوف الأعراس وحفلات الخطوبة. تشكيلة باردة ودافئة تتضمن تارتلات كبد الأوز، كانابيه الجبن المعتق، وميني كيش السبانخ والجبن الفرنسي.",
    descriptionEn: "High-end wedding trays designed for direct guest service with assortment of savory tarts, artisanal cheeses, and gourmet appetizers.",
    sizes: ["صينية 60 قطعة", "صينية 90 قطعة"],
    features: [
      "صواني ذهبية فاخرة جاهزة للتقديم المباشر",
      "مكونات طازجة وصحية 100%",
      "تناسق لوني مبهر يضفي فخامة على موائد الأعراس"
    ],
    inStock: true
  },
  {
    id: "hm-dalozi-skincare-patches",
    title: "HM Dalozi - Botanical Prickly Pear & Argan Radiance Elixir",
    titleAr: "إكسير النضارة النباتي الفاخر HM Dalozi - زيت التين الشوكي والأرغان",
    collection: "HM Dalozi Beauty",
    category: "beauty-cosmetics",
    subCategoryId: "beauty-skincare-elixirs",
    season: "all-season",
    price: 4900,
    originalPrice: 6200,
    rating: 4.8,
    reviewsCount: 53,
    badge: "100% طبيعي",
    badgeEn: "NATURAL",
    images: [imgSkincare],
    descriptionAr: "روتين العناية المتكامل والمحبوب من HM Dalozi. إكسير طبيعي غني بزيت بذور التين الشوكي الجزائري النادر وزيت الأرغان الصافي مع قطرات ماء الورد الجبلي لترطيب عميق ونضارة مخملية تدوم طويلاً.",
    descriptionEn: "Complete HM Dalozi luxury skincare regimen powered by pure Algerian prickly pear seed oil, organic argan, and botanical extracts.",
    sizes: ["زجاجة فاخرة 50 مل", "طقم العناية المتكامل (سيروم + لصقات المسام)"],
    customerQuote: {
      text: "بصراحة أفضل زيت جربته في الجزائر، ينعم البشرة ويفتحها بدون أثر دهني.",
      author: "مريم ع.",
      city: "سطيف"
    },
    features: [
      "مستخلصات نباتية مهدئة للبشرة الحساسة",
      "زيت بذور التين الشوكي النقي المقاوم للتجاعيد",
      "نتائج فورية ملحوظة من أول أسبوع",
      "معتمدة من أطباء الجلدية وآمنة تماماً"
    ],
    inStock: true
  },
  {
    id: "royal-oud-parfum-dalozi",
    title: "Royal Agarwood & Amber Prestige Eau de Parfum",
    titleAr: "عطر دهن العود الملكي والعنبر الفاخر مع بخور المناسبات",
    collection: "HM Dalozi Fragrance",
    category: "beauty-cosmetics",
    subCategoryId: "beauty-luxury-perfumes",
    season: "all-season",
    price: 8500,
    originalPrice: 10500,
    rating: 5.0,
    reviewsCount: 38,
    badge: "حصري",
    badgeEn: "EXCLUSIVE",
    images: [imgSkincare],
    descriptionAr: "عطر شرقي ملكي يجمع بين دهن العود الكمبودي النادر، نفحات العنبر الدافئ، وعبير الورد الطائفي. يدوم ثباته أكثر من 48 ساعة على الملابس ويأتي مع علبة بخور مذهبة كهدية.",
    descriptionEn: "Regal Eau de Parfum blending rare Cambodian agarwood, amber, and Taif rose with exceptional 48-hour longevity.",
    sizes: ["زجاجة كريستال 100 مل", "طقم العطر + بخور ملكي"],
    features: [
      "تركيز نقي عالي (Extrait de Parfum)",
      "ثبات وفوحان استثنائي للأعراس والمناسبات الكبرى",
      "زجاجة كريستالية بغطاء مذهب في علبة هدايا ملكية"
    ],
    inStock: true
  },
  {
    id: "aura-emerald-kaftan",
    title: "Aura Collection - Royal Emerald Green Velvet Dress",
    titleAr: "تشكيلة أورا - قندورة قطيفة زمردية شتوية ملكية بالطرز السطايفي",
    collection: "Aura Collection",
    category: "women-fashion",
    subCategoryId: "women-winter-events",
    season: "autumn-winter",
    price: 19200,
    originalPrice: 23500,
    rating: 4.9,
    reviewsCount: 22,
    badge: "حصري",
    badgeEn: "EXCLUSIVE",
    images: [imgAuraDetail, imgAuraViolet],
    descriptionAr: "تحفة فنية تجمع عراقة التراث الجزائري مع الفخامة الحديثة. لون زمردي عميق على قماش قطيفة ملكي حريري دافئ، مع تطريز خيوط الفتلة الذهبية والكرستال النمساوي اللامع على الصدر والأكمام.",
    descriptionEn: "Masterpiece emerald green velvet dress with authentic Algerian Fetla embroidery and Austrian crystal embellishments.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Emerald Green", nameAr: "أخضر زمردي", hex: "#064E3B" },
      { name: "Royal Violet", nameAr: "بنفسجي ملكي", hex: "#4C1D95" },
      { name: "Midnight Black", nameAr: "أسود ملكي", hex: "#111827" }
    ],
    customerQuote: {
      text: "أناقة لا توصف! القندورة في الحقيقة أجمل بكثير من الصور.",
      author: "فايزة ك.",
      city: "تلمسان"
    },
    features: [
      "قطيفة أصلية فاخرة غير متغيرة بالكي أو الغسيل الجاف",
      "تطريز ذهبي يدوي بحرفية جزائرية عريقة",
      "حزام كرستالي قابل للتعديل مدمج",
      "شحن سريع ومجاني للطلبات فوق 15,000 د.ج"
    ],
    inStock: true,
    instagramHandle: "@dalozi_couture"
  }
];

export const CATEGORIES_LIST = [
  { id: 'all' as const, labelAr: 'جميع المعروضات', labelEn: 'All Collections' },
  { id: 'women-fashion' as const, labelAr: 'الملابس النسائية والقفاطين', labelEn: "Women's Fashion & Caftans" },
  { id: 'mens-apparel' as const, labelAr: 'أزياء رجالية راقية', labelEn: "Men's Apparel" },
  { id: 'sweets-bakery' as const, labelAr: 'حلويات وكيك فاخر', labelEn: 'Pastries & Bakery' },
  { id: 'catering-buffet' as const, labelAr: 'مملحات وبوفيهات (Catering)', labelEn: 'Catering & Buffets' },
  { id: 'beauty-cosmetics' as const, labelAr: 'العناية والتجميل (HM Dalozi)', labelEn: 'HM Dalozi Beauty' },
];
