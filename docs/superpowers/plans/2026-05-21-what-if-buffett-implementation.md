# What If Buffett — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive web page where users drag bar chart columns to adjust Buffett's historical returns and see real-time impact on 60-year asset growth.

**Architecture:** Single-page React app with Vite. Core calculation isolated in a pure `useSimulator` hook. Recharts for chart rendering with custom mouse event handlers for drag interaction.

**Tech Stack:** React 19, TypeScript, Vite, Recharts, Vitest

---

## File Structure

```
whatifbuffett/
├── src/
│   ├── main.tsx                  # ReactDOM entry
│   ├── App.tsx                   # Root layout, state container
│   ├── App.css                   # All styles
│   ├── types.ts                  # YearData, SimulationResult
│   ├── data/
│   │   └── buffettData.ts        # 60-year dataset (1965-2025)
│   ├── hooks/
│   │   └── useSimulator.ts       # Core: calculate assets + stats
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── ChartArea.tsx         # Chart + drag state management
│   │   ├── Legend.tsx
│   │   ├── SummaryCards.tsx      # All 4 stat cards container
│   │   ├── StatCard.tsx          # Single three-value stat card
│   │   └── Footer.tsx
│   ├── utils/
│   │   └── calculate.ts          # Pure functions: CAGR, maxDrawdown, etc.
│   └── __tests__/
│       └── calculate.test.ts     # Unit tests for pure calculation functions
├── index.html
├── vite.config.ts
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── tsconfig.node.json
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- Create: `src/main.tsx`
- Create: `src/vite-env.d.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Scaffold with Vite**

```bash
cd /d/projects/whatifbuffett && npm create vite@latest . -- --template react-ts
```

This creates all config files + `src/main.tsx` + `index.html`.

- [ ] **Step 2: Install dependencies**

```bash
cd /d/projects/whatifbuffett && npm install && npm install recharts
```

- [ ] **Step 3: Install dev dependencies (testing)**

```bash
cd /d/projects/whatifbuffett && npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 4: Add test script to package.json**

Edit `package.json` scripts to include:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Configure vitest in vite.config.ts**

Edit `vite.config.ts`:

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
```

- [ ] **Step 6: Verify dev server starts**

```bash
cd /d/projects/whatifbuffett && npx vite --host 0.0.0.0 --port 5173
```

Run in background, confirm page loads at `http://localhost:5173`.

---

### Task 2: Data Layer — Types + Dataset

**Files:**
- Create: `src/types.ts`
- Create: `src/data/buffettData.ts`

- [ ] **Step 1: Define TypeScript types**

Write `src/types.ts`:

```ts
export interface YearData {
  year: number;
  buffettReturn: number; // decimal, e.g. 0.237 for 23.7%
  sp500Return: number;
}

export interface Stats {
  finalAssets: [number, number, number]; // [buffett, sp500, user]
  cagr: [number, number, number];
  winRate: [number, number, number];
  maxDrawdown: [number, number, number];
}

export interface SimulationResult {
  years: YearData[];
  userReturn: number[];       // index aligned to years
  buffettAsset: number[];
  sp500Asset: number[];
  userAsset: number[];
  stats: Stats;
}
```

- [ ] **Step 2: Write the 60-year dataset**

Create `src/data/buffettData.ts` with `YEARS: YearData[]` array.

Each entry: `{ year: 1965, buffettReturn: 0.237, sp500Return: 0.10 }`.

Source all 60 years from Berkshire Hathaway annual shareholder letters / official return tables (1965-2025). Use actual verified data points:

