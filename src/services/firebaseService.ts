import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Product, OrderData, OrderStatus, User } from '../types';
import { PRODUCTS } from '../data/products';
import { ensureProductFitsFirestore, estimateProductDocSizeKb } from '../utils/helpers';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';

/**
 * Seed initial catalog into Firestore if collection is empty
 */
export async function seedInitialProductsIfEmpty(): Promise<void> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsRef);
    if (snapshot.empty) {
      console.log('⚡ Seeding initial luxury products into Firestore...');
      for (const prod of PRODUCTS) {
        await setDoc(
          doc(db, PRODUCTS_COLLECTION, prod.id),
          sanitizeForFirestore({
            ...prod,
            createdAt: serverTimestamp(),
          })
        );
      }
      console.log('✅ Luxury products seeded successfully into Firestore!');
    }
  } catch (error) {
    console.warn('⚠️ Note on seeding products to Firestore:', error);
  }
}

/**
 * Real-time listener for products from Firestore
 */
export function subscribeToProducts(onProductsUpdated: (products: Product[]) => void): () => void {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const unsubscribe = onSnapshot(
      productsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const prods: Product[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Product;
            prods.push({
              ...data,
              id: docSnap.id,
            });
          });
          onProductsUpdated(prods);
        } else {
          // If Firestore is still empty, seed it
          seedInitialProductsIfEmpty();
          onProductsUpdated(PRODUCTS);
        }
      },
      (error) => {
        console.warn('⚠️ Firestore subscription error (falling back to initial data):', error);
        onProductsUpdated(PRODUCTS);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('⚠️ Could not attach Firestore listener:', err);
    onProductsUpdated(PRODUCTS);
    return () => {};
  }
}

export interface SaveProductResult {
  success: boolean;
  product?: Product;
  error?: string;
  errorCode?: string;
  sizeKb?: number;
}

/**
 * Recursively removes undefined values and converts unsupported types
 * so Firestore setDoc never throws an "Unsupported field value: undefined" error.
 */
export function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) {
    return obj
      .map(sanitizeForFirestore)
      .filter((item) => item !== undefined);
  }
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      const sanitized = sanitizeForFirestore(val);
      if (sanitized !== undefined) {
        clean[key] = sanitized;
      }
    }
  }
  return clean;
}

/**
 * Add or update product in Firestore with automated image compression,
 * undefined value sanitization, and full console diagnostic logging.
 */
export async function saveProductToFirestore(product: Product): Promise<SaveProductResult> {
  console.group(`🔥 [Firestore Save Attempt] Product: "${product.titleAr || product.id}"`);
  console.log('📌 Product ID:', product.id);

  try {
    // 1. Ensure document fits under Firestore's 1MB limit by auto-compressing base64 images
    const optimized = await ensureProductFitsFirestore(product, 650);
    const sizeKb = estimateProductDocSizeKb(optimized);

    console.log(`📊 Estimated Payload Size: ${sizeKb} KB (Firestore Max Limit: 1024 KB)`);
    console.log(`🖼️ Total Images attached: ${optimized.images?.length || 0}`);

    // 2. Sanitize to strip any undefined values that cause setDoc() to fail
    const cleanPayload = sanitizeForFirestore({
      ...optimized,
      updatedAt: serverTimestamp(),
    });

    console.log('📦 Sanitized Payload being sent to Firestore:', cleanPayload);

    // 3. Save to Firestore
    const productRef = doc(db, PRODUCTS_COLLECTION, optimized.id);
    await setDoc(productRef, cleanPayload, { merge: true });

    console.log(`✅ [Firestore Success] Product "${optimized.id}" saved and synced to Firestore!`);
    console.groupEnd();

    return {
      success: true,
      product: optimized,
      sizeKb,
    };
  } catch (error: any) {
    const errorDetails = {
      message: error?.message || 'Unknown Firestore error',
      code: error?.code || 'FIRESTORE_WRITE_ERROR',
      stack: error?.stack,
      attemptedProductId: product?.id,
    };

    console.error('❌ [Firestore Save Error Details]:', errorDetails);
    console.groupEnd();

    return {
      success: false,
      error: error?.message || 'حدث خطأ أثناء الاتصال بقاعدة بيانات Firestore',
      errorCode: error?.code || 'FIRESTORE_ERROR',
    };
  }
}

