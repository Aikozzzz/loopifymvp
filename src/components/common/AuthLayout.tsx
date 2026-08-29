import { ArrowRight, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LoopifyLogo } from '@/components/common/LoopifyLogo'

interface AuthLayoutProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

export function AuthLayout({ eyebrow, title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-4.5rem)] w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-10 lg:py-16">
      <div className="relative hidden overflow-hidden rounded-panel bg-primary p-8 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-14 -top-10 size-48 rounded-full border-[24px] border-white/5" aria-hidden="true" />
        <div className="absolute -bottom-14 -left-10 size-44 rounded-full border-[22px] border-lime/10" aria-hidden="true" />
        <div className="relative">
          <Link to="/" aria-label="Loopify home">
            <LoopifyLogo inverse />
          </Link>
          <div className="mt-24 max-w-sm">
            <Sparkles className="size-7 text-lime" aria-hidden="true" />
            <p className="mt-5 text-3xl font-extrabold leading-tight tracking-[-0.05em]">
              Leave a little room for good things to happen.
            </p>
          </div>
        </div>
        <div className="relative flex items-center gap-3 text-sm font-semibold text-white/65">
          <ShieldCheck className="size-5 text-lime" aria-hidden="true" />
          Built around privacy, safety, and real neighborhoods.
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col justify-center">
        <Link className="mb-12 lg:hidden" to="/" aria-label="Loopify home">
          <LoopifyLogo />
        </Link>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-ink sm:text-4xl">{title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">{description}</p>
        </div>
        <div className="mt-8">{children}</div>
        <div className="mt-7 text-center text-sm text-muted">{footer}</div>
        <Link className="mx-auto mt-8 inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-ink" to="/">
          <HeartHandshake className="size-3.5" aria-hidden="true" />
          Back to Loopify
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
