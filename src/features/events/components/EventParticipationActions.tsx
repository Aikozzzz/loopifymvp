import { UserMinus, UserPlus, Users } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { AuthRequiredError } from '@/lib/auth'
import { joinEvent, leaveEvent } from '../services'

interface EventParticipationActionsProps {
  eventId: string
  status: 'upcoming' | 'completed' | 'cancelled'
  startsAt: string
  participantCount: number
  isJoined: boolean
}

export function EventParticipationActions({
  eventId,
  status,
  startsAt,
  participantCount,
  isJoined,
}: EventParticipationActionsProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  const canParticipate = status === 'upcoming' && new Date(startsAt).getTime() > now
  const participationMutation = useMutation({
    mutationFn: () => (isJoined ? leaveEvent(eventId) : joinEvent(eventId)),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['event', eventId] }),
        queryClient.invalidateQueries({ queryKey: ['events'] }),
      ])
      toast.success(isJoined ? 'You left the event.' : 'You’re on the list for this event.')
    },
    onError: (error: Error) => {
      if (error instanceof AuthRequiredError) {
        navigate('/login', { state: { from: `/events/${eventId}` } })
        return
      }

      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['event', eventId] }),
        queryClient.invalidateQueries({ queryKey: ['events'] }),
      ])
      toast.error(error.message || 'We could not update your participation.')
    },
  })

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted">
        <Users className="size-4 text-primary" aria-hidden="true" />
        {participantCount} {participantCount === 1 ? 'person' : 'people'} joining
      </div>
      {canParticipate ? (
        <Button
          className="sm:ml-auto"
          loading={participationMutation.isPending}
          variant={isJoined ? 'outline' : 'secondary'}
          onClick={() => participationMutation.mutate()}
        >
          {isJoined ? (
            <>
              <UserMinus className="size-4" aria-hidden="true" />
              Leave event
            </>
          ) : (
            <>
              <UserPlus className="size-4" aria-hidden="true" />
              Join event
            </>
          )}
        </Button>
      ) : status === 'upcoming' ? (
        <span className="text-sm font-semibold text-muted sm:ml-auto">
          This event has started.
        </span>
      ) : status === 'completed' ? (
        <span className="text-sm font-semibold text-muted sm:ml-auto">This event is complete.</span>
      ) : (
        <span className="text-sm font-semibold text-muted sm:ml-auto">This event was cancelled.</span>
      )}
    </div>
  )
}
