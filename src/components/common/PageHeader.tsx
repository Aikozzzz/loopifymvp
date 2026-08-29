import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-line pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">{eyebrow}</p> : null}
        <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-ink sm:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}
