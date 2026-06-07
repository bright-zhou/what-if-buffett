import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hints } from './Hints';
import { translations } from '../i18n';
import type { Language } from '../i18n';

const { langRef, setLang } = vi.hoisted(() => {
  const ref: { current: Language } = { current: 'zh' };
  return {
    langRef: ref,
    setLang: (l: Language) => {
      ref.current = l;
    },
  };
});

vi.mock('../i18n/useLang', () => ({
  useLang: () => ({
    lang: langRef.current,
    t: (key: string) =>
      translations[langRef.current][key as keyof typeof translations.zh] ?? key,
    toggleLang: () => {},
  }),
}));

describe('Hints', () => {
  beforeEach(() => {
    setLang('zh');
  });

  it('renders 5 hint items in Chinese by default', () => {
    render(<Hints />);
    expect(screen.getByText(translations.zh['hint.drag'])).toBeInTheDocument();
    expect(screen.getByText(translations.zh['hint.wheel'])).toBeInTheDocument();
    expect(screen.getByText(translations.zh['hint.pan'])).toBeInTheDocument();
    expect(screen.getByText(translations.zh['hint.arrow'])).toBeInTheDocument();
    expect(screen.getByText(translations.zh['hint.dblclick'])).toBeInTheDocument();
  });

  it('renders 5 hint items in English when lang is en', () => {
    setLang('en');
    render(<Hints />);
    expect(screen.getByText(translations.en['hint.drag'])).toBeInTheDocument();
    expect(screen.getByText(translations.en['hint.wheel'])).toBeInTheDocument();
    expect(screen.getByText(translations.en['hint.pan'])).toBeInTheDocument();
    expect(screen.getByText(translations.en['hint.arrow'])).toBeInTheDocument();
    expect(screen.getByText(translations.en['hint.dblclick'])).toBeInTheDocument();
  });

  it('uses a separator between hints (4 separators for 5 items)', () => {
    const { container } = render(<Hints />);
    // Each separator is a '·' rendered in its own <span>. There should be 4.
    const separators = Array.from(container.querySelectorAll('span')).filter(
      (el) => el.textContent === '·',
    );
    expect(separators).toHaveLength(4);
  });
});
