import { useLang } from '../i18n/LanguageContext';
import { Slider } from './Slider';
import { FRICTION_RANGE, LEVERAGE_RANGE } from '../parameters/ranges';
import type { Parameters } from '../parameters/apply';

interface ParameterPanelProps {
  parameters: Parameters;
  onChange: (next: Parameters) => void;
  onReset: () => void;
}

const formatFriction = (v: number) => `${(v * 100).toFixed(1)}%`;
const formatLeverage = (v: number) => `${v.toFixed(1)}x`;

export function ParameterPanel({ parameters, onChange, onReset }: ParameterPanelProps) {
  const { t } = useLang();

  return (
    <div style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: 8,
      padding: '16px 20px',
      margin: '12px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 240px', minWidth: 240 }}>
          <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>
            {t('param.friction')}
          </div>
          <Slider
            min={FRICTION_RANGE.min}
            max={FRICTION_RANGE.max}
            step={FRICTION_RANGE.step}
            value={parameters.friction}
            onChange={v => onChange({ ...parameters, friction: v })}
            snapPoints={FRICTION_RANGE.snapPoints}
            format={formatFriction}
            ariaLabel={t('param.friction')}
          />
        </div>
        <div style={{ flex: '1 1 240px', minWidth: 240 }}>
          <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>
            {t('param.leverage')}
          </div>
          <Slider
            min={LEVERAGE_RANGE.min}
            max={LEVERAGE_RANGE.max}
            step={LEVERAGE_RANGE.step}
            value={parameters.leverage}
            onChange={v => onChange({ ...parameters, leverage: v })}
            snapPoints={LEVERAGE_RANGE.snapPoints}
            format={formatLeverage}
            ariaLabel={t('param.leverage')}
          />
        </div>
      </div>
      <div>
        <button
          onClick={onReset}
          style={{
            background: '#334155', color: '#e2e8f0',
            border: '1px solid #475569',
            padding: '4px 12px', borderRadius: 4,
            cursor: 'pointer', fontSize: 12,
          }}
        >
          {t('param.reset')}
        </button>
      </div>
    </div>
  );
}
