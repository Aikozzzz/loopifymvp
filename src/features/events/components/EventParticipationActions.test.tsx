import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { EventParticipationActions } from './EventParticipationActions'

const joinEvent = vi.hoisted(() => vi.fn())
const leaveEvent = vi.hoisted(() => vi.fn())

vi.mock('../services', () => ({
  joinEvent,
  leaveEvent,
}))
vi.mock('@/lib/auth', () => ({
  AuthRequiredError: class AuthRequiredError extends Error {},
}))

function renderActions(
  overrides: Partial<ComponentProps<typeof EventParticipationActions>> = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <EventParticipationActions
          eventId="event-1"
          status="upcoming"
          startsAt={new Date(Date.now() + 60 * 60 * 1000).toISOString()}
          participantCount={2}
          isJoined={false}
          {...overrides}
        />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('EventParticipationActions', () => {
  it('lets a signed-in participant join an upcoming event', async () => {
    joinEvent.mockResolvedValue(undefined)
    const user = userEvent.setup()

    renderActions()
    expect(screen.getByText('2 people joining')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Join event' }))

    expect(joinEvent).toHaveBeenCalledWith('event-1')
  })

  it('offers leaving when the current user is already participating', () => {
    renderActions({ isJoined: true })

    expect(screen.getByRole('button', { name: 'Leave event' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Join event' })).not.toBeInTheDocument()
  })

  it('removes participation controls after an event has completed', () => {
    renderActions({
      status: 'completed',
      startsAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    })

    expect(screen.getByText('This event is complete.')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
