import { expect, test } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

const PASSWORD = 'correct horse'

test('a new user signs up, signs out and signs back in', async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`

  await page.goto('/')
  await expect(page).toHaveURL('/sign-in')

  await page.getByRole('link', { name: 'Create an account' }).click()
  await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible()
  await page.getByLabel('First name').fill('Ada')
  await page.getByLabel('Last name').fill('Lovelace')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD)
  await page.getByRole('button', { name: 'Show password' }).click()
  await expect(page.getByLabel('Password', { exact: true })).toHaveValue(PASSWORD)
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByText('Signed in as Ada Lovelace')).toBeVisible()

  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL('/sign-in')
  await page.goto('/')
  await expect(page).toHaveURL('/sign-in')

  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill('wrong horse')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(
    page.getByRole('alert').filter({ hasText: 'Wrong email or password.' })
  ).toBeVisible()

  await page.getByLabel('Password', { exact: true }).fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByText('Signed in as Ada Lovelace')).toBeVisible()
})

test('an ended session sends you back to sign in', async ({ page, context }) => {
  await context.addCookies([
    { name: 'team4_session', value: 'ended', domain: 'localhost', path: '/' },
  ])

  await page.goto('/')

  await expect(page).toHaveURL('/sign-in')
  expect((await context.cookies()).map((c) => c.name)).not.toContain('team4_session')
})

test('signed-in users skip the sign-in page', async ({ page }) => {
  await page.goto('/sign-up')
  await page.getByLabel('Email').fill(`e2e-${Date.now()}@example.com`)
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL('/')

  await page.goto('/sign-in')
  await expect(page).toHaveURL('/')
})
