import { Bell, CheckCircle2, Mail, MapPin, UserRound } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Field, Input } from '@/components/ui/Input'
import { profileSchema, type ProfileFormValues } from '@/features/profiles/profileSchemas'
import { useAuth } from '@/features/auth/useAuth'

export function ProfilePage() {
  const { profile, updateProfile, user } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile?.display_name ?? user?.user_metadata.display_name ?? '',
      township: profile?.township ?? '',
    },
  })
  const name = useWatch({ control, name: 'displayName' })
  const township = useWatch({ control, name: 'township' })

  useEffect(() => {
    reset({
      displayName: profile?.display_name ?? user?.user_metadata.display_name ?? '',
      township: profile?.township ?? '',
    })
  }, [profile, reset, user?.user_metadata.display_name])

  const onSubmit = async (values: ProfileFormValues) => {
    setFormError(null)

    try {
      const savedProfile = await updateProfile({
        display_name: values.displayName.trim(),
        township: values.township.trim() || null,
      })

      reset({
        displayName: savedProfile.display_name,
        township: savedProfile.township ?? '',
      })
      toast.success('Your Loopify profile is up to date.')
    } catch {
      const message = 'We could not save your profile. Please try again.'
      setFormError(message)
      toast.error(message)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        eyebrow="Your details"
        title="Profile"
        description="Share just enough for neighbors to recognize you and coordinate safely."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_17rem]">
        <Card>
          <CardHeader className="border-b border-line">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-lavender text-[#705d91]">
                <UserRound className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-bold text-ink">Public profile</h2>
                <p className="mt-0.5 text-xs text-muted">These details help build a little context.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
              {formError ? (
                <p className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm leading-relaxed text-danger" role="alert">
                  {formError}
                </p>
              ) : null}
              <Field
                label="Display name"
                htmlFor="profile-name"
                hint="This is shown on your public donations and events."
                error={errors.displayName?.message}
                required
              >
                <Input
                  id="profile-name"
                  placeholder="How neighbors should know you"
                  aria-invalid={errors.displayName ? 'true' : 'false'}
                  aria-describedby={errors.displayName ? 'profile-name-error' : undefined}
                  {...register('displayName')}
                />
              </Field>
              <Field
                label="Township"
                htmlFor="profile-township"
                hint="A general area is enough. Keep your exact address private."
                error={errors.township?.message}
              >
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                  <Input
                    id="profile-township"
                    className="pl-10"
                    placeholder="Where you’re based"
                    aria-invalid={errors.township ? 'true' : 'false'}
                    aria-describedby={errors.township ? 'profile-township-error' : undefined}
                    {...register('township')}
                  />
                </div>
              </Field>
              <Field
                label="Account email"
                htmlFor="profile-email"
                hint="Your email is used for sign-in and is not shown on public listings."
              >
                <Input
                  id="profile-email"
                  type="email"
                  value={user?.email ?? ''}
                  icon={<Mail className="size-4" />}
                  readOnly
                  disabled
                />
              </Field>
              <div className="flex justify-end border-t border-line pt-6">
                <Button type="submit" loading={isSubmitting}>
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  Save profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card className="bg-sage">
            <CardContent className="pt-5">
              <div className="flex size-12 items-center justify-center rounded-full bg-lime text-xl font-extrabold text-ink">
                {name.trim().slice(0, 1).toUpperCase() || '?'}
              </div>
              <p className="mt-4 text-lg font-bold text-ink">{name.trim() || 'Your profile'}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-muted">
                <MapPin className="size-3.5" aria-hidden="true" />
                {township.trim() || 'Add your township'}
              </p>
              <Badge className="mt-4" tone="green">
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                Community member
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-3 pt-5">
              <Bell className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-ink">Your privacy matters</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  Loopify will never put your private contact details on a public listing.
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
