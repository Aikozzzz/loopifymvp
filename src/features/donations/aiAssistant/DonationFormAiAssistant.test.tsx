import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  class MockDonationAssistantError extends Error {
    constructor(
      readonly code: string,
      message: string,
    ) {
      super(message)
    }
  }

  return {
    analyzeDonationImage: vi.fn(),
    discardAnalysisImage: vi.fn(),
    MockDonationAssistantError,
  }
})

const { analyzeDonationImage, MockDonationAssistantError } = mocks

vi.mock('@/features/donations/aiAssistant/aiAssistantService', () => ({
  analyzeDonationImage: mocks.analyzeDonationImage,
  discardAnalysisImage: mocks.discardAnalysisImage,
  DonationAssistantError: mocks.MockDonationAssistantError,
}))

import { DonationForm } from '../components/DonationForm'

const suggestion = {
  detectedItem: 'Children’s storybooks',
  suggestedTitle: 'Box of children’s storybooks',
  suggestedDescription: 'A clean box of children’s storybooks ready for a new home.',
  suggestedCategory: 'books' as const,
  safetyFlags: ['possible_personal_information' as const],
  confidence: 0.92,
}

function renderForm() {
  return render(
    <DonationForm
      mode="create"
      onCancel={vi.fn()}
      onSubmit={vi.fn().mockResolvedValue(undefined)}
    />,
  )
}

function getImageInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>('#donation-image')

  if (!input) {
    throw new Error('Donation image input was not rendered.')
  }

  return input
}

describe('DonationForm AI assistant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    analyzeDonationImage.mockResolvedValue({
      suggestion,
      temporaryImagePath: 'user-1/analysis.png',
    })
  })

  it('keeps the assistant disabled until a donor selects an image', async () => {
    const user = userEvent.setup()
    const { container } = renderForm()

    const suggestButton = screen.getByRole('button', { name: 'Suggest Details with AI' })
    expect(suggestButton).toBeDisabled()

    await user.upload(
      getImageInput(container),
      new File(['image'], 'storybooks.png', { type: 'image/png' }),
    )

    expect(suggestButton).toBeEnabled()
    expect(analyzeDonationImage).not.toHaveBeenCalled()
  })

  it('populates editable fields without changing the manual condition', async () => {
    const user = userEvent.setup()
    const { container } = renderForm()

    await user.upload(
      getImageInput(container),
      new File(['image'], 'storybooks.png', { type: 'image/png' }),
    )
    await user.click(screen.getByRole('button', { name: 'Suggest Details with AI' }))

    await waitFor(() => {
      expect(screen.getByDisplayValue('Box of children’s storybooks')).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('A clean box of children’s storybooks ready for a new home.')).toBeInTheDocument()
    expect(container.querySelector<HTMLSelectElement>('#donation-category')).not.toBeNull()
    expect(container.querySelector<HTMLSelectElement>('#donation-category')).toHaveValue('books')
    expect(container.querySelector<HTMLSelectElement>('#donation-condition')).not.toBeNull()
    expect(container.querySelector<HTMLSelectElement>('#donation-condition')).toHaveValue('')
    expect(
      screen.getByText('AI-generated suggestions — please review and edit before publishing.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Possible personal information — please check the item yourself.')).toBeInTheDocument()
    expect(analyzeDonationImage).toHaveBeenCalledOnce()
  })

  it('shows an unavailable error and exposes retry', async () => {
    const user = userEvent.setup()
    analyzeDonationImage.mockRejectedValue(
      new MockDonationAssistantError(
        'ai_unavailable',
        'The AI assistant is unavailable right now. You can still complete the listing manually.',
      ),
    )
    const { container } = renderForm()

    await user.upload(
      getImageInput(container),
      new File(['image'], 'storybooks.png', { type: 'image/png' }),
    )
    await user.click(screen.getByRole('button', { name: 'Suggest Details with AI' }))

    expect(
      await screen.findByText('The AI assistant is unavailable right now. You can still complete the listing manually.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
