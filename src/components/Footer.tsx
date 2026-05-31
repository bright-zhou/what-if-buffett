import { useLang } from '../i18n/LanguageContext';

export function Footer() {
  const { t } = useLang();
  return (
    <footer style={{ textAlign: 'center', padding: '16px 0', color: '#64748b', fontSize: 12 }}>
      <p style={{ margin: 0 }}>{t('footer.source')}</p>
      <p style={{ margin: '4px 0 0' }}>
        <a
          href="https://github.com/bright-zhou/what-if-buffett/issues"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#64748b', textDecoration: 'underline' }}
        >
          {t('footer.feedback')}
        </a>
        {' · '}
        {t('footer.quote')}
      </p>
    </footer>
  );
}
