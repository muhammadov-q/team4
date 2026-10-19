import { expect, test } from '@playwright/test'

const PAGE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
)

test('keeps a read page in the history and opens it again', async ({ page }) => {
  const name = `folio-${Date.now()}.png`

  await page.goto('/dashboard')
  await page.getByLabel('Page image').setInputFiles({
    name,
    mimeType: 'image/png',
    buffer: PAGE_PNG,
  })
  await page.getByRole('button', { name: 'Recognize page' }).click()
  await expect(page.getByRole('region', { name: 'Model response' })).toBeVisible()

  await page
    .getByRole('navigation', { name: 'Dashboard navigation' })
    .getByRole('link', { name: 'History' })
    .click()
  await expect(page).toHaveURL('/dashboard/history')
  await expect(page.getByRole('link', { name: 'History' })).toHaveAttribute('aria-current', 'page')

  await page.getByRole('list', { name: 'Past results' }).getByRole('link', { name }).click()

  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Model response' })).toBeVisible()
  await expect(page.getByRole('img', { name: `Saved page ${name}` })).toBeVisible()
})
