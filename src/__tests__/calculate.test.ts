import { describe, it, expect } from 'vitest';
import { calculateAssets, calculateCAGR, calculateMaxDrawdown, calculateWinRate, calculateStats } from '../utils/calculate';

describe('calculateAssets', () => {
  it('should compute asset curve from initial value and returns', () => {
    const initial = 1;
    const returns = [0.1, -0.05, 0.2];
    const result = calculateAssets(initial, returns);
    expect(result[0]).toBeCloseTo(1);
    expect(result[1]).toBeCloseTo(1.1);
    expect(result[2]).toBeCloseTo(1.045);
    expect(result[3]).toBeCloseTo(1.254);
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
    const cagr = calculateCAGR(1, 2.594, 10);
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
    expect(drawdown).toBeCloseTo(0.3333, 3);
  });

  it('should be 0 for always increasing', () => {
    expect(calculateMaxDrawdown([1, 2, 3, 4])).toBe(0);
  });
});

describe('calculateWinRate', () => {
  it('should compute correct win rate', () => {
    const returns = [0.1, -0.05, 0.2, 0, -0.1, 0.05];
    expect(calculateWinRate(returns)).toBeCloseTo(0.5);
  });
});

describe('calculateStats', () => {
  it('should return all stats for three scenarios', () => {
    const buffettReturns = [0.1, 0.2, -0.05];
    const sp500Returns = [0.05, -0.1, 0.15];
    const userReturns = [0.1, 0.2, -0.05];
    const initialAsset = 1;
    const years = 3;

    const stats = calculateStats(buffettReturns, sp500Returns, userReturns, initialAsset, years);

    expect(stats.finalAssets).toHaveLength(3);
    expect(stats.cagr).toHaveLength(3);
    expect(stats.winRate).toHaveLength(3);
    expect(stats.maxDrawdown).toHaveLength(3);

    // user = buffett initially, so stats should match
    expect(stats.finalAssets[0]).toBeCloseTo(stats.finalAssets[2]);
    expect(stats.cagr[0]).toBeCloseTo(stats.cagr[2]);
  });
});
