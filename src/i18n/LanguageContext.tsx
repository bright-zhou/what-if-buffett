import { useState, useCallback, useMemo, type ReactNode } from 'react';
import type { Language, TranslationKey } from './index';
import { translations } from './index';
import { LanguageContext, type LanguageContextType } from './useLang';

const STORAGE_KEY = 'whatif-lang';

// Outbound-first: default 'en' aligns with og:locale=en_US primary and
// hreflang en primary. First-time visitors (incl. Googlebot) see English.
// Localized users (zh toggle persisted) are preserved.
function getInitialLang(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'zh') return stored;
  } catch { /* localStorage unavailable */ }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(getInitialLang);

  const t = useCallback((key: TranslationKey) => translations[lang][key], [lang]);

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'zh' ? 'en' : 'zh';
      try { localStorage.setItem(STORAGE_KEY, next); } catch { /* localStorage unavailable */ }
      return next;
    });
  }, []);

  const value = useMemo<LanguageContextType>(
    () => ({ lang, t, toggleLang }),
    [lang, t, toggleLang],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
