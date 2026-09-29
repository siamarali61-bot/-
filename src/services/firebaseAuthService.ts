import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut,
  User as FirebaseUser,
  FacebookAuthProvider,
} from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Formats an Algerian phone number to standard E.164 (+213XXXXXXXXX)
 */
export function formatAlgerianPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');

  if (cleaned.startsWith('00213')) {
    cleaned = '+' + cleaned.slice(2);
  } else if (cleaned.startsWith('213')) {
    cleaned = '+' + cleaned;
  } else if (cleaned.startsWith('0')) {
    cleaned = '+213' + cleaned.slice(1);
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+213' + cleaned;
  }

  return cleaned;
}

/**
 * Creates GoogleAuthProvider configured with prompt: 'select_account'
 * to always show account picker on mobile and desktop
 */
export function createGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account',
  });
  return provider;
}

/**
 * Official Real Firebase Google Sign-In
 * Defaults to signInWithPopup for direct instant response, supports signInWithRedirect
 */
export async function signInWithGoogle(method: 'popup' | 'redirect' = 'popup'): Promise<FirebaseUser | null> {
  const provider = createGoogleProvider();
  if (method === 'redirect') {
    await signInWithRedirect(auth, provider);
    return null;
  } else {
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error: any) {
      if (
        error?.code === 'auth/popup-blocked' ||
        error?.code === 'auth/cancelled-popup-request'
      ) {
        console.warn('Popup was blocked, falling back to Firebase redirect...', error);
        await signInWithRedirect(auth, provider);
        return null;
      }
      throw error;
    }
  }
}

/**
 * Check if user is returning from Firebase Google signInWithRedirect
 */
export async function checkRedirectResult(): Promise<FirebaseUser | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return result.user;
    }
    return null;
  } catch (error: any) {
    console.warn('⚠️ Firebase getRedirectResult note:', error?.message || error);
    return null;
  }
}

/**
 * Official Real Firebase Facebook Sign-In
 */
export async function signInWithFacebook(): Promise<FirebaseUser> {
  const provider = new FacebookAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

/**
 * Setup or get existing RecaptchaVerifier for Phone SMS
 */
export function getOrCreateRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  const existing = (window as unknown as { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier;
  if (existing) {
    try {
      existing.clear();
    } catch {}
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired, please retry verification.');
    },
  });

  (window as unknown as { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Send real SMS verification code via Firebase Phone Auth
 */
export async function sendFirebasePhoneVerification(
  phoneNumber: string,
  containerId = 'recaptcha-container'
): Promise<ConfirmationResult> {
  const formatted = formatAlgerianPhoneNumber(phoneNumber);
  const verifier = getOrCreateRecaptchaVerifier(containerId);
  const confirmationResult = await signInWithPhoneNumber(auth, formatted, verifier);
  return confirmationResult;
}

/**
 * Confirm the SMS code with Firebase ConfirmationResult
 */
export async function confirmFirebasePhoneCode(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<FirebaseUser> {
  const result = await confirmationResult.confirm(code);
  return result.user;
}

/**
 * Sign out from Firebase Auth
 */
export async function signOutFromFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Note signing out from Firebase:', err);
  }
}
