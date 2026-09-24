import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { RecognitionWorkbench } from './recognition-workbench'

afterEach(() => {
  vi.unstubAllGlobals()
})

const page = () => new File(['png-bytes'], 'folio-1r.png', { type: 'image/png' })

function setup({ applyAccept = true } = {}) {
  const user = userEvent.setup({ applyAccept })
  renderWithProviders(<RecognitionWorkbench />)
  return { user }
}

const recognizeButton = () => screen.getByRole('button', { name: /recognize page/i })

describe('RecognitionWorkbench', () => {
  it('sends the chosen page to the backend and shows the response', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(Response.json({ prediction: 250000, model_version: 'mock' }))
    vi.stubGlobal('fetch', fetch)
    const { user } = setup()

    expect(recognizeButton()).toBeDisabled()
    await user.upload(screen.getByLabelText('Page image'), page())
    expect(screen.getByRole('img', { name: 'Preview of folio-1r.png' })).toBeInTheDocument()

    await user.click(recognizeButton())

    const response = await screen.findByRole('region', { name: 'Model response' })
    expect(within(response).getByText('Prediction').nextElementSibling).toHaveTextContent('250000')
    expect(within(response).getByText('mock')).toBeInTheDocument()
    expect(within(response).getByText('Machine output')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledOnce()
    expect(fetch).toHaveBeenCalledWith('/api/predict', expect.objectContaining({ method: 'POST' }))
  })

  it('rejects a file that is not a page image before it reaches the backend', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    const { user } = setup({ applyAccept: false })

    await user.upload(
      screen.getByLabelText('Page image'),
      new File(['%PDF'], 'thesis.pdf', { type: 'application/pdf' })
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'thesis.pdf is not a JPG, PNG or TIFF image.'
    )
    expect(recognizeButton()).toBeDisabled()
    expect(fetch).not.toHaveBeenCalled()
  })

  it("shows the backend's reason when it rejects the image", async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ detail: 'File must be an image' }, { status: 415 }))
    )
    const { user } = setup()

    await user.upload(screen.getByLabelText('Page image'), page())
    await user.click(recognizeButton())

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Image rejected')
    expect(alert).toHaveTextContent('File must be an image')
    expect(screen.getByRole('button', { name: /try again/i })).toBeEnabled()
  })

  it('explains when the recognition service is offline', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ detail: 'The recognition service is not reachable.' }, { status: 502 })
        )
    )
    const { user } = setup()

    await user.upload(screen.getByLabelText('Page image'), page())
    await user.click(recognizeButton())

    expect(await screen.findByRole('alert')).toHaveTextContent('Recognition service offline')
  })

  it('can cancel a running recognition', async () => {
    const fetch = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_, reject) => {
          init.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError'))
          )
        })
    )
    vi.stubGlobal('fetch', fetch)
    const { user } = setup()

    await user.upload(screen.getByLabelText('Page image'), page())
    await user.click(recognizeButton())

    expect(await screen.findByText('Reading the page')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /recognizing/i })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(await screen.findByText('Ready to read')).toBeInTheDocument()
    expect(fetch.mock.calls[0][1].signal?.aborted).toBe(true)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('clears the previous result when the page is replaced', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ prediction: 1, model_version: 'mock' }))
    )
    const { user } = setup()

    await user.upload(screen.getByLabelText('Page image'), page())
    await user.click(recognizeButton())
    await screen.findByRole('region', { name: 'Model response' })

    await user.upload(
      screen.getByLabelText('Replacement page image'),
      new File(['png'], 'folio-1v.png', { type: 'image/png' })
    )

    expect(screen.queryByRole('region', { name: 'Model response' })).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Preview of folio-1v.png' })).toBeInTheDocument()
  })

  it('takes a page pasted from the clipboard', () => {
    setup()
    const paste = new Event('paste', { cancelable: true })
    Object.defineProperty(paste, 'clipboardData', { value: { files: [page()] } })

    act(() => {
      window.dispatchEvent(paste)
    })

    expect(screen.getByRole('img', { name: 'Preview of folio-1r.png' })).toBeInTheDocument()
    expect(paste.defaultPrevented).toBe(true)
  })
})
