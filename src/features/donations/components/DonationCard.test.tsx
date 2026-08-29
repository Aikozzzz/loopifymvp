import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { Donation } from '@/features/donations/types'
import { DonationCard } from './DonationCard'

const donation: Donation = {
  id: 'item-1',
  donor_id: 'donor-1',
  title: 'Desk lamp',
  description: 'A working lamp ready for a new home.',
  category: 'household',
  condition: 'good',
  status: 'available',
  township: 'Bahan',
  image_path: 'donor-1/lamp.png',
  food_expiration_date: null,
  pickup_deadline: null,
  created_at: '2026-08-29T06:00:00.000Z',
  updated_at: '2026-08-29T06:00:00.000Z',
  donor: {
    id: 'donor-1',
    display_name: 'Aye Aye',
    township: 'Bahan',
    avatar_url: null,
  },
  imageUrl: 'https://example.com/lamp.png',
}

describe('DonationCard resilience', () => {
  it('shows a useful fallback when the donation image fails', () => {
    const { container } = render(
      <MemoryRouter>
        <DonationCard donation={donation} />
      </MemoryRouter>,
    )

    const image = container.querySelector('img')
    expect(image).not.toBeNull()
    fireEvent.error(image as HTMLImageElement)

    expect(screen.getByText('Donation photo unavailable')).toBeInTheDocument()
  })
})
