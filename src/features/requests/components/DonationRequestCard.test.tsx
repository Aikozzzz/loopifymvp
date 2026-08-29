import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { DonationRequestWithRelations } from '@/features/requests/types'
import { DonationRequestCard } from './DonationRequestCard'

const request: DonationRequestWithRelations = {
  id: 'request-1',
  item_id: 'item-1',
  requester_id: 'recipient-1',
  request_message: 'This would help me prepare for school.',
  status: 'accepted',
  donor_reply: 'Meet at the library entrance on Saturday.',
  created_at: '2026-08-29T06:00:00.000Z',
  updated_at: '2026-08-29T06:00:00.000Z',
  item: {
    id: 'item-1',
    donor_id: 'donor-1',
    title: 'Study lamp',
    description: 'A working lamp for a new home.',
    category: 'household',
    condition: 'good',
    status: 'reserved',
    township: 'Bahan',
    image_path: 'donor-1/lamp.png',
    food_expiration_date: null,
    pickup_deadline: null,
    created_at: '2026-08-28T06:00:00.000Z',
    updated_at: '2026-08-29T06:00:00.000Z',
    donor: {
      id: 'donor-1',
      display_name: 'Aye Aye',
      township: 'Bahan',
      avatar_url: null,
    },
    imageUrl: 'https://example.com/lamp.png',
  },
  requester: {
    id: 'recipient-1',
    display_name: 'Ko Ko',
    township: 'Kamayut',
    avatar_url: null,
  },
}

describe('DonationRequestCard permissions', () => {
  it('shows private pickup details to the recipient after acceptance', () => {
    render(<DonationRequestCard request={request} perspective="recipient" />)

    expect(screen.getByText('Private pickup note')).toBeInTheDocument()
    expect(
      screen.getByText('Meet at the library entrance on Saturday.'),
    ).toBeInTheDocument()
  })

  it('does not expose pickup details to a donor while a request is pending', () => {
    render(
      <DonationRequestCard
        request={{ ...request, status: 'pending', donor_reply: null }}
        perspective="donor"
      />,
    )

    expect(screen.queryByText('Private pickup note')).not.toBeInTheDocument()
    expect(
      screen.getByText(/Pickup details stay private and can be added/),
    ).toBeInTheDocument()
  })
})
