import { act, renderHook } from '@testing-library/react';
import { usePersistentState } from './usePersistentState.ts';

const isNumber = (value: unknown): value is number => typeof value === 'number';

describe('usePersistentState', () => {
  it('starts from the initial value when nothing is stored', () => {
    const { result } = renderHook(() => usePersistentState('count', 0, { isValid: isNumber }));
    expect(result.current[0]).toBe(0);
  });

  it('writes updates to storage and restores them on the next mount', () => {
    const first = renderHook(() => usePersistentState('count', 0, { isValid: isNumber }));
    act(() => first.result.current[1](5));
    expect(localStorage.getItem('count')).toBe('5');
    first.unmount();

    const second = renderHook(() => usePersistentState('count', 0, { isValid: isNumber }));
    expect(second.result.current[0]).toBe(5);
  });

  it('falls back to the initial value when stored data is corrupt or the wrong shape', () => {
    localStorage.setItem('count', '{not json');
    const corrupt = renderHook(() => usePersistentState('count', 1, { isValid: isNumber }));
    expect(corrupt.result.current[0]).toBe(1);

    localStorage.setItem('count', '"text"');
    const wrongShape = renderHook(() => usePersistentState('count', 2, { isValid: isNumber }));
    expect(wrongShape.result.current[0]).toBe(2);
  });
});
