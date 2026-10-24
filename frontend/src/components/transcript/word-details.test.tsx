import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { makeRecognition } from '@/test/recognitions'
import { renderWithProviders } from '@/test/render'
import { WordDetails } from './word-details'

const words = makeRecognition().predictions

function renderDetails(selected: number | null) {
  const onSelect = vi.fn()
  renderWithProviders(<WordDetails words={words} selected={selected} onSelect={onSelect} />)
  return { onSelect }
}

const entry = (term: string) => screen.getByText(term).nextElementSibling

describe('WordDetails', () => {
  it('asks to pick a word when none is picked', () => {
    renderDetails(null)

    expect(screen.getByText('Pick a word')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Selected word' })).not.toBeInTheDocument()
  })

  it('shows where the word is, its translation and what it means', () => {
    renderDetails(1)

    const word = screen.getByRole('region', { name: 'Selected word' })
    expect(within(word).getByText('ἐστί,')).toBeInTheDocument()
    expect(within(word).getByText('Line 1, word 2')).toBeInTheDocument()
    expect(entry('Translation')).toHaveTextContent('is')
    expect(entry('Dictionary form')).toHaveTextContent('εἰμί')
    expect(entry('Definition')).toHaveTextContent('verb: to be')
    expect(within(word).getByText('Machine translation')).toBeInTheDocument()
    expect(within(word).getByText('Read with 80% confidence')).toBeInTheDocument()
  })

  it('says so when a word has no translation', () => {
    renderDetails(2)

    expect(screen.getByText('Line 2, word 1')).toBeInTheDocument()
    expect(screen.getByText('No translation yet')).toBeInTheDocument()
    expect(screen.queryByText('Translation')).not.toBeInTheDocument()
  })

  it('steps to the previous and next word', async () => {
    const { onSelect } = renderDetails(1)

    await userEvent.click(screen.getByRole('button', { name: /previous word/i }))
    await userEvent.click(screen.getByRole('button', { name: /next word/i }))

    expect(onSelect.mock.calls).toEqual([[0], [2]])
  })

  it.each([
    [0, /previous word/i],
    [2, /next word/i],
  ])('can not step past the edge from word %i', (selected, name) => {
    renderDetails(selected)

    expect(screen.getByRole('button', { name })).toBeDisabled()
  })
})
