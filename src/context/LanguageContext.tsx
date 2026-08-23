import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import nl from '../translations/nl';
import en from '../translations/en';

export type Locale = 'nl' | 'en';

export const DEFAULT_LOCALE: Locale = 'en';

const LOCALE_RE = /^\/(en|nl)(\/|$)/;

export function localeFromPath(pathname: string): Locale | null {
  const m = pathname.match(LOCALE_RE);
  return m ? (m[1] as Locale) : null;
}

export function stripLocale(pathname: string): string {
  const m = pathname.match(/^\/(en|nl)(\/.*)?$/);
  if (!m) return pathname;
  return m[2] || '/';
}

export function localizePath(path: string, locale: Locale): string {
  if (path === '/admin' || path.startsWith('/admin/')) return path;
  const inner = path === '/' ? '' : path;
  const localized = `/${locale}${inner}`;
  // Trailing slash = canonical form (see prerender.mjs canonicalRoute).
  return localized.endsWith('/') ? localized : `${localized}/`;
}

interface LanguageContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = { nl, en };

export function LanguageProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const urlLocale = localeFromPath(location.pathname);

  const [savedLocale, setSavedLocale] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem('maison-tislit-locale');
      if (saved === 'nl' || saved === 'en') return saved;
    } catch {}
    return DEFAULT_LOCALE;
  });

  const locale: Locale = urlLocale ?? savedLocale;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const handleSetLocale = (l: Locale) => {
    try { localStorage.setItem('maison-tislit-locale', l); } catch {}
    setSavedLocale(l);
    if (urlLocale && urlLocale !== l) {
      navigate(localizePath(stripLocale(location.pathname), l));
    }
  };

  const t = (key: string): string => {
    const val = translations[locale][key as keyof typeof nl];
    return val !== undefined ? val : key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useTranslation must be used within LanguageProvider');
  return ctx;
};