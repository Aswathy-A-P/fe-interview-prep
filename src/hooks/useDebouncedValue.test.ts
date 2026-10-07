import { act, renderHook } from '@testing-library/react';
import { useDebouncedValue } from './useDebouncedValue.ts';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('only updates after the value has stopped changing for the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'r' },
    });

    rerender({ value: 're' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 'rea' });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('r');

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('rea');
  });
});
