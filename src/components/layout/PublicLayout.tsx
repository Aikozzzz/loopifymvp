import { ArrowUpRight, CalendarDays, Compass, HeartHandshake, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { LoopifyLogo } from '@/components/common/LoopifyLogo'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { useAuth } from '@/features/auth/useAuth'
import { cn } from '@/lib/utils'

const publicLinks = [
  { to: '/feed', label: 'Explore donations', icon: Compass },
  { to: '/events', label: 'Community events', icon: CalendarDays },
]

export function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/" aria-label="Loopify home">
            <LoopifyLogo />
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
            {publicLinks.map(({ to, label }) => (
              <NavLink
                className={({ isActive }) =>
                  cn('text-sm font-semibold transition hover:text-ink', isActive ? 'text-ink' : 'text-muted')
                }
                key={to}
                to={to}
              >
                {label}
              </NavLink>
            ))}
            <a className="text-sm font-semibold text-muted transition hover:text-ink" href="/#how-it-works">
              How it works
            </a>
          </nav>

          <div className="hidden items-center gap-2.5 md:flex">
            <Link className={buttonStyles({ variant: 'ghost', size: 'sm' })} to={isAuthenticated ? '/feed' : '/login'}>
              {isAuthenticated ? 'Your workspace' : 'Log in'}
            </Link>
            <Link className={buttonStyles({ variant: 'secondary', size: 'sm' })} to="/donate">
              <HeartHandshake className="size-4" aria-hidden="true" />
              Give an item
            </Link>
          </div>

          <button
            className="flex size-10 items-center justify-center rounded-full text-ink transition hover:bg-sage md:hidden"
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-public-navigation"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>

        {isMenuOpen ? (
          <div className="border-t border-line bg-canvas px-5 py-4 md:hidden" id="mobile-public-navigation">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1" aria-label="Mobile navigation">
              {publicLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold',
                      isActive ? 'bg-primary-soft text-ink' : 'text-muted hover:bg-sage hover:text-ink',
                    )
                  }
                  key={to}
                  to={to}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
              <a
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-muted hover:bg-sage hover:text-ink"
                href="/#how-it-works"
                onClick={() => setIsMenuOpen(false)}
              >
                <ArrowUpRight className="size-4" aria-hidden="true" />
                How it works
              </a>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-4">
                <Link className={buttonStyles({ variant: 'outline', size: 'sm', className: 'w-full' })} to={isAuthenticated ? '/feed' : '/login'}>
                  {isAuthenticated ? 'Workspace' : 'Log in'}
                </Link>
                <Link className={buttonStyles({ variant: 'secondary', size: 'sm', className: 'w-full' })} to="/donate">
                  Give an item
                </Link>
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-line bg-paper">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="max-w-xs">
              <Link to="/" aria-label="Loopify home">
                <LoopifyLogo />
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Useful things, local causes, and neighbors looking out for one another.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-muted">
              <Link className="hover:text-ink" to="/feed">Explore</Link>
              <Link className="hover:text-ink" to="/events">Events</Link>
              <Link className="hover:text-ink" to="/profile">Profile</Link>
              <a className="hover:text-ink" href="/#safety">Safety</a>
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-line pt-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Loopify. Built for everyday generosity.</p>
            <p>Start small. Keep it local.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
