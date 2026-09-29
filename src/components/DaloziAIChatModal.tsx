import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  Loader2,
  ExternalLink,
  RefreshCw,
  Phone,
  MessageCircle,
  Truck,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { Language, User, Wilaya } from '../types';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ALGERIA_WILAYAS } from '../data/wilayas';
import { STORE_WHATSAPP_NUMBER } from '../data/products';
import {
  resolveKnowledgeBaseQuery,
  generateWhatsAppHandoffUrl,
} from '../services/daloziKnowledgeBase';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: Array<{ title: string; uri: string }>;
  whatsappHandoffUrl?: string;
  detectedWilaya?: Wilaya;
  sourceType?: 'gemini' | 'knowledge_base';
}

interface DaloziAIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  currentUser: User | null;
}

const INITIAL_MESSAGES: Record<Language, ChatMessage[]> = {
  ar: [
    {
      id: 'welcome-ar',
      sender: 'assistant',
      text: `مرحباً بك في دالوزي ستور الفاخر ✦ أنا **مستشارك الذكي للأناقة والتسوق وخدمة الزبائن** في الجزائر، مدعوم بأحدث تقنيات Gemini وقاعدة المعرفة المعتمدة لـ 58 ولاية.

يسعدني الرد فورياً على استفساراتكم:
• 👑 تفاصيل ومقاسات وأسعار **تشكيلة هالة (Aura Collection)**.
• 🚚 حساب تكلفة ومدة الشحن لولايتك بالتحديد (مع الشحن المجاني فوق 30,000 دج).
• 📦 ضمانات **الدفع عند الاستلام** وحق **معاينة وفحص الطرد** قبل السداد.
• 🧁 أرقى حلويات المناسبات الملكية وبوفيهات المأكولات (Catering).
• 💬 إمكانية التحويل المباشر لمستشارنا عبر الواتساب في أي وقت.

بمَ يمكنني مساعدتك الآن؟`,
      timestamp: new Date().toISOString(),
      whatsappHandoffUrl: generateWhatsAppHandoffUrl('استفسار عام من المتجر'),
    },
  ],
  fr: [
    {
      id: 'welcome-fr',
      sender: 'assistant',
      text: `Bienvenue chez Dalozi Store Luxury ✦ Je suis votre **Conseiller Client & Styliste Personnel IA**, propulsé par Gemini et notre base de données certifiée pour les 58 wilayas.

Je suis à votre entière disposition pour:
• 👑 Détails, coupes et prix de la **Collection Aura** (Qandoura, Caftans).
• 🚚 Calcul des frais et délais de livraison pour votre wilaya (Gratuit dès 30 000 DZD).
• 📦 Garanties **Paiement à la livraison** et **vérification du colis avant paiement**.
• 🧁 Pâtisseries prestigieuses et buffets traiteur pour vos événements.
• 💬 Handoff direct vers un conseiller WhatsApp à tout moment.

Comment puis-je vous guider ?`,
      timestamp: new Date().toISOString(),
      whatsappHandoffUrl: generateWhatsAppHandoffUrl('Question générale Dalozi'),
    },
  ],
  en: [
    {
      id: 'welcome-en',
      sender: 'assistant',
      text: `Welcome to Dalozi Luxury Store ✦ I am your **AI Concierge & Customer Support Assistant**, powered by Gemini and our verified 58 wilayas knowledge base.

I can immediately assist you with:
• 👑 Sizing, pricing & fabrics of the **Aura Collection**.
• 🚚 Exact delivery costs & delays for your Algerian wilaya.
• 📦 **Cash on Delivery (COD)** & full package inspection guarantee.
• 🧁 Gourmet traditional sweets and catering buffets.
• 💬 Direct human WhatsApp assistance available 24/7.

How may I assist you today?`,
      timestamp: new Date().toISOString(),
      whatsappHandoffUrl: generateWhatsAppHandoffUrl('General Inquiry Dalozi'),
    },
  ],
};

const SUGGESTIONS: Record<Language, string[]> = {
  ar: [
    '🚚 كم سعر ووقت التوصيل لولايتي؟',
    '📦 هل يحق لي فتح الطرد ومعاينته قبل الدفع؟',
    '👑 ما هي أسعار ومقاسات قندورة تشكيلة أورا؟',
    '🧁 ما هي أفضل حلويات المناسبات والأعراس؟',
    '💬 أريد التحدث مع خدمة الزبائن عبر الواتساب',
  ],
  fr: [
    '🚚 Quel est le prix et délai de livraison pour ma wilaya ?',
    '📦 Puis-je ouvrir et vérifier le colis avant de payer ?',
    '👑 Quels sont les prix et tailles de la Collection Aura ?',
    '🧁 Quelles pâtisseries recommandez-vous pour un événement ?',
    '💬 Parler à un conseiller humain sur WhatsApp',
  ],
  en: [
    '🚚 What is the shipping cost to my wilaya?',
    '📦 Can I open and inspect the package before paying?',
    '👑 What are the prices & sizes of Aura Collection?',
    '🧁 What sweets do you recommend for an event?',
    '💬 Talk to a customer support agent on WhatsApp',
  ],
};

