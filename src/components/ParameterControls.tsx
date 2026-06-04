import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useLang } from '../i18n/LanguageContext';
import { Slider } from './Slider';
import { FRICTION_RANGE, LEVERAGE_RANGE } from '../parameters/ranges';
import type { Parameters } from '../parameters/apply';

interface ParameterControlsProps {
  parameters: Parameters;
  onChange: (next: Parameters) => void;
}

const formatFriction = (v: number) => `${(v * 100).toFixed(1)}%`;
const formatLeverage = (v: number) => `${v.toFixed(1)}x`;

type OpenKey = 'friction' | 'leverage' | null;

interface ParamButtonWithDropdownProps {
  label: string;
  value: string;
  active: boolean;
  onClick: () => void;
  children?: ReactNode;
}

function ParamButtonWithDropdown({
  label,
  value,
  active,
  onClick,
  children,
}: ParamButtonWithDropdownProps) {
  const buttonStyle: CSSProperties = {
    background: active ? '#475569' : '#334155',
    color: '#e2e8f0',
    border: `1px solid ${active ? '#f59e0b' : '#475569'}`,
    padding: '3px 10px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 14,
    whiteSpace: 'nowrap',
    transition: 'background 0.15s, border-color 0.15s',
  };
  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={onClick}
        aria-expanded={active}
        style={buttonStyle}
        onMouseEnter={e => {
          if (!active) e.currentTarget.style.background = '#3f4a5b';
        }}
        onMouseLeave={e => {
          if (!active) e.currentTarget.style.background = '#334155';
        }}
      >
        {label} {value}
      </button>
      {children}
    </div>
  );
}

export function ParameterControls({ parameters, onChange }: ParameterControlsProps) {
  const { t } = useLang();
  const [openKey, setOpenKey] = useState<OpenKey>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click. Re-binds when openKey changes so the listener
  // is only active while a slider is open.
  useEffect(() => {
    if (openKey === null) return;
    const handleMouseDown = (e: MouseEvent) => {
      const root = containerRef.current;
      if (root && !root.contains(e.target as Node)) {
        setOpenKey(null);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [openKey]);

  const handleFrictionClick = () => {
    setOpenKey(prev => (prev === 'friction' ? null : 'friction'));
  };
  const handleLeverageClick = () => {
    setOpenKey(prev => (prev === 'leverage' ? null : 'leverage'));
  };

  const frictionLabel = t('param.friction');
  const leverageLabel = t('param.leverage');

  return (
    <div
      ref={containerRef}
      // marginRight = SummaryCards width (210) + chart-row gap (16),
      // so the leverage button's right edge aligns with the chart's right edge.
      style={{ display: 'flex', gap: 8, alignItems: 'center', marginRight: 226 }}
    >
      <ParamButtonWithDropdown
        label={frictionLabel}
        value={formatFriction(parameters.friction)}
        active={openKey === 'friction'}
        onClick={handleFrictionClick}
      >
        {openKey === 'friction' && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 4,
              padding: '24px 14px',
              zIndex: 10,
            }}
          >
            <Slider
              min={FRICTION_RANGE.min}
              max={FRICTION_RANGE.max}
              step={FRICTION_RANGE.step}
              value={parameters.friction}
              onChange={v => onChange({ ...parameters, friction: v })}
              snapPoints={FRICTION_RANGE.snapPoints}
              format={formatFriction}
              ariaLabel={frictionLabel}
            />
          </div>
        )}
      </ParamButtonWithDropdown>

      <ParamButtonWithDropdown
        label={leverageLabel}
        value={formatLeverage(parameters.leverage)}
        active={openKey === 'leverage'}
        onClick={handleLeverageClick}
      >
        {openKey === 'leverage' && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 4,
              padding: '24px 14px',
              zIndex: 10,
            }}
          >
            <Slider
              min={LEVERAGE_RANGE.min}
              max={LEVERAGE_RANGE.max}
              step={LEVERAGE_RANGE.step}
              value={parameters.leverage}
              onChange={v => onChange({ ...parameters, leverage: v })}
              snapPoints={LEVERAGE_RANGE.snapPoints}
              format={formatLeverage}
              ariaLabel={leverageLabel}
            />
          </div>
        )}
      </ParamButtonWithDropdown>
    </div>
  );
}
