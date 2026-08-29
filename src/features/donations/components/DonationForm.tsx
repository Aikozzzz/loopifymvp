import {
  AlertTriangle,
  CalendarClock,
  Camera,
  CheckCircle2,
  FileImage,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Field, Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import {
  DONATION_CATEGORIES,
  DONATION_CATEGORY_LABELS,
  DONATION_CONDITIONS,
  DONATION_CONDITION_LABELS,
} from '@/features/donations/constants'
import {
  analyzeDonationImage,
  discardAnalysisImage,
  DonationAssistantError,
} from '@/features/donations/aiAssistant/aiAssistantService'
import {
  DONATION_SAFETY_FLAG_LABELS,
  type DonationSuggestion,
} from '@/features/donations/aiAssistant/schemas'
import { donationFormSchema, type DonationFormValues } from '@/features/donations/schemas'
import type { Donation } from '@/features/donations/types'

interface DonationFormProps {
  mode: 'create' | 'edit'
  initialDonation?: Donation
  onSubmit: (values: DonationFormValues) => Promise<void>
  onCancel: () => void
}

function toLocalDateTimeInput(value: string | null): string {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) {
    return ''
  }

  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function getDefaultValues(donation?: Donation): DonationFormValues {
  return {
    title: donation?.title ?? '',
    description: donation?.description ?? '',
    category: donation?.category ?? ('' as DonationFormValues['category']),
    condition: donation?.condition ?? ('' as DonationFormValues['condition']),
    township: donation?.township ?? '',
    foodExpirationDate: donation?.food_expiration_date ?? '',
    pickupDeadline: toLocalDateTimeInput(donation?.pickup_deadline ?? null),
    image: undefined,
  }
}

export function DonationForm({ mode, initialDonation, onSubmit, onCancel }: DonationFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: getDefaultValues(initialDonation),
  })
  const category = useWatch({ control, name: 'category' })
  const selectedImage = useWatch({ control, name: 'image' })
  const imageRegistration = register('image')
  const initialImageUrl = initialDonation?.imageUrl
  const [aiSuggestion, setAiSuggestion] = useState<DonationSuggestion | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [preparedImagePath, setPreparedImagePath] = useState<string | null>(null)
  const preparedImagePathRef = useRef<string | null>(null)
  const previewUrl = useMemo(
    () => (selectedImage ? URL.createObjectURL(selectedImage) : initialImageUrl),
    [initialImageUrl, selectedImage],
  )

  useEffect(() => {
    if (initialDonation) {
      reset(getDefaultValues(initialDonation))
    }
  }, [initialDonation, reset])

  useEffect(
    () => () => {
      if (selectedImage && previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    },
    [previewUrl, selectedImage],
  )

  useEffect(
    () => () => {
      if (preparedImagePathRef.current) {
        void discardAnalysisImage(preparedImagePathRef.current)
      }
    },
    [],
  )

  useEffect(() => {
    if (category !== 'sealed_food') {
      setValue('foodExpirationDate', '', { shouldValidate: false })
      setValue('pickupDeadline', '', { shouldValidate: false })
    }
  }, [category, setValue])

  const clearPreparedImage = () => {
    const imagePath = preparedImagePath
    setPreparedImagePath(null)

    if (imagePath) {
      void discardAnalysisImage(imagePath)
    }
  }

  const suggestDetails = async () => {
    if (!selectedImage && !initialDonation?.image_path) {
      setError('image', { type: 'custom', message: 'Choose a photo before asking for suggestions.' })
      return
    }

    clearPreparedImage()
    setAiError(null)
    setIsAnalyzing(true)

    try {
      const result = await analyzeDonationImage(selectedImage, initialDonation?.image_path)

      preparedImagePathRef.current = result.temporaryImagePath
      setPreparedImagePath(result.temporaryImagePath)
      setAiSuggestion(result.suggestion)
      setValue('title', result.suggestion.suggestedTitle, { shouldDirty: true, shouldValidate: true })
      setValue('description', result.suggestion.suggestedDescription, { shouldDirty: true, shouldValidate: true })
      setValue('category', result.suggestion.suggestedCategory, { shouldDirty: true, shouldValidate: true })
    } catch (error) {
      setAiError(
        error instanceof DonationAssistantError
          ? error.message
          : 'The AI assistant could not analyze this image. Please try again.',
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const submitForm = async (values: DonationFormValues) => {
    if (mode === 'create' && !values.image) {
      setError('image', { type: 'custom', message: 'Add one clear photo before publishing.' })
      return
    }

    try {
      await onSubmit(values)
      clearPreparedImage()
    } catch {
      // The page mutation owns the toast; keep the form open so the donor can retry.
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <Card>
        <CardHeader className="border-b border-line">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <HeartHandshake className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-bold text-ink">Donation details</h2>
              <p className="mt-0.5 text-xs text-muted">A few thoughtful details help the right person find it.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="space-y-6" noValidate onSubmit={handleSubmit(submitForm)}>
            <Field
              label="What are you sharing?"
              htmlFor="donation-title"
              hint="Keep the title specific and easy to scan."
              error={errors.title?.message}
              required
            >
              <Input
                id="donation-title"
                placeholder="e.g. A box of children’s storybooks"
                {...register('title')}
                aria-invalid={Boolean(errors.title)}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Category" htmlFor="donation-category" error={errors.category?.message} required>
                <Select id="donation-category" {...register('category')} aria-invalid={Boolean(errors.category)}>
                  <option value="" disabled>
                    Select a category
                  </option>
                  {DONATION_CATEGORIES.map((donationCategory) => (
                    <option key={donationCategory} value={donationCategory}>
                      {DONATION_CATEGORY_LABELS[donationCategory]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Condition" htmlFor="donation-condition" error={errors.condition?.message} required>
                <Select id="donation-condition" {...register('condition')} aria-invalid={Boolean(errors.condition)}>
                  <option value="" disabled>
                    Choose condition
                  </option>
                  {DONATION_CONDITIONS.map((condition) => (
                    <option key={condition} value={condition}>
                      {DONATION_CONDITION_LABELS[condition]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field
              label="General area"
              htmlFor="donation-township"
              hint="Share a township or neighborhood, never your home address."
              error={errors.township?.message}
              required
            >
              <Input
                id="donation-township"
                placeholder="e.g. Kamayut Township"
                {...register('township')}
                aria-invalid={Boolean(errors.township)}
              />
            </Field>

            <Field
              label="Tell the story"
              htmlFor="donation-description"
              hint="Mention size, quantity, or anything someone should know before requesting."
              error={errors.description?.message}
              required
            >
              <Textarea
                id="donation-description"
                placeholder="What would help a neighbor understand this item?"
                {...register('description')}
                aria-invalid={Boolean(errors.description)}
              />
            </Field>

            {category === 'sealed_food' ? (
              <div className="rounded-2xl border border-[#eddca8] bg-[#fff8dc] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <CalendarClock className="mt-0.5 size-5 shrink-0 text-[#785c13]" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-ink">Food safety dates</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      Only unopened, sealed food that has not expired can be shared.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Expiration date"
                    htmlFor="food-expiration-date"
                    error={errors.foodExpirationDate?.message}
                    required
                  >
                    <Input
                      id="food-expiration-date"
                      type="date"
                      {...register('foodExpirationDate')}
                      aria-invalid={Boolean(errors.foodExpirationDate)}
                    />
                  </Field>
                  <Field
                    label="Pickup by"
                    htmlFor="pickup-deadline"
                    error={errors.pickupDeadline?.message}
                    required
                  >
                    <Input
                      id="pickup-deadline"
                      type="datetime-local"
                      {...register('pickupDeadline')}
                      aria-invalid={Boolean(errors.pickupDeadline)}
                    />
                  </Field>
                </div>
              </div>
            ) : null}

            <Field
              label={mode === 'create' ? 'One clear photo' : 'Update the photo'}
              htmlFor="donation-image"
              hint="JPG, PNG, or WebP up to 5 MB. Keep one image focused on the item."
              error={errors.image?.message}
              required={mode === 'create'}
            >
              <input
                ref={(element) => {
                  imageRegistration.ref(element)
                  fileInputRef.current = element
                }}
                className="sr-only"
                id="donation-image"
                name={imageRegistration.name}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onBlur={imageRegistration.onBlur}
                onChange={(event) => {
                  clearPreparedImage()
                  setAiSuggestion(null)
                  setAiError(null)
                  setValue('image', event.target.files?.[0], {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }}
              />
              <button
                className="flex min-h-36 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-line bg-sage/45 px-5 text-center transition hover:border-ink/30 hover:bg-sage"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <img className="mb-3 max-h-28 max-w-full rounded-xl object-contain" src={previewUrl} alt="Selected donation preview" />
                ) : (
                  <span className="flex size-10 items-center justify-center rounded-xl bg-paper text-muted">
                    <Upload className="size-5" aria-hidden="true" />
                  </span>
                )}
                {selectedImage ? (
                  <>
                    <FileImage className="size-5 text-primary" aria-hidden="true" />
                    <span className="mt-2 max-w-full truncate text-sm font-semibold text-ink">{selectedImage.name}</span>
                    <span className="mt-1 text-xs text-muted">Choose another photo</span>
                  </>
                ) : initialDonation ? (
                  <>
                    <span className="text-sm font-bold text-ink">Current photo</span>
                    <span className="mt-1 text-xs text-muted">Choose a replacement, or keep this one</span>
                  </>
                ) : (
                  <>
                    <span className="mt-3 text-sm font-bold text-ink">Choose a photo</span>
                    <span className="mt-1 text-xs text-muted">One image keeps the listing clear</span>
                  </>
                )}
              </button>
              <div className="space-y-3">
                <Button
                  className="w-full sm:w-auto"
                  disabled={!selectedImage && !initialDonation?.image_path}
                  loading={isAnalyzing}
                  size="sm"
                  type="button"
                  variant="secondary"
                  onClick={() => void suggestDetails()}
                >
                  <Sparkles className="size-4" aria-hidden="true" />
                  Suggest Details with AI
                </Button>
                <p className="text-xs leading-relaxed text-muted">
                  Use the photo as a starting point. You will review every suggestion before publishing.
                </p>

                {isAnalyzing ? (
                  <p className="rounded-xl border border-line bg-sage px-3.5 py-3 text-sm text-muted" role="status">
                    Looking at the image and drafting editable details…
                  </p>
                ) : null}

                {aiError ? (
                  <div className="flex items-start justify-between gap-3 rounded-xl border border-danger/25 bg-danger/5 px-3.5 py-3" role="alert">
                    <p className="text-sm leading-relaxed text-danger">{aiError}</p>
                    <Button className="shrink-0" size="sm" type="button" variant="outline" onClick={() => void suggestDetails()}>
                      Try again
                    </Button>
                  </div>
                ) : null}

                {aiSuggestion ? (
                  <div className="space-y-3 rounded-xl border border-primary/20 bg-primary-soft/45 px-3.5 py-3" role="status">
                    <p className="text-sm font-semibold text-ink">
                      AI-generated suggestions — please review and edit before publishing.
                    </p>
                    <p className="text-xs leading-relaxed text-muted">
                      Possible match: <span className="font-semibold text-ink">{aiSuggestion.detectedItem}</span>. Confidence is an estimate, not a guarantee.
                    </p>
                    {aiSuggestion.safetyFlags.length > 0 ? (
                      <div className="rounded-xl border border-[#eddca8] bg-[#fff8dc] p-3" role="alert">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#785c13]" aria-hidden="true" />
                          <div>
                            <p className="text-xs font-bold text-ink">Possible safety warnings</p>
                            <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-muted">
                              {aiSuggestion.safetyFlags.map((flag) => (
                                <li key={flag}>{DONATION_SAFETY_FLAG_LABELS[flag]} — please check the item yourself.</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </Field>

            <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
              <Button variant="ghost" type="button" onClick={onCancel}>
                Cancel
              </Button>
              <Button loading={isSubmitting} type="submit">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                {mode === 'create' ? 'Publish donation' : 'Save changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <aside className="space-y-4">
        <Card className="bg-primary text-white">
          <CardContent className="pt-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-lime">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Sharing safely
            </span>
            <h2 className="mt-5 text-lg font-bold">A few good boundaries</h2>
            <ul className="mt-4 space-y-3">
              {[
                'Use a public pickup spot when possible.',
                'Keep private contact details off the listing.',
                'No medicine, weapons, alcohol, or recalled goods.',
              ].map((item) => (
                <li className="flex items-start gap-2.5 text-sm leading-relaxed text-white/70" key={item}>
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-peach">
          <CardContent className="pt-5">
            <Camera className="size-6 text-[#9b6649]" aria-hidden="true" />
            <p className="mt-4 text-sm font-bold text-ink">Clear beats perfect.</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              A natural, well-lit photo and an honest description help the next person feel ready to request.
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
