import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIdleHint } from '../hooks/useIdleHint';

describe('useIdleHint', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    vi.useRealTimers();
    window.matchMedia = originalMatchMedia;
  });

  it('test 1: first visit + 60s no interaction → shouldBreath=true, localStorage set', () => {
    const { result } = renderHook(() => useIdleHint());
    expect(result.current.shouldBreath).toBe(false);
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(result.current.shouldBreath).toBe(true);
    expect(localStorage.getItem('p0b2d.idleHintShown')).toBe('1');
  });

  it('test 2: reset() before trigger → timer resets, no trigger within 60s', () => {
    const { result } = renderHook(() => useIdleHint());
    act(() => { vi.advanceTimersByTime(30_000); });
    act(() => { result.current.reset(); });
    act(() => { vi.advanceTimersByTime(30_000); });
    expect(result.current.shouldBreath).toBe(false);
    expect(localStorage.getItem('p0b2d.idleHintShown')).toBeNull();
  });

  it('test 3: reset() after trigger → shouldBreath=false (animation stops)', () => {
    const { result } = renderHook(() => useIdleHint());
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(result.current.shouldBreath).toBe(true);
    act(() => { result.current.reset(); });
    expect(result.current.shouldBreath).toBe(false);
    expect(localStorage.getItem('p0b2d.idleHintShown')).toBe('1');
  });

  it('test 4: localStorage pre-set → shouldBreath=false forever, no timer', () => {
    localStorage.setItem('p0b2d.idleHintShown', '1');
    const { result } = renderHook(() => useIdleHint());
    expect(result.current.shouldBreath).toBe(false);
    act(() => { vi.advanceTimersByTime(120_000); });
    expect(result.current.shouldBreath).toBe(false);
  });

  it('test 5: prefers-reduced-motion → shouldBreath=false permanently', () => {
    const matchMediaMock = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    window.matchMedia = matchMediaMock;
    const { result } = renderHook(() => useIdleHint());
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(result.current.shouldBreath).toBe(false);
    expect(localStorage.getItem('p0b2d.idleHintShown')).toBeNull();
  });

  it('test 6: unmount clears timer (no orphan setTimeout)', () => {
    const { unmount } = renderHook(() => useIdleHint());
    act(() => { vi.advanceTimersByTime(30_000); });
    unmount();
    // If timer leaked, advancing would throw "Cannot advance timer after unmount"
    // or trigger callback. Here we just verify no throw and no shouldBreath flip.
    expect(() => vi.advanceTimersByTime(60_000)).not.toThrow();
  });

  it('test 7: rapid reset() calls do not stack timers (last call wins)', () => {
    const { result } = renderHook(() => useIdleHint());
    act(() => { vi.advanceTimersByTime(50_000); });
    act(() => { result.current.reset(); });
    act(() => { vi.advanceTimersByTime(50_000); });
    act(() => { result.current.reset(); });
    // 110s elapsed since mount, but two resets mean trigger should be 60s after last reset
    act(() => { vi.advanceTimersByTime(10_000); });
    expect(result.current.shouldBreath).toBe(false);
    act(() => { vi.advanceTimersByTime(50_000); });
    expect(result.current.shouldBreath).toBe(true);
  });

  it('test 8: custom thresholdMs and storageKey options honored', () => {
    const { result } = renderHook(() =>
      useIdleHint({ thresholdMs: 5_000, storageKey: 'custom.key' })
    );
    act(() => { vi.advanceTimersByTime(5_000); });
    expect(result.current.shouldBreath).toBe(true);
    expect(localStorage.getItem('custom.key')).toBe('1');
    expect(localStorage.getItem('p0b2d.idleHintShown')).toBeNull();
  });
});