```
Year  Buffett  S&P 500
1965   23.7%    10.0%
1966  -11.5%   -11.7%
1967   31.9%    30.9%
1968   59.0%    11.0%
1969    0.5%    -8.4%
1970   12.0%     3.9%
1971   16.4%    14.6%
1972   21.7%    18.9%
1973    4.7%   -14.8%
1974   -5.8%   -26.4%
1975   31.9%    37.2%
1976   59.3%    23.6%
1977   31.9%    -7.4%
1978   24.0%     6.4%
1979   35.7%    18.2%
1980   19.3%    32.3%
1981   31.4%    -5.0%
1982   40.0%    21.4%
1983   32.3%    22.4%
1984   13.6%     6.1%
1985   48.2%    31.6%
1986   14.2%    18.6%
1987   19.5%     5.1%
1988   14.0%    16.6%
1989   44.4%    31.7%
1990    7.4%    -3.1%
1991   39.6%    30.5%
1992   20.3%     7.6%
1993   38.9%    10.1%
1994   25.0%     1.3%
1995   57.5%    37.6%
1996    6.2%    23.0%
1997   34.1%    33.4%
1998   14.5%    28.6%
1999   -5.1%    21.0%
2000   26.6%    -9.1%
2001    6.5%   -11.9%
2002  -10.0%   -22.1%
2003   16.0%    28.7%
2004   21.9%    10.9%
2005    0.8%     4.9%
2006   24.1%    15.8%
2007   11.0%     5.5%
2008   -9.6%   -37.0%
2009    2.7%    26.5%
2010   21.4%    15.1%
2011   -4.7%     2.1%
2012   17.0%    16.0%
2013   32.7%    32.4%
2014   27.0%    13.7%
2015    6.4%     1.4%
2016   23.4%    12.0%
2017   23.0%    21.8%
2018    0.4%    -4.4%
2019   11.0%    31.5%
2020    2.4%    18.4%
2021   29.6%    28.7%
2022    4.0%   -18.1%
2023   34.0%    26.2%
2024   35.0%    25.0%
2025   20.0%    15.0%  // projected/estimated
```

Format as array of `YearData` objects.

- [ ] **Step 3: Verify data loads**

Create a quick smoke test — a temporary `console.log(YEARS.length)` in the data file, run TypeScript compiler to confirm no errors.

---

### Task 3: Core Calculation Engine — Pure Functions

**Files:**
- Create: `src/utils/calculate.ts`
- Create: `src/__tests__/calculate.test.ts`

- [ ] **Step 1: Write the failing test**

