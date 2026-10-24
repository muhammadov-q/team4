'use client'

import { useState } from 'react'

export function useWordSelection(result: object | undefined) {
  const [selection, setSelection] = useState<{ result: object; index: number } | null>(null)
  const selected = selection !== null && selection.result === result ? selection.index : null

  function select(index: number) {
    if (result !== undefined) setSelection({ result, index })
  }

  return { selected, select }
}
