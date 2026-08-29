import { ArrowLeft, HeartHandshake } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { DonationErrorState } from '@/features/donations/components/DonationErrorState'
import { DonationForm } from '@/features/donations/components/DonationForm'
import { useMyDonation } from '@/features/donations/hooks/useDonations'
import { createDonation, updateDonation } from '@/features/donations/services/donationService'
import type { DonationFormValues } from '@/features/donations/schemas'
import { queryClient } from '@/lib/queryClient'

export function CreateDonationPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const donationQuery = useMyDonation(id)
  const mutation = useMutation({
    mutationFn: (values: DonationFormValues) => (id ? updateDonation(id, values) : createDonation(values)),
    onSuccess: (donation) => {
      void queryClient.invalidateQueries({ queryKey: ['donations'] })
      void queryClient.invalidateQueries({ queryKey: ['requests'] })
      toast.success(isEdit ? 'Donation updated.' : 'Donation published.')
      navigate(`/donations/${donation.id}`)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Donation could not be saved.')
    },
  })

  if (isEdit && donationQuery.isPending) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader eyebrow="Your giving" title="Edit donation" description="Loading your donation details…" />
        <div className="mt-8 h-96 animate-pulse rounded-card bg-sage" />
      </div>
    )
  }

  if (isEdit && (donationQuery.isError || !donationQuery.data)) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader eyebrow="Your giving" title="Edit donation" description="This donation could not be opened for editing." />
        <DonationErrorState onRetry={() => void donationQuery.refetch()} />
      </div>
    )
  }

  if (isEdit && donationQuery.data?.status !== 'available') {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader
          eyebrow="Your giving"
          title="This donation is already in motion."
          description="Reserved, donated, and withdrawn listings cannot be edited."
        />
        <EmptyState
          className="mt-8"
          title="Editing is paused for this listing."
          description="You can still view its public details and track the current status from My donations."
          actionLabel="Back to my donations"
          onAction={() => navigate('/my-donations')}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        eyebrow={isEdit ? 'Update your giving' : 'Start a new loop'}
        title={isEdit ? 'Keep the details clear.' : 'Give an item a next chapter.'}
        description={
          isEdit
            ? 'Update an available donation so neighbors have the clearest information.'
            : 'Tell neighbors what you’re ready to pass forward. Keep it clear, useful, and easy to collect.'
        }
        action={
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink" to="/my-donations">
            <ArrowLeft className="size-4" aria-hidden="true" />
            My donations
          </Link>
        }
      />

      <div className="mt-8">
        <DonationForm
          mode={isEdit ? 'edit' : 'create'}
          initialDonation={donationQuery.data}
          onSubmit={async (values) => {
            await mutation.mutateAsync(values)
          }}
          onCancel={() => navigate(isEdit && id ? `/donations/${id}` : '/feed')}
        />
      </div>

      {!isEdit ? (
        <div className="mt-6 flex items-start gap-3 rounded-card border border-line bg-paper p-4 text-sm text-muted">
          <HeartHandshake className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <p>
            Donations are always free. Pickup instructions and direct contact details should only be shared after a request is accepted.
          </p>
        </div>
      ) : null}
    </div>
  )
}
