// Y-axis scale helpers for the return-axis (left axis of CombinedChart).
//
// Why a dedicated module: with the parameter engine, userReturn can reach
// up to 6.0 (leverage=3 * rawReturn=2). The previous hard cap at 2 truncated
// bars; we now derive hi from actual visible data and adapt the tick step
// so the axis stays readable across both small (default) and large
// (leveraged) ranges.

const PAD = 0.08;
const LO_FLOOR = -1; // bankruptcy floor: assets can never go below -100%

export function calcReturnDomain(returns: number[]): [number, number] {
  const min = Math.min(...returns);
  const max = Math.max(...returns);
  const lo = Math.max(LO_FLOOR, Math.floor((min - PAD) * 10) / 10);
  const hi = Math.ceil((max + PAD) * 10) / 10;
  return [lo, hi];
}

export function calcReturnTicks([lo, hi]: [number, number]): number[] {
  const range = hi - lo;
  // Step adapts to keep tick count in a readable range (~5–12 ticks).
  const step =
    range > 4 ? 1.0 :
    range > 2 ? 0.5 :
    range > 1.5 ? 0.2 :
    range > 0.8 ? 0.1 :
    0.05;
  // Iterate by integer step count to avoid floating-point drift from `lo/step`
  // (e.g. -0.3/0.1 → -2.999... rounds the wrong direction).
  const startK = Math.ceil(lo / step - 1e-9);
  const endK = Math.floor(hi / step + 1e-9);
  const ticks: number[] = [];
  for (let k = startK; k <= endK; k++) {
    ticks.push(Math.round(k * step * 100) / 100);
  }
  return ticks;
}
