import {
  CalendarDays,
  ChevronRight,
  Gift,
  HeartHandshake,
  Inbox,
  LogOut,
  Menu,
  UserRound,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LoopifyLogo } from '@/components/common/LoopifyLogo'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { useAuth } from '@/features/auth/useAuth'
import { cn } from '@/lib/utils'

const appLinks = [
  { to: '/feed', label: 'Explore donations', icon: HeartHandshake, end: false },
  { to: '/my-donations', label: 'My donations', icon: Gift, end: true },
  { to: '/my-requests', label: 'My requests', icon: Inbox, end: true },
  { to: '/events', label: 'Community events', icon: CalendarDays, end: false },
  { to: '/profile', label: 'Profile', icon: UserRound, end: true },
]

function AppNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()
  const { profile, signOut, user } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const displayName = profile?.display_name ?? user?.user_metadata.display_name ?? 'Community member'
  const initials = displayName.trim().slice(0, 1).toUpperCase() || '?'

  const handleSignOut = async () => {
    setIsSigningOut(true)

    try {
      await signOut()
      toast.success('You are signed out of Loopify.')
      onNavigate?.()
      navigate('/', { replace: true })
    } catch {
      toast.error('We could not sign you out. Please try again.')
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <>
      <div className="px-5 pb-8 pt-6">
        <Link to="/" aria-label="Loopify home" onClick={onNavigate}>
          <LoopifyLogo />
        </Link>
      </div>
      <div className="px-3">
        <Link
          className={buttonStyles({ variant: 'secondary', size: 'md', className: 'w-full' })}
          to="/donate"
          onClick={onNavigate}
        >
          <HeartHandshake className="size-4" aria-hidden="true" />
          Donate an item
        </Link>
      </div>
      <nav className="mt-7 space-y-1 px-3" aria-label="App navigation">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Your loop</p>
        {appLinks.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                isActive ? 'bg-primary-soft text-ink' : 'text-muted hover:bg-sage hover:text-ink',
              )
            }
            end={end}
            key={to}
            to={to}
            onClick={onNavigate}
          >
            <Icon className="size-[18px]" aria-hidden="true" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="size-3.5 opacity-0 transition group-hover:opacity-60" aria-hidden="true" />
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto space-y-3 p-4">
        <div className="rounded-2xl border border-line bg-paper p-3">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-lime text-sm font-extrabold text-ink">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{displayName}</p>
              <p className="truncate text-xs text-muted">{user?.email ?? 'Loopify member'}</p>
            </div>
          </div>
          <button
            className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-full px-3 text-xs font-bold text-muted transition hover:bg-sage hover:text-ink disabled:pointer-events-none disabled:opacity-50"
            type="button"
            onClick={() => void handleSignOut()}
            disabled={isSigningOut}
          >
            <LogOut className="size-3.5" aria-hidden="true" />
            {isSigningOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
        <div className="rounded-2xl bg-sage p-4">
          <p className="text-sm font-bold text-ink">Small acts add up.</p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            Every item and event helps make a more resourceful neighborhood.
          </p>
          <Link className="mt-3 inline-flex text-xs font-bold text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink" to="/#how-it-works" onClick={onNavigate}>
            Learn how it works
          </Link>
        </div>
      </div>
    </>
  )
}

export function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const currentPage = appLinks.find(({ to }) => location.pathname.startsWith(to))?.label ?? 'Workspace'

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-paper lg:flex">
        <AppNavigation />
      </aside>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 cursor-default bg-ink/35 backdrop-blur-sm"
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setIsMenuOpen(false)}
          />
          <aside className="relative flex h-full w-[min(19rem,88vw)] flex-col border-r border-line bg-paper shadow-2xl" id="app-navigation-drawer">
            <div className="absolute right-4 top-4">
              <button
                className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-sage hover:text-ink"
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <AppNavigation onNavigate={() => setIsMenuOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line/80 bg-canvas/90 px-5 backdrop-blur-xl sm:px-8 lg:hidden">
          <button
            className="flex size-10 items-center justify-center rounded-full text-ink hover:bg-sage"
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="app-navigation-drawer"
            aria-label="Open navigation menu"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <Link to="/" aria-label="Loopify home">
            <LoopifyLogo compact />
          </Link>
          <Link className="flex size-10 items-center justify-center rounded-full bg-lime text-ink" to="/donate" aria-label="Donate an item">
            <HeartHandshake className="size-4" aria-hidden="true" />
          </Link>
        </header>

        <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="mb-8 flex items-center gap-2 text-xs font-semibold text-muted">
            <span>Workspace</span>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <span className="text-ink">{currentPage}</span>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
