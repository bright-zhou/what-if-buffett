import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import type { YearData } from '../types';

interface CombinedChartProps {
  years: YearData[];
  userReturn: number[];
  buffettAsset: number[];
  sp500Asset: number[];
  userAsset: number[];
  onBarDrag: (yearIndex: number, newReturn: number) => void;
}

function formatCurrency(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(2)}`;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: '#1e293b', border: '1px solid #334155',
      borderRadius: 8, padding: '8px 12px', fontSize: 12,
    }}>
      <div style={{ color: '#94a3b8', marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {(payload as Array<{ name: string; value: number; color: string }>).map((p, i) => {
        const isReturn = String(p.name).includes('Return');
        return (
          <div key={i} style={{
            color: '#e2e8f0', display: 'flex',
            justifyContent: 'space-between', gap: 16,
          }}>
            <span style={{ color: p.color }}>{p.name}</span>
            <span>{isReturn ? `${(p.value * 100).toFixed(1)}%` : formatCurrency(p.value)}</span>
          </div>
        );
      })}
    </div>
  );
}

// Custom bar shape that handles drag interaction on user's return bars.
// Recharts Bar's onMouseDown does not pass native MouseEvents, so we use
// a custom SVG rect with native onMouseDown to get clientY for drag tracking.
function DraggableBar(props: any) {
  const { x, y, width, height, index, onDragStart } = props;
  return (
    <rect
      x={x} y={y} width={width} height={Math.max(height, 0)}
      fill="#f59e0b" opacity={0.7} style={{ cursor: 'ns-resize' }}
      onMouseDown={onDragStart ? (e: React.MouseEvent) => {
        e.stopPropagation();
        onDragStart(index, e.clientY);
      } : undefined}
    />
  );
}

const LEGEND_NAMES: Record<string, string> = {
  buffettReturn: 'Buffett',
  sp500Return: 'S&P 500',
  userReturn: 'My Assumption',
  buffettAsset: 'Buffett Asset',
  sp500Asset: 'S&P 500 Asset',
  userAsset: 'My Asset',
};

export function CombinedChart({
  years, userReturn, buffettAsset, sp500Asset, userAsset, onBarDrag,
}: CombinedChartProps) {
  // Combine all data series into a single array for ComposedChart.
  const chartData = years.map((y, i) => ({
    year: y.year,
    buffettReturn: y.buffettReturn,
    sp500Return: y.sp500Return,
    userReturn: userReturn[i],
    buffettAsset: buffettAsset[i],
    sp500Asset: sp500Asset[i],
    userAsset: userAsset[i],
  }));

  // X-axis: show every 5th year to avoid crowding
  const xTicks = chartData.filter(d => d.year % 5 === 0).map(d => d.year);

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

  const handleDragStart = useCallback((index: number, clientY: number) => {
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
  }, [userReturn, onBarDrag]);

  return (
    <div style={{
      background: '#0f172a',
      borderRadius: 12,
      padding: '16px 16px 8px',
      position: 'relative',
      userSelect: 'none',
    }}>
      <ResponsiveContainer width="100%" height={450}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

          <XAxis
            dataKey="year"
            ticks={xTicks}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
          />

          {/* Left Y-axis: return percentages */}
          <YAxis
            yAxisId="left"
            orientation="left"
            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[-1.0, 2.0]}
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

          {/* Bar charts for annual returns (left Y-axis) */}
          <Bar dataKey="buffettReturn" yAxisId="left" fill="#3b82f6" opacity={0.3} isAnimationActive={false} />
          <Bar dataKey="sp500Return" yAxisId="left" fill="#64748b" opacity={0.2} isAnimationActive={false} />
          <Bar
            dataKey="userReturn"
            yAxisId="left"
            shape={<DraggableBar onDragStart={handleDragStart} />}
            isAnimationActive={false}
          />

          {/* Line charts for cumulative asset values (right Y-axis) */}
          <Line dataKey="buffettAsset" yAxisId="right" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line dataKey="sp500Asset" yAxisId="right" stroke="#64748b" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          <Line dataKey="userAsset" yAxisId="right" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>

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
