import { describe, it, expect } from 'vitest';
import { calcReturnDomain, calcReturnTicks } from '../utils/chartAxis';

describe('calcReturnDomain', () => {
  it('default range (no leverage): pads + rounds to 0.1', () => {
    const [lo, hi] = calcReturnDomain([-0.3, 0.1, 0.5]);
    expect(lo).toBeCloseTo(-0.4);
    expect(hi).toBeCloseTo(0.6);
  });

  it('clamps lo at -1 (bankruptcy floor)', () => {
    const [lo] = calcReturnDomain([-1, 0.2, 0.3]);
    expect(lo).toBe(-1);
  });

  it('no longer hard-caps hi at 2: leverage 3x can push to 600%', () => {
    // leverage=3, rawReturn=2 → effective=6
    const [, hi] = calcReturnDomain([-0.5, 0.3, 6.0]);
    expect(hi).toBeCloseTo(6.1);
  });

  it('handles single-value array', () => {
    const [lo, hi] = calcReturnDomain([0.2]);
    expect(lo).toBeCloseTo(0.1);
    expect(hi).toBeCloseTo(0.3);
  });
});

describe('calcReturnTicks', () => {
  it('default range (~1.0): uses 0.1 step', () => {
    const ticks = calcReturnTicks([-0.3, 0.6]);
    expect(ticks).toContain(-0.3);
    expect(ticks).toContain(0);
    expect(ticks).toContain(0.6);
    expect(ticks.length).toBeGreaterThanOrEqual(8);
    expect(ticks.length).toBeLessThanOrEqual(12);
  });

  it('large range (>2): uses 0.5 step', () => {
    const ticks = calcReturnTicks([-1, 2]);
    expect(ticks.length).toBeGreaterThanOrEqual(5);
    expect(ticks.length).toBeLessThanOrEqual(8);
  });

  it('extreme range (>4, e.g. leverage 3x): uses 1.0 step, stays readable', () => {
    const ticks = calcReturnTicks([-1, 6]);
    // 7 + 1 ticks at most
    expect(ticks.length).toBeGreaterThanOrEqual(6);
    expect(ticks.length).toBeLessThanOrEqual(10);
    expect(ticks).toContain(0);
    expect(ticks).toContain(6);
  });

  it('small range (<0.8): uses 0.05 step', () => {
    const ticks = calcReturnTicks([0, 0.5]);
    expect(ticks.length).toBeGreaterThanOrEqual(8);
  });
});
