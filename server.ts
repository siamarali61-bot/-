import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveKnowledgeBaseQuery, generateWhatsAppHandoffUrl } from './src/services/daloziKnowledgeBase.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Safely initialize GoogleGenAI if key is present
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI();
  }
} catch (e) {
  console.warn('GoogleGenAI initialization notice:', e);
}

/**
 * Multi-turn Gemini AI Chat endpoint
 * Features:
 * - Conversational context history
 * - Personalized Algerian luxury fashion & shopping concierge persona
 * - Google Search Grounding for real-time trends & information
 * - Seamless Intelligent Knowledge Base Fallback for 100% uptime
 * - WhatsApp Human Handoff integration
 */
app.post('/api/chat', async (req, res) => {
  const { messages, userContext } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages list is required' });
  }

  // Extract last user message and language
  const lastUserMsg = messages.slice().reverse().find((m: any) => m.sender === 'user')?.text || '';
  const lang = userContext?.lang || 'ar';
  const whatsappUrl = generateWhatsAppHandoffUrl(lastUserMsg);

  // If Gemini client is not initialized, immediately use local Knowledge Base
  if (!ai || !process.env.GEMINI_API_KEY) {
    const kb = resolveKnowledgeBaseQuery(lastUserMsg, lang);
    return res.json({
      text: kb.text,
      sources: kb.sources || [],
      whatsappHandoffUrl: kb.whatsappHandoffUrl,
      source: 'knowledge_base',
      detectedWilaya: kb.detectedWilaya,
    });
  }

  try {
    // Transform chat messages into Gemini contents format
    const contents = messages.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text || '' }],
    }));

    const systemInstruction = `أنت "مساعد دالوزي الذكي" (Dalozi AI Luxury Stylist & Concierge)، المستشار الشخصي للأناقة والتسوق الفاخر لمنصة دالوزي (Dalozi Store) في الجزائر.
مهمتك وقواعدك:
1. فهم وإجابة الاستفسارات باللغة العربية الفصحى، الفرنسية، والدارجة الجزائرية الأصيلة (مثال: شحال التوصيل، وقتاش يوصلني، نقدرو نفتحو الكولية، كاين لاطاي 42، قاطو العرس، الخ).
2. تقديم نصائح راقية وتنسيقات لأزياء "تشكيلة هالة" (Aura Collection) - القندورة السطايفية، القفطان الجزائري، الكراكو، والجبات الفاخرة للأعراس والمناسبات، بأسعار تبدأ من 18,500 دج ومقاسات من 38 حتى 52 (S حتى XXL).
3. تقديم تفاصيل الأزياء الرجالية الفاخرة (البدلات الإيطالية بـ 24,500 دج).
4. التوصية بأفخر الحلويات الجزائرية الملكية (صندوق الحلويات الملكي بـ 6,500 دج) وبوفيهات المأكولات والمملحات (Catering من 1,200 دج/شخص).
5. التعريف بمستحضرات العناية الطبيعية الفاخرة HM Dalozi Cosmetics (إكسير النضارة بـ 4,800 دج).
6. شرح وتأكيد ضمانات التسوق في دالوزي:
   - الدفع عند الاستلام (Cash On Delivery) لجميع الـ 58 ولاية جزائرية.
   - حق فتح الطرد ومعاينة وفحص الطلبية قبل دفع أي دينار للموزع.
   - الشحن السريع والشحن المجاني التلقائي للطلبيات فوق 30,000 دج.
   - توصيل العاصمة والبليدة وبومرداس وتيبازة في 24 ساعة، وباقي الولايات من 1 إلى 3 أيام.
7. توفير زر ورابط التواصل المباشر مع الدعم الفني والمستشارين عبر الواتساب على 0672330936 (+213672330936) للأسئلة الخاصة والطلبيات المخصصة.

الأسلوب: فاخر، أنيق، مهذب، ودود، منظم في نقاط جميلة واستخدام مناسب للأيقونات الفاخرة (✦ 🇩🇿 ✨).`;

    let replyText = '';
    let sources: Array<{ title: string; uri: string }> = [];

    // Attempt 1: Gemini 2.5 Flash with Google Search Grounding
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });

      replyText = response.text || '';
      const metadata = response.candidates?.[0]?.groundingMetadata;
      if (metadata?.groundingChunks) {
        sources = (metadata.groundingChunks as any[])
          .filter((chunk: any) => chunk?.web?.title && chunk?.web?.uri)
          .map((chunk: any) => ({
            title: String(chunk.web.title),
            uri: String(chunk.web.uri),
          }));
      }
    } catch (groundingError: any) {
      console.warn('Gemini search grounding call note, falling back to direct prompt:', groundingError?.message);

      // Attempt 2: Direct model generation
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      replyText = response.text || '';
    }

    if (!replyText || replyText.trim().length === 0) {
      throw new Error('Empty Gemini response');
    }

    return res.json({
      text: replyText,
      sources,
      whatsappHandoffUrl: whatsappUrl,
      source: 'gemini',
    });
  } catch (error: any) {
    console.warn('Gemini API call failed, activating local Knowledge Base fallback:', error?.message || error);

    // Instant resilient fallback to Algerian Knowledge Base
    const kb = resolveKnowledgeBaseQuery(lastUserMsg, lang);
    return res.json({
      text: kb.text,
      sources: kb.sources || [],
      whatsappHandoffUrl: kb.whatsappHandoffUrl,
      source: 'knowledge_base',
      detectedWilaya: kb.detectedWilaya,
    });
  }
});

