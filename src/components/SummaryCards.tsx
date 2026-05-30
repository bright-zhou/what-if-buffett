import { useMemo } from 'react';
import type { Stats } from '../types';
import { StatCard } from './StatCard';
import { useLang } from '../i18n/LanguageContext';

interface SummaryCardsProps { stats: Stats }

export function SummaryCards({ stats }: SummaryCardsProps) {
  const { t } = useLang();

  const finalAssetsDisplay = useMemo(() => stats.finalAssets.map(v => Math.round(v)) as [number, number, number], [stats.finalAssets]);
  const cagrDisplay = useMemo(() => stats.cagr.map(v => parseFloat((v * 100).toFixed(1))) as [number, number, number], [stats.cagr]);
  const winRateDisplay = useMemo(() => stats.winRate.map(v => parseFloat((v * 100).toFixed(1))) as [number, number, number], [stats.winRate]);
  const maxDrawdownDisplay = useMemo(() => stats.maxDrawdown.map(v => parseFloat((v * 100).toFixed(1))) as [number, number, number], [stats.maxDrawdown]);

  const finalAssetsDelta = useMemo(() => {
    const d = finalAssetsDisplay[2] - finalAssetsDisplay[1];
    if (d === 0) return { text: undefined, sign: 0 };
    const pct = finalAssetsDisplay[1] !== 0 ? (d / finalAssetsDisplay[1]) * 100 : 0;
    return { text: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`, sign: d };
  }, [finalAssetsDisplay]);

  const cagrDelta = useMemo(() => {
    const d = cagrDisplay[2] - cagrDisplay[1];
    if (d === 0) return { text: undefined, sign: 0 };
    return { text: `${d >= 0 ? '+' : ''}${d.toFixed(1)}%`, sign: d };
  }, [cagrDisplay]);

  const winRateDelta = useMemo(() => {
    const d = winRateDisplay[2] - winRateDisplay[1];
    if (d === 0) return { text: undefined, sign: 0 };
    return { text: `${d >= 0 ? '+' : ''}${d.toFixed(1)}%`, sign: d };
  }, [winRateDisplay]);

  const maxDrawdownDelta = useMemo(() => {
    const d = maxDrawdownDisplay[1] - maxDrawdownDisplay[2];
    if (d === 0) return { text: undefined, sign: 0 };
    const userMinusBuffett = maxDrawdownDisplay[2] - maxDrawdownDisplay[1];
    return { text: `${userMinusBuffett >= 0 ? '+' : ''}${userMinusBuffett.toFixed(1)}%`, sign: d };
  }, [maxDrawdownDisplay]);

  const labels: [string, string, string] = [t('label.sp500'), t('label.buffett'), t('label.user')];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 210, flexShrink: 0 }}>
      <StatCard
        title={t('stat.finalAssets')}
        values={stats.finalAssets}
        formatter={v => `$${Math.round(v).toLocaleString()}`}
        labels={labels}
        deltaFormatted={finalAssetsDelta.text}
        deltaSign={finalAssetsDelta.sign}
      />
      <StatCard
        title={t('stat.cagr')}
        values={stats.cagr}
        formatter={v => `${(v * 100).toFixed(1)}%`}
        labels={labels}
        deltaFormatted={cagrDelta.text}
        deltaSign={cagrDelta.sign}
      />
      <StatCard
        title={t('stat.winRate')}
        values={stats.winRate}
        formatter={v => `${(v * 100).toFixed(1)}%`}
        labels={labels}
        deltaFormatted={winRateDelta.text}
        deltaSign={winRateDelta.sign}
      />
      <StatCard
        title={t('stat.maxDrawdown')}
        values={stats.maxDrawdown}
        formatter={v => `${(v * 100).toFixed(1)}%`}
        labels={labels}
        deltaFormatted={maxDrawdownDelta.text}
        deltaSign={maxDrawdownDelta.sign}
      />
    </div>
  );
}
