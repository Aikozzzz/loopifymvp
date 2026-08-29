import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import type { RequestStatus } from '@/types/database'

const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Pending review',
  accepted: 'Accepted',
  declined: 'Declined',
  cancelled: 'Cancelled',
  fulfilled: 'Completed',
}

const REQUEST_STATUS_TONES: Record<RequestStatus, BadgeTone> = {
  pending: 'yellow',
  accepted: 'green',
  declined: 'danger',
  cancelled: 'neutral',
  fulfilled: 'blue',
}

interface RequestStatusBadgeProps {
  status: RequestStatus
  dot?: boolean
}

export function RequestStatusBadge({ status, dot = true }: RequestStatusBadgeProps) {
  return (
    <Badge tone={REQUEST_STATUS_TONES[status]} dot={dot}>
      {REQUEST_STATUS_LABELS[status]}
    </Badge>
  )
}
