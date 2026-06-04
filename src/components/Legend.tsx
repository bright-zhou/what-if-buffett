import { useLang } from '../i18n/LanguageContext';

export function Legend() {
  const { t } = useLang();
  const items = [
    { color: '#3b82f6', label: t('legend.buffett') },
    { color: '#64748b', label: t('legend.sp500') },
    { color: '#f59e0b', label: t('legend.user') },
  ];
  return (
    <div style={{ display: 'flex', gap: 20, justifyContent: 'center', padding: '8px 0' }}>
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: item.color }} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
