import { zodResolver } from '@hookform/resolvers/zod'
import { Flag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Field } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { AuthRequiredError } from '@/lib/auth'
import { reportReasons, reportSchema, type ReportFormValues } from '../schemas'
import { submitEventReport } from '../services'

const reasonLabels: Record<ReportFormValues['reason'], string> = {
  prohibited_item: 'Prohibited or unsafe activity',
  unsafe_behavior: 'Unsafe behavior',
  harassment: 'Harassment or disrespect',
  spam: 'Spam or misleading information',
  other: 'Something else',
}

interface ReportDialogProps {
  eventId: string
}

export function ReportDialog({ eventId }: ReportDialogProps) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportFormValues>({
    defaultValues: {
      reason: 'other',
      details: '',
    },
    resolver: zodResolver(reportSchema),
  })
  const reportMutation = useMutation({
    mutationFn: (values: ReportFormValues) => submitEventReport(eventId, values),
    onSuccess: () => {
      toast.success('Thanks for helping keep Loopify safe.')
      setOpen(false)
      reset()
    },
    onError: (error: Error) => {
      if (error instanceof AuthRequiredError) {
        setOpen(false)
        navigate('/login', { state: { from: `/events/${eventId}` } })
        return
      }

      toast.error(error.message || 'We could not submit this report.')
    },
  })

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Flag className="size-4" aria-hidden="true" />
        Report event
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Report this event"
        description="Reports are private. Share enough detail for the Loopify team to understand what needs attention."
      >
        <form className="space-y-5" onSubmit={handleSubmit((values) => reportMutation.mutate(values))} noValidate>
          <div className="rounded-xl bg-sage px-4 py-3">
            <Badge tone="neutral">Private report</Badge>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Do not include your phone number, home address, or other private contact details.
            </p>
          </div>
          <Field label="What is the concern?" htmlFor="report-reason" error={errors.reason?.message} required>
            <Select id="report-reason" {...register('reason')} aria-invalid={Boolean(errors.reason)}>
              {reportReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reasonLabels[reason]}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Additional details"
            htmlFor="report-details"
            hint="Optional. Keep it factual and specific."
            error={errors.details?.message}
          >
            <Textarea
              id="report-details"
              placeholder="What happened?"
              {...register('details')}
              aria-invalid={Boolean(errors.details)}
            />
          </Field>
          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={reportMutation.isPending} type="submit">
              Submit private report
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
