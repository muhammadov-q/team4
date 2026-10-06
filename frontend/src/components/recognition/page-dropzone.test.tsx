import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PageDropzone } from './page-dropzone'

function setup() {
  const onFile = vi.fn()
  const onUsePhone = vi.fn()
  render(<PageDropzone onFile={onFile} onUsePhone={onUsePhone} />)
  const input = screen.getByLabelText('Page image')
  const openPicker = vi.spyOn(input, 'click')
  return { user: userEvent.setup(), onFile, onUsePhone, openPicker }
}

describe('PageDropzone', () => {
  it('opens the file picker from anywhere in the drop area', async () => {
    const { user, openPicker } = setup()

    await user.click(screen.getByText('or paste one from your clipboard'))

    expect(openPicker).toHaveBeenCalledOnce()
  })

  it('opens the file picker once from the Choose image button', async () => {
    const { user, openPicker } = setup()

    await user.click(screen.getByRole('button', { name: 'Choose image' }))

    expect(openPicker).toHaveBeenCalledOnce()
  })

  it('starts the phone flow without opening the file picker', async () => {
    const { user, onUsePhone, openPicker } = setup()

    await user.click(screen.getByRole('button', { name: 'Use your phone' }))

    expect(onUsePhone).toHaveBeenCalledOnce()
    expect(openPicker).not.toHaveBeenCalled()
  })

  it('says what will happen while a file is dragged over, and takes the dropped file', () => {
    const { onFile } = setup()
    const area = screen.getByText('Drop a page image here').closest('div')!.parentElement!
    const page = new File(['png'], 'folio-1r.png', { type: 'image/png' })

    fireEvent.dragEnter(area)
    expect(screen.getByText('Drop to add the page')).toBeInTheDocument()

    fireEvent.drop(area, { dataTransfer: { files: [page] } })
    expect(onFile).toHaveBeenCalledWith(page)
    expect(screen.getByText('Drop a page image here')).toBeInTheDocument()
  })

  it('lists the accepted files in one line', () => {
    setup()
    expect(screen.getByText('JPG, PNG or TIFF, up to 50 MB')).toBeInTheDocument()
  })
})
