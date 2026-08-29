import { CheckCircle2, HeartHandshake } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Field } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import {
  donationRequestSchema,
  type DonationRequestValues,
} from '@/features/requests/schemas'

interface RequestDonationFormProps {
  donationTitle: string
  onSubmit: (values: DonationRequestValues) => Promise<void>
  onCancel: () => void
}

export function RequestDonationForm({
  donationTitle,
  onSubmit,
  onCancel,
}: RequestDonationFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DonationRequestValues>({
    resolver: zodResolver(donationRequestSchema),
    defaultValues: {
      requestMessage: '',
    },
  })
  const requestMessage = useWatch({ control, name: 'requestMessage', defaultValue: '' })

  return (
    <Card className="border-0 bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <HeartHandshake className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-bold text-ink">Request {donationTitle}</h3>
            <p className="mt-0.5 text-xs text-muted">
              The donor will see this message with your request.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <form
          className="space-y-5"
          noValidate
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values)
          })}
        >
          <Field
            label="Why would this item help?"
            htmlFor="request-message"
            hint="Keep it kind and practical. Avoid sharing sensitive personal details."
            error={errors.requestMessage?.message}
            required
          >
            <Textarea
              id="request-message"
              maxLength={500}
              placeholder="Tell the donor a little about how you would use it…"
              {...register('requestMessage')}
              aria-invalid={Boolean(errors.requestMessage)}
            />
            <p className="text-right text-xs text-muted">
              {requestMessage.length}/500
            </p>
          </Field>

          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <Button variant="ghost" type="button" onClick={onCancel}>
              Keep browsing
            </Button>
            <Button loading={isSubmitting} type="submit">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Send request
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
