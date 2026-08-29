import { expect, test } from '@playwright/test'
import {
  e2eCredentials,
  hasE2eCredentials,
  signIn,
} from './support'

function futureDateTime(hours: number): string {
  const date = new Date(Date.now() + hours * 60 * 60 * 1000)
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

const tinyPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)

test.describe('two-user donation and event lifecycle', () => {
  test.skip(
    !hasE2eCredentials,
    'Set E2E_DONOR_EMAIL, E2E_DONOR_PASSWORD, E2E_RECIPIENT_EMAIL, and E2E_RECIPIENT_PASSWORD to run against Supabase.',
  )

  test('completes a donation handover and event participation', async ({ browser }) => {
    const {
      donorEmail,
      donorPassword,
      recipientEmail,
      recipientPassword,
    } = e2eCredentials

    if (!donorEmail || !donorPassword || !recipientEmail || !recipientPassword) {
      test.skip(true, 'Credential values are incomplete.')
      return
    }

    const donorContext = await browser.newContext()
    const recipientContext = await browser.newContext()
    const donorPage = await donorContext.newPage()
    const recipientPage = await recipientContext.newPage()

    try {
      const uniqueId = Date.now()
      const donationTitle = `E2E donation ${uniqueId}`
      const requestMessage = 'This item would help my family study at home.'

      await signIn(donorPage, donorEmail, donorPassword)
      await donorPage.goto('/donate')
      await donorPage.getByLabel('What are you sharing?').fill(donationTitle)
      await donorPage.getByLabel('Category').selectOption('books')
      await donorPage.getByLabel('Condition').selectOption('good')
      await donorPage.getByLabel('General area').fill('Bahan')
      await donorPage.getByLabel('Tell the story').fill(
        'A clean, useful item ready for a neighbor who can use it.',
      )
      await donorPage.locator('input[type="file"]').setInputFiles({
        name: 'e2e-donation.png',
        mimeType: 'image/png',
        buffer: tinyPng,
      })
      await donorPage.getByRole('button', { name: 'Publish donation' }).click()
      await donorPage.waitForURL('**/donations/*')
      const donationUrl = donorPage.url()

      await signIn(recipientPage, recipientEmail, recipientPassword)
      await recipientPage.goto(donationUrl)
      await recipientPage.getByRole('button', { name: 'Request donation' }).click()
      await recipientPage.getByLabel('Why would this item help?').fill(requestMessage)
      await recipientPage.getByRole('button', { name: 'Send request' }).click()
      await expect(
        recipientPage.getByRole('link', { name: /View my request/ }),
      ).toBeVisible()

      await donorPage.goto('/my-donations')
      await expect(donorPage.getByText(requestMessage)).toBeVisible()
      await donorPage.getByRole('button', { name: 'Accept', exact: true }).click()
      await donorPage.getByLabel('Private pickup note').fill(
        'Meet at the public library entrance on Saturday morning.',
      )
      await donorPage.getByRole('dialog').getByRole('button', {
        name: 'Accept request',
      }).click()
      await expect(donorPage.getByText('Reserved', { exact: true }).first()).toBeVisible()

      await donorPage.getByRole('button', { name: 'Mark complete', exact: true }).click()
      await donorPage.getByRole('dialog').getByRole('button', {
        name: 'Mark complete',
      }).click()
      await expect(donorPage.getByText('Donated', { exact: true }).first()).toBeVisible()

      const eventTitle = `E2E neighborhood event ${uniqueId}`
      await donorPage.goto('/events/create')
      await donorPage.getByLabel('Event name').fill(eventTitle)
      await donorPage.getByLabel('What’s the plan?').fill(
        'We will clean the park entrance and sort the collected waste together.',
      )
      await donorPage.getByLabel('Event type').selectOption('cleanup')
      await donorPage.getByLabel('Township').fill('Bahan')
      await donorPage.getByLabel('Public meeting point').fill('Kandawgyi Park entrance')
      await donorPage.getByLabel('Starts').fill(futureDateTime(48))
      await donorPage.getByLabel('Ends (optional)').fill(futureDateTime(50))
      await donorPage.getByRole('button', { name: 'Publish event' }).click()
      await donorPage.waitForURL((url) =>
        url.pathname.startsWith('/events/') && url.pathname !== '/events/create',
      )
      const eventUrl = donorPage.url()

      await recipientPage.goto(eventUrl)
      await recipientPage.getByRole('button', { name: 'Join event' }).click()
      await expect(
        recipientPage.getByRole('button', { name: 'Leave event' }),
      ).toBeVisible()
    } finally {
      await recipientContext.close()
      await donorContext.close()
    }
  })
})
