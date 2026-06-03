import { describe, it, expect } from 'vitest';
import { applyParameters, DEFAULT_PARAMETERS } from '../parameters/apply';

describe('applyParameters', () => {
  it('default params (L=1, f=0) → identity', () => {
    expect(applyParameters(0.1, DEFAULT_PARAMETERS)).toBeCloseTo(0.1);
    expect(applyParameters(-0.2, DEFAULT_PARAMETERS)).toBeCloseTo(-0.2);
    expect(applyParameters(0, DEFAULT_PARAMETERS)).toBeCloseTo(0);
  });

  it('2% friction: rawReturn=0.1 → 0.078', () => {
    expect(applyParameters(0.1, { leverage: 1, friction: 0.02 })).toBeCloseTo(0.078);
  });

  it('2x leverage: rawReturn=0.1 → 0.20', () => {
    expect(applyParameters(0.1, { leverage: 2, friction: 0 })).toBeCloseTo(0.20);
  });

  it('2x leverage + 5% friction: rawReturn=0.1 → 0.09', () => {
    // L*(1+r)*(1-f) - L = 2*1.1*0.95 - 2 = 2.09 - 2 = 0.09
    expect(applyParameters(0.1, { leverage: 2, friction: 0.05 })).toBeCloseTo(0.09);
  });

  it('2x leverage with -50% raw → capped at -1 (bankruptcy)', () => {
    expect(applyParameters(-0.5, { leverage: 2, friction: 0 })).toBe(-1);
  });

  it('3x leverage with -33.4% raw → capped at -1', () => {
    expect(applyParameters(-0.334, { leverage: 3, friction: 0 })).toBe(-1);
  });

  it('rawReturn=-1 → -1 regardless of L, f', () => {
    expect(applyParameters(-1, { leverage: 2, friction: 0.05 })).toBe(-1);
    expect(applyParameters(-1, { leverage: 3, friction: 0.1 })).toBe(-1);
  });

  it('rawReturn=+2 with 2x leverage → 4 (doubled)', () => {
    // L*(1+r)*(1-f) - L = 2*3*1 - 2 = 4
    expect(applyParameters(2, { leverage: 2, friction: 0 })).toBeCloseTo(4);
  });
});
