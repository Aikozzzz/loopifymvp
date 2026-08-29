import OpenAI from 'openai'

import {
  donationSuggestionJsonSchema,
  donationSuggestionSchema,
  type DonationSuggestion,
} from './schemas'

export type AIClientErrorCode = 'ai_unavailable' | 'invalid_ai_response'

export class AIClientError extends Error {
  readonly code: AIClientErrorCode

  constructor(code: AIClientErrorCode, message: string) {
    super(message)
    this.name = 'AIClientError'
    this.code = code
  }
}

const SYSTEM_INSTRUCTIONS = [
  'You help a donor draft a safe, factual donation listing from one item photo.',
  'Return only the requested structured object.',
  'Suggest a title and description within the supplied length limits.',
  'Never include a price, sale language, or monetary value.',
  'Never determine or suggest item condition; the donor selects condition separately.',
  'Use safetyFlags only for possible warnings, never as confirmed violations.',
  'If the image is unclear, include unclear_image and keep suggestions cautious.',
  'For possible medicine, weapons, alcohol, unsafe food, personal information, or inappropriate content, use the matching warning flag.',
].join(' ')

function getConfiguredClient(): { client: OpenAI; model: string } {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  const model = process.env.OPENAI_MODEL?.trim()

  if (!apiKey || !model) {
    throw new AIClientError(
      'ai_unavailable',
      'The AI assistant is unavailable right now. You can still complete the listing manually.',
    )
  }

  return {
    client: new OpenAI({ apiKey }),
    model,
  }
}

export async function analyzeDonationImage(imageUrl: string): Promise<DonationSuggestion> {
  const { client, model } = getConfiguredClient()

  try {
    const response = await client.responses.create({
      model,
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: SYSTEM_INSTRUCTIONS }],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: 'Analyze this donation image and draft editable listing details.',
            },
            {
              type: 'input_image',
              image_url: imageUrl,
              detail: 'low',
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'donation_suggestion',
          strict: true,
          schema: donationSuggestionJsonSchema,
        },
      },
    })

    const output = response.output_text?.trim()

    if (!output) {
      throw new AIClientError('invalid_ai_response', 'The AI assistant returned no usable suggestions.')
    }

    let parsed: unknown

    try {
      parsed = JSON.parse(output)
    } catch {
      throw new AIClientError('invalid_ai_response', 'The AI assistant returned an invalid response.')
    }

    const result = donationSuggestionSchema.safeParse(parsed)

    if (!result.success) {
      throw new AIClientError('invalid_ai_response', 'The AI assistant returned an invalid response.')
    }

    return result.data
  } catch (error) {
    if (error instanceof AIClientError) {
      throw error
    }

    throw new AIClientError(
      'ai_unavailable',
      'The AI assistant is unavailable right now. You can still complete the listing manually.',
    )
  }
}
