import type { Page } from '@playwright/test'

export const e2eCredentials = {
  donorEmail: process.env.E2E_DONOR_EMAIL,
  donorPassword: process.env.E2E_DONOR_PASSWORD,
  recipientEmail: process.env.E2E_RECIPIENT_EMAIL,
  recipientPassword: process.env.E2E_RECIPIENT_PASSWORD,
}

export const hasE2eCredentials = Object.values(e2eCredentials).every(Boolean)

export async function mockEmptySupabaseRest(page: Page): Promise<void> {
  await page.route('**/rest/v1/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'content-range': '0-0/0' },
      body: '[]',
    })
  })
}

export async function signIn(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/login')
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/feed')
}
