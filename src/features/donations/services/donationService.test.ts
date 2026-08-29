import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DonationServiceError, listDonations } from './donationService'

const supabase = vi.hoisted(() => ({
  from: vi.fn(),
  storage: {
    from: vi.fn(),
  },
}))

const requireCurrentUser = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase', () => ({ supabase }))
vi.mock('@/lib/auth', () => ({ requireCurrentUser }))

function createQueryBuilder() {
  const builder = {
    select: vi.fn(),
    neq: vi.fn(),
    order: vi.fn(),
    eq: vi.fn(),
    ilike: vi.fn(),
    or: vi.fn(),
    range: vi.fn(),
  }

  builder.select.mockReturnValue(builder)
  builder.neq.mockReturnValue(builder)
  builder.order.mockReturnValue(builder)
  builder.eq.mockReturnValue(builder)
  builder.ilike.mockReturnValue(builder)
  builder.or.mockReturnValue(builder)

  return builder
}

const donationRow = {
  id: 'item-1',
  donor_id: 'donor-1',
  title: 'Desk lamp',
  description: 'A working lamp ready for a new home.',
  category: 'books',
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
}

describe('donation service filters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.storage.from.mockReturnValue({
      getPublicUrl: vi.fn().mockReturnValue({
        data: { publicUrl: 'https://cdn.example.com/lamp.png' },
      }),
    })
  })

  it('applies safe filters, pagination, and maps public image URLs', async () => {
    const query = createQueryBuilder()
    query.range.mockResolvedValue({
      data: [donationRow],
      error: null,
      count: 1,
    })
    supabase.from.mockReturnValue(query)

    const result = await listDonations({
      search: ' desk_%',
      category: 'books',
      township: ' Bahan, ',
      status: 'available',
      page: 2,
      pageSize: 12,
    })

    expect(query.eq).toHaveBeenCalledWith('category', 'books')
    expect(query.eq).toHaveBeenCalledWith('status', 'available')
    expect(query.ilike).toHaveBeenCalledWith('township', '%Bahan%')
    expect(query.or).toHaveBeenCalledWith(
      'title.ilike.%desk%,description.ilike.%desk%,township.ilike.%desk%',
    )
    expect(query.range).toHaveBeenCalledWith(12, 23)
    expect(result).toMatchObject({
      total: 1,
      page: 2,
      pageSize: 12,
      totalPages: 1,
      items: [{ title: 'Desk lamp', imageUrl: 'https://cdn.example.com/lamp.png' }],
    })
  })

  it('turns Supabase failures into a feature error', async () => {
    const query = createQueryBuilder()
    query.range.mockResolvedValue({
      data: null,
      error: { message: 'network unavailable' },
      count: null,
    })
    supabase.from.mockReturnValue(query)

    await expect(listDonations()).rejects.toEqual(
      new DonationServiceError('network unavailable'),
    )
  })
})
