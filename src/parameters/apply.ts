export interface Parameters {
  leverage: number;
  friction: number;
}

export const DEFAULT_PARAMETERS: Parameters = { leverage: 1, friction: 0 };

export function applyParameters(rawReturn: number, params: Parameters): number {
  const r = params.leverage * (1 + rawReturn) * (1 - params.friction) - params.leverage;
  return Math.max(-1, r);
}
