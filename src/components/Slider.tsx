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
  orientation?: 'horizontal' | 'vertical';
}

const TRACK_HEIGHT = 4;
const THUMB_SIZE = 16;
const TICK_HEIGHT = 8;
const TRACK_LENGTH = 160;

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
  orientation = 'horizontal',
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const isVertical = orientation === 'vertical';

  const computeValue = (clientAxis: number): number | null => {
    const track = trackRef.current;
    if (!track) return null;
    const rect = track.getBoundingClientRect();
    const ratio = isVertical
      ? clamp((clientAxis - rect.top) / rect.height, 0, 1)
      : clamp((clientAxis - rect.left) / rect.width, 0, 1);
    const raw = min + ratio * (max - min);
    return clamp(roundToStep(raw, step, min), min, max);
  };
  const computeValueRef = useRef(computeValue);
  computeValueRef.current = computeValue;

  const percentage = ((value - min) / (max - min)) * 100;
  const displayValue = format ? format(value) : value.toString();

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const next = computeValueRef.current(isVertical ? e.clientY : e.clientX);
      if (next !== null) onChangeRef.current(next);
    };
    const handleUp = () => { draggingRef.current = false; };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [min, max, step, isVertical]);

  const handleMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;
    const next = computeValue(isVertical ? e.clientY : e.clientX);
    if (next !== null) onChange(next);
  };

  // Forward compat: horizontal uses Left/Right; vertical uses Up/Down.
  // All four keys are accepted regardless of orientation so screen readers
  // and users with custom bindings can still drive the slider.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(clamp(roundToStep(value + step, step, min), min, max));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(clamp(roundToStep(value - step, step, min), min, max));
    }
  };

  if (isVertical) {
    const wrapperStyle: CSSProperties = {
      width: THUMB_SIZE + 24,
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
      background: '#f59e0b', border: '2px solid #1e293b',
      boxShadow: '0 2px 4px rgba(0,0,0,0.4)', cursor: 'grab',
    };
    const tickRowStyle: CSSProperties = {
      position: 'relative',
      height: '100%',
      width: 8,
      marginLeft: 4,
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
            <div
              role="slider"
              aria-label={ariaLabel}
              aria-orientation={orientation}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={value}
              tabIndex={0}
              onKeyDown={handleKeyDown}
              style={thumbStyle}
            />
          </div>
          {snapPoints && (
            <div style={tickRowStyle}>
              {snapPoints.map(point => {
                const pos = ((point - min) / (max - min)) * 100;
                return (
                  <button
                    key={point}
                    type="button"
                    aria-label={`snap to ${point}`}
                    onClick={() => onChange(clamp(point, min, max))}
                    style={{
                      position: 'absolute',
                      top: `calc(${pos}% - 1px)`,
                      left: 0,
                      width: 8, height: 2, padding: 0, border: 'none',
                      background: '#64748b', cursor: 'pointer',
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', userSelect: 'none' }}>
      <div style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
        {displayValue}
      </div>
      <div
        ref={trackRef}
        data-testid="slider-track"
        onMouseDown={handleMouseDown}
        style={{
          position: 'relative',
          height: THUMB_SIZE,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{
          position: 'absolute', left: 0, right: 0,
          height: TRACK_HEIGHT, background: '#334155', borderRadius: TRACK_HEIGHT / 2,
        }} />
        <div style={{
          position: 'absolute', left: 0, width: `${percentage}%`,
          height: TRACK_HEIGHT, background: '#f59e0b', borderRadius: TRACK_HEIGHT / 2,
        }} />
        <div
          role="slider"
          aria-label={ariaLabel}
          aria-orientation={orientation}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          style={{
            position: 'absolute', left: `calc(${percentage}% - ${THUMB_SIZE / 2}px)`,
            width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: '50%',
            background: '#f59e0b', border: '2px solid #1e293b',
            boxShadow: '0 2px 4px rgba(0,0,0,0.4)', cursor: 'grab',
          }}
        />
      </div>
      {snapPoints && (
        <div style={{ position: 'relative', height: TICK_HEIGHT + 16, marginTop: 4 }}>
          {snapPoints.map(point => {
            const left = ((point - min) / (max - min)) * 100;
            return (
              <button
                key={point}
                type="button"
                aria-label={`snap to ${point}`}
                onClick={() => onChange(clamp(point, min, max))}
                style={{
                  position: 'absolute', left: `calc(${left}% - 1px)`, top: 0,
                  width: 2, height: TICK_HEIGHT, padding: 0, border: 'none',
                  background: '#64748b', cursor: 'pointer',
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
