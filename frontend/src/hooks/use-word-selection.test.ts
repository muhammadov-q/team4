import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useWordSelection } from './use-word-selection'

const first = {}
const second = {}

describe('useWordSelection', () => {
  it('starts with no word picked', () => {
    const { result } = renderHook(() => useWordSelection(first))

    expect(result.current.selected).toBeNull()
  })

  it('remembers the picked word', () => {
    const { result } = renderHook(() => useWordSelection(first))

    act(() => result.current.select(3))

    expect(result.current.selected).toBe(3)
  })

  it('forgets the word when another result comes in', () => {
    const { result, rerender } = renderHook(({ shown }) => useWordSelection(shown), {
      initialProps: { shown: first as object | undefined },
    })
    act(() => result.current.select(3))

    rerender({ shown: second })
    expect(result.current.selected).toBeNull()

    rerender({ shown: undefined })
    expect(result.current.selected).toBeNull()
  })

  it('ignores picks while there is no result', () => {
    const { result } = renderHook(() => useWordSelection(undefined))

    act(() => result.current.select(0))

    expect(result.current.selected).toBeNull()
  })
})