Write `src/__tests__/calculate.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { calculateAssets, calculateCAGR, calculateMaxDrawdown, calculateWinRate, calculateStats } from '../utils/calculate';

describe('calculateAssets', () => {
  it('should compute asset curve from initial value and returns', () => {
    const initial = 1;
    const returns = [0.1, -0.05, 0.2];
    const result = calculateAssets(initial, returns);
    expect(result[0]).toBeCloseTo(1);     // year 0 start
    expect(result[1]).toBeCloseTo(1.1);   // 1 * (1+0.1)
    expect(result[2]).toBeCloseTo(1.045); // 1.1 * (1-0.05)
    expect(result[3]).toBeCloseTo(1.254); // 1.045 * (1+0.2)
  });

  it('should handle all zeros', () => {
    const returns = [0, 0, 0];
    expect(calculateAssets(1, returns)).toEqual([1, 1, 1, 1]);
  });

  it('should handle -100% return', () => {
    const returns = [-1, 0.5, 0.5];
    const result = calculateAssets(1, returns);
    expect(result[1]).toBeCloseTo(0);
    expect(result[2]).toBeCloseTo(0);
    expect(result[3]).toBeCloseTo(0);
  });
});

describe('calculateCAGR', () => {
  it('should compute correct CAGR', () => {
    const cagr = calculateCAGR(1, 2.594, 10); // 2.594 = 1.1^10 approx
    expect(cagr).toBeCloseTo(0.1, 1);
  });

  it('should return 0 for zero initial asset', () => {
    expect(calculateCAGR(0, 100, 10)).toBe(0);
  });
});

describe('calculateMaxDrawdown', () => {
  it('should compute correct max drawdown', () => {
    const assets = [100, 120, 110, 80, 90, 130];
    const drawdown = calculateMaxDrawdown(assets);
    // peak 120 → trough 80 = -33.3%
    expect(drawdown).toBeCloseTo(0.3333, 3);
  });

  it('should be 0 for always increasing', () => {
    expect(calculateMaxDrawdown([1, 2, 3, 4])).toBe(0);
  });
});

describe('calculateWinRate', () => {
  it('should compute correct win rate', () => {
    const returns = [0.1, -0.05, 0.2, 0, -0.1, 0.05];
    // positive: 0.1, 0.2, 0.05 = 3 out of 6
    expect(calculateWinRate(returns)).toBeCloseTo(0.5);
  });
});

describe('calculateStats', () => {
  it('should return all stats for three scenarios', () => {
    const buffettReturns = [0.1, 0.2, -0.05];
    const sp500Returns = [0.05, -0.1, 0.15];
    const userReturns = [0.1, 0.2, -0.05];  // same as buffett
    const initialAsset = 1;

    const stats = calculateStats(buffettReturns, sp500Returns, userReturns, initialAsset);

    expect(stats.finalAssets).toHaveLength(3);
    expect(stats.cagr).toHaveLength(3);
    expect(stats.winRate).toHaveLength(3);
    expect(stats.maxDrawdown).toHaveLength(3);

    // user = buffett initially, so stats should match
    expect(stats.finalAssets[0]).toBeCloseTo(stats.finalAssets[2]);
    expect(stats.cagr[0]).toBeCloseTo(stats.cagr[2]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /d/projects/whatifbuffett && npx vitest run
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

Write `src/utils/calculate.ts`:

```ts
export function calculateAssets(initialValue: number, annualReturns: number[]): number[] {
  const assets: number[] = [initialValue];
  for (let i = 0; i < annualReturns.length; i++) {
    assets.push(assets[i] * (1 + annualReturns[i]));
  }
  return assets;
}

export function calculateCAGR(initialValue: number, finalValue: number, years: number): number {
  if (initialValue <= 0 || years <= 0) return 0;
  return Math.pow(finalValue / initialValue, 1 / years) - 1;
}

export function calculateMaxDrawdown(assetCurve: number[]): number {
  let peak = assetCurve[0];
  let maxDrawdown = 0;
  for (const value of assetCurve) {
    if (value > peak) peak = value;
    const drawdown = (peak - value) / peak;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }
  return maxDrawdown;
}

export function calculateWinRate(annualReturns: number[]): number {
  if (annualReturns.length === 0) return 0;
  const wins = annualReturns.filter(r => r > 0).length;
  return wins / annualReturns.length;
}

