import { screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeRecognition } from '@/test/recognitions'
import { renderWithProviders } from '@/test/render'
import { HistoryList } from './history-list'

afterEach(() => {
  vi.unstubAllGlobals()
})

function stubHistory(response: Response) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
}

describe('HistoryList', () => {
  it('lists past results, each linking to the full result', async () => {
    stubHistory(
      Response.json([
        makeRecognition({ id: 2, filename: 'folio-2r.png' }),
        makeRecognition({ id: 1, filename: '', predictions: [] }),
      ])
    )
    renderWithProviders(<HistoryList />)

    const list = await screen.findByRole('list', { name: 'Past results' })
    const [newest, oldest] = within(list).getAllByRole('link')
    expect(newest).toHaveAttribute('href', '/dashboard/history/2')
    expect(newest).toHaveTextContent('folio-2r.png')
    expect(newest).toHaveTextContent('15 Oct 2026')
    expect(newest).toHaveTextContent('Φύσις ἐστί, ?')
    expect(oldest).toHaveAttribute('href', '/dashboard/history/1')
    expect(oldest).toHaveTextContent('Untitled page')
    expect(oldest).toHaveTextContent('No words')
    expect(screen.getByText('2 results')).toBeInTheDocument()
    expect(screen.getByText('Machine output')).toBeInTheDocument()
  })

  it('shows placeholder rows while the history loads', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {}))
    )
    const { container } = renderWithProviders(<HistoryList />)

    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('points to the Read page when there is nothing yet', async () => {
    stubHistory(Response.json([]))
    renderWithProviders(<HistoryList />)

    expect(await screen.findByText('No results yet')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Read a page' })).toHaveAttribute('href', '/dashboard')
  })

  it('says so when the history cannot load', async () => {
    stubHistory(Response.json({ detail: 'The backend is not reachable.' }, { status: 502 }))
    renderWithProviders(<HistoryList />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Could not load your history')
    expect(alert).toHaveTextContent('The backend is not reachable.')
  })

  it('shows a sign-in prompt when history returns 401', async () => {
    stubHistory(Response.json({ detail: 'Sign in to continue.' }, { status: 401 }))
    renderWithProviders(<HistoryList />)

    expect(await screen.findByText('Sign in to view your history')).toBeInTheDocument()

    expect(
      screen.getByText(
        'You can recognize images as a guest. Sign in to save future results and view your saved history.'
      )
    ).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/sign-in')

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Past results' })).not.toBeInTheDocument()
  })
})
