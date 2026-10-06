import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { PhoneCapture } from './phone-capture'

afterEach(() => {
  vi.unstubAllGlobals()
})

const session = (uploads = 0) => Response.json({ id: 'abc', upload_count: uploads })
const photo = () => new File(['jpeg'], 'image.jpg', { type: 'image/jpeg' })

function stubBackend(onUpload: () => Response) {
  const fetch = vi.fn(async (_url: string, init: RequestInit = {}) =>
    init.method === 'PUT' ? onUpload() : session()
  )
  vi.stubGlobal('fetch', fetch)
  return fetch
}

async function setup() {
  const user = userEvent.setup({ applyAccept: false })
  renderWithProviders(<PhoneCapture sessionId="abc" />)
  await screen.findByRole('heading', { name: 'Take a photo of the page' })
  return { user }
}

describe('PhoneCapture', () => {
  it('opens the back camera from the main button', async () => {
    stubBackend(() => session(1))
    await setup()

    const camera = screen.getByLabelText('Photo of the page')
    expect(camera).toHaveAttribute('capture', 'environment')
    expect(camera).toHaveAttribute('accept', 'image/*')
    expect(screen.getByRole('button', { name: 'Take photo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Choose from photos' })).toBeInTheDocument()
  })

  it('sends the photo to the computer and offers another one', async () => {
    const fetch = stubBackend(() => session(1))
    const { user } = await setup()

    await user.upload(screen.getByLabelText('Photo of the page'), photo())

    expect(await screen.findByText('Sent to your computer')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Photo you took' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Take another photo' })).toBeInTheDocument()
    const upload = fetch.mock.calls.find(([, init]) => init?.method === 'PUT')
    expect(upload?.[0]).toBe('/api/capture-sessions/abc/image')
  })

  it('keeps the photo and lets the user retry when sending fails', async () => {
    const onUpload = vi
      .fn()
      .mockReturnValueOnce(Response.json({ detail: 'Service down' }, { status: 502 }))
      .mockReturnValueOnce(session(1))
    stubBackend(onUpload)
    const { user } = await setup()

    await user.upload(screen.getByLabelText('Photo from your library'), photo())
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent("Couldn't send the photo")
    expect(alert).toHaveTextContent('Service down')

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('Sent to your computer')).toBeInTheDocument()
    expect(onUpload).toHaveBeenCalledTimes(2)
  })

  it('rejects a file that is not an image without sending it', async () => {
    const onUpload = vi.fn()
    stubBackend(onUpload)
    const { user } = await setup()

    await user.upload(
      screen.getByLabelText('Photo from your library'),
      new File(['%PDF'], 'scan.pdf', { type: 'application/pdf' })
    )

    expect(screen.getByRole('alert')).toHaveTextContent('scan.pdf is not a JPG, PNG or TIFF image.')
    expect(onUpload).not.toHaveBeenCalled()
  })

  it('says when the link no longer works', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ detail: 'Expired' }, { status: 404 }))
    )
    renderWithProviders(<PhoneCapture sessionId="old" />)

    expect(
      await screen.findByRole('heading', { name: 'This link no longer works' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Take photo' })).not.toBeInTheDocument()
  })

  it('says the link no longer works when it ends before the upload', async () => {
    stubBackend(() => Response.json({ detail: 'Expired' }, { status: 404 }))
    const { user } = await setup()

    await user.upload(screen.getByLabelText('Photo of the page'), photo())

    expect(
      await screen.findByRole('heading', { name: 'This link no longer works' })
    ).toBeInTheDocument()
  })
})
