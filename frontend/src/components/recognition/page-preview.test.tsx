import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Word } from '@/lib/words'
import { renderWithProviders } from '@/test/render'
import { PagePreview } from './page-preview'

const page = new File(['png-bytes'], 'folio.png', { type: 'image/png' })

const word = (text: string, box: Word['box']): Word => ({
  text,
  probabilities: { [text]: 1 },
  box,
  line: 0,
  gloss: null,
})

const words = [
  word('καὶ', { x: 100, y: 50, w: 200, h: 100 }),
  word('μὲν', { x: 500, y: 50, w: 200, h: 100 }),
  word('δὲ', { x: 0, y: 0, w: 0, h: 0 }),
]

function renderPreview(props: Partial<React.ComponentProps<typeof PagePreview>> = {}) {
  renderWithProviders(
    <PagePreview file={page} onReplace={vi.fn()} onCrop={vi.fn()} onRemove={vi.fn()} {...props} />
  )
  return screen.getByRole('img', { name: 'Preview of folio.png' })
}

function load(image: HTMLElement, width: number, height: number) {
  Object.defineProperty(image, 'naturalWidth', { value: width })
  Object.defineProperty(image, 'naturalHeight', { value: height })
  fireEvent.load(image)
}

describe('PagePreview', () => {
  it('draws a box over each word the model found once the image loads', () => {
    const image = renderPreview({ words })

    expect(screen.queryAllByTestId('word-box')).toHaveLength(0)
    load(image, 1000, 500)

    const boxes = screen.getAllByTestId('word-box')
    expect(boxes).toHaveLength(2)
    expect(boxes[1]).toHaveStyle({ left: '50%', top: '10%', width: '20%', height: '20%' })
  })

  it('picks a word when its box is clicked and marks the picked one', async () => {
    const onSelectWord = vi.fn()
    load(renderPreview({ words, selected: 0, onSelectWord }), 1000, 500)

    const [first, second] = screen.getAllByTestId('word-box')
    expect(first).toHaveAttribute('data-selected', 'true')
    expect(second).not.toHaveAttribute('data-selected')

    await userEvent.click(second)
    expect(onSelectWord).toHaveBeenCalledWith(1)
  })

  it('shows the plain page before there is a result', () => {
    load(renderPreview(), 1000, 500)

    expect(screen.queryAllByTestId('word-box')).toHaveLength(0)
  })

  it('explains when the browser cannot show the image', () => {
    fireEvent.error(renderPreview({ words }))

    expect(screen.getByText(/can't preview this image/i)).toBeInTheDocument()
    expect(screen.queryAllByTestId('word-box')).toHaveLength(0)
  })
})
