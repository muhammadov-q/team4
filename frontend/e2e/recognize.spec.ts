import { expect, test } from '@playwright/test'

// Needs the backend on :8000 (see backend/README.md). Playwright starts the frontend.

// A 1x1 PNG: enough for the mock model, which only checks the upload is an image.
const PAGE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
)

test('uploads a page and shows the backend response', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Read a manuscript page' })).toBeVisible()

  await page.getByLabel('Page image').setInputFiles({
    name: 'folio-1r.png',
    mimeType: 'image/png',
    buffer: PAGE_PNG,
  })
  await expect(page.getByRole('img', { name: 'Preview of folio-1r.png' })).toBeVisible()

  const request = page.waitForRequest('**/api/predict')
  await page.getByRole('button', { name: 'Recognize page' }).click()
  expect((await request).method()).toBe('POST')

  const response = page.getByRole('region', { name: 'Model response' })
  await expect(response).toBeVisible()
  await expect(response.getByText('Machine output')).toBeVisible()
  await expect(response.locator('pre')).toContainText('"model_version"')
})

test('rejects a file that is not an image without calling the backend', async ({ page }) => {
  let called = false
  page.on('request', (req) => {
    if (req.url().includes('/api/predict')) called = true
  })
  await page.goto('/')

  await page.getByLabel('Page image').setInputFiles({
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not a page'),
  })

  // Filtered: Next.js's route announcer is also role="alert".
  await expect(page.getByRole('alert').filter({ hasText: 'notes.txt' })).toHaveText(
    'notes.txt is not a JPG, PNG or TIFF image.'
  )
  await expect(page.getByRole('button', { name: 'Recognize page' })).toBeDisabled()
  expect(called).toBe(false)
})
