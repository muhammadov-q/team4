import { devices, expect, test } from '@playwright/test'

const PAGE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
)

test('a photo taken on the phone lands on the page on the computer', async ({ page, browser }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Use your phone' }).click()

  const dialog = page.getByRole('dialog', { name: 'Use your phone' })
  await expect(dialog.getByRole('img', { name: /QR code/ })).toBeVisible()
  const link = await dialog.getByText(/\/capture\//).textContent()
  expect(link).toMatch(/^https?:\/\/(?!localhost)[^/]+\/capture\/[\w-]+$/)

  const phone = await browser.newContext({ ...devices['Pixel 7'] })
  const phonePage = await phone.newPage()
  await phonePage.goto(link!)
  await expect(phonePage.getByRole('heading', { name: 'Take a photo of the page' })).toBeVisible()

  await phonePage.getByLabel('Photo of the page').setInputFiles({
    name: 'image.png',
    mimeType: 'image/png',
    buffer: PAGE_PNG,
  })
  await expect(phonePage.getByText('Sent to your computer')).toBeVisible()

  await expect(page.getByRole('img', { name: 'Preview of Phone photo 1.png' })).toBeVisible()
  await expect(dialog).toBeHidden()
  await expect(page.getByText('Phone linked. New photos replace the page.')).toBeVisible()

  await phonePage.getByLabel('Photo of the page').setInputFiles({
    name: 'image.png',
    mimeType: 'image/png',
    buffer: PAGE_PNG,
  })
  await expect(page.getByRole('img', { name: 'Preview of Phone photo 2.png' })).toBeVisible()

  await page.getByRole('button', { name: 'Unlink' }).click()
  await phonePage.reload()
  await expect(phonePage.getByRole('heading', { name: 'This link no longer works' })).toBeVisible()

  await phone.close()
})
