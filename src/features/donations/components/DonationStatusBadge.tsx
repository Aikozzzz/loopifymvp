import { Badge } from '@/components/ui/Badge'
import {
  DONATION_STATUS_LABELS,
  DONATION_STATUS_TONES,
} from '@/features/donations/constants'
import type { ItemStatus } from '@/types/database'

interface DonationStatusBadgeProps {
  status: ItemStatus
  dot?: boolean
}

export function DonationStatusBadge({ status, dot = true }: DonationStatusBadgeProps) {
  return (
    <Badge tone={DONATION_STATUS_TONES[status]} dot={dot}>
      {DONATION_STATUS_LABELS[status]}
    </Badge>
  )
}
