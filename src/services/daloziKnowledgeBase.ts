import { ALGERIA_WILAYAS } from '../data/wilayas';
import { Language, Wilaya } from '../types';

export const STORE_PHONE_NUMBER = "0672330936";
export const STORE_WHATSAPP_NUMBER = "213672330936";

export interface KnowledgeBaseResponse {
  text: string;
  matchedCategory: 'delivery' | 'guarantee' | 'products' | 'sizing' | 'human_handoff' | 'general';
  confidence: number;
  sources?: Array<{ title: string; uri: string }>;
  whatsappHandoffUrl: string;
  detectedWilaya?: Wilaya;
}

/**
 * Clean & normalize text for robust matching in Arabic, French, and Algerian Darija
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '') // remove Arabic diacritics
    .replace(/[éèêë]/g, 'e')
    .replace(/[àâä]/g, 'a')
    .replace(/[ùûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .trim();
}

/**
 * Detect Wilaya from text by code (1-58) or Arabic/French name
 */
export function detectWilayaFromQuery(query: string): Wilaya | undefined {
  const norm = normalizeText(query);

  // 1. Try matching wilaya numbers like "16", "31", "19", "09", "ولاية 16"
  const numberMatch = query.match(/(?:ولاية|wilaya|code)?\s*([0-5]?[0-9])/i);
  if (numberMatch && numberMatch[1]) {
    const codeNum = parseInt(numberMatch[1], 10);
    if (codeNum >= 1 && codeNum <= 58) {
      const found = ALGERIA_WILAYAS.find((w) => w.code === codeNum);
      if (found) return found;
    }
  }

  // 2. Try matching wilaya names
  for (const w of ALGERIA_WILAYAS) {
    const normAr = normalizeText(w.nameAr);
    const normFr = normalizeText(w.nameFr);

    if (norm.includes(normAr) || norm.includes(normFr)) {
      return w;
    }

    // Special Algerian variants
    if (w.code === 16 && (norm.includes('عاصمة') || norm.includes('alger') || norm.includes('دزاير'))) {
      return w;
    }
    if (w.code === 31 && (norm.includes('وهران') || norm.includes('oran') || norm.includes('الباهية'))) {
      return w;
    }
    if (w.code === 19 && (norm.includes('سطيف') || norm.includes('setif') || norm.includes('العالي'))) {
      return w;
    }
    if (w.code === 25 && (norm.includes('قسنطينة') || norm.includes('constantine') || norm.includes('سيرتا'))) {
      return w;
    }
    if (w.code === 23 && (norm.includes('عنابة') || norm.includes('annaba') || norm.includes('بونة'))) {
      return w;
    }
  }

  return undefined;
}

/**
 * Generate a pre-filled WhatsApp handoff link
 */
export function generateWhatsAppHandoffUrl(customerQuery?: string): string {
  const cleanPhone = STORE_WHATSAPP_NUMBER.replace(/\D/g, '');
  const baseMsg = customerQuery
    ? `مرحباً دالوزي ستور، استفسار من المتجر بخصوص: "${customerQuery.trim()}"`
    : `مرحباً دالوزي ستور، أود الاستفسار والتحدث مع مستشار المبيعات.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(baseMsg)}`;
}

/**
 * Core Knowledge-Base Engine:
 * Answers all customer inquiries with rich, formatted Algerian context even if Gemini API is offline.
 */