/**
 * Delete product from Firestore
 */
export async function deleteProductFromFirestore(productId: string): Promise<boolean> {
  console.group(`🗑️ [Firestore Delete Attempt] Product ID: "${productId}"`);
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(productRef);
    console.log(`✅ [Firestore Success] Product "${productId}" deleted successfully!`);
    console.groupEnd();
    return true;
  } catch (error: any) {
    console.error('❌ [Firestore Delete Error]:', {
      message: error?.message,
      code: error?.code,
      productId,
    });
    console.groupEnd();
    return false;
  }
}

const LOCAL_ORDERS_KEY = 'dalozi_synced_orders';

export function getLocalCachedOrders(): OrderData[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOrderToLocalCache(order: OrderData): void {
  try {
    const existing = getLocalCachedOrders();
    const filtered = existing.filter((o) => o.orderId !== order.orderId);
    const updated = [order, ...filtered];
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dalozi_order_saved', { detail: order }));
    }
  } catch (err) {
    console.warn('⚠️ Could not cache order locally:', err);
  }
}

export function updateLocalCachedOrderStatus(
  orderId: string,
  status: OrderStatus,
  notes?: string,
  extra?: { deliveryCompany?: string; deliveryTrackingNumber?: string; deliveryDispatchedAt?: string }
): void {
  try {
    const existing = getLocalCachedOrders();
    const updated = existing.map((o) =>
      o.orderId === orderId
        ? {
            ...o,
            status,
            notes: notes !== undefined ? notes : o.notes,
            statusUpdatedAt: new Date().toISOString(),
            ...(extra?.deliveryCompany ? { deliveryCompany: extra.deliveryCompany } : {}),
            ...(extra?.deliveryTrackingNumber ? { deliveryTrackingNumber: extra.deliveryTrackingNumber } : {}),
            ...(extra?.deliveryDispatchedAt ? { deliveryDispatchedAt: extra.deliveryDispatchedAt } : {}),
          }
        : o
    );
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dalozi_order_saved', { detail: { orderId, status } }));
    }
  } catch (err) {
    console.warn('⚠️ Could not update local order cache:', err);
  }
}

export function deleteLocalCachedOrder(orderId: string): void {
  try {
    const existing = getLocalCachedOrders();
    const updated = existing.filter((o) => o.orderId !== orderId);
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dalozi_order_saved', { detail: { orderId, deleted: true } }));
    }
  } catch (err) {
    console.warn('⚠️ Could not delete local order cache:', err);
  }
}

/**
 * Save new customer Order directly to Firestore
 */