// AI Auto-Description generation endpoint
app.post('/api/generate-description', async (req, res) => {
  try {
    const { titleAr, category, price, features, instagramHandle } = req.body;
    const catNameMap: Record<string, string> = {
      'women-fashion': 'أزياء نسائية فاخرة وقنادر وقفاطين جزائرية',
      'mens-apparel': 'أزياء رجالية وبدلات رسمية راقية',
      'sweets-bakery': 'حلويات جزائرية ملكية للمناسبات والأعراس',
      'catering-buffet': 'بوفيهات ومملحات وضيافة فاخرة (Catering)',
      'beauty-cosmetics': 'مستحضرات عناية وجمال طبيعية راقية',
    };
    const catLabel = catNameMap[category] || 'منتجات دالوزي الفاخرة';

    const prompt = `أنت خبير صياغة نصوص تسويقية فاخرة ومحتوى مبيعات رقمي لمتجر "دالوزي" الجزائري الفاخر (Dalozi Store).
اكتب وصفاً تسويقياً جذاباً وفخماً يعزز الثقة والهوية الجزائرية باللغة العربية الفصحى الأنيقة لمنتج جديد بالمعلومات التالية:
- اسم المنتج: ${titleAr || 'منتج فاخر حصيري'}
- القسم: ${catLabel}
- السعر: ${price ? price + ' دج' : 'حسب الاختيار'}
${instagramHandle ? `- حساب المصممة/المالكة على إنستغرام: ${instagramHandle}` : ''}
${features ? `- المواصفات الإضافية: ${features}` : ''}

شروط الوصف:
1. أن يبدأ بعبارة تقديمية جذابة تبرز الأصالة والأناقة الجزائرية والفخامة.
2. فقرة تشرح جودة القماش أو المكونات ودقة الصنع والإتقان.
3. التنويه بأن المنتج يصل في علبة هدايا دالوزي المذهبة الفاخرة.
4. التأكيد القوي على ميزة متجر دالوزي: الدفع عند الاستلام مع حق فتح الطرد ومعاينته والتأكد من المقاس قبل دفع أي دينار لعامل التوصيل في جميع الـ 58 ولاية.
5. اجعل النص متناسقاً ومباشراً بدون مقدمات أو ثرثرة، وجاهزاً للوضع في المتجر فوراً.`;

    let generatedText = '';

    if (ai && process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        generatedText = response.text || '';
      } catch (err: any) {
        console.warn('Gemini auto-description notice, using fallback:', err?.message);
      }
    }

    if (!generatedText || generatedText.trim().length === 0) {
      const igAttribution = instagramHandle
        ? `\nتصميم حصري بالشراكة مع المصممة المبدعة (${instagramHandle.startsWith('@') ? instagramHandle : '@' + instagramHandle}).`
        : '';

      if (category === 'women-fashion') {
        generatedText = `قطعة استثنائية تجسد الفخامة والأصالة الجزائرية الرفيعة.${igAttribution} تم تصميمها بعناية فائقة باستخدام أجود الخامات الملكية مع لمسات تطريز يدوي متقن تضفي بريقاً ساحراً يناسب أبهى مناسباتك وأعراسك.

تأتيكم القطعة داخل علبة هدايا "دالوزي" الفاخرة والمذهبة لتقديمها كهدية راقية. نضمن لكم تجربة تسوق آمنة 100% مع ميزة الدفع عند الاستلام (COD) وحق فتح الطرد ومعاينة القماش والمقاس قبل دفع أي دينار لعامل التوصيل عبر 58 ولاية.`;
      } else if (category === 'sweets-bakery' || category === 'catering-buffet') {
        generatedText = `إبداع طهي راقٍ يجمع بين عراقة الحلويات والمملحات الجزائرية الأصيلة واللمسات العصرية المبتكرة.${igAttribution} محضرة بأجود المكونات الطبيعية المنتقاة والمكسرات الفاخرة لترتقي بضيافتكم في حفلات الخطوبة، الأعراس، والمناسبات الكبرى.

تغليف محكم يحافظ على الطراوة والقرمشة مع ضمان وصول الطلبية طازجة وفي وقت قياسي لباب داركم عبر شبكة توصيل دالوزي الخاصة مع إمكانية الفحص الكامل قبل السداد.`;
      } else if (category === 'beauty-cosmetics') {
        generatedText = `تركيبة طبيعية نقية 100% مستوحاة من أسرار الجمال الجزائري العريق.${igAttribution} عناية فائقة تمنح بشرتك نضارة مخملية وإشراقة طبيعية تدوم طويلاً، خالية تماماً من المواد الكيميائية الضارة ومختبرة لضمان أقصى درجات النقاء والأمان.

تصلكم في عبوة زجاجية فاخرة مع ضمان فحص الطرد والاستلام الآمن في كافة الولايات الـ 58.`;
      } else {
        generatedText = `قطعة راقية تمثل التوازن المثالي بين الأناقة العصرية والجودة العالية.${igAttribution} صُممت خصيصاً لأصحاب الذوق الرفيع بأدق تفاصيل الخياطة والمتانة التي تدوم.

مرفقة بعلبة هدايا دالوزي الرسمية مع خدمة التوصيل السريع والدفع عند الاستلام، مع كامل الحق في معاينة المنتج وفحصه قبل الدفع.`;
      }
    }

    return res.json({ description: generatedText.trim() });
  } catch (error: any) {
    console.error('Auto-description endpoint error:', error);
    return res.status(500).json({ error: 'Failed to generate description' });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    store: 'Dalozi Store',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✦ Dalozi Store Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
