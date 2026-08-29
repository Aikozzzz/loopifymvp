import { expect, test } from '@playwright/test'
import { mockEmptySupabaseRest } from './support'

test.describe('public Loopify smoke checks', () => {
  test.beforeEach(async ({ page }) => {
    await mockEmptySupabaseRest(page)
  })

  test('renders the landing page and primary journeys', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: /Good things go around/i }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: /Explore the community/i }),
    ).toHaveAttribute('href', '/feed')
    await expect(page.getByRole('link', { name: /Browse community events/i })).toHaveAttribute(
      'href',
      '/events',
    )
  })

  test('supports public donation filters and refresh-safe routes', async ({ page }) => {
    await page.goto('/feed')
    await expect(
      page.getByRole('heading', { name: 'Find something useful nearby.' }),
    ).toBeVisible()

    await page.getByLabel('Filter by category').selectOption('books')
    await expect(page).toHaveURL(/category=books/)
    await page.getByLabel('Filter by status').selectOption('available')
    await expect(page).toHaveURL(/status=available/)

    await page.reload()
    await expect(
      page.getByRole('heading', { name: 'Find something useful nearby.' }),
    ).toBeVisible()
  })

  test('keeps public pages usable at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 })
    await page.goto('/')

    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(documentWidth).toBeLessThanOrEqual(320)

    await page.getByRole('button', { name: 'Open navigation menu' }).click()
    await expect(
      page.getByRole('navigation', { name: 'Mobile navigation' }),
    ).toBeVisible()
  })

  test('associates feed controls with accessible labels', async ({ page }) => {
    await page.goto('/feed')

    const unlabeledControls = await page.locator('input, select, textarea').evaluateAll((elements) =>
      elements
        .filter((element) => {
          const hasExplicitLabel = Array.from(document.querySelectorAll('label')).some(
            (label) => label.htmlFor === element.id,
          )
          return !hasExplicitLabel && !element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')
        })
        .map((element) => element.outerHTML),
    )

    expect(unlabeledControls).toEqual([])
  })

  test('serves the events route after a direct navigation and refresh', async ({ page }) => {
    await page.goto('/events')
    await expect(
      page.getByRole('heading', { name: 'Community events with room for you.' }),
    ).toBeVisible()

    await page.reload()
    await expect(
      page.getByRole('heading', { name: 'Community events with room for you.' }),
    ).toBeVisible()
  })
})
