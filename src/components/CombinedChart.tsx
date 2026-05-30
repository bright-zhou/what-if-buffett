import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell,
} from 'recharts';
import type { YearData } from '../types';
import { useLang } from '../i18n/LanguageContext';

const MIN_VISIBLE_YEARS = 1;

interface CombinedChartProps {
  years: YearData[];
  userReturn: number[];
  buffettAsset: number[];
  sp500Asset: number[];
  userAsset: number[];
  onBarDrag: (yearIndex: number, newReturn: number) => void;
}

interface ChartDataPoint extends YearData {
  userReturn: number;
  buffettAsset: number;
  sp500Asset: number;
  userAsset: number;
}

interface DraggableBarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  onDragStart?: (index: number, clientY: number) => void;
  fill?: string;
}

function formatCurrency(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(2)}`;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataPoint }> }) {
  const { t } = useLang();
  if (!active || !payload || !payload[0]) return null;

  const d = payload[0].payload;
  const rows = [
    { label: t('label.user'),    ret: d.userReturn,    asset: d.userAsset,    color: '#f59e0b' },
    { label: t('label.buffett'), ret: d.buffettReturn, asset: d.buffettAsset, color: '#3b82f6' },
    { label: t('label.sp500'),   ret: d.sp500Return,   asset: d.sp500Asset,   color: '#64748b' },
  ];

  return (
    <div style={{
      background: '#1e293b', border: '1px solid #334155',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
      lineHeight: 1.4,
    }}>
      <div style={{
        color: '#e2e8f0', fontWeight: 600, fontSize: 13,
        marginBottom: 8, paddingBottom: 6,
        borderBottom: '1px solid #334155',
      }}>
        {d.year}
      </div>
      <table style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', fontWeight: 400, color: '#64748b', fontSize: 10, paddingBottom: 4, width: 60 }} />
            <th style={{ textAlign: 'right', fontWeight: 400, color: '#64748b', fontSize: 10, paddingBottom: 4, width: 58 }}>Return</th>
            <th style={{ textAlign: 'right', fontWeight: 400, color: '#64748b', fontSize: 10, paddingBottom: 4, width: 76 }}>Asset</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={{ color: r.color, fontSize: 12, padding: '2px 0' }}>{r.label}</td>
              <td style={{ color: '#e2e8f0', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums', padding: '2px 0' }}>
                {(r.ret * 100).toFixed(1)}%
              </td>
              <td style={{ color: '#e2e8f0', fontSize: 12, textAlign: 'right', fontVariantNumeric: 'tabular-nums', padding: '2px 0' }}>
                {formatCurrency(r.asset)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Custom bar shape to capture native MouseEvent for drag tracking.
// Recharts Bar's onMouseDown does not pass the native event with clientY,
// so we must use a custom SVG rect with native onMouseDown.
function DraggableBar(props: DraggableBarProps) {
  const { x, y, width, height, index, onDragStart, fill } = props;
  // Recharts computes height = baseValueScale - currentValueScale.
  // For negative returns, height is negative. SVG <rect> needs positive
  // height, so we swap y to the bottom and take absolute value.
  const barH = Math.abs(height!);
  const barY = height! >= 0 ? y! : y! + height!;
  return (
    <rect
      x={x} y={barY} width={width} height={barH}
      className="bar-rect"
      fill={fill}
      style={{ cursor: 'ns-resize' }}
      onMouseDown={onDragStart ? (e: React.MouseEvent) => {
        e.stopPropagation();
        onDragStart(index!, e.clientY);
      } : undefined}
    />
  );
}

export function CombinedChart({
  years, userReturn, buffettAsset, sp500Asset, userAsset, onBarDrag,
}: CombinedChartProps) {
  const { t } = useLang();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartAreaRef = useRef<HTMLDivElement>(null);

  const LEGEND_NAMES: Record<string, string> = {
    buffettAsset: t('chart.buffettAsset'),
    sp500Asset: t('chart.sp500Asset'),
    userAsset: t('chart.userAsset'),
  };

  // Combine all data series into a single array for ComposedChart.
  const chartData = useMemo(() => years.map((y, i) => ({
    year: y.year,
    buffettReturn: y.buffettReturn,
    sp500Return: y.sp500Return,
    userReturn: userReturn[i],
    buffettAsset: buffettAsset[i],
    sp500Asset: sp500Asset[i],
    userAsset: userAsset[i],
  })), [years, userReturn, buffettAsset, sp500Asset, userAsset]);

  // Visible domain: [startIndex, endIndex] into chartData
  const [visibleDomain, setVisibleDomain] = useState<[number, number]>([0, years.length - 1]);

  // Ensure domain stays valid when years length changes (shouldn't, but safety)
  useEffect(() => {
    setVisibleDomain([0, years.length - 1]);
  }, [years.length]);

  const visibleData = useMemo(
    () => chartData.slice(visibleDomain[0], visibleDomain[1] + 1),
    [chartData, visibleDomain],
  );

  const visibleSpan = visibleDomain[1] - visibleDomain[0] + 1;

  // X-axis tick interval adapts to visible span
  const tickInterval = visibleSpan <= 15 ? 1 : visibleSpan <= 30 ? 2 : visibleSpan <= 45 ? 3 : 5;
  const xTicks = visibleData
    .filter((_, i) => i % tickInterval === 0)
    .map(d => d.year);

  // Y-axis left domain auto-adapts to visible return range
  const returnDomain = useMemo(() => {
    const returns = visibleData.flatMap(d => [d.buffettReturn, d.sp500Return, d.userReturn]);
    const min = Math.min(...returns);
    const max = Math.max(...returns);
    const pad = 0.08;
    const lo = Math.max(-1, Math.floor((min - pad) * 10) / 10);
    const hi = Math.min(2, Math.ceil((max + pad) * 10) / 10);
    return [lo, hi] as [number, number];
  }, [visibleData]);

  const returnTicks = useMemo(() => {
    const [lo, hi] = returnDomain;
    const step = (hi - lo) > 1.5 ? 0.2 : (hi - lo) > 0.8 ? 0.1 : 0.05;
    const ticks: number[] = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
      ticks.push(Math.round(v * 100) / 100);
    }
    return ticks;
  }, [returnDomain]);

  // Drag state: index of bar being dragged, current value, and mouse position
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragValue, setDragValue] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Refs for drag tracking to avoid stale closures in event handlers
  const dragRef = useRef<{
    index: number; startY: number; initialReturn: number;
  } | null>(null);
  const currentValueRef = useRef(0);

  // Refs for document-level event listeners so they can be cleaned up on unmount
  const mouseMoveRef = useRef<((e: MouseEvent) => void) | null>(null);
  const mouseUpRef = useRef<((e: MouseEvent) => void) | null>(null);

  // Cleanup document-level listeners on unmount (prevents leak if component
  // unmounts while a drag is in progress)
  useEffect(() => {
    return () => {
      if (mouseMoveRef.current) document.removeEventListener('mousemove', mouseMoveRef.current);
      if (mouseUpRef.current) document.removeEventListener('mouseup', mouseUpRef.current);
    };
  }, []);

  // Wheel-to-zoom with { passive: false } to prevent page scroll.
  // Uses chartAreaRef for precise mouse-to-year mapping (avoids edge drift).
  const visibleDomainRef = useRef(visibleDomain);
  visibleDomainRef.current = visibleDomain;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handler = (e: WheelEvent) => {
      e.preventDefault();

      const chartArea = chartAreaRef.current;
      if (!chartArea) return;
      const rect = chartArea.getBoundingClientRect();
      const mouseXRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

      const [start, end] = visibleDomainRef.current;
      const currentSpan = end - start + 1;
      const anchorIndex = Math.round(start + mouseXRatio * (currentSpan - 1));

      const zoomIn = e.deltaY < 0;
      const factor = zoomIn ? 0.75 : 1.33;
      let newSpan = currentSpan * factor;
      newSpan = zoomIn
        ? Math.max(MIN_VISIBLE_YEARS, Math.floor(newSpan))
        : Math.min(years.length, Math.ceil(newSpan));

      if (newSpan === currentSpan) return;

      const anchorRatio = (anchorIndex - start) / Math.max(1, currentSpan - 1);
      let newStart = Math.round(anchorIndex - anchorRatio * (newSpan - 1));
      newStart = Math.max(0, Math.min(years.length - newSpan, newStart));

      setVisibleDomain([newStart, newStart + newSpan - 1]);
    };

    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [years.length]);

  // Pan: drag chart background to scroll horizontally through years
  const panRef = useRef<{ startX: number; startDomain: [number, number] } | null>(null);

  useEffect(() => {
    const chartArea = chartAreaRef.current;
    if (!chartArea) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      // Skip pan when clicking on a bar (SVG rect) — bar drag handles that
      if ((e.target as Element).tagName === 'rect') return;
      panRef.current = { startX: e.clientX, startDomain: [...visibleDomainRef.current] };
      document.body.style.cursor = 'grabbing';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!panRef.current) return;
      const rect = chartArea.getBoundingClientRect();
      const dx = e.clientX - panRef.current.startX;
      const span = panRef.current.startDomain[1] - panRef.current.startDomain[0] + 1; // inclusive
      const yearShift = Math.round(dx * (span / rect.width));
      if (yearShift === 0) return;

      let newStart = panRef.current.startDomain[0] - yearShift;
      newStart = Math.max(0, Math.min(years.length - span, newStart));
      setVisibleDomain([newStart, newStart + span - 1]);
    };

    const handleMouseUp = () => {
      panRef.current = null;
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    chartArea.addEventListener('mousedown', handleMouseDown);
    return () => chartArea.removeEventListener('mousedown', handleMouseDown);
  }, [years.length]);

  // Keyboard pan: left/right arrow keys shift visible domain
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      // Don't capture when focus is in an input
      if ((e.target as Element).tagName === 'INPUT') return;

      e.preventDefault();
      const [start, end] = visibleDomainRef.current;
      const span = end - start + 1;
      const step = 1;

      const newStart = e.key === 'ArrowLeft'
        ? Math.max(0, start - step)
        : Math.min(years.length - span, start + step);

      if (newStart !== start) {
        setVisibleDomain([newStart, newStart + span - 1]);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [years.length]);

  const handleDragStart = useCallback((visibleIndex: number, clientY: number) => {
    // Map visible index back to original data index
    const index = visibleDomain[0] + visibleIndex;
    const initialReturn = userReturn[index];
    currentValueRef.current = initialReturn;
    dragRef.current = { index, startY: clientY, initialReturn };
    setDragIndex(index);
    setDragValue(initialReturn);
    setMousePos({ x: 0, y: clientY });

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const deltaPx = e.clientY - dragRef.current.startY;
      const deltaReturn = -deltaPx * 0.01; // 1px ≈ 1% return
      const newReturn = Math.max(-1.0, Math.min(2.0,
        Math.round((dragRef.current.initialReturn + deltaReturn) * 1000) / 1000
      ));
      currentValueRef.current = newReturn;
      setDragValue(newReturn);
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      if (dragRef.current) {
        onBarDrag(dragRef.current.index, currentValueRef.current);
      }
      dragRef.current = null;
      setDragIndex(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      mouseMoveRef.current = null;
      mouseUpRef.current = null;
    };

    mouseMoveRef.current = handleMouseMove;
    mouseUpRef.current = handleMouseUp;

    // Attach listeners to document to track drag across the entire page.
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [userReturn, onBarDrag, visibleDomain]);

  return (
    <div
      ref={containerRef}
      style={{
        background: '#0f172a',
        borderRadius: 12,
        padding: '16px 16px 8px',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <div ref={chartAreaRef} style={{ cursor: 'grab', width: '100%', height: 450 }}>
        <ResponsiveContainer width="100%" height={450}>
          <ComposedChart data={visibleData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

          <XAxis
            dataKey="year"
            ticks={xTicks}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
          />

          {/* Left Y-axis: return percentages, -100% to +200%, ticks every 10% */}
          <YAxis
            yAxisId="left"
            orientation="left"
            ticks={returnTicks}
            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={returnDomain}
          />

          {/* Right Y-axis: asset values ($) */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={formatCurrency}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip content={<ChartTooltip />} />

          <Legend
            verticalAlign="top"
            formatter={(value: string) => LEGEND_NAMES[value] ?? value}
            wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
          />

          {/* Single bar per year. Custom shape captures native MouseEvent for drag. */}
          {/* Blue = Buffett's original, amber = user-modified. Cell provides per-bar fill. */}
          <Bar
            dataKey="userReturn"
            yAxisId="left"
            shape={<DraggableBar onDragStart={handleDragStart} />}
            legendType="none"
            isAnimationActive={false}
          >
            {visibleData.map((entry, i) => (
              <Cell
                key={i}
                fill={Math.abs(entry.userReturn - entry.buffettReturn) > 1e-8 ? '#f59e0b' : '#3b82f6'}
              />
            ))}
          </Bar>

          {/* Line charts for cumulative asset values (right Y-axis) */}
          <Line dataKey="buffettAsset" yAxisId="right" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line dataKey="sp500Asset" yAxisId="right" stroke="#64748b" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          <Line dataKey="userAsset" yAxisId="right" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
        </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Floating label during drag */}
      {dragIndex !== null && (
        <div style={{
          position: 'fixed',
          left: mousePos.x + 12,
          top: mousePos.y - 36,
          background: '#1e293b',
          border: '1px solid #f59e0b',
          borderRadius: 6,
          padding: '4px 8px',
          color: '#f59e0b',
          fontSize: 13,
          fontWeight: 600,
          pointerEvents: 'none',
          zIndex: 1000,
          whiteSpace: 'nowrap',
        }}>
          {(dragValue * 100).toFixed(1)}%
        </div>
      )}
    </div>
  );
}
