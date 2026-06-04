import { describe, it, expect } from 'vitest';
import { applyParameters, DEFAULT_PARAMETERS } from '../parameters/apply';

describe('applyParameters', () => {
  it('default params (L=1, f=0) → identity', () => {
    expect(applyParameters(0.1, DEFAULT_PARAMETERS)).toBeCloseTo(0.1);
    expect(applyParameters(-0.2, DEFAULT_PARAMETERS)).toBeCloseTo(-0.2);
    expect(applyParameters(0, DEFAULT_PARAMETERS)).toBeCloseTo(0);
  });

  it('2% friction: rawReturn=0.1 → 0.08 (expense ratio on AUM)', () => {
    // r = L * (r_raw - f) = 1 * (0.1 - 0.02) = 0.08
    expect(applyParameters(0.1, { leverage: 1, friction: 0.02 })).toBeCloseTo(0.08);
  });

  it('2x leverage: rawReturn=0.1 → 0.20', () => {
    // r = 2 * (0.1 - 0) = 0.20
    expect(applyParameters(0.1, { leverage: 2, friction: 0 })).toBeCloseTo(0.20);
  });

  it('2x leverage + 5% friction: rawReturn=0.1 → 0.10', () => {
    // r = 2 * (0.1 - 0.05) = 0.10
    // Friction is charged on the full $200 position (f * L * C),
    // not on the $100 of own capital — leverage amplifies friction.
    expect(applyParameters(0.1, { leverage: 2, friction: 0.05 })).toBeCloseTo(0.10);
  });

  it('leverage amplifies friction: 2x leverage pays 2x friction on own capital', () => {
    // 2x leverage, 0% friction, 10% return: 2 * 0.10 = 0.20
    expect(applyParameters(0.1, { leverage: 2, friction: 0 })).toBeCloseTo(0.20);
    // Same scenario with 2% friction: 2 * (0.10 - 0.02) = 0.16
    expect(applyParameters(0.1, { leverage: 2, friction: 0.02 })).toBeCloseTo(0.16);
    // Friction drag on own capital: 0.20 - 0.16 = 0.04 = 2 * 0.02
    // → leveraged investors pay friction on borrowed portion too.
  });

  it('2x leverage with -50% raw → capped at -1 (bankruptcy)', () => {
    // r = 2 * (-0.5 - 0) = -1.0
    expect(applyParameters(-0.5, { leverage: 2, friction: 0 })).toBe(-1);
  });

  it('3x leverage with -33.4% raw → capped at -1', () => {
    // r = 3 * (-0.334 - 0) = -1.002 → capped
    expect(applyParameters(-0.334, { leverage: 3, friction: 0 })).toBe(-1);
  });

  it('friction pulls bankruptcy point earlier', () => {
    // With f=0.05, L=2, rawReturn=-0.48: r = 2 * (-0.48 - 0.05) = -1.06 → capped
    expect(applyParameters(-0.48, { leverage: 2, friction: 0.05 })).toBe(-1);
    // Without friction, r=-0.48 with L=2 → -0.96 (not capped)
    expect(applyParameters(-0.48, { leverage: 2, friction: 0 })).toBeCloseTo(-0.96);
  });

  it('rawReturn=-1 → -1 regardless of L, f', () => {
    expect(applyParameters(-1, { leverage: 2, friction: 0.05 })).toBe(-1);
    expect(applyParameters(-1, { leverage: 3, friction: 0.1 })).toBe(-1);
  });

  it('rawReturn=+2 with 2x leverage → 4 (doubled)', () => {
    // r = 2 * (2 - 0) = 4
    expect(applyParameters(2, { leverage: 2, friction: 0 })).toBeCloseTo(4);
  });
});