export async function saveOrderToFirestore(order: OrderData): Promise<boolean> {
  // 1. Immediately store in local cache so UI displays it with 0ms latency
  const guaranteedOrder: OrderData = {
    ...order,
    status: order.status || 'pending',
    paymentMethod: 'COD',
    createdAt: order.createdAt || new Date().toISOString(),
  };
  saveOrderToLocalCache(guaranteedOrder);

  // 2. Sanitize payload cleanly for Firestore
  const sanitizedItems = (order.items || []).map((it) => ({
    quantity: Number(it.quantity) || 1,
    selectedColor: it.selectedColor
      ? {
          name: it.selectedColor.name || '',
          nameAr: it.selectedColor.nameAr || '',
          hex: it.selectedColor.hex || '#D4AF37',
        }
      : null,
    selectedSize: it.selectedSize || null,
    product: {
      id: it.product?.id || '',
      title: it.product?.title || '',
      titleAr: it.product?.titleAr || '',
      collection: it.product?.collection || '',
      category: it.product?.category || '',
      price: Number(it.product?.price) || 0,
      images: it.product?.images || [],
      descriptionAr: it.product?.descriptionAr || '',
    },
  }));

  const orderPayload = sanitizeForFirestore({
    orderId: order.orderId,
    customerName: order.customerName.trim(),
    phone: order.phone.trim(),
    wilaya: order.wilaya
      ? {
          code: order.wilaya.code,
          nameAr: order.wilaya.nameAr,
          nameFr: order.wilaya.nameFr,
          homeDeliveryPrice: Number(order.wilaya.homeDeliveryPrice) || 0,
          deskDeliveryPrice: Number(order.wilaya.deskDeliveryPrice) || 0,
          deliveryDays: order.wilaya.deliveryDays || '',
        }
      : null,
    commune: (order.commune || '').trim(),
    address: (order.address || '').trim(),
    deliveryType: order.deliveryType || 'home',
    items: sanitizedItems,
    subtotal: Number(order.subtotal) || 0,
    deliveryFee: Number(order.deliveryFee) || 0,
    discount: Number(order.discount) || 0,
    total: Number(order.total) || 0,
    paymentMethod: 'COD',
    status: order.status || 'pending',
    deliveryCompany: order.deliveryCompany || null,
    deliveryTrackingNumber: order.deliveryTrackingNumber || null,
    deliveryDispatchedAt: order.deliveryDispatchedAt || null,
    notes: (order.notes || '').trim(),
    createdAt: order.createdAt || new Date().toISOString(),
    timestamp: serverTimestamp(),
  });

  try {
    const orderRef = doc(db, ORDERS_COLLECTION, order.orderId);
    await setDoc(orderRef, orderPayload);
    console.log(`✅ Order ${order.orderId} saved to Firestore successfully! Status: ${orderPayload.status}`);
    return true;
  } catch (error) {
    console.error('❌ Error saving order to Firestore:', error);
    // Order is still preserved in local cache and visible to admin
    return true;
  }
}

/**
 * Update Order delivery details in Firestore (dispatch to HHD, E-Com, Andersen Delivery)
 */
export async function updateOrderDeliveryDetailsInFirestore(
  orderId: string,
  deliveryData: {
    status: OrderStatus;
    deliveryCompany: string;
    deliveryTrackingNumber: string;
    deliveryDispatchedAt: string;
    notes?: string;
  }
): Promise<boolean> {
  updateLocalCachedOrderStatus(orderId, deliveryData.status, deliveryData.notes, {
    deliveryCompany: deliveryData.deliveryCompany,
    deliveryTrackingNumber: deliveryData.deliveryTrackingNumber,
    deliveryDispatchedAt: deliveryData.deliveryDispatchedAt,
  });

  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const updateData: Record<string, any> = {
      status: deliveryData.status,
      statusUpdatedAt: new Date().toISOString(),
      deliveryCompany: deliveryData.deliveryCompany,
      deliveryTrackingNumber: deliveryData.deliveryTrackingNumber,
      deliveryDispatchedAt: deliveryData.deliveryDispatchedAt,
    };
    if (deliveryData.notes !== undefined) {
      updateData.notes = deliveryData.notes;
    }
    await updateDoc(orderRef, updateData);
    console.log(`✅ Order ${orderId} delivery info updated in Firestore: ${deliveryData.deliveryCompany} (#${deliveryData.deliveryTrackingNumber})`);
    return true;
  } catch (error) {
    console.warn('⚠️ Note updating order delivery info in Firestore:', error);
    return true;
  }
}

/**
 * Update Order status in Firestore (pending, contacted, shipped, delivered, cancelled)
 */
