import zh from './zh';
import en from './en';

export type TranslationKey = keyof typeof zh;

export const translations = { zh, en } as const;

export type Language = keyof typeof translations;
