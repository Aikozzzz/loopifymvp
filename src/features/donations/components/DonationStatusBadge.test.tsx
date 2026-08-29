import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DonationStatusBadge } from './DonationStatusBadge'

describe('DonationStatusBadge', () => {
  it.each([
    ['available', 'Available'],
    ['reserved', 'Reserved'],
    ['completed', 'Donated'],
    ['withdrawn', 'Withdrawn'],
  ] as const)('renders the %s status label', (status, label) => {
    render(<DonationStatusBadge status={status} />)

    expect(screen.getByText(label)).toBeInTheDocument()
  })
})
