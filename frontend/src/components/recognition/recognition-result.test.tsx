import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Recognition } from '@/lib/api/recognitions'
import { makeRecognition } from '@/test/recognitions'
import { renderWithProviders } from '@/test/render'
import { RecognitionResult } from './recognition-result'

function renderResult(
  overrides: Partial<Recognition> = {},
  { durationMs, selected = null }: { durationMs?: number; selected?: number | null } = {}
) {
  const onSelect = vi.fn()
  renderWithProviders(
    <RecognitionResult
      recognition={makeRecognition(overrides)}
      durationMs={durationMs}
      selected={selected}
      onSelect={onSelect}
    />
  )
  return { region: screen.getByRole('region', { name: 'Model response' }), onSelect }
}

describe('RecognitionResult', () => {
  it('asks to pick a word until one is picked', () => {
    const { region } = renderResult()

    expect(within(region).getByText('Pick a word')).toBeInTheDocument()
    expect(within(region).getByText('Machine output')).toBeInTheDocument()
    expect(within(region).getByText('eparchos-6791')).toBeInTheDocument()
    expect(within(region).getByText(/boxes on your page/i)).toBeInTheDocument()
  })

  it('shows the picked word and moves to the next one', async () => {
    const { region, onSelect } = renderResult({}, { selected: 0 })

    const word = within(region).getByRole('region', { name: 'Selected word' })
    expect(word).toHaveTextContent('Φύσις')
    expect(word).toHaveTextContent('nature')

    await userEvent.click(within(region).getByRole('button', { name: /next word/i }))
    expect(onSelect).toHaveBeenCalledWith(1)
  })

  it('shows only the answer, not the raw response', () => {
    const { region } = renderResult({}, { selected: 0 })

    expect(region).not.toHaveTextContent('probabilities')
    expect(region).not.toHaveTextContent('model_version')
  })

  it('says so when no words were found', () => {
    const { region } = renderResult({ predictions: [] })

    expect(within(region).getByText('No words found')).toBeInTheDocument()
    expect(within(region).queryByText('Pick a word')).not.toBeInTheDocument()
    expect(within(region).queryByText(/boxes on your page/i)).not.toBeInTheDocument()
  })

  it('flags the mock and skips the boxes hint, since the mock has no boxes', () => {
    const { region } = renderResult({
      model_version: 'mock',
      predictions: [
        {
          text: '2',
          probabilities: { '2': 1 },
          box: { x: 0, y: 0, w: 0, h: 0 },
          line: 0,
          gloss: null,
        },
      ],
    })

    expect(within(region).getByText(/placeholder output from the mock model/i)).toBeInTheDocument()
    expect(within(region).queryByText(/boxes on your page/i)).not.toBeInTheDocument()
  })

  it('shows how long the model took only when it just ran', () => {
    expect(renderResult({}, { durationMs: 120 }).region).toHaveTextContent('120 ms')
  })

  it('leaves the time out for a saved result', () => {
    expect(renderResult().region).not.toHaveTextContent(/\d+ ms/)
  })
})
