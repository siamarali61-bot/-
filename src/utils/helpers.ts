import { CartItem, Product, ProductVariantColor, Wilaya } from '../types';
import { STORE_WHATSAPP_NUMBER } from '../data/products';

export function formatDZD(amount: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    maximumFractionDigits: 0,
  }).format(amount) + ' د.ج';
}

export function formatDZDEn(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount) + ' DA';
}

export function createProductWhatsAppUrl(
  product: Product,
  selectedColor?: ProductVariantColor,
  selectedSize?: string,
  quantity = 1,
  wilayaName?: string
): string {
  let message = `مرحباً دالوزي ستور (DALOZI STORE) 🇩🇿✨\nأود تأكيد طلب فاخر للمنتج التالي:\n\n`;
  message += `▪️ *المنتج:* ${product.titleAr}\n`;
  message += `▪️ *السعر:* ${formatDZD(product.price)}\n`;
  message += `▪️ *الكمية:* ${quantity}\n`;
  
  if (selectedColor) {
    message += `▪️ *اللون المختار:* ${selectedColor.nameAr} (${selectedColor.name})\n`;
  }
  if (selectedSize) {
    message += `▪️ *المقاس / الحجم:* ${selectedSize}\n`;
  }
  if (wilayaName) {
    message += `▪️ *الولاية:* ${wilayaName}\n`;
  }
  
  message += `\n*الإجمالي التقريبي:* ${formatDZD(product.price * quantity)}\n`;
  message += `*طريقة الدفع:* الدفع عند الاستلام (COD) 📦\n`;
  message += `يرجى إفادتي بتفاصيل الشحن والتأكيد. شكراً!`;

  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function createCartWhatsAppUrl(
  items: CartItem[],
  customerName: string,
  phone: string,
  wilaya: Wilaya,
  commune: string,
  total: number
): string {
  let message = `السلام عليكم ورحمة الله 🇩🇿✨\nطلب شراء جديد عبر موقع *دالوزي ستور (DALOZI STORE)*:\n\n`;
  message += `👤 *معلومات الزبون:*\n`;
  message += `▪️ الاسم: ${customerName}\n`;
  message += `▪️ الهاتف: ${phone}\n`;
  message += `▪️ الولاية: ${wilaya.code} - ${wilaya.nameAr} (${wilaya.nameFr})\n`;
  message += `▪️ البلدية / العنوان: ${commune}\n\n`;
  
  message += `🛍️ *الطلبيات:*\n`;
  items.forEach((item, index) => {
    message += `${index + 1}. *${item.product.titleAr}*\n`;
    if (item.selectedSize) message += `   - المقاس: ${item.selectedSize}\n`;
    if (item.selectedColor) message += `   - اللون: ${item.selectedColor.nameAr}\n`;
    message += `   - الكمية: ${item.quantity} × ${formatDZD(item.product.price)}\n`;
  });

  message += `\n💰 *المجموع الإجمالي مع التوصيل:* ${formatDZD(total)}\n`;
  message += `📦 *طريقة الدفع:* الدفع عند الاستلام (Cash on Delivery)\n`;
  message += `شكراً لكم وأرجو الاتصال لتأكيد موعد الشحن.`;

  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Compresses an image File using HTML Canvas and returns optimized Base64 string
 * suitable for direct storage in Firebase Firestore documents (safe under 1MB limit).
 */
export async function compressImageFileToBase64(
  file: File,
  maxDimension = 850,
  quality = 0.75
): Promise<{ base64: string; sizeKb: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const raw = event.target?.result as string;
          resolve({
            base64: raw,
            sizeKb: Math.round(raw.length / 1024),
            width: img.width,
            height: img.height,
          });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL('image/jpeg', quality);
        const sizeKb = Math.round((base64.length * 3) / 4 / 1024);

        resolve({ base64, sizeKb, width, height });
      };
      img.onerror = (err) => reject(err);
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Recompresses an existing Base64 data URI to ensure it stays compact and safe for Firestore.
 */
export async function compressBase64Image(
  dataUri: string,
  maxDimension = 800,
  quality = 0.70
): Promise<string> {
  // If it's a web URL (http/https), no need to compress
  if (dataUri.startsWith('http://') || dataUri.startsWith('https://')) {
    return dataUri;
  }

  // If already very small (< 40KB base64 length < ~55,000 chars), return as is
  if (dataUri.length < 55000) {
    return dataUri;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUri);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const optimized = canvas.toDataURL('image/jpeg', quality);
      resolve(optimized);
    };
    img.onerror = () => {
      // Fallback to original if decoding fails
      resolve(dataUri);
    };
    img.src = dataUri;
  });
}

/**
 * Calculates estimated document size in Kilobytes for Firestore
 */
export function estimateProductDocSizeKb(product: any): number {
  try {
    const jsonStr = JSON.stringify(product);
    // Approximate UTF-8 byte length
    const bytes = new Blob([jsonStr]).size;
    return Math.round((bytes / 1024) * 10) / 10;
  } catch {
    return 0;
  }
}

/**
 * Automatic payload compressor: checks the total document size against Firestore's 1MB limit (1024 KB).
 * If the payload exceeds 650KB, it compresses all Base64 images progressively so the document
 * NEVER fails due to Firestore size limits.
 */
export async function ensureProductFitsFirestore(product: any, targetMaxKb = 650): Promise<any> {
  let currentSizeKb = estimateProductDocSizeKb(product);
  console.log(`📊 [Firestore Size Check] Product initial estimated size: ${currentSizeKb} KB (Target max: ${targetMaxKb} KB)`);

  if (currentSizeKb <= targetMaxKb) {
    return product;
  }

  console.warn(`⚠️ [Firestore Compression] Product size (${currentSizeKb} KB) exceeds safety threshold (${targetMaxKb} KB). Auto-compressing images...`);

  const cloned = { ...product };
  if (Array.isArray(cloned.images) && cloned.images.length > 0) {
    const optimizedImages: string[] = [];

    // Stage 1: Compress each base64 to 750px max, quality 0.68
    for (let i = 0; i < cloned.images.length; i++) {
      const img = cloned.images[i];
      if (typeof img === 'string' && img.startsWith('data:')) {
        const compressed = await compressBase64Image(img, 750, 0.68);
        optimizedImages.push(compressed);
      } else {
        optimizedImages.push(img);
      }
    }
    cloned.images = optimizedImages;
    currentSizeKb = estimateProductDocSizeKb(cloned);
    console.log(`📉 [Firestore Compression] Stage 1 finished. New size: ${currentSizeKb} KB`);

    // Stage 2: If still above target, apply tighter compression (600px, quality 0.58)
    if (currentSizeKb > targetMaxKb) {
      const stage2Images: string[] = [];
      for (let i = 0; i < cloned.images.length; i++) {
        const img = cloned.images[i];
        if (typeof img === 'string' && img.startsWith('data:')) {
          const compressed = await compressBase64Image(img, 600, 0.58);
          stage2Images.push(compressed);
        } else {
          stage2Images.push(img);
        }
      }
      cloned.images = stage2Images;
      currentSizeKb = estimateProductDocSizeKb(cloned);
      console.log(`📉 [Firestore Compression] Stage 2 finished. Final size: ${currentSizeKb} KB`);
    }
  }

  return cloned;
}

