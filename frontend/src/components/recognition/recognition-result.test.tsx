import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Recognition } from '@/lib/api/recognitions'
import { renderWithProviders } from '@/test/render'
import { RecognitionResult } from './recognition-result'

type Answer = Pick<Recognition, 'predictions' | 'model_version'>

function renderResult(answer: Answer, durationMs?: number) {
  const recognition = { id: 1, created_at: '', filename: 'folio-1r.png', ...answer }
  renderWithProviders(<RecognitionResult recognition={recognition} durationMs={durationMs} />)
  return screen.getByRole('region', { name: 'Model response' })
}

const knnResponse: Answer = {
  predictions: [
    { digit: 4, probabilities: { '4': 0.92, '9': 0.08 }, box: { x: 100, y: 50, w: 200, h: 100 } },
    { digit: 2, probabilities: { '2': 0.61, '7': 0.39 }, box: { x: 500, y: 50, w: 200, h: 100 } },
  ],
  model_version: 'KNN-100126',
}

describe('RecognitionResult', () => {
  it('shows the digits read and how sure the model is about each one', () => {
    const region = renderResult(knnResponse)

    expect(within(region).getByText('Digits read').nextElementSibling).toHaveTextContent('42')
    expect(within(region).getByText('Machine output')).toBeInTheDocument()
    expect(within(region).getByText('KNN-100126')).toBeInTheDocument()

    const list = within(region).getByRole('list', { name: 'How sure the model is' })
    const digits = within(list).getAllByRole('listitem')
    expect(digits.map((item) => item.textContent)).toEqual(['492%', '261%'])
    expect(within(region).getByText(/boxes on your page/i)).toBeInTheDocument()
  })

  it('shows only the answer, not the raw response', () => {
    const region = renderResult(knnResponse)

    expect(region).not.toHaveTextContent('probabilities')
    expect(region).not.toHaveTextContent('model_version')
  })

  it('says so when no digits were found', () => {
    const region = renderResult({ predictions: [], model_version: 'KNN-100126' })

    expect(within(region).getByText('No digits found')).toBeInTheDocument()
    expect(
      within(region).queryByRole('list', { name: 'How sure the model is' })
    ).not.toBeInTheDocument()
    expect(within(region).queryByText(/boxes on your page/i)).not.toBeInTheDocument()
  })

  it('flags the mock and skips the boxes hint, since the mock has no boxes', () => {
    const region = renderResult({
      predictions: [{ digit: 2, probabilities: { '2': 1 }, box: { x: 0, y: 0, w: 0, h: 0 } }],
      model_version: 'mock',
    })

    expect(within(region).getByText(/placeholder output from the mock model/i)).toBeInTheDocument()
    expect(within(region).queryByText(/boxes on your page/i)).not.toBeInTheDocument()
  })

  it('shows how long the model took only when it just ran', () => {
    expect(renderResult(knnResponse, 120)).toHaveTextContent('120 ms')
  })

  it('leaves the time out for a saved result', () => {
    expect(renderResult(knnResponse)).not.toHaveTextContent(/\d+ ms/)
  })
})
