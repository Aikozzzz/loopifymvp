import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DonationFilters, type DonationFilterValues } from './DonationFilters'

const defaultFilters: DonationFilterValues = {
  search: '',
  category: 'all',
  township: '',
  status: 'all',
}

describe('DonationFilters', () => {
  it('labels controls and reports filter changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onReset = vi.fn()

    render(
      <DonationFilters
        value={defaultFilters}
        onChange={onChange}
        onReset={onReset}
      />,
    )

    await user.type(screen.getByRole('searchbox', { name: 'Search donations' }), 'books')
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by category' }),
      'books',
    )

    expect(onChange).toHaveBeenCalledWith({ search: 'b' })
    expect(onChange).toHaveBeenLastCalledWith({ category: 'books' })
  })

  it('shows active filters and offers an accessible reset action', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()

    render(
      <DonationFilters
        value={{
          ...defaultFilters,
          search: 'lamp',
          township: 'Bahan',
          status: 'available',
        }}
        onChange={vi.fn()}
        onReset={onReset}
      />,
    )

    expect(screen.getByText('3 filters active')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear donation filters' }))
    expect(onReset).toHaveBeenCalledOnce()
  })
})
