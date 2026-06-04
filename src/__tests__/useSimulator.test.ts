import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSimulator } from '../hooks/useSimulator';
import { YEARS } from '../data/buffettData';
import { applyParameters } from '../parameters/apply';

describe('useSimulator', () => {
  it('default state: result.userReturn equals buffett returns', () => {
    const { result } = renderHook(() => useSimulator());
    YEARS.forEach((y, i) => {
      expect(result.current.result.userReturn[i]).toBeCloseTo(y.buffettReturn);
    });
    expect(result.current.parameters).toEqual({ leverage: 1, friction: 0 });
  });

  it('setParameters with friction=0.02 → userReturn projected', () => {
    const { result } = renderHook(() => useSimulator());
    act(() => {
      result.current.setParameters({ leverage: 1, friction: 0.02 });
    });
    YEARS.forEach((y, i) => {
      expect(result.current.result.userReturn[i]).toBeCloseTo(
        applyParameters(y.buffettReturn, { leverage: 1, friction: 0.02 })
      );
    });
  });

  it('setParameters with leverage=2 → userReturn projected', () => {
    const { result } = renderHook(() => useSimulator());
    act(() => {
      result.current.setParameters({ leverage: 2, friction: 0 });
    });
    YEARS.forEach((y, i) => {
      expect(result.current.result.userReturn[i]).toBeCloseTo(
        applyParameters(y.buffettReturn, { leverage: 2, friction: 0 })
      );
    });
  });

  it('updateReturn modifies rawReturns only; parameters unaffected', () => {
    const { result } = renderHook(() => useSimulator());
    act(() => {
      result.current.setParameters({ leverage: 2, friction: 0 });
      result.current.updateReturn(0, 0.5);
    });
    // userReturn[0] = applyParameters(0.5, {L=2, f=0}) = 2 * (0.5 - 0) = 1.0
    expect(result.current.result.userReturn[0]).toBeCloseTo(1.0);
    expect(result.current.parameters).toEqual({ leverage: 2, friction: 0 });
  });

  it('exposes rawReturns separately from userReturn (leverage diverges them)', () => {
    const { result } = renderHook(() => useSimulator());
    act(() => {
      result.current.setParameters({ leverage: 2, friction: 0 });
      result.current.updateReturn(0, 0.3);
    });
    // rawReturns reflects what the user set; userReturn is the leveraged projection.
    expect(result.current.result.rawReturns[0]).toBeCloseTo(0.3);
    expect(result.current.result.userReturn[0]).toBeCloseTo(0.6); // 2 * (0.3 - 0)
  });

  it('resetAll clears both rawReturns and parameters', () => {
    const { result } = renderHook(() => useSimulator());
    act(() => {
      result.current.setParameters({ leverage: 2, friction: 0.05 });
      result.current.updateReturn(0, 0.5);
    });
    act(() => {
      result.current.resetAll();
    });
    YEARS.forEach((y, i) => {
      expect(result.current.result.userReturn[i]).toBeCloseTo(y.buffettReturn);
    });
    expect(result.current.parameters).toEqual({ leverage: 1, friction: 0 });
  });
});
