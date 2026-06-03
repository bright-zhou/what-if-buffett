import { useRef, useEffect, useCallback } from 'react';

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
const TICK_HEIGHT = 8;

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

  const percentage = ((value - min) / (max - min)) * 100;
  const displayValue = format ? format(value) : value.toString();

  const updateFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    const raw = min + ratio * (max - min);
    onChange(clamp(roundToStep(raw, step, min), min, max));
  }, [min, max, step, onChange]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      updateFromClientX(e.clientX);
    };
    const handleUp = () => { draggingRef.current = false; };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [updateFromClientX]);

  const handleMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;
    updateFromClientX(e.clientX);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      onChange(clamp(roundToStep(value + step, step, min), min, max));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onChange(clamp(roundToStep(value - step, step, min), min, max));
    }
  };

  return (
    <div style={{ width: '100%', userSelect: 'none' }}>
      <div style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
        {displayValue}
      </div>
      <div
        ref={trackRef}
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
