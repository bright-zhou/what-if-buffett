import { useLang } from '../i18n/LanguageContext';

export function Footer() {
  const { t } = useLang();
  return (
    <footer style={{ textAlign: 'center', padding: '16px 0', color: '#64748b', fontSize: 12 }}>
      <p style={{ margin: 0 }}>{t('footer.source')}</p>
      <p style={{ margin: '4px 0 0' }}>
        {t('footer.quote')}
      </p>
    </footer>
  );
}
