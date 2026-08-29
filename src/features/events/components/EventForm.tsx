import { CalendarDays, CheckCircle2, MapPin } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Field, Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { eventTypeLabels, getMinimumDateTime } from '../formatters'
import { eventFormSchema, type EventFormValues } from '../schemas'
import { zodResolver } from '@hookform/resolvers/zod'

interface EventFormProps {
  initialValues: EventFormValues
  submitLabel: string
  isSubmitting?: boolean
  onSubmit: (values: EventFormValues) => void
}

export function EventForm({
  initialValues,
  submitLabel,
  isSubmitting = false,
  onSubmit,
}: EventFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    defaultValues: initialValues,
    resolver: zodResolver(eventFormSchema),
    mode: 'onBlur',
  })

  return (
    <Card>
      <CardHeader className="border-b border-line">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-sky text-[#39727a]">
            <CalendarDays className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-bold text-ink">Event details</h2>
            <p className="mt-0.5 text-xs text-muted">Clear invitations make good gatherings easier to join.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field
            label="Event name"
            htmlFor="event-title"
            hint="Give your invitation a clear, friendly name."
            error={errors.title?.message}
            required
          >
            <Input
              id="event-title"
              autoComplete="off"
              placeholder="e.g. Sunday morning cleanup"
              {...register('title')}
              aria-invalid={Boolean(errors.title)}
            />
          </Field>

          <Field
            label="What’s the plan?"
            htmlFor="event-description"
            error={errors.description?.message}
            required
          >
            <Textarea
              id="event-description"
              placeholder="Tell people what you’ll do together and what to bring."
              {...register('description')}
              aria-invalid={Boolean(errors.description)}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Event type" htmlFor="event-type" error={errors.eventType?.message} required>
              <Select id="event-type" {...register('eventType')} aria-invalid={Boolean(errors.eventType)}>
                {Object.entries(eventTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Township"
              htmlFor="event-township"
              error={errors.township?.message}
              required
            >
              <Input
                id="event-township"
                autoComplete="address-level2"
                placeholder="e.g. Bahan Township"
                {...register('township')}
                aria-invalid={Boolean(errors.township)}
              />
            </Field>
          </div>

          <Field
            label="Public meeting point"
            htmlFor="event-location"
            hint="Choose a recognizable public place. Never publish a private address."
            error={errors.locationName?.message}
            required
          >
            <Input
              id="event-location"
              placeholder="e.g. Kandawgyi Park south entrance"
              icon={<MapPin className="size-4" />}
              {...register('locationName')}
              aria-invalid={Boolean(errors.locationName)}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Starts"
              htmlFor="event-start"
              hint="Events must begin in the future."
              error={errors.startsAt?.message}
              required
            >
              <Input
                id="event-start"
                type="datetime-local"
                min={getMinimumDateTime()}
                {...register('startsAt')}
                aria-invalid={Boolean(errors.startsAt)}
              />
            </Field>
            <Field
              label="Ends (optional)"
              htmlFor="event-end"
              error={errors.endsAt?.message}
            >
              <Input
                id="event-end"
                type="datetime-local"
                {...register('endsAt')}
                aria-invalid={Boolean(errors.endsAt)}
              />
            </Field>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
            <Button loading={isSubmitting} type="submit">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
