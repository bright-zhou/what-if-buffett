import { useLang } from '../i18n/useLang';

const SEP = '·';

export function Hints() {
  const { t } = useLang();
  const hints = [
    t('hint.drag'),
    t('hint.dblclick'),
    t('hint.wheel'),
    t('hint.pan'),
    t('hint.arrow'),
  ];
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '10px 0 2px',
        color: '#94a3b8',
        fontSize: 12,
        letterSpacing: '0.01em',
      }}
    >
      {hints.map((hint, i) => (
        <span key={hint}>
          {i > 0 && (
            <span style={{ margin: '0 10px', opacity: 0.45 }}>{SEP}</span>
          )}
          {hint}
        </span>
      ))}
    </div>
  );
}
