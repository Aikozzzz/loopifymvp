import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  HeartHandshake,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import deskLampImage from '../../desk_lamp.jpg'
import storybooksImage from '../../storybooks.jpg'
import { Badge } from '@/components/ui/Badge'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { Card } from '@/components/ui/Card'
import { DonationCard } from '@/features/donations/components/DonationCard'
import { DonationSkeleton } from '@/features/donations/components/DonationSkeleton'
import { useDonationFeed } from '@/features/donations/hooks/useDonations'

const steps = [
  {
    number: '01',
    title: 'Share what you can',
    description: 'Post a useful item or a local event with the details neighbors need to say yes.',
    icon: HeartHandshake,
    tone: 'bg-peach',
  },
  {
    number: '02',
    title: 'Find a good fit',
    description: 'People nearby browse by category and area, then send a thoughtful request.',
    icon: Users,
    tone: 'bg-sky',
  },
  {
    number: '03',
    title: 'Keep it moving',
    description: 'Arrange a safe handover or show up together. Every loop makes the next one easier.',
    icon: Sparkles,
    tone: 'bg-lavender',
  },
]

export function LandingPage() {
  const featuredQuery = useDonationFeed({ page: 1, pageSize: 3, status: 'available' })

  return (
    <div>
      <section className="overflow-hidden border-b border-line">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:gap-16 lg:px-10 lg:pb-28 lg:pt-24">
          <div className="animate-rise-in">
            <Badge tone="green" dot>
              Neighbors helping neighbors
            </Badge>
            <h1 className="mt-6 max-w-3xl text-[clamp(3.2rem,8vw,6.25rem)] font-extrabold leading-[0.92] tracking-[-0.075em] text-ink">
              Good things go <span className="text-[#4d8950]">around.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
              Loopify makes it simple to pass useful things forward and show up for the causes that matter close to home.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link className={buttonStyles({ variant: 'secondary', size: 'lg' })} to="/donate">
                <HeartHandshake className="size-5" aria-hidden="true" />
                Give an item
              </Link>
              <Link className={buttonStyles({ variant: 'outline', size: 'lg' })} to="/feed">
                Explore the community
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-semibold text-muted">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#4d8950]" aria-hidden="true" />
                Always free to give
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#4d8950]" aria-hidden="true" />
                Safety-first by design
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[34rem] animate-rise-in delay-200">
            <div className="absolute -left-8 top-8 size-24 rounded-full bg-lime/70 blur-2xl sm:-left-12" aria-hidden="true" />
            <div className="absolute -bottom-8 -right-3 size-36 rounded-full bg-peach/80 blur-3xl" aria-hidden="true" />
            <div className="relative rotate-1 rounded-panel border border-line bg-paper p-3 shadow-[0_24px_70px_rgba(23,59,48,0.11)] sm:p-4">
              <div className="flex items-center justify-between border-b border-line px-2 pb-4">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-lime" aria-hidden="true" />
                  <span className="text-sm font-bold text-ink">Today around you</span>
                </div>
                <span className="font-mono text-[10px] text-muted">LOOP / 001</span>
              </div>
              <div className="grid grid-cols-2 gap-3 p-2 pt-4">
                <div className="relative flex min-h-52 flex-col justify-between overflow-hidden rounded-2xl bg-ink">
                  <img
                    className="absolute inset-0 size-full object-cover"
                    src={deskLampImage}
                    alt="Desk lamp available for donation"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" aria-hidden="true" />
                  <div className="relative z-10 flex min-h-52 flex-col justify-between p-4">
                    <Badge className="w-fit bg-white/80 text-[#865841]" tone="peach">New share</Badge>
                    <div>
                      <p className="text-sm font-bold text-white">Desk lamp</p>
                      <p className="mt-1 text-xs text-white/75">Kamayut · 2 km away</p>
                    </div>
                  </div>
                </div>
                <div className="relative mt-8 flex min-h-52 flex-col justify-between overflow-hidden rounded-2xl bg-sky">
                  <img
                    className="absolute inset-0 size-full object-cover"
                    src={storybooksImage}
                    alt="Storybooks available for donation"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" aria-hidden="true" />
                  <div className="relative z-10 flex justify-end p-4 pb-0">
                    <span className="flex size-8 items-center justify-center rounded-full bg-white/60 text-[#39727a]">
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="relative z-10 p-4">
                    <p className="text-sm font-bold text-white">Storybooks</p>
                    <p className="mt-1 text-xs text-white/75">Bahan · 3 km away</p>
                  </div>
                </div>
                <div className="col-span-2 flex items-center justify-between rounded-2xl bg-primary p-4 text-white sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-white/10">
                      <Users className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Cleanup at Kandawgyi</p>
                      <p className="mt-0.5 text-xs text-white/65">Saturday · 18 neighbors going</p>
                    </div>
                  </div>
                  <ChevronRight className="size-5 text-white/65" aria-hidden="true" />
                </div>
              </div>
              <div className="flex items-center gap-2 px-2 pb-1 pt-3">
                <div className="flex -space-x-2">
                  {['AM', 'K', 'TH'].map((initials, index) => (
                    <span
                      className={`flex size-7 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-ink ${index === 0 ? 'bg-lime' : index === 1 ? 'bg-coral' : 'bg-sky'}`}
                      key={initials}
                    >
                      {initials}
                    </span>
                  ))}
                </div>
                <p className="text-xs font-semibold text-muted">People are making room for something new.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10" aria-label="Loopify impact">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-card bg-primary p-6 text-white sm:p-7">
            <p className="font-mono text-xs text-white/55">WHY LOOPIFY</p>
            <p className="mt-10 max-w-[13rem] text-2xl font-bold leading-tight tracking-[-0.03em]">
              Better than letting good things gather dust.
            </p>
          </div>
          <div className="rounded-card bg-lime p-6 text-ink sm:p-7">
            <p className="font-mono text-xs text-ink/55">01 / LIVE BOARD</p>
            <p className="mt-8 text-5xl font-extrabold tracking-[-0.07em] sm:text-6xl">
              {featuredQuery.data?.total.toLocaleString() ?? '—'}
            </p>
            <p className="mt-2 text-sm font-semibold text-ink/65">available donations to explore</p>
          </div>
          <div className="rounded-card bg-peach p-6 text-ink sm:p-7">
            <p className="font-mono text-xs text-ink/55">02 / ONE CLEAR ASK</p>
            <p className="mt-8 text-5xl font-extrabold tracking-[-0.07em] sm:text-6xl">01</p>
            <p className="mt-2 text-sm font-semibold text-ink/65">focused photo for each listing</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8 sm:pb-28 lg:px-10" aria-labelledby="featured-heading">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">A little closer to home</p>
            <h2 className="mt-3 max-w-xl text-3xl font-extrabold tracking-[-0.05em] text-ink sm:text-4xl" id="featured-heading">
              What’s finding its next chapter
            </h2>
          </div>
          <Link className="group inline-flex items-center gap-2 text-sm font-bold text-ink" to="/feed">
            See all donations
            <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </Link>
        </div>
        {featuredQuery.isPending ? (
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <DonationSkeleton key={index} />
            ))}
          </div>
        ) : featuredQuery.isError ? (
          <Card className="mt-9 flex flex-col items-center justify-center bg-peach px-6 py-12 text-center">
            <RefreshCw className="size-8 text-[#9b6649]" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-bold text-ink">The live board needs a refresh.</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
              We could not load the latest donations, but the rest of Loopify is ready when you are.
            </p>
            <button
              className={buttonStyles({ variant: 'outline', size: 'md', className: 'mt-6' })}
              type="button"
              onClick={() => void featuredQuery.refetch()}
            >
              Try again
            </button>
          </Card>
        ) : featuredQuery.data?.items.length ? (
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {featuredQuery.data.items.map((donation) => (
              <DonationCard donation={donation} key={donation.id} />
            ))}
          </div>
        ) : (
          <Card className="mt-9 flex flex-col items-center justify-center bg-sage px-6 py-12 text-center">
            <HeartHandshake className="size-8 text-primary" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-bold text-ink">Your neighborhood board starts here.</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
              Be the first to share something useful, or explore the board again as new loops begin.
            </p>
            <Link className={buttonStyles({ variant: 'secondary', size: 'md', className: 'mt-6' })} to="/donate">
              Give an item
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Card>
        )}
      </section>

      <section className="border-y border-line bg-paper" id="how-it-works" aria-labelledby="how-heading">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20 lg:px-10">
          <div>
            <Badge tone="yellow">Simple by design</Badge>
            <h2 className="mt-5 max-w-md text-3xl font-extrabold leading-tight tracking-[-0.05em] text-ink sm:text-5xl" id="how-heading">
              Make a difference without making it complicated.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
              No price tags, no noise. Just useful things and community moments moving between people who live near each other.
            </p>
          </div>
          <div className="grid gap-3">
            {steps.map(({ number, title, description, icon: Icon, tone }) => (
              <div className="group flex gap-4 rounded-card border border-line p-5 transition hover:border-ink/20 hover:bg-canvas sm:gap-6 sm:p-6" key={number}>
                <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${tone} text-ink`}>
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col justify-between gap-1 sm:flex-row">
                    <h3 className="text-base font-bold text-ink">{title}</h3>
                    <span className="font-mono text-xs text-muted">{number}</span>
                  </div>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">{description}</p>
                </div>
                <ArrowRight className="mt-1 hidden size-5 text-muted transition group-hover:translate-x-1 group-hover:text-ink sm:block" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10" aria-labelledby="events-heading">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <Badge tone="blue">Beyond the handover</Badge>
            <h2 className="mt-5 max-w-md text-3xl font-extrabold leading-tight tracking-[-0.05em] text-ink sm:text-5xl" id="events-heading">
              Some things are better when we do them together.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
              Join a cleanup, lend a hand at a food drive, or start a small moment of your own.
            </p>
            <Link className={buttonStyles({ variant: 'outline', size: 'md', className: 'mt-7' })} to="/events">
              Browse community events
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="overflow-hidden bg-sky">
              <div className="flex aspect-[1.2/1] flex-col justify-between p-5 sm:p-6">
                <div className="flex items-start justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-white/60 text-[#39727a]">
                    <CalendarDays className="size-6" aria-hidden="true" />
                  </span>
                  <Badge tone="blue">This Saturday</Badge>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink/60">Cleanup</p>
                  <h3 className="mt-2 text-xl font-bold tracking-[-0.03em] text-ink">Kandawgyi lake morning</h3>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-ink/60">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    Mingalar Taung Nyunt · 18 going
                  </p>
                </div>
              </div>
            </Card>
            <Card className="overflow-hidden bg-lavender">
              <div className="flex aspect-[1.2/1] flex-col justify-between p-5 sm:p-6">
                <div className="flex items-start justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-white/60 text-[#705d91]">
                    <Users className="size-6" aria-hidden="true" />
                  </span>
                  <Badge tone="neutral">Next week</Badge>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink/60">Food drive</p>
                  <h3 className="mt-2 text-xl font-bold tracking-[-0.03em] text-ink">Pantry restock circle</h3>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-ink/60">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    Hlaing Township · 9 going
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-primary text-white" id="safety" aria-labelledby="safety-heading">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20 lg:px-10">
          <div>
            <Badge className="bg-white/10 text-lime" tone="green">Trust is part of the product</Badge>
            <h2 className="mt-5 max-w-md text-3xl font-extrabold leading-tight tracking-[-0.05em] sm:text-5xl" id="safety-heading">
              Good loops need clear boundaries.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/65">
              We keep listings simple, pickup details private, and reminders visible so sharing feels considered from the start.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              'Only share a general area publicly',
              'Choose a safe, public handover spot',
              'Keep private contact details private',
              'Report anything that feels unsafe',
            ].map((item) => (
              <div className="flex items-start gap-3 rounded-card border border-white/10 bg-white/5 p-5" key={item}>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-lime text-primary">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
                <p className="text-sm font-semibold leading-relaxed text-white/85">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="relative overflow-hidden rounded-panel bg-lime px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="absolute -left-8 -top-12 size-40 rounded-full border-[24px] border-primary/5" aria-hidden="true" />
          <div className="absolute -bottom-16 -right-8 size-52 rounded-full border-[28px] border-primary/5" aria-hidden="true" />
          <div className="relative mx-auto max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/55">Your next small act</p>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.05em] text-ink sm:text-5xl">
              There’s probably something useful waiting at home.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-ink/65">
              Give it a new story, or find the thing that makes someone else’s day a little easier.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link className={buttonStyles({ variant: 'primary', size: 'lg' })} to="/donate">
                Start a loop
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link className={buttonStyles({ variant: 'outline', size: 'lg', className: 'bg-white/50' })} to="/feed">
                Find something nearby
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
