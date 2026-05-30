import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Language, TranslationKey } from './index';
import { translations } from './index';

interface LanguageContextType {
  lang: Language;
  t: (key: TranslationKey) => string;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function getInitialLang(): Language {
  try {
    const stored = localStorage.getItem('whatif-lang');
    if (stored === 'en' || stored === 'zh') return stored;
  } catch { /* localStorage unavailable */ }
  return 'zh';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(getInitialLang);

  const t = useCallback((key: TranslationKey) => translations[lang][key], [lang]);

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'zh' ? 'en' : 'zh';
      try { localStorage.setItem('whatif-lang', next); } catch { /* */ }
      return next;
    });
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
