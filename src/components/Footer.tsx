import { useLang } from '../i18n/useLang';

export function Footer() {
  const { t } = useLang();
  return (
    <footer style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: 12 }}>
      <p style={{ margin: 0 }}>{t('footer.source')}</p>
      <p style={{ margin: '4px 0 0' }}>
        {t('footer.quote')}
      </p>
      <p style={{ margin: '4px 0 0' }}>
        <a
          href="https://github.com/bright-zhou/what-if-buffett/issues"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#64748b', textDecoration: 'underline' }}
        >
          {t('footer.feedback')}
        </a>
      </p>
    </footer>
  );
}
