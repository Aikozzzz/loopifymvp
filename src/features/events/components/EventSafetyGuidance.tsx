import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const safetyGuidelines = [
  'Choose a recognizable public meeting point.',
  'Share what people should bring and how long it may take.',
  'Keep private contact details out of the public event description.',
  'Do not organize activities involving weapons, illegal goods, or unsafe materials.',
]

export function EventSafetyGuidance() {
  return (
    <Card className="bg-primary text-white">
      <CardContent className="pt-5">
        <Badge className="bg-white/10 text-lime" tone="green">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Community safety
        </Badge>
        <h2 className="mt-5 text-lg font-bold">Keep the invitation safe.</h2>
        <ul className="mt-4 space-y-3">
          {safetyGuidelines.map((guideline) => (
            <li className="flex items-start gap-2.5 text-sm leading-relaxed text-white/70" key={guideline}>
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden="true" />
              {guideline}
            </li>
          ))}
        </ul>
        <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/55">
          If plans feel unsafe or break these rules, leave the event and use the report button so the community can review it.
        </p>
      </CardContent>
    </Card>
  )
}
