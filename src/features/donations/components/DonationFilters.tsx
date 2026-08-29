import { Search, SlidersHorizontal, X } from 'lucide-react'
import { DONATION_CATEGORIES, DONATION_CATEGORY_LABELS, PUBLIC_DONATION_STATUSES, DONATION_STATUS_LABELS } from '@/features/donations/constants'
import type { ItemCategory, ItemStatus } from '@/types/database'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { buttonStyles } from '@/components/ui/buttonStyles'

export type DonationFilterValues = {
  search: string
  category: ItemCategory | 'all'
  township: string
  status: ItemStatus | 'all'
}

interface DonationFiltersProps {
  value: DonationFilterValues
  onChange: (next: Partial<DonationFilterValues>) => void
  onReset: () => void
}

export function DonationFilters({ value, onChange, onReset }: DonationFiltersProps) {
  const activeFilterCount =
    Number(value.category !== 'all') +
    Number(value.status !== 'all') +
    Number(Boolean(value.township.trim()))

  return (
    <Card className="mt-8 p-3 sm:p-4">
      <form
        className="grid gap-3 lg:grid-cols-[1.35fr_0.85fr_0.8fr_0.85fr_auto]"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="sr-only" htmlFor="donation-search">
          Search donations
        </label>
        <Input
          id="donation-search"
          icon={<Search className="size-4" />}
          placeholder="Search by item or keyword"
          type="search"
          value={value.search}
          onChange={(event) => onChange({ search: event.target.value })}
        />
        <label className="sr-only" htmlFor="donation-category">
          Filter by category
        </label>
        <Select
          id="donation-category"
          value={value.category}
          onChange={(event) => onChange({ category: event.target.value as ItemCategory | 'all' })}
        >
          <option value="all">All categories</option>
          {DONATION_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {DONATION_CATEGORY_LABELS[category]}
            </option>
          ))}
        </Select>
        <label className="sr-only" htmlFor="donation-township">
          Filter by township
        </label>
        <Input
          id="donation-township"
          placeholder="Township"
          value={value.township}
          onChange={(event) => onChange({ township: event.target.value })}
        />
        <label className="sr-only" htmlFor="donation-status">
          Filter by status
        </label>
        <Select
          id="donation-status"
          value={value.status}
          onChange={(event) => onChange({ status: event.target.value as ItemStatus | 'all' })}
        >
          <option value="all">All statuses</option>
          {PUBLIC_DONATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {DONATION_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
        <button
          className={buttonStyles({ variant: 'outline', size: 'md' })}
          type="button"
          onClick={onReset}
          aria-label="Clear donation filters"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </form>
      {activeFilterCount || value.search ? (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
          <p className="text-xs font-semibold text-muted">
            {activeFilterCount + Number(Boolean(value.search))} filter
            {activeFilterCount + Number(Boolean(value.search)) === 1 ? '' : 's'} active
          </p>
          <button
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-ink"
            type="button"
            onClick={onReset}
          >
            Reset filters
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </Card>
  )
}
