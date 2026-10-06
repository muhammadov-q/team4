import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { ImageCropper } from './image-cropper'

describe('ImageCropper', () => {
  it('shows crop controls and calls onCancel', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    const file = new File(['png-bytes'], 'folio-1r.png', {
      type: 'image/png',
    })

    renderWithProviders(<ImageCropper file={file} onApply={vi.fn()} onCancel={onCancel} />)

    expect(screen.getByText('Crop image')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply crop' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalledOnce()
  })
})
