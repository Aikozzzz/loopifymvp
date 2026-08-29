import { ArrowLeft, ArrowRight, HeartHandshake, SearchX } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { DonationCard } from '@/features/donations/components/DonationCard'
import { DonationErrorState } from '@/features/donations/components/DonationErrorState'
import { DonationFilters, type DonationFilterValues } from '@/features/donations/components/DonationFilters'
import { DonationSkeleton } from '@/features/donations/components/DonationSkeleton'
import { DONATION_CATEGORIES, DONATION_PAGE_SIZE, PUBLIC_DONATION_STATUSES } from '@/features/donations/constants'
import { useDonationFeed } from '@/features/donations/hooks/useDonations'
import type { ItemCategory, ItemStatus } from '@/types/database'

function isCategory(value: string | null): value is ItemCategory {
  return Boolean(value && DONATION_CATEGORIES.includes(value as ItemCategory))
}

function isStatus(value: string | null): value is ItemStatus {
  return Boolean(value && PUBLIC_DONATION_STATUSES.includes(value as (typeof PUBLIC_DONATION_STATUSES)[number]))
}

export function FeedPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo<DonationFilterValues>(
    () => ({
      search: searchParams.get('search') ?? '',
      category: isCategory(searchParams.get('category')) ? (searchParams.get('category') as ItemCategory) : 'all',
      township: searchParams.get('township') ?? '',
      status: isStatus(searchParams.get('status')) ? (searchParams.get('status') as ItemStatus) : 'all',
    }),
    [searchParams],
  )
  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1)
  const donationQuery = useDonationFeed({ ...filters, page, pageSize: DONATION_PAGE_SIZE })
  const total = donationQuery.data?.total ?? 0
  const totalPages = donationQuery.data?.totalPages ?? 1
  const hasFilters = Boolean(filters.search || filters.category !== 'all' || filters.township || filters.status !== 'all')

  function updateFilters(next: Partial<DonationFilterValues>) {
    const nextParams = new URLSearchParams(searchParams)
    const nextFilters = { ...filters, ...next }

    if (nextFilters.search.trim()) {
      nextParams.set('search', nextFilters.search.trim())
    } else {
      nextParams.delete('search')
    }
    if (nextFilters.category !== 'all') {
      nextParams.set('category', nextFilters.category)
    } else {
      nextParams.delete('category')
    }
    if (nextFilters.township.trim()) {
      nextParams.set('township', nextFilters.township.trim())
    } else {
      nextParams.delete('township')
    }
    if (nextFilters.status !== 'all') {
      nextParams.set('status', nextFilters.status)
    } else {
      nextParams.delete('status')
    }
    nextParams.delete('page')
    setSearchParams(nextParams)
  }

  function changePage(nextPage: number) {
    const nextParams = new URLSearchParams(searchParams)
    if (nextPage > 1) {
      nextParams.set('page', String(nextPage))
    } else {
      nextParams.delete('page')
    }
    setSearchParams(nextParams)
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
      <PageHeader
        eyebrow="The community board"
        title="Find something useful nearby."
        description="Browse items neighbors are ready to pass forward. No price tags, just good things looking for their next home."
        action={
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink" to="/">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back home
          </Link>
        }
      />

      <DonationFilters value={filters} onChange={updateFilters} onReset={() => setSearchParams({})} />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge tone="green" dot>
            Community donations
          </Badge>
          <span className="text-sm text-muted">
            {total} {total === 1 ? 'item' : 'items'} on the board
          </span>
        </div>
        {donationQuery.isFetching && !donationQuery.isPending ? (
          <span className="text-xs font-semibold text-muted" role="status">
            Updating…
          </span>
        ) : null}
      </div>

      {donationQuery.isPending ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <DonationSkeleton key={index} />
          ))}
        </div>
      ) : donationQuery.isError ? (
        <DonationErrorState onRetry={() => void donationQuery.refetch()} />
      ) : donationQuery.data.items.length === 0 ? (
        <EmptyState
          className="mt-5"
          title={hasFilters ? 'No donations match these filters.' : 'The first loop starts with you.'}
          description={
            hasFilters
              ? 'Try a different keyword, township, category, or status. You can also clear the filters and explore the full board.'
              : 'There are no live donations yet. Share something useful and help your neighborhood’s board come alive.'
          }
          icon={<SearchX className="size-6" aria-hidden="true" />}
          actionLabel={hasFilters ? 'Clear filters' : 'Donate an item'}
          onAction={() => (hasFilters ? setSearchParams({}) : navigate('/donate'))}
        />
      ) : (
        <>
          <div className={`mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${donationQuery.isFetching ? 'opacity-60' : ''}`}>
            {donationQuery.data.items.map((donation) => (
              <DonationCard donation={donation} key={donation.id} />
            ))}
          </div>
          {totalPages > 1 ? (
            <nav className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-5" aria-label="Donation pages">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => changePage(page - 1)}>
                <ArrowLeft className="size-4" aria-hidden="true" />
                Previous
              </Button>
              <p className="text-xs font-semibold text-muted">
                Page {page} of {totalPages}
              </p>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => changePage(page + 1)}>
                Next
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </nav>
          ) : null}
        </>
      )}

      <div className="mt-10 flex items-start gap-3 rounded-card border border-line bg-paper p-4 text-sm text-muted">
        <HeartHandshake className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <p>Only a general township is shown here. Pickup details and direct contact information stay private until a request is accepted.</p>
      </div>
    </div>
  )
}
