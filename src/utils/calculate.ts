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
  if (assetCurve.length === 0) return 0;
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
