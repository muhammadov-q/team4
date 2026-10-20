import { fireEvent, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeRecognition } from '@/test/recognitions'
import { renderWithProviders } from '@/test/render'
import { SavedRecognition } from './saved-recognition'

afterEach(() => {
  vi.unstubAllGlobals()
})

function stubFetch(response: Response) {
  const fetch = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetch)
  return fetch
}

describe('SavedRecognition', () => {
  it('shows the saved page with the digits the model read', async () => {
    const fetch = stubFetch(Response.json(makeRecognition({ id: 7 })))
    renderWithProviders(<SavedRecognition id={7} />)

    expect(await screen.findByRole('heading', { level: 1, name: 'folio-1r.png' })).toBeVisible()
    expect(screen.getByText(/^Read on 15 Oct 2026/)).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('/api/recognitions/7', expect.anything())

    const result = screen.getByRole('region', { name: 'Model response' })
    expect(within(result).getByText('Digits read').nextElementSibling).toHaveTextContent('42')
    expect(within(result).getByText('Machine output')).toBeInTheDocument()

    const page = screen.getByRole('img', { name: 'Saved page folio-1r.png' })
    expect(page).toHaveAttribute('src', '/api/recognitions/7/image')
    expect(screen.queryAllByTestId('digit-box')).toHaveLength(0)

    Object.defineProperty(page, 'naturalWidth', { value: 100 })
    Object.defineProperty(page, 'naturalHeight', { value: 100 })
    fireEvent.load(page)

    expect(screen.getAllByTestId('digit-box')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'History' })).toHaveAttribute(
      'href',
      '/dashboard/history'
    )
  })

  it('says so, once, when the result is not in your history', async () => {
    const fetch = stubFetch(
      Response.json({ detail: 'This result is not in your history.' }, { status: 404 })
    )
    renderWithProviders(<SavedRecognition id={99} />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Could not open this result')
    expect(alert).toHaveTextContent('This result is not in your history.')
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('explains when the browser cannot show the saved image', async () => {
    stubFetch(Response.json(makeRecognition({ filename: 'scan.tiff' })))
    renderWithProviders(<SavedRecognition id={1} />)

    fireEvent.error(await screen.findByRole('img', { name: 'Saved page scan.tiff' }))

    expect(screen.getByText(/can't show this image/)).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Model response' })).toBeInTheDocument()
  })
})
