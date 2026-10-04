declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_ID = 'G-K1GHXHZCEX';
export const CONSENT_KEY = 'mt-cookie-consent';
/** Dispatched (e.g. from the footer) to withdraw consent and re-open the banner. */
export const CONSENT_RESET_EVENT = 'mt:cookie-reset';

export type ConsentChoice = 'granted' | 'denied';

let gaLoaded = false;
let gaLoading: Promise<void> | null = null;
const loadListeners = new Set<() => void>();

function isProdHost(): boolean {
  return /(^|\.)maisontislit\.com$/.test(window.location.hostname);
}

function gtag(...args: unknown[]): void {
  if (typeof window.gtag === 'function') window.gtag(...args);
}

/** Push a Consent Mode v2 update. Safe to call before the GA library loads. */
export function updateConsent(granted: boolean): void {
  const state = granted ? 'granted' : 'denied';
  gtag('consent', 'update', {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  });
}

function notifyLoaded(): void {
  gaLoaded = true;
  loadListeners.forEach(cb => cb());
}

export function isGaLoaded(): boolean {
  return gaLoaded;
}

/** Subscribe to the one-time GA library load. Returns an unsubscribe fn. */
export function onGaLoaded(cb: () => void): () => void {
  if (gaLoaded) {
    cb();
    return () => {};
  }
  loadListeners.add(cb);
  return () => {
    loadListeners.delete(cb);
  };
}

/** Inject gtag.js (production host only) and configure GA. Resolves once. */
export function loadGa(): Promise<void> {
  if (gaLoaded) return Promise.resolve();
  if (gaLoading) return gaLoading;
  gaLoading = new Promise<void>((resolve, reject) => {
    if (!isProdHost()) {
      // Local dev / previews / prerender: pretend it loaded so trackers stay quiet.
      notifyLoaded();
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="googletagmanager.com/gtag/js"]'
    );
    if (existing) {
      notifyLoaded();
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    s.onload = () => {
      gtag('js', new Date());
      // Initial page_view for the current page; the SPA tracker handles the rest.
      gtag('config', GA_ID);
      notifyLoaded();
      resolve();
    };
    s.onerror = () => reject(new Error('gtag.js failed to load'));
    document.head.appendChild(s);
  });
  return gaLoading;
}

export function readStoredConsent(): ConsentChoice | null {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

export function storeConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // Private mode etc: banner simply reappears next visit.
  }
}

export function clearStoredConsent(): void {
  try {
    window.localStorage.removeItem(CONSENT_KEY);
  } catch {
    // ignore
  }
}

export function acceptConsent(): void {
  storeConsent('granted');
  updateConsent(true);
  loadGa().catch(() => {
    // Ad-blocked or offline: analytics stays off, site keeps working.
  });
}

export function declineConsent(): void {
  storeConsent('denied');
  updateConsent(false);
}