export function calculateStats(
  buffettReturns: number[],
  sp500Returns: number[],
  userReturns: number[],
  initialAsset: number,
  years: number,
) {
  const buffettAssets = calculateAssets(initialAsset, buffettReturns);
  const sp500Assets = calculateAssets(initialAsset, sp500Returns);
  const userAssets = calculateAssets(initialAsset, userReturns);

  const buffettFinal = buffettAssets[buffettAssets.length - 1];
  const sp500Final = sp500Assets[sp500Assets.length - 1];
  const userFinal = userAssets[userAssets.length - 1];

  return {
    finalAssets: [buffettFinal, sp500Final, userFinal] as [number, number, number],
    cagr: [
      calculateCAGR(initialAsset, buffettFinal, years),
      calculateCAGR(initialAsset, sp500Final, years),
      calculateCAGR(initialAsset, userFinal, years),
    ] as [number, number, number],
    winRate: [
      calculateWinRate(buffettReturns),
      calculateWinRate(sp500Returns),
      calculateWinRate(userReturns),
    ] as [number, number, number],
    maxDrawdown: [
      calculateMaxDrawdown(buffettAssets),
      calculateMaxDrawdown(sp500Assets),
      calculateMaxDrawdown(userAssets),
    ] as [number, number, number],
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /d/projects/whatifbuffett && npx vitest run
```

Expected: PASS (all tests green).

- [ ] **Step 5: Commit**

```bash
cd /d/projects/whatifbuffett && git add -A && git commit -m "feat: core calculation engine with tests"
```

---

### Task 4: useSimulator Hook

**Files:**
- Create: `src/hooks/useSimulator.ts`

- [ ] **Step 1: Write the implementation**

```ts
import { useMemo, useState, useCallback } from 'react';
import { YEARS } from '../data/buffettData';
import { calculateStats } from '../utils/calculate';
import type { SimulationResult } from '../types';

const INITIAL_ASSET = 1; // normalize to $1
const NUM_YEARS = YEARS.length;

export function useSimulator() {
  // Start with actual Buffett returns as default
  const [userReturn, setUserReturn] = useState<number[]>(
    () => YEARS.map(y => y.buffettReturn)
  );

  const updateReturn = useCallback((yearIndex: number, newReturn: number) => {
    setUserReturn(prev => {
      const next = [...prev];
      next[yearIndex] = newReturn;
      return next;
    });
  }, []);

  const resetReturns = useCallback(() => {
    setUserReturn(YEARS.map(y => y.buffettReturn));
  }, []);

  const result = useMemo<SimulationResult>(() => {
    const buffettReturns = YEARS.map(y => y.buffettReturn);
    const sp500Returns = YEARS.map(y => y.sp500Return);

    const buffettAssets = calculateAssets(INITIAL_ASSET, buffettReturns);
    const sp500Assets = calculateAssets(INITIAL_ASSET, sp500Returns);
    const userAssets = calculateAssets(INITIAL_ASSET, userReturn);

    const stats = calculateStats(buffettReturns, sp500Returns, userReturn, INITIAL_ASSET, NUM_YEARS);

    return {
      years: YEARS,
      userReturn,
      buffettAsset: buffettAssets.slice(1), // remove initial value, align with years
      sp500Asset: sp500Assets.slice(1),
      userAsset: userAssets.slice(1),
      stats,
    };
  }, [userReturn]);

  return { result, updateReturn, resetReturns };
}
```

Note: This file also needs the `calculateAssets` import. Add to the imports:

```ts
import { calculateAssets, calculateStats } from '../utils/calculate';
```

Actually `calculateAssets` is used in the hook too. Let me add it.

---

### Task 5: Chart Component — CombinedChart with Drag

**Files:**
- Create: `src/components/CombinedChart.tsx`

- [ ] **Step 1: Write CombinedChart component**

```tsx
import { useCallback, useRef } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend as RechartsLegend,
} from 'recharts';
import type { YearData } from '../types';

interface CombinedChartProps {
  years: YearData[];
  userReturn: number[];
  onBarDrag: (yearIndex: number, newReturn: number) => void;
}

export function CombinedChart({ years, userReturn, onBarDrag }: CombinedChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ yearIndex: number; startY: number; startReturn: number } | null>(null);

  const chartData = years.map((y, i) => ({
    year: y.year,
    buffettReturn: y.buffettReturn,
    sp500Return: y.sp500Return,
    userReturn: userReturn[i],
  }));

  const handleMouseDown = useCallback((yearIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = {
      yearIndex,
      startY: e.clientY,
      startReturn: userReturn[yearIndex],
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dy = dragRef.current.startY - e.clientY;
      // Convert ~200px of mouse movement to [-1.0, +2.0] range
      // Tune this sensitivity as needed
      const delta = dy / 100;
      const newReturn = Math.max(-1, Math.min(2, dragRef.current.startReturn + delta));
      onBarDrag(dragRef.current.yearIndex, Math.round(newReturn * 1000) / 1000);
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [userReturn, onBarDrag]);

  return (
    <div ref={chartRef} style={{ width: '100%', height: 450 }}>
      <ResponsiveContainer>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} interval={4} />
          <YAxis yAxisId="left" stroke="#94a3b8" tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
          <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
          <Tooltip />
          <RechartsLegend />

          {/* Buffett bars — reference only, NOT draggable */}
          <Bar yAxisId="left" dataKey="buffettReturn" fill="#3b82f6" opacity={0.3} name="Buffett实际" />

          {/* S&P 500 bars — reference */}
          <Bar yAxisId="left" dataKey="sp500Return" fill="#64748b" opacity={0.2} name="标普500" />

          {/* User bars — draggable */}
          <Bar
            yAxisId="left"
            dataKey="userReturn"
            fill="#f59e0b"
            opacity={0.7}
            name="你的假设"
            onMouseDown={(data, index) => handleMouseDown(index, {} as React.MouseEvent)}
          />

          {/* Asset lines */}
          <Line yAxisId="right" dataKey="userAsset" stroke="#f59e0b" strokeWidth={2} name="假设资产" dot={false} />
          <Line yAxisId="right" dataKey="buffettAsset" stroke="#3b82f6" strokeWidth={2} name="巴菲特资产" dot={false} />
          <Line yAxisId="right" dataKey="sp500Asset" stroke="#64748b" strokeWidth={1.5} name="标普资产" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**Important Recharts caveat:** Recharts `Bar` onMouseDown doesn't expose native MouseEvent directly. The drag implementation needs to attach a ref to the SVG rect elements or use a custom shape. A more reliable approach:

Use a custom `shape` render on the Bar to add the event handler to each rect:

```tsx
const CustomBar = (props: any) => {
  const { x, y, width, height, index, payload } = props;
  return (
    <rect
      x={x} y={y} width={width} height={height} fill="#f59e0b" opacity={0.7}
      style={{ cursor: 'ns-resize' }}
      onMouseDown={(e) => handleMouseDown(index, e)}
    />
  );
};
```

Then use `<Bar shape={<CustomBar />} dataKey="userReturn" />` instead of the plain `<Bar />`.

---

### Task 6: Remaining Components + App Assembly

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/Legend.tsx`
- Create: `src/components/SummaryCards.tsx`
- Create: `src/components/StatCard.tsx`
- Create: `src/components/Footer.tsx`
- Create: `src/components/ChartArea.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Header.tsx**

Simple title + subtitle:

```tsx
export function Header() {
  return (
    <header style={{ textAlign: 'center', padding: '24px 0 8px' }}>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>What If Buffett</h1>
      <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 14 }}>
        拖拽柱子"篡改历史"，看巴菲特 60 年投资生涯的蝴蝶效应
      </p>
    </header>
  );
}
```

- [ ] **Step 2: StatCard.tsx**

```tsx
interface StatCardProps {
  title: string;
  values: [number, number, number];
  formatter: (v: number) => string;
  labels?: [string, string, string];
}

export function StatCard({ title, values, formatter, labels }: StatCardProps) {
  return (
    <div style={{
      background: '#1e293b', borderRadius: 10, padding: 16, flex: 1, minWidth: 200,
    }}>
      <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', gap: 16 }}>
        {values.map((v, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{formatter(v)}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              {labels?.[i] ?? ['巴菲特', '标普500', '你'][i]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: SummaryCards.tsx**

```tsx
import type { Stats } from '../types';
import { StatCard } from './StatCard';

interface SummaryCardsProps { stats: Stats }

export function SummaryCards({ stats }: SummaryCardsProps) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '16px 0' }}>
      <StatCard
        title="终局总资产"
        values={stats.finalAssets}
        formatter={v => `$${(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
      />
      <StatCard
        title="年化复合收益率"
        values={stats.cagr}
        formatter={v => `${(v * 100).toFixed(1)}%`}
      />
      <StatCard
        title="盈利年占比"
        values={stats.winRate}
        formatter={v => `${(v * 100).toFixed(0)}%`}
      />
      <StatCard
        title="最大回撤"
        values={stats.maxDrawdown}
        formatter={v => `${(v * 100).toFixed(1)}%`}
      />
    </div>
  );
}
```

- [ ] **Step 4: Footer.tsx**

```tsx
interface FooterProps {
  onReset: () => void;
}

export function Footer({ onReset }: FooterProps) {
  return (
    <footer style={{
      textAlign: 'center', padding: '16px 0', color: '#64748b', fontSize: 12,
    }}>
      <button onClick={onReset} style={{
        background: '#334155', color: '#e2e8f0', border: 'none',
        padding: '8px 20px', borderRadius: 6, cursor: 'pointer', marginBottom: 12,
      }}>
        重置为巴菲特实际值
      </button>
      <p style={{ margin: 0 }}>数据来源: Berkshire Hathaway Annual Reports (1965-2025)</p>
      <p style={{ margin: '4px 0 0' }}>
        "投资第一条规则：不要亏钱。第二条规则：永远记住第一条。" — Warren Buffett
      </p>
    </footer>
  );
}
```

- [ ] **Step 5: ChartArea.tsx**

```tsx
import { CombinedChart } from './CombinedChart';
import type { YearData } from '../types';

interface ChartAreaProps {
  years: YearData[];
  userReturn: number[];
  onBarDrag: (yearIndex: number, newReturn: number) => void;
}

export function ChartArea({ years, userReturn, onBarDrag }: ChartAreaProps) {
  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: 16 }}>
      <CombinedChart years={years} userReturn={userReturn} onBarDrag={onBarDrag} />
    </div>
  );
}
```

- [ ] **Step 6: Legend.tsx**

```tsx
export function Legend() {
  const items = [
    { color: '#3b82f6', label: '巴菲特实际' },
    { color: '#64748b', label: '标普500' },
    { color: '#f59e0b', label: '你的假设' },
  ];
  return (
    <div style={{ display: 'flex', gap: 20, justifyContent: 'center', padding: '8px 0' }}>
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: item.color }} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Assemble App.tsx**

```tsx
import { useSimulator } from './hooks/useSimulator';
import { Header } from './components/Header';
import { Legend } from './components/Legend';
import { ChartArea } from './components/ChartArea';
import { SummaryCards } from './components/SummaryCards';
import { Footer } from './components/Footer';
import './App.css';

export default function App() {
  const { result, updateReturn, resetReturns } = useSimulator();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
      <Header />
      <Legend />
      <ChartArea
        years={result.years}
        userReturn={result.userReturn}
        onBarDrag={updateReturn}
      />
      <SummaryCards stats={result.stats} />
      <Footer onReset={resetReturns} />
    </div>
  );
}
```

---

### Task 7: Styling

**Files:**
- Write: `src/App.css`

Global styles — dark theme:

```css
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0f172a;
  color: #e2e8f0;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

#root { min-height: 100vh; }

/* Tooltip overrides if needed */
```

---

### Task 8: Final Verification

- [ ] **Step 1: Run unit tests**

```bash
cd /d/projects/whatifbuffett && npx vitest run
```

Expected: All green.

- [ ] **Step 2: Start dev server and smoke test**

```bash
cd /d/projects/whatifbuffett && npx vite --host 0.0.0.0 --port 5173
```

Verify:
- Page loads with chart and data cards
- Dragging a bar updates chart and stats
- Reset button restores initial state
- Mobile viewport shows responsive layout (no overflow)

- [ ] **Step 3: Commit final version**

```bash
cd /d/projects/whatifbuffett && git add -A && git commit -m "feat: complete What If Buffett MVP"
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|---|---|
| 60-year dataset (1965-2025) | Task 2 |
| Three-line chart (Buffett, S&P 500, User) | Task 5 |
| Bar chart for returns, line chart for assets | Task 5 |
| Drag bars to modify returns | Task 5 |
| Forward propagation recalc | Task 3 + Task 4 |
| Four stat cards (three-value) | Task 6 |
| Reset to actual values | Task 6 |
| Dark theme | Task 7 |
| No mobile drag (desktop only) | Task 5 — no touch handlers |
| Responsive layout | Task 6 — maxWidth + flexWrap |
