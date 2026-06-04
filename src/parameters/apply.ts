export interface Parameters {
  leverage: number;
  friction: number;
}

export const DEFAULT_PARAMETERS: Parameters = { leverage: 1, friction: 0 };

// Formula: r = L * (r_raw - f), capped at -1.
//
// Real-world frictions (commissions, bid-ask spread, management fees, taxes)
// are charged on the full position L·C, not on the post-growth value. So the
// deduction is a flat f·L·C per year, taken off the gross leveraged return.
//
// Equivalent of:
//
//   gross:     C * (1 + L * r_raw) - C = C * L * r_raw
//   friction:  f * L * C  (per year, on AUM)
//   net:       C * (L * r_raw - f)
//   return:    L * r_raw - f = L * (r_raw - f)
//
// At L=1 this reduces to the textbook expense-ratio model (r - f).
// At L>1 the friction scales with leverage, exposing the "leverage is a
// double-edged sword" insight: 2x leverage + 5% friction + 10% raw return
// nets 10% (not 15%), because the 5% friction is charged on $200 of
// position, not on $100 of own capital.
export function applyParameters(rawReturn: number, params: Parameters): number {
  const r = params.leverage * (rawReturn - params.friction);
  return Math.max(-1, r);
}
