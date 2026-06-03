import { useMemo, useState, useCallback } from 'react';
import { YEARS } from '../data/buffettData';
import { calculateAssets, calculateStats } from '../utils/calculate';
import { DEFAULT_PARAMETERS, applyParameters, type Parameters } from '../parameters/apply';
import type { SimulationResult } from '../types';

const INITIAL_ASSET = 1;
const NUM_YEARS = YEARS.length;

export function useSimulator() {
  const [rawReturns, setRawReturns] = useState<number[]>(
    () => YEARS.map(y => y.buffettReturn)
  );
  const [parameters, setParametersState] = useState<Parameters>(DEFAULT_PARAMETERS);

  const updateReturn = useCallback((yearIndex: number, newReturn: number) => {
    setRawReturns(prev => {
      const next = [...prev];
      next[yearIndex] = newReturn;
      return next;
    });
  }, []);

  const setParameters = useCallback((next: Parameters) => {
    setParametersState(next);
  }, []);

  const resetAll = useCallback(() => {
    setRawReturns(YEARS.map(y => y.buffettReturn));
    setParametersState(DEFAULT_PARAMETERS);
  }, []);

  const userReturn = useMemo(
    () => rawReturns.map(r => applyParameters(r, parameters)),
    [rawReturns, parameters]
  );

  const result = useMemo<SimulationResult>(() => {
    const buffettReturns = YEARS.map(y => y.buffettReturn);
    const sp500Returns = YEARS.map(y => y.sp500Return);

    const buffettAssets = calculateAssets(INITIAL_ASSET, buffettReturns);
    const sp500Assets = calculateAssets(INITIAL_ASSET, sp500Returns);
    const userAssets = calculateAssets(INITIAL_ASSET, userReturn);

    const stats = calculateStats(buffettReturns, sp500Returns, userReturn, INITIAL_ASSET, NUM_YEARS);

    return {
      years: [...YEARS],
      userReturn,
      buffettAsset: buffettAssets.slice(1),
      sp500Asset: sp500Assets.slice(1),
      userAsset: userAssets.slice(1),
      stats,
    };
  }, [userReturn]);

  return { result, parameters, updateReturn, setParameters, resetAll };
}