export const DaloziAIChatModal: React.FC<DaloziAIChatModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  currentUser,
}) => {
  const isAr = currentLang === 'ar';
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('dalozi_ai_chat_history_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return INITIAL_MESSAGES[currentLang];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWilayaQuickSelect, setShowWilayaQuickSelect] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isLoading]);

  // Persist messages in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dalozi_ai_chat_history_v2', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    setShowWilayaQuickSelect(false);

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    // Save user message to Firestore
    try {
      const chatId = currentUser?.id || 'guest-session';
      addDoc(collection(db, 'chats', chatId, 'messages'), {
        sender: 'user',
        text,
        userId: currentUser?.id || 'guest',
        timestamp: serverTimestamp(),
      }).catch(() => {});
    } catch {}

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          userContext: {
            userName: currentUser?.name,
            role: currentUser?.role,
            lang: currentLang,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API HTTP error: ${response.status}`);
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toISOString(),
        sources: data.sources || [],
        whatsappHandoffUrl: data.whatsappHandoffUrl || generateWhatsAppHandoffUrl(text),
        detectedWilaya: data.detectedWilaya,
        sourceType: data.source || 'gemini',
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Save assistant response to Firestore
      try {
        const chatId = currentUser?.id || 'guest-session';
        addDoc(collection(db, 'chats', chatId, 'messages'), {
          sender: 'assistant',
          text: assistantMsg.text,
          userId: currentUser?.id || 'guest',
          sources: assistantMsg.sources || [],
          timestamp: serverTimestamp(),
        }).catch(() => {});
      } catch {}
    } catch (err) {
      console.warn('Network error or API offline, resolving via local Knowledge Base:', err);

      // Instant Client-side Fallback using Algerian Knowledge Base
      const kb = resolveKnowledgeBaseQuery(text, currentLang);
      const fallbackMsg: ChatMessage = {
        id: `kb-${Date.now()}`,
        sender: 'assistant',
        text: kb.text,
        timestamp: new Date().toISOString(),
        sources: kb.sources || [],
        whatsappHandoffUrl: kb.whatsappHandoffUrl,
        detectedWilaya: kb.detectedWilaya,
        sourceType: 'knowledge_base',
      };

      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES[currentLang]);
    try {
      localStorage.removeItem('dalozi_ai_chat_history_v2');
    } catch {}
  };

  const handleSelectWilayaFromMenu = (w: Wilaya) => {
    setShowWilayaQuickSelect(false);
    const query = isAr
      ? `كم سعر ومدة التوصيل لولاية ${w.code} - ${w.nameAr}؟`
      : `Combien coûte la livraison pour la wilaya ${w.code} - ${w.nameFr} ?`;
    handleSendMessage(query);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-chat-title"
      className="fixed inset-0 z-50 overflow-hidden bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-[#111116] border border-[#D4AF37]/50 w-full sm:max-w-2xl h-[95vh] sm:h-[88vh] rounded-t-3xl sm:rounded-3xl shadow-[0_0_70px_rgba(212,175,55,0.35)] flex flex-col overflow-hidden text-[#FAF8F5]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#181824] via-[#1a1a20] to-[#181824] border-b border-[#D4AF37]/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-gradient flex items-center justify-center text-[#0F0F12] shadow-[0_0_15px_rgba(212,175,55,0.5)]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="ai-chat-title" className="text-sm sm:text-base font-bold text-gold-gradient font-['Cairo',sans-serif]">
                  {isAr ? 'مستشار دالوزي الذكي' : 'Conseiller IA Dalozi'}
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>متصل الآن</span>
                </span>
              </div>
              <p className="text-[11px] text-[#FAF8F5]/70 flex items-center gap-1.5">
                <span>{isAr ? 'دعم فوري · أسعار 58 ولاية · المعاينة قبل الدفع' : 'Support instantané · 58 Wilayas · COD'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleResetChat}
              title={isAr ? 'محادثة جديدة' : 'Nouvelle conversation'}
              className="p-2 text-[#FAF8F5]/60 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#FAF8F5]/60 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Wilaya Delivery Bar */}
        <div className="bg-[#161620] px-4 py-2 border-b border-[#D4AF37]/20 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-[#D4AF37] font-semibold">
            <Truck className="w-4 h-4" />
            <span>{isAr ? 'حاسبة توصيل 58 ولاية:' : 'Calculateur 58 Wilayas:'}</span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowWilayaQuickSelect(!showWilayaQuickSelect)}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#1F1F2C] hover:bg-[#282838] border border-[#D4AF37]/40 rounded-lg text-[11px] text-[#FAF8F5] cursor-pointer"
            >
              <span>{isAr ? 'اختر ولايتك لحساب السعر' : 'Sélectionner une wilaya'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#D4AF37]" />
            </button>

            {showWilayaQuickSelect && (
              <div className="absolute top-full end-0 mt-1 w-64 max-h-56 overflow-y-auto bg-[#181824] border border-[#D4AF37]/50 rounded-xl shadow-2xl p-1 z-50">
                {ALGERIA_WILAYAS.map((w) => (
                  <button
                    key={w.code}
                    type="button"
                    onClick={() => handleSelectWilayaFromMenu(w)}
                    className="w-full text-start px-2.5 py-1.5 text-xs text-[#FAF8F5] hover:bg-[#D4AF37]/20 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>
                      {w.code} - {isAr ? w.nameAr : w.nameFr}
                    </span>
                    <span className="text-[10px] text-[#D4AF37] font-mono">{w.homeDeliveryPrice} دج</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                    isUser
                      ? 'bg-[#2A2A38] text-white border border-white/10'
                      : 'bg-gold-gradient text-[#0F0F12] shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                  }`}
                >
                  {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[88%] sm:max-w-[85%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-white rounded-tr-none'
                      : 'bg-[#181822] border border-white/10 text-[#FAF8F5] rounded-tl-none shadow-lg'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                  {/* Detected Wilaya Badge */}
                  {msg.detectedWilaya && (
                    <div className="mt-3 p-2.5 bg-[#12121A] border border-[#D4AF37]/30 rounded-xl text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[#D4AF37]">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>
                          {isAr ? 'الولاية المحددة:' : 'Wilaya ciblée:'} {msg.detectedWilaya.code} -{' '}
                          {isAr ? msg.detectedWilaya.nameAr : msg.detectedWilaya.nameFr}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-[#FAF8F5]/80">
                        <span>المنزل: {msg.detectedWilaya.homeDeliveryPrice} دج</span>
                        <span>المكتب (Stop Desk): {msg.detectedWilaya.deskDeliveryPrice} دج</span>
                        <span>{msg.detectedWilaya.deliveryDays}</span>
                      </div>
                    </div>
                  )}

                  {/* Web Grounding Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5">
                      <span className="text-[10px] text-[#D4AF37] font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{isAr ? 'مصادر البحث المعتمدة:' : 'Sources web vérifiées:'}</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((s, idx) => (
                          <a
                            key={idx}
                            href={s.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#101018] border border-white/10 text-[10px] text-[#FAF8F5]/80 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-colors"
                          >
                            <span>{s.title}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Human Handoff Button (Included in Assistant Responses) */}
                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-white/10">
                      <a
                        href={msg.whatsappHandoffUrl || generateWhatsAppHandoffUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/50 text-[#25D366] text-xs font-bold transition-all shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4 text-[#25D366]" />
                        <span>{isAr ? 'تحدث مباشرة مع مستشارنا عبر الواتساب (0672330936)' : 'Parler à un conseiller sur WhatsApp'}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Shimmer */}
          {isLoading && (
            <div className="flex gap-3 animate-fadeIn">
              <div className="w-8 h-8 rounded-xl bg-gold-gradient text-[#0F0F12] flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#181822] border border-[#D4AF37]/30 rounded-2xl rounded-tl-none p-3.5 text-xs text-[#FAF8F5]/80 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
                <span>
                  {isAr ? 'جاري تحضير الإجابة بدقة مع مراجعة بيانات المتجر والتوصيل...' : 'Préparation de la réponse...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length <= 4 && (
          <div className="px-3 sm:px-4 py-2 bg-[#14141C] border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
            {SUGGESTIONS[currentLang].map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(sug)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[#1C1C26] hover:bg-[#252534] border border-[#D4AF37]/25 text-[11px] text-[#FAF8F5]/90 hover:text-[#D4AF37] transition-all shrink-0 cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar & Human Handoff */}
        <div className="p-3 sm:p-4 bg-[#14141C] border-t border-[#D4AF37]/30 shrink-0 space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isAr
                  ? 'اسأل عن الأسعار، مقاسات القنادر، ولايتك، أو حق فتح الطرد قبل الدفع...'
                  : 'Posez votre question sur les prix, tailles, livraison, garanties...'
              }
              className="flex-1 bg-[#1A1A24] border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-xl py-2.5 sm:py-3 px-3.5 text-xs sm:text-sm text-[#FAF8F5] focus:outline-none placeholder:text-[#FAF8F5]/40"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 sm:p-3 rounded-xl bg-gold-gradient text-[#0F0F12] hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all cursor-pointer shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              aria-label="إرسال"
            >
              <Send className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </form>

          {/* Bottom Human WhatsApp Handoff Bar */}
          <div className="flex items-center justify-between text-[11px] text-[#FAF8F5]/70 pt-1 px-1 flex-wrap gap-2">
            <span className="flex items-center gap-1 text-[#D4AF37] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAr ? 'المعاينة قبل الدفع · الدفع عند الاستلام' : 'Vérification avant paiement (COD)'}</span>
            </span>

            <a
              href={`https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent('مرحباً دالوزي ستور، أود التحدث مباشرة مع خدمة الزبائن.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'واتساب الإدارة: 0672330936' : 'WhatsApp Support: 0672330936'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
