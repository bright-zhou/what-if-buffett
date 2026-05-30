import { useLang } from '../i18n/LanguageContext';

interface HeaderProps { onReset: () => void }

export function Header({ onReset }: HeaderProps) {
  const { t, lang, toggleLang } = useLang();

  return (
    <header style={{ textAlign: 'center', padding: '24px 0 8px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -8 }}>
        <button
          onClick={toggleLang}
          title={lang === 'zh' ? 'Switch to English' : '切换到中文'}
          style={{
            background: 'none', border: 'none',
            color: '#64748b', cursor: 'pointer',
            fontSize: 11, fontFamily: 'inherit',
            padding: 0, opacity: 0.6,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
        >
          {lang === 'zh' ? 'EN' : '中'}
        </button>
      </div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>{t('app.title')}</h1>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 4 }}>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>
          {t('app.subtitle')}
        </p>
        <button onClick={onReset} style={{
          background: '#334155', color: '#e2e8f0', border: '1px solid #475569',
          padding: '3px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12,
        }}>
          {t('app.reset')}
        </button>
      </div>
    </header>
  );
}
