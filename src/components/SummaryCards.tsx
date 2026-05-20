import type { Stats } from '../types';
import { StatCard } from './StatCard';

interface SummaryCardsProps { stats: Stats }

export function SummaryCards({ stats }: SummaryCardsProps) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '16px 0' }}>
      <StatCard
        title="终局总资产"
        values={stats.finalAssets}
        formatter={v => {
          if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
          if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
          return `$${v.toFixed(2)}`;
        }}
      />
      <StatCard
        title="年化复合收益率"
        values={stats.cagr}
        formatter={v => `${(v * 100).toFixed(2)}%`}
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
