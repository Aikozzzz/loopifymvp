import { getCurrentUser, requireCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { validateDonationImage } from '@/features/donations/schemas'
import type { User } from '@supabase/supabase-js'

import { donationSuggestionSchema, type DonationSuggestion } from './schemas'

const IMAGE_BUCKET = 'item-images'
const ANALYZE_DONATION_ENDPOINT = '/.netlify/functions/analyze-donation'

export type DonationAssistantErrorCode =
  | 'auth_required'
  | 'invalid_image'
  | 'image_not_owned'
  | 'ai_unavailable'
  | 'invalid_ai_response'
  | 'request_failed'

export class DonationAssistantError extends Error {
  readonly code: DonationAssistantErrorCode

  constructor(code: DonationAssistantErrorCode, message: string) {
    super(message)
    this.name = 'DonationAssistantError'
    this.code = code
  }
}

export type DonationAnalysisResult = {
  suggestion: DonationSuggestion
  temporaryImagePath: string | null
}

type ErrorResponse = {
  error?: {
    code?: unknown
    message?: unknown
  }
}

function getImageUrl(imagePath: string): string {
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(imagePath).data.publicUrl
}

async function uploadAnalysisImage(userId: string, file: File): Promise<string> {
  const validationMessage = validateDonationImage(file)

  if (validationMessage) {
    throw new DonationAssistantError('invalid_image', validationMessage)
  }

  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const imagePath = `${userId}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(imagePath, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })

  if (error) {
    throw new DonationAssistantError(
      'request_failed',
      'The image could not be prepared for analysis. Please try again.',
    )
  }

  return imagePath
}

async function removeUserImage(userId: string, imagePath: string | null): Promise<void> {
  if (!imagePath || !imagePath.startsWith(`${userId}/`)) {
    return
  }

  await supabase.storage.from(IMAGE_BUCKET).remove([imagePath])
}

function errorFromResponse(status: number, payload: unknown): DonationAssistantError {
  const response = payload as ErrorResponse
  const code = response.error?.code
  const message = response.error?.message

  if (code === 'auth_required' || status === 401) {
    return new DonationAssistantError('auth_required', 'Please sign in to use the donation assistant.')
  }

  if (code === 'image_not_owned' || status === 403) {
    return new DonationAssistantError(
      'image_not_owned',
      'For safety, the image must be uploaded to your Loopify storage folder.',
    )
  }

  if (code === 'invalid_ai_response' || status === 502) {
    return new DonationAssistantError(
      'invalid_ai_response',
      'The AI assistant returned an invalid response. Please try again.',
    )
  }

  if (code === 'ai_unavailable' || status === 503) {
    return new DonationAssistantError(
      'ai_unavailable',
      'The AI assistant is unavailable right now. You can still complete the listing manually.',
    )
  }

  return new DonationAssistantError(
    'request_failed',
    typeof message === 'string' && message ? message : 'The donation assistant could not be reached. Please try again.',
  )
}

async function readResponsePayload(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function analyzeDonationImage(
  file: File | undefined,
  existingImagePath?: string,
): Promise<DonationAnalysisResult> {
  let user: User

  try {
    user = await requireCurrentUser()
  } catch {
    throw new DonationAssistantError('auth_required', 'Please sign in to use the donation assistant.')
  }

  let imagePath = existingImagePath ?? null
  let temporaryImagePath: string | null = null

  if (file) {
    temporaryImagePath = await uploadAnalysisImage(user.id, file)
    imagePath = temporaryImagePath
  }

  if (!imagePath || !imagePath.startsWith(`${user.id}/`)) {
    throw new DonationAssistantError(
      'image_not_owned',
      'For safety, the image must be uploaded to your Loopify storage folder.',
    )
  }

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.access_token) {
      throw new DonationAssistantError('auth_required', 'Please sign in to use the donation assistant.')
    }

    const response = await fetch(ANALYZE_DONATION_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl: getImageUrl(imagePath) }),
    })
    const payload = await readResponsePayload(response)

    if (!response.ok) {
      throw errorFromResponse(response.status, payload)
    }

    const suggestion = donationSuggestionSchema.safeParse(
      typeof payload === 'object' && payload !== null && 'suggestion' in payload
        ? payload.suggestion
        : undefined,
    )

    if (!suggestion.success) {
      throw new DonationAssistantError(
        'invalid_ai_response',
        'The AI assistant returned an invalid response. Please try again.',
      )
    }

    return {
      suggestion: suggestion.data,
      temporaryImagePath,
    }
  } catch (error) {
    if (temporaryImagePath) {
      await removeUserImage(user.id, temporaryImagePath)
    }

    if (error instanceof DonationAssistantError) {
      throw error
    }

    throw new DonationAssistantError(
      'ai_unavailable',
      'The AI assistant is unavailable right now. You can still complete the listing manually.',
    )
  }
}

export async function discardAnalysisImage(imagePath: string | null): Promise<void> {
  if (!imagePath) {
    return
  }

  const user = await getCurrentUser()

  if (user) {
    await removeUserImage(user.id, imagePath)
  }
}

export { ANALYZE_DONATION_ENDPOINT }
