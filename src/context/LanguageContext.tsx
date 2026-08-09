import { createContext, useContext, useState, ReactNode } from 'react';
import fr from '../translations/fr';
import en from '../translations/en';

type Locale = 'fr' | 'en';

interface LanguageContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = { fr, en };

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem('maison-tislit-locale');
      if (saved === 'fr' || saved === 'en') return saved;
    } catch {}
    return 'en';
  });

  const handleSetLocale = (l: Locale) => {
    setLocale(l);
    try { localStorage.setItem('maison-tislit-locale', l); } catch {}
  };

  const t = (key: string): string => {
    const val = translations[locale][key as keyof typeof fr];
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
