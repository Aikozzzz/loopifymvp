import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { donorReplySchema, type DonorReplyValues } from '@/features/requests/schemas'

interface AcceptRequestFormProps {
  requesterName: string
  onSubmit: (values: DonorReplyValues) => Promise<void>
  onCancel: () => void
}

export function AcceptRequestForm({
  requesterName,
  onSubmit,
  onCancel,
}: AcceptRequestFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DonorReplyValues>({
    resolver: zodResolver(donorReplySchema),
    defaultValues: {
      donorReply: '',
    },
  })
  const donorReply = useWatch({ control, name: 'donorReply', defaultValue: '' })

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values)
      })}
    >
      <div className="flex items-start gap-3 rounded-xl bg-primary-soft/60 px-3.5 py-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-muted">
          Accepting {requesterName} will reserve the donation and automatically decline other pending requests.
        </p>
      </div>
      <Field
        label="Private pickup note"
        htmlFor="donor-reply"
        hint="Only you and the accepted recipient can see this note. You can leave it blank and add details another way."
        error={errors.donorReply?.message}
      >
        <Textarea
          id="donor-reply"
          maxLength={500}
          placeholder="e.g. I can meet at the community library entrance on Saturday…"
          {...register('donorReply')}
          aria-invalid={Boolean(errors.donorReply)}
        />
        <p className="text-right text-xs text-muted">{donorReply.length}/500</p>
      </Field>
      <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Keep reviewing
        </Button>
        <Button loading={isSubmitting} type="submit">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          Accept request
        </Button>
      </div>
    </form>
  )
}
