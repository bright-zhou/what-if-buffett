// ── Core data types for What If Buffett ──

export interface YearData {
  year: number;
  buffettReturn: number; // decimal, e.g. 0.237 for 23.7%
  sp500Return: number;
}

export interface Stats {
  finalAssets: [number, number, number]; // [buffett, sp500, user]
  cagr: [number, number, number];        // [buffett, sp500, user]
  winRate: [number, number, number];     // [buffett, sp500, user]
  maxDrawdown: [number, number, number]; // [buffett, sp500, user]
}

export interface SimulationResult {
  years: YearData[];
  userReturn: number[];
  buffettAsset: number[];
  sp500Asset: number[];
  userAsset: number[];
  stats: Stats;
}
