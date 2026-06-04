import { useRef, useEffect, type CSSProperties } from 'react';

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  snapPoints?: readonly number[];
  format?: (v: number) => string;
  ariaLabel: string;
}

const TRACK_HEIGHT = 4;
const THUMB_SIZE = 16;
const TRACK_LENGTH = 220;
const TICK_DOT_SIZE = 4;
const TRACK_TO_LABEL_GAP = 12;
const TICK_LABEL_FONT = 12;
const TICK_COL_WIDTH = 40;

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function roundToStep(v: number, step: number, min: number): number {
  const steps = Math.round((v - min) / step);
  return Number((min + steps * step).toFixed(10));
}

export function Slider({
  min, max, step, value, onChange,
  snapPoints, format, ariaLabel,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const computeValue = (clientY: number): number | null => {
    const track = trackRef.current;
    if (!track) return null;
    const rect = track.getBoundingClientRect();
    const ratio = clamp((clientY - rect.top) / rect.height, 0, 1);
    const raw = min + ratio * (max - min);
    return clamp(roundToStep(raw, step, min), min, max);
  };
  const computeValueRef = useRef(computeValue);
  computeValueRef.current = computeValue;

  const percentage = ((value - min) / (max - min)) * 100;

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const next = computeValueRef.current(e.clientY);
      if (next !== null) onChangeRef.current(next);
    };
    const handleUp = () => { draggingRef.current = false; };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [min, max, step]);

  const handleMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;
    const next = computeValue(e.clientY);
    if (next !== null) onChange(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(clamp(roundToStep(value + step, step, min), min, max));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(clamp(roundToStep(value - step, step, min), min, max));
    }
  };

  const wrapperStyle: CSSProperties = {
    width: TRACK_HEIGHT + TRACK_TO_LABEL_GAP + TICK_COL_WIDTH,
    height: TRACK_LENGTH,
    userSelect: 'none',
  };
  const trackStyle: CSSProperties = {
    position: 'relative',
    width: TRACK_HEIGHT,
    height: TRACK_LENGTH,
    cursor: 'ns-resize',
  };
  const trackBgStyle: CSSProperties = {
    position: 'absolute', top: 0, bottom: 0, left: 0,
    width: TRACK_HEIGHT, background: '#334155', borderRadius: TRACK_HEIGHT / 2,
  };
  const trackFilledStyle: CSSProperties = {
    position: 'absolute', top: 0, left: 0,
    height: `${percentage}%`, width: TRACK_HEIGHT,
    background: '#f59e0b', borderRadius: TRACK_HEIGHT / 2,
  };
  const thumbStyle: CSSProperties = {
    position: 'absolute',
    top: `calc(${percentage}% - ${THUMB_SIZE / 2}px)`,
    left: '50%', transform: 'translateX(-50%)',
    width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: '50%',
    background: '#f59e0b', border: '2px solid rgba(255,255,255,0.7)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.4)', cursor: 'grab',
  };
  const tickColumnStyle: CSSProperties = {
    position: 'relative',
    height: '100%',
    width: TICK_COL_WIDTH,
    marginLeft: TRACK_TO_LABEL_GAP,
  };

  return (
    <div style={wrapperStyle}>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <div
          ref={trackRef}
          data-testid="slider-track"
          onMouseDown={handleMouseDown}
          style={trackStyle}
        >
          <div style={trackBgStyle} />
          <div style={trackFilledStyle} />
          {snapPoints?.map(point => {
            const pos = ((point - min) / (max - min)) * 100;
            return (
              <div
                key={point}
                style={{
                  position: 'absolute',
                  top: `calc(${pos}% - ${TICK_DOT_SIZE / 2}px)`,
                  left: 0,
                  width: TICK_DOT_SIZE,
                  height: TICK_DOT_SIZE,
                  borderRadius: '50%',
                  background: '#94a3b8',
                  pointerEvents: 'none',
                }}
              />
            );
          })}
          <div
            role="slider"
            aria-label={ariaLabel}
            aria-orientation="vertical"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            style={thumbStyle}
          />
        </div>
        {snapPoints && (
          <div style={tickColumnStyle}>
            {snapPoints.map(point => {
              const pos = ((point - min) / (max - min)) * 100;
              const label = format ? format(point) : point.toString();
              return (
                <button
                  key={point}
                  type="button"
                  aria-label={`snap to ${point}`}
                  onClick={() => onChange(clamp(point, min, max))}
                  style={{
                    position: 'absolute',
                    top: `calc(${pos}% - 8px)`,
                    left: 0,
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: '#94a3b8',
                    fontSize: TICK_LABEL_FONT,
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