export function resolveKnowledgeBaseQuery(query: string, lang: Language = 'ar'): KnowledgeBaseResponse {
  const norm = normalizeText(query);
  const isAr = lang === 'ar';
  const whatsappUrl = generateWhatsAppHandoffUrl(query);

  // 1. Check for Wilaya Delivery inquiries
  const detectedWilaya = detectWilayaFromQuery(query);
  const hasDeliveryKeywords =
    norm.includes('توصيل') ||
    norm.includes('livraison') ||
    norm.includes('delivery') ||
    norm.includes('شحن') ||
    norm.includes('ليفريزو') ||
    norm.includes('شحال التوصيل') ||
    norm.includes('سعر التوصيل') ||
    norm.includes('تكلفة التوصيل') ||
    norm.includes('وقت يوصل') ||
    norm.includes('وقتاش يوصل') ||
    norm.includes('كم يوم') ||
    norm.includes('délai') ||
    norm.includes('frais') ||
    norm.includes('58 ولاية');

  if (detectedWilaya) {
    const textAr = `✦ **تفاصيل التوصيل لولاية ${detectedWilaya.code} - ${detectedWilaya.nameAr} (${detectedWilaya.nameFr})**:

🚚 **التوصيل لباب المنزل (À domicile)**: ${detectedWilaya.homeDeliveryPrice.toLocaleString()} دج
🏢 **التوصيل لنقطة الاستلام (Stop Desk)**: ${detectedWilaya.deskDeliveryPrice.toLocaleString()} دج
⏱️ **مدة الوصول المقدرة**: ${detectedWilaya.deliveryDays}

💎 **ملاحظة ذهبية**: الشحن **مجاني تماماً** للطلبيات التي تتجاوز 30,000 دج!
🛡️ **ضمان دالوزي**: يحق لك فتح الطرد ومعاينة الطلبية بدقة قبل دفع أي دينار للموزع (الدفع عند الاستلام).`;

    const textFr = `✦ **Détails de livraison pour la Wilaya ${detectedWilaya.code} - ${detectedWilaya.nameFr}**:

🚚 **Livraison à domicile**: ${detectedWilaya.homeDeliveryPrice.toLocaleString()} DZD
🏢 **Livraison Stop Desk (Bureau)**: ${detectedWilaya.deskDeliveryPrice.toLocaleString()} DZD
⏱️ **Délai estimé**: ${detectedWilaya.deliveryDays}

💎 **Offre Prestige**: Livraison **GRATUITE** dès 30 000 DZD d'achats !
🛡️ **Garantie Dalozi**: Paiement à la livraison après ouverture et vérification du colis.`;

    return {
      text: isAr ? textAr : textFr,
      matchedCategory: 'delivery',
      confidence: 0.98,
      whatsappHandoffUrl: whatsappUrl,
      detectedWilaya,
    };
  }

  if (hasDeliveryKeywords) {
    const textAr = `✦ **سياسة الشحن والتوصيل لجميع ولايات الوطن (58 ولاية)**:

🚚 **تغطية شاملة**: نوفر الشحن السريع لباب الدار أو للمكتب (Stop Desk) في كل الجزائر:
• **الجزائر العاصمة والبليدة وبومرداس وتيبازة**: توصيل سريع خلال 24 ساعة (من 450 إلى 500 دج).
• **ولايات الوسط والشرق والغرب (وهران، سطيف، قسنطينة، تلمسان، عنابة، باتنة...)**: 1 إلى 2 أيام (من 650 إلى 700 دج).
• **ولايات الهضاب والجنوب**: 2 إلى 4 أيام (من 800 إلى 950 دج).
• **الجنوب الكبير (تمنراست، إليزي، تندوف، جانت)**: 4 إلى 6 أيام (من 1300 إلى 1500 دج).

🎁 **الشحن المجاني**: للطلبيات التي تصل قيمتها إلى 30,000 دج فأكثر.
🔍 **يمكنك كتابة اسم ولايتك أو رقمها (مثال: سطيف أو 19) لحساب التكلفة بدقة فوراً!**`;

    const textFr = `✦ **Politique de livraison dans les 58 Wilayas d'Algérie**:

🚚 **Couverture nationale**: Livraison rapide à domicile ou en point relais Stop Desk:
• **Alger, Blida, Tipaza, Boumerdès**: 24h chrono (450 à 500 DZD).
• **Nord, Est et Ouest (Oran, Sétif, Constantine, Annaba...)**: 1 à 2 jours (650 à 700 DZD).
• **Hauts plateaux et Sud**: 2 à 4 jours (800 à 950 DZD).
• **Grand Sud (Tamanrasset, Tindouf, Djanet...)**: 4 à 6 jours.

🎁 **Livraison GRATUITE** dès 30 000 DZD de commande !
🔍 **Indiquez le nom ou numéro de votre wilaya (ex: 16 ou Oran) pour obtenir le tarif précis.**`;

    return {
      text: isAr ? textAr : textFr,
      matchedCategory: 'delivery',
      confidence: 0.95,
      whatsappHandoffUrl: whatsappUrl,
    };
  }

  // 2. Check for Guarantee & Inspection before payment (حق المعاينة والدفع عند الاستلام)
  const hasGuaranteeKeywords =
    norm.includes('معاينه') ||
    norm.includes('فحص') ||
    norm.includes('فتح الطرد') ||
    norm.includes('نفتح الكوليه') ||
    norm.includes('نفتح الطرد') ||
    norm.includes('نقيس') ||
    norm.includes('نقيسو') ||
    norm.includes('نخلص قبل') ||
    norm.includes('الدفع عند الاستلام') ||
    norm.includes('كاش') ||
    norm.includes('ضمان') ||
    norm.includes('استرجاع') ||
    norm.includes('تبديل') ||
    norm.includes('استبدال') ||
    norm.includes('ouvir') ||
    norm.includes('essayer') ||
    norm.includes('cod') ||
    norm.includes('garantie') ||
    norm.includes('retour') ||
    norm.includes('echange');

  if (hasGuaranteeKeywords) {
    const textAr = `✦ **ضمانات متجر دالوزي الملكية وحماية الزبون 100%**:

1. 📦 **حق المعاينة والفحص الكامل قبل السداد**:
   يحق لك تماماً فتح الطرد وفحص جودة القماش، دقة التطريز، والمقاس قبل دفع أي دينار لعامل التوصيل.

2. 💵 **الدفع عند الاستلام (Cash On Delivery)**:
   لا تدفع مسبقاً! الدفع نقداً عند استلام طلبيتك ورضاك التام عنها.

3. 🔄 **الاستبدال السهل والمرن**:
   في حال رغبتك في تبديل المقاس أو اللون، فريق خدمة العملاء متاح لمساعدتك خلال 48 ساعة.

4. 🎁 **تغليف الهدايا الملكي**:
   كل قطعة من دالوزي تصلك في علبة فخمة مذهبة مع بطاقة شهادة الجودة والأصالة.`;

    const textFr = `✦ **Garanties Officielles Dalozi Store & Protection Client**:

1. 📦 **Droit d'inspection avant paiement**:
   Vous avez le droit légitime d'ouvrir votre colis, d'examiner le tissu, la broderie et la coupe avant de payer le livreur.

2. 💵 **Paiement à la livraison (COD)**:
   Paiement 100% en espèces à la réception de votre commande.

3. 🔄 **Échange facile sous 48h**:
   Pour changer de taille ou de couleur, notre support s'occupe de tout rapidement.

4. 🎁 **Packaging Luxe Offert**:
   Chaque article est expédié dans un coffret rigide noir et or siglé Dalozi.`;

    return {
      text: isAr ? textAr : textFr,
      matchedCategory: 'guarantee',
      confidence: 0.95,
      whatsappHandoffUrl: whatsappUrl,
    };
  }

  // 3. Products: Aura Collection, Qandouras, Abayas, Menswear, Sweets, Catering, Cosmetics
  const hasAuraKeywords =
    norm.includes('اورا') ||
    norm.includes('aura') ||
    norm.includes('قندوره') ||
    norm.includes('قنادر') ||
    norm.includes('قفطان') ||
    norm.includes('قطيفه') ||
    norm.includes('سطايفيه') ||
    norm.includes('فستان') ||
    norm.includes('فساتين') ||
    norm.includes('عرس') ||
    norm.includes('اعراس') ||
    norm.includes('robe');

  if (hasAuraKeywords) {
    const textAr = `✦ **تشكيلة أورا الملكية (Aura Collection) - قندورة القطيفة المطرزة**:

👑 **الموديل الأيقوني**: قندورة قطيفة ملكية كورية عالية الكثافة بالطرز الذهبي الأصيل (المجبود).
💰 **السعر الترويجي**: **18,500 دج** (بدلاً من 22,000 دج).
📏 **المقاسات المتوفرة**: S، M، L، XL، XXL (متوافقة مع المقاسات الجزائرية من 38 حتى 52).
🎨 **الألوان الفاخرة**:
• بنفسجي ملكي (Royal Violet)
• أخضر زمردي (Emerald Green)
• عنابي ملكي (Bordeaux)
• كحلي داكن (Midnight Navy)

✨ تأتي في علبة هدايا دالوزي الفخمة مع إمكانية الفحص والمعاينة قبل دفع ثمنها للموزع!`;

    const textFr = `✦ **Aura Collection - Qandoura Haute Couture**:

👑 **Modèle Signature**: Velours coréen royal à broderie dorée artisanale (Mejboud).
💰 **Prix**: **18 500 DZD** (au lieu de 22 000 DZD).
📏 **Tailles disponibles**: S, M, L, XL, XXL.
🎨 **Couleurs**: Violet Royal, Vert Émeraude, Bordeaux, Bleu Nuit.

✨ Livrée dans un coffret prestige avec droit d'essayage avant paiement !`;

    return {
      text: isAr ? textAr : textFr,
      matchedCategory: 'products',
      confidence: 0.94,
      whatsappHandoffUrl: whatsappUrl,
    };
  }

  // Sweets & Catering
  const hasSweetsKeywords =
    norm.includes('حلويات') ||
    norm.includes('قاطو') ||
    norm.includes('بقلاوه') ||
    norm.includes('مقروط') ||
    norm.includes('خطوبه') ||
    norm.includes('بوفيه') ||
    norm.includes('مملحات') ||
    norm.includes('كاترينغ') ||
    norm.includes('catering') ||
    norm.includes('patisserie') ||
    norm.includes('gateau') ||
    norm.includes('sale');

  if (hasSweetsKeywords) {
    const textAr = `✦ **حلويات دالوزي الفاخرة وبوفيهات المأكولات الملكية**:

🧁 **صندوق حلويات المناسبات الملكية (Prestige Pastry Box)**:
• تشكيلة راقية من البقلاوة بالجوز واللوز، مقروط اللوز العاصمي، والدزيريات المذهبة.
• السعر: **6,500 دج** للصندوق الملكي المشكل (تغليف خاص للحفاظ على الطراوة).

🍱 **بوفيه المملحات الراقية (Luxury Savory Catering Buffet)**:
• ميني برغر ملون، كيش السلمون، كورنيه المملحات، ومقبلات راقية للأعراس والولائم.
• السعر يبدأ من: **1,200 دج للشخص** مع إمكانية التخصيص حسب عدد الضيوف.

💬 نوفر أسعاراً خاصة للكميات وطلبيات الأعراس عبر الواتساب مباشرة!`;

    const textFr = `✦ **Pâtisseries Fines & Traiteur Événementiel Dalozi**:

🧁 **Coffret Douceurs Royales**:
• Baklawa aux amandes/noix, Makroud el louz, Dziriettes dorées.
• Prix: **6 500 DZD** le coffret luxe fraîcheur.

🍱 **Buffet Salé Prestige Traiteur**:
• Mini-burgers gourmets, mini-quiches saumon, canapés fins.
• À partir de **1 200 DZD / invité** pour mariages et réceptions.`;

    return {
      text: isAr ? textAr : textFr,
      matchedCategory: 'products',
      confidence: 0.93,
      whatsappHandoffUrl: whatsappUrl,
    };
  }

  // Cosmetics
  const hasCosmeticsKeywords =
    norm.includes('تجميل') ||
    norm.includes('عنايه') ||
    norm.includes('بشره') ||
    norm.includes('زيت') ||
    norm.includes('ارغان') ||
    norm.includes('سيروم') ||
    norm.includes('كوزميتيك') ||
    norm.includes('hm') ||
    norm.includes('cosmetics') ||
    norm.includes('skincare');

  if (hasCosmeticsKeywords) {
    const textAr = `✦ **مستحضرات العناية الطبيعية الفاخرة HM Dalozi Cosmetics**:

🌿 **إكسير النضارة النباتي الملكي (Botanical Radiance Elixir)**:
• تركيبة طبيعية 100% غنية بزيت بذور التين الشوكي، زيت الأرغان النقي، وخلاصة الورد الجبلي.
• يعيد مرونة البشرة، يحارب علامات الإرهاق، ويمنح إشراقة مخملية ساحرة.
• السعر: **4,800 دج** (زجاجة فاخرة 50 مل مع قطارة دقيقة).`;

    const textFr = `✦ **Cosmétiques Naturels HM Dalozi**:

🌿 **Élixir Botanique Éclat Royal**:
• 100% naturel aux huiles de figue de barbarie, argan pur et eau de rose.
• Hydratation profonde, anti-âge et éclat instantané.
• Prix: **4 800 DZD** (Flacon verre luxe 50ml).`;

    return {
      text: isAr ? textAr : textFr,
      matchedCategory: 'products',
      confidence: 0.92,
      whatsappHandoffUrl: whatsappUrl,
    };
  }

  // 4. Human Handoff / WhatsApp
  const hasHumanKeywords =
    norm.includes('واتساب') ||
    norm.includes('whatsapp') ||
    norm.includes('انسان') ||
    norm.includes('شخص') ||
    norm.includes('هاتف') ||
    norm.includes('تليفون') ||
    norm.includes('مستشار') ||
    norm.includes('خدمه الزبائن') ||
    norm.includes('مكالمه') ||
    norm.includes('رقمكم') ||
    norm.includes('parler') ||
    norm.includes('humain') ||
    norm.includes('conseiller') ||
    norm.includes('telephone') ||
    norm.includes('contact');

  if (hasHumanKeywords) {
    const textAr = `✦ **يسعدنا تواصلكم المباشر مع فريق الدعم والمستشارين**:

📞 **رقم الهاتف والواتساب الرسمي**: **0672330936** (+213672330936)
💬 فريقنا متواجد 7/7 للإجابة الفورية، تخصيص المقاسات، وتأكيد طلبياتكم الخاصة.

👇 اضغط على الزر الذهبي أدناه للانتقال الفوري إلى المحادثة المباشرة عبر الواتساب!`;

    const textFr = `✦ **Contactez directement nos conseillers de vente**:

📞 **Numéro WhatsApp & Téléphone**: **0672330936** (+213672330936)
💬 Notre équipe VIP est disponible 7j/7 pour vous assister.

👇 Cliquez ci-dessous pour ouvrir directement la conversation WhatsApp !`;

    return {
      text: isAr ? textAr : textFr,
      matchedCategory: 'human_handoff',
      confidence: 0.99,
      whatsappHandoffUrl: whatsappUrl,
    };
  }

  // 5. Default General Response (Warm, helpful, Algerian luxury tone)
  const defaultAr = `أهلاً بك في **متجر دالوزي الفاخر (Dalozi Store)** ✦

أنا مستشارك الذكي، يسعدني جداً مساعدتك في أي استفسار:
1. 👑 **الأزياء والقفاطين**: أسعار ومقاسات تشكيلة هالة (Aura Collection).
2. 🚚 **التوصيل لـ 58 ولاية**: اكتب اسم أو رقم ولايتك وسأعطيك السعر والمدة فوراً.
3. 📦 **الضمانات**: إمكانية فتح الطرد والفحص قبل الدفع عند الاستلام.
4. 🧁 **الحلويات والمملحات**: حلويات المناسبات وبوفيهات الأعراس.

💬 كما يمكنك في أي وقت التحدث مباشرة مع مستشارنا عبر الواتساب على **0672330936**. بمَ ترغب في أن أبدأ معك؟`;

  const defaultFr = `Bienvenue chez **Dalozi Store Luxury** ✦

Je suis votre assistant IA, à votre écoute pour:
1. 👑 **Collection Aura**: Tailles, prix et détails des Qandouras et Caftans.
2. 🚚 **Livraison 58 Wilayas**: Écrivez votre wilaya pour le tarif et délai exact.
3. 📦 **Garanties**: Vérification complète du colis avant paiement en espèces.
4. 🧁 **Pâtisseries & Traiteur**: Pour vos mariages et événements.

💬 Vous pouvez aussi contacter un conseiller humain au **0672330936**. Comment puis-je vous aider ?`;

  return {
    text: isAr ? defaultAr : defaultFr,
    matchedCategory: 'general',
    confidence: 0.85,
    whatsappHandoffUrl: whatsappUrl,
  };
}
