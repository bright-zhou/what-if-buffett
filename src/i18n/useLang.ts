import { createContext, useContext } from 'react';
import type { Language, TranslationKey } from './index';

export interface LanguageContextType {
  lang: Language;
  t: (key: TranslationKey) => string;
  toggleLang: () => void;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
