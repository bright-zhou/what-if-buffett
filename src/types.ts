// ── Core data types for What If Buffett ──

export interface YearData {
  year: number;
  buffettReturn: number; // decimal, e.g. 0.237 for 23.7%
  sp500Return: number;
}

export interface Stats {
  finalAssets: [number, number, number]; // [sp500, buffett, user]
  cagr: [number, number, number];        // [sp500, buffett, user]
  winRate: [number, number, number];     // [sp500, buffett, user]
  maxDrawdown: [number, number, number]; // [sp500, buffett, user]
}

export interface SimulationResult {
  years: YearData[];
  userReturn: number[];
  buffettAsset: number[];
  sp500Asset: number[];
  userAsset: number[];
  stats: Stats;
}
