import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { DigitPrediction } from '@/lib/digits'
import { renderWithProviders } from '@/test/render'
import { PagePreview } from './page-preview'

const page = new File(['png-bytes'], 'digits.png', { type: 'image/png' })

const predictions: DigitPrediction[] = [
  { digit: 4, probabilities: { '4': 0.9 }, box: { x: 100, y: 50, w: 200, h: 100 } },
  { digit: 2, probabilities: { '2': 0.6 }, box: { x: 500, y: 50, w: 200, h: 100 } },
  { digit: 0, probabilities: { '0': 1 }, box: { x: 0, y: 0, w: 0, h: 0 } },
]

function renderPreview(props: { predictions?: DigitPrediction[] } = {}) {
  renderWithProviders(
    <PagePreview file={page} onReplace={vi.fn()} onCrop={vi.fn()} onRemove={vi.fn()} {...props} />
  )
  return screen.getByRole('img', { name: 'Preview of digits.png' })
}

function load(image: HTMLElement, width: number, height: number) {
  Object.defineProperty(image, 'naturalWidth', { value: width })
  Object.defineProperty(image, 'naturalHeight', { value: height })
  fireEvent.load(image)
}

describe('PagePreview', () => {
  it('draws a box over each digit the model found once the image loads', () => {
    const image = renderPreview({ predictions })

    expect(screen.queryAllByTestId('digit-box')).toHaveLength(0)
    load(image, 1000, 500)

    const boxes = screen.getAllByTestId('digit-box')
    expect(boxes).toHaveLength(2)
    expect(boxes[1]).toHaveTextContent('2')
    expect(boxes[1]).toHaveStyle({ left: '50%', top: '10%', width: '20%', height: '20%' })
  })

  it('shows the plain page before there is a result', () => {
    load(renderPreview(), 1000, 500)

    expect(screen.queryAllByTestId('digit-box')).toHaveLength(0)
  })

  it('explains when the browser cannot show the image', () => {
    fireEvent.error(renderPreview({ predictions }))

    expect(screen.getByText(/can't preview this image/i)).toBeInTheDocument()
    expect(screen.queryAllByTestId('digit-box')).toHaveLength(0)
  })
})
