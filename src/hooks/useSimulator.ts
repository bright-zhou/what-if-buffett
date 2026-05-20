import { useMemo, useState, useCallback } from 'react';
import { YEARS } from '../data/buffettData';
import { calculateAssets, calculateStats } from '../utils/calculate';
import type { SimulationResult } from '../types';

const INITIAL_ASSET = 1; // normalize to $1
const NUM_YEARS = YEARS.length;

export function useSimulator() {
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
      years: [...YEARS] as SimulationResult['years'],
      userReturn,
      buffettAsset: buffettAssets.slice(1),
      sp500Asset: sp500Assets.slice(1),
      userAsset: userAssets.slice(1),
      stats,
    };
  }, [userReturn]);

  return { result, updateReturn, resetReturns };
}
