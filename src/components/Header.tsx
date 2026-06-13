import { useLang } from '../i18n/useLang';

interface HeaderProps {
  onReset: () => void;
  shouldBreath?: boolean;
}

export function Header({ onReset, shouldBreath = false }: HeaderProps) {
  const { t, lang, toggleLang } = useLang();

  return (
    <header style={{ textAlign: 'center', padding: '24px 0 8px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -8 }}>
        <button
          onClick={toggleLang}
          title={lang === 'zh' ? 'Switch to English' : '切换到中文'}
          style={{
            background: 'none', border: 'none',
            color: '#94a3b8', cursor: 'pointer',
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
      <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em' }}>{t('app.title')}</h1>
      <h2
        style={{
          position: 'absolute',
          width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden',
          clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0,
        }}
      >
        {t('app.valueProp')}
      </h2>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 4 }}>
        <p
          className={shouldBreath ? 'breathing' : undefined}
          style={{
            margin: 0,
            color: '#94a3b8',
            fontSize: 14,
            letterSpacing: '-0.01em',
            animation: shouldBreath ? 'subtitle-breathing 2.4s ease-in-out infinite' : undefined,
            transition: 'opacity 0.2s ease',
          }}
        >
          {t('app.subtitle')}
        </p>
        <button onClick={onReset} style={{
          background: '#334155', color: '#e2e8f0', border: '1px solid #475569',
          padding: '3px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 14,
          transition: 'background 0.15s, border-color 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#475569';
          e.currentTarget.style.borderColor = '#64748b';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#334155';
          e.currentTarget.style.borderColor = '#475569';
        }}
        >
          {t('app.reset')}
        </button>
      </div>
    </header>
  );
}
