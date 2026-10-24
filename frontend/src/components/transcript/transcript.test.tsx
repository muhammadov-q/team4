import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Word } from '@/lib/words'
import { makeRecognition } from '@/test/recognitions'
import { renderWithProviders } from '@/test/render'
import { Transcript } from './transcript'

const words = makeRecognition().predictions

function renderTranscript(selected: number | null = null, list: Word[] = words) {
  const onSelect = vi.fn()
  renderWithProviders(<Transcript words={list} selected={selected} onSelect={onSelect} />)
  return { region: screen.getByRole('region', { name: 'Transcript' }), onSelect }
}

describe('Transcript', () => {
  it('shows the words line by line, labelled as machine output', () => {
    const { region } = renderTranscript()

    const lines = within(region).getAllByRole('listitem')
    expect(lines).toHaveLength(2)
    expect(
      within(lines[0])
        .getAllByRole('button')
        .map((b) => b.textContent)
    ).toEqual(['Φύσις', 'ἐστί,'])
    expect(lines[1]).toHaveTextContent('Line 2?')
    expect(region).toHaveTextContent('3 words on 2 lines')
    expect(within(region).getByText('Machine output')).toBeInTheDocument()
  })

  it('picks a word when it is clicked', async () => {
    const { region, onSelect } = renderTranscript()

    await userEvent.click(within(region).getByRole('button', { name: 'ἐστί,' }))

    expect(onSelect).toHaveBeenCalledWith(1)
  })

  it('marks the picked word as pressed', () => {
    const { region } = renderTranscript(2)

    expect(within(region).getByRole('button', { name: '?' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(within(region).getByRole('button', { name: 'Φύσις' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('says so when the model found no words', () => {
    const { region } = renderTranscript(null, [])

    expect(region).toHaveTextContent('0 words on 0 lines')
    expect(within(region).getByText('The model found no words on this page.')).toBeInTheDocument()
    expect(within(region).queryByRole('button')).not.toBeInTheDocument()
  })
})