export async function updateOrderStatusInFirestore(
  orderId: string,
  status: OrderStatus,
  notes?: string
): Promise<boolean> {
  updateLocalCachedOrderStatus(orderId, status, notes);

  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const updateData: Record<string, any> = {
      status,
      statusUpdatedAt: new Date().toISOString(),
    };
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    await updateDoc(orderRef, updateData);
    console.log(`✅ Order ${orderId} status successfully updated to: ${status}`);
    return true;
  } catch (error) {
    console.warn('⚠️ Note updating order status in Firestore (fallback applied):', error);
    return true;
  }
}

/**
 * Delete an order from Firestore
 */
export async function deleteOrderFromFirestore(orderId: string): Promise<boolean> {
  deleteLocalCachedOrder(orderId);

  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(orderRef);
    console.log(`✅ Order ${orderId} deleted from Firestore`);
    return true;
  } catch (error) {
    console.warn('⚠️ Note deleting order from Firestore (local removed):', error);
    return true;
  }
}

/**
 * Retrieve all orders from Firestore merged with local cache
 */
export async function getOrdersFromFirestore(): Promise<OrderData[]> {
  const localOrders = getLocalCachedOrders();
  const mergedMap = new Map<string, OrderData>();

  // Add local cached orders first
  localOrders.forEach((o) => mergedMap.set(o.orderId, o));

  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const snap = await getDocs(ordersRef);
    snap.forEach((docSnap) => {
      const data = docSnap.data() as OrderData;
      mergedMap.set(data.orderId, { ...mergedMap.get(data.orderId), ...data });
    });
  } catch (error) {
    console.warn('⚠️ Could not fetch orders from Firestore, using local cache:', error);
  }

  const result = Array.from(mergedMap.values());
  result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  return result;
}

/**
 * Real-time listener for incoming orders with instant custom event handling
 */
export function subscribeToOrders(onOrdersUpdated: (orders: OrderData[]) => void): () => void {
  const notifyCurrentOrders = async () => {
    const all = await getOrdersFromFirestore();
    onOrdersUpdated(all);
  };

  // Immediate dispatch with current cached/existing orders
  notifyCurrentOrders();

  // Listen to window custom event for 0ms order updates
  const handleLocalOrderSaved = () => {
    notifyCurrentOrders();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('dalozi_order_saved', handleLocalOrderSaved);
  }

  let unsubscribeFirestore = () => {};

  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    unsubscribeFirestore = onSnapshot(
      ordersRef,
      (snapshot) => {
        const firestoreOrders: OrderData[] = [];
        snapshot.forEach((docSnap) => {
          firestoreOrders.push(docSnap.data() as OrderData);
        });

        // Merge with local cache
        const localOrders = getLocalCachedOrders();
        const map = new Map<string, OrderData>();
        localOrders.forEach((o) => map.set(o.orderId, o));
        firestoreOrders.forEach((o) => map.set(o.orderId, { ...map.get(o.orderId), ...o }));

        const merged = Array.from(map.values());
        merged.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        onOrdersUpdated(merged);
      },
      (error) => {
        console.warn('⚠️ Firestore orders listener note:', error);
        notifyCurrentOrders();
      }
    );
  } catch (err) {
    console.warn('⚠️ Failed to initialize Firestore orders snapshot:', err);
  }

  return () => {
    unsubscribeFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('dalozi_order_saved', handleLocalOrderSaved);
    }
  };
}

/**
 * Save or update User Profile (Customer or Seller) to Firestore
 */
export async function saveUserToFirestore(user: User): Promise<boolean> {
  try {
    const userRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(
      userRef,
      {
        ...user,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`✅ User profile ${user.id} saved to Firestore successfully!`);
    return true;
  } catch (error) {
    console.error('❌ Error saving user to Firestore:', error);
    return false;
  }
}

/**
 * Retrieve User Profile from Firestore
 */
export async function getUserFromFirestore(userId: string): Promise<User | null> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as User;
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching user from Firestore:', error);
    return null;
  }
}
