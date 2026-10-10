import { expect, test as setup } from '@playwright/test'

setup('sign up', async ({ page }) => {
  await page.goto('/sign-up')
  await page.getByLabel('Email').fill(`e2e-${Date.now()}@example.com`)
  await page.getByLabel('Password', { exact: true }).fill('correct horse')
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL('/')
  await page.context().storageState({ path: 'e2e/.auth/user.json' })
})
