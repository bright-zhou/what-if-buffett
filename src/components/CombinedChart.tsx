import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import type { YearData } from '../types';
import { useLang } from '../i18n/useLang';
import { calcReturnDomain, calcReturnTicks } from '../utils/chartAxis';

const MIN_VISIBLE_YEARS = 1;

interface CombinedChartProps {
  years: YearData[];
  rawReturns: number[];
  userReturn: number[];
  buffettAsset: number[];
  sp500Asset: number[];
  userAsset: number[];
  onBarDrag: (yearIndex: number, newReturn: number) => void;
  onTimeNavigate?: () => void;
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
  onDragStart?: (index: number, clientX: number, clientY: number) => void;
  onDblClickReset?: (index: number) => void;
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
        color: '#e2e8f0', fontWeight: 600, fontSize: 14,
        letterSpacing: '-0.01em',
        marginBottom: 8, paddingBottom: 6,
        borderBottom: '1px solid #334155',
      }}>
        {d.year}
      </div>
      <table style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', fontWeight: 400, color: '#94a3b8', fontSize: 11, paddingBottom: 4, width: 60 }} />
            <th style={{ textAlign: 'right', fontWeight: 400, color: '#94a3b8', fontSize: 11, paddingBottom: 4, width: 58 }}>Return</th>
            <th style={{ textAlign: 'right', fontWeight: 400, color: '#94a3b8', fontSize: 11, paddingBottom: 4, width: 76 }}>Asset</th>
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
  const { x, y, width, height, index, onDragStart, onDblClickReset, fill } = props;
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
        // Do NOT stopPropagation: the chartArea pan handler already filters
        // out target.tagName === 'rect', and outside-click listeners (e.g.
        // ParameterControls dropdown close) need the event to bubble to document.
        onDragStart(index!, e.clientX, e.clientY);
      } : undefined}
      onDoubleClick={onDblClickReset ? () => onDblClickReset(index!) : undefined}
    />
  );
}

export function CombinedChart({
  years, rawReturns, userReturn, buffettAsset, sp500Asset, userAsset, onBarDrag, onTimeNavigate,
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

  // Y-axis left domain auto-adapts to visible return range.
  // Hi is no longer hard-capped at 2; leverage 3x can push userReturn to 6.0.
  const returnDomain = useMemo(
    () => calcReturnDomain(visibleData.flatMap(d => [d.buffettReturn, d.sp500Return, d.userReturn])),
    [visibleData],
  );

  const returnTicks = useMemo(() => calcReturnTicks(returnDomain), [returnDomain]);

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
      onTimeNavigate?.();
    };

    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [years.length, onTimeNavigate]);

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
      onTimeNavigate?.();
    };

    const handleMouseUp = () => {
      panRef.current = null;
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    chartArea.addEventListener('mousedown', handleMouseDown);
    return () => chartArea.removeEventListener('mousedown', handleMouseDown);
  }, [years.length, onTimeNavigate]);

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
        onTimeNavigate?.();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [years.length, onTimeNavigate]);

  const handleDragStart = useCallback((visibleIndex: number, clientX: number, clientY: number) => {
    // Map visible index back to original data index
    const index = visibleDomain[0] + visibleIndex;
    // Drag operates on raw return (the value the user "sets"). When leverage
    // or friction is non-default, the bar will jump to its effective value
    // after release — this is intentional educational feedback about how
    // parameters amplify outcomes (e.g. leverage 2x + raw -50% → effective -100%).
    const initialReturn = rawReturns[index];
    currentValueRef.current = initialReturn;
    dragRef.current = { index, startY: clientY, initialReturn };
    setDragIndex(index);
    setDragValue(initialReturn);
    setMousePos({ x: clientX, y: clientY });

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
  }, [rawReturns, onBarDrag, visibleDomain]);

  // Double-click a bar to reset that year to Buffett's original return.
  // Reuses onBarDrag to keep a single source of truth for rawReturns updates.
  const handleBarDblClick = useCallback((visibleIndex: number) => {
    const dataIndex = visibleDomain[0] + visibleIndex;
    const original = years[dataIndex]?.buffettReturn;
    if (original !== undefined) {
      onBarDrag(dataIndex, original);
    }
  }, [visibleDomain, years, onBarDrag]);

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
      <div ref={chartAreaRef} style={{ cursor: 'grab', width: '100%', height: 520 }}>
        <ResponsiveContainer width="100%" height={520}>
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
            shape={<DraggableBar onDragStart={handleDragStart} onDblClickReset={handleBarDblClick} />}
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

          {/* Horizontal reference line during drag: shows the raw return value
              the user is targeting. White 1px dashed line stays subtle; label
              renders as a boxed tag at the plot area's left edge so it doesn't
              overlap the line itself. */}
          {dragIndex !== null && (
            <ReferenceLine
              yAxisId="left"
              y={dragValue}
              stroke="#ffffff"
              strokeDasharray="4 4"
              strokeWidth={1}
              isFront
              label={(props: { viewBox?: { x?: number; y?: number } }) => {
                const vb = props.viewBox;
                if (!vb || vb.x === undefined || vb.y === undefined) return <g />;
                const text = `${(dragValue * 100).toFixed(1)}%`;
                const padH = 6;
                const padV = 3;
                const charW = 7.2;
                const w = text.length * charW + padH * 2;
                const h = 12 + padV * 2;
                // Place tag to the LEFT of the plot area, so it sits next to
                // the Y-axis (outside the chart's drawing region). The opaque
                // background masks any overlap with Y-axis tick labels.
                const rectX = vb.x - w - 4;
                const rectY = vb.y - h / 2;
                return (
                  <g pointerEvents="none">
                    <rect
                      x={rectX} y={rectY} width={w} height={h}
                      fill="#0f172a" stroke="#ffffff" strokeWidth={1} rx={3}
                    />
                    <text
                      x={rectX + w / 2} y={vb.y}
                      textAnchor="middle" dominantBaseline="central"
                      fill="#ffffff" fontSize={12} fontWeight={600}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {text}
                    </text>
                  </g>
                );
              }}
            />
          )}
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
          fontSize: 14,
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
