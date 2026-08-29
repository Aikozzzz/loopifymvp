import type { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions'

import { analyzeDonationImage, AIClientError } from './_shared/ai-client'
import { AuthFailure, getAuthenticatedUser, getServerSupabaseUrl } from './_shared/auth'
import { analyzeDonationRequestSchema } from './_shared/schemas'

const MAX_BODY_BYTES = 16 * 1024
const IMAGE_PATH_PREFIX = '/storage/v1/object/public/item-images/'

type ErrorPayload = {
  error: {
    code: string
    message: string
  }
}

function jsonResponse(statusCode: number, payload: unknown): HandlerResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(payload),
  }
}

function errorResponse(statusCode: number, code: string, message: string): HandlerResponse {
  const payload: ErrorPayload = { error: { code, message } }
  return jsonResponse(statusCode, payload)
}

function getBody(event: HandlerEvent): string {
  if (!event.body) {
    return ''
  }

  if (!event.isBase64Encoded) {
    return event.body
  }

  try {
    return Buffer.from(event.body, 'base64').toString('utf8')
  } catch {
    return ''
  }
}

function hasAcceptableBodySize(event: HandlerEvent, body: string): boolean {
  const contentLength = Object.entries(event.headers).find(
    ([name]) => name.toLowerCase() === 'content-length',
  )?.[1]

  if (contentLength) {
    const parsedLength = Number(contentLength)

    if (!Number.isFinite(parsedLength) || parsedLength > MAX_BODY_BYTES) {
      return false
    }
  }

  return Buffer.byteLength(body, 'utf8') <= MAX_BODY_BYTES
}

export function isOwnedStorageImageUrl(imageUrl: string, userId: string, supabaseUrl: string): boolean {
  try {
    const parsedImageUrl = new URL(imageUrl)
    const projectUrl = new URL(supabaseUrl)

    if (
      parsedImageUrl.origin !== projectUrl.origin ||
      parsedImageUrl.username ||
      parsedImageUrl.password ||
      parsedImageUrl.pathname.includes('\\') ||
      parsedImageUrl.search ||
      parsedImageUrl.hash ||
      !parsedImageUrl.pathname.startsWith(IMAGE_PATH_PREFIX)
    ) {
      return false
    }

    const objectPath = decodeURIComponent(parsedImageUrl.pathname.slice(IMAGE_PATH_PREFIX.length))
    const pathSegments = objectPath.split('/')
    const fileName = pathSegments.at(-1) ?? ''

    return (
      pathSegments.length >= 2 &&
      pathSegments[0] === userId &&
      !objectPath.includes('\\') &&
      /\.(?:jpe?g|png|webp)$/i.test(fileName) &&
      pathSegments.slice(1).every((segment) => Boolean(segment) && segment !== '.' && segment !== '..')
    )
  } catch {
    return false
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod.toUpperCase() !== 'POST') {
    return errorResponse(405, 'method_not_allowed', 'Only POST requests are supported.')
  }

  const body = getBody(event)

  if (!hasAcceptableBodySize(event, body)) {
    return errorResponse(413, 'request_too_large', 'The image analysis request is too large.')
  }

  let user

  try {
    user = await getAuthenticatedUser(event)
  } catch (error) {
    if (error instanceof AuthFailure && error.code === 'server_misconfigured') {
      return errorResponse(503, 'service_unavailable', 'The donation assistant is unavailable right now.')
    }

    return errorResponse(401, 'auth_required', 'Please sign in to use the donation assistant.')
  }

  let requestBody: unknown

  try {
    requestBody = JSON.parse(body)
  } catch {
    return errorResponse(400, 'invalid_request', 'Provide a valid image URL.')
  }

  const parsedRequest = analyzeDonationRequestSchema.safeParse(requestBody)

  if (!parsedRequest.success) {
    return errorResponse(400, 'invalid_request', 'Provide a valid image URL.')
  }

  let supabaseUrl: string

  try {
    supabaseUrl = getServerSupabaseUrl()
  } catch {
    return errorResponse(503, 'service_unavailable', 'The donation assistant is unavailable right now.')
  }

  if (!isOwnedStorageImageUrl(parsedRequest.data.imageUrl, user.id, supabaseUrl)) {
    return errorResponse(
      403,
      'image_not_owned',
      'For safety, the image must be uploaded to your Loopify storage folder.',
    )
  }

  try {
    const suggestion = await analyzeDonationImage(parsedRequest.data.imageUrl)
    return jsonResponse(200, { suggestion })
  } catch (error) {
    if (error instanceof AIClientError && error.code === 'invalid_ai_response') {
      return errorResponse(502, 'invalid_ai_response', 'The AI assistant returned an invalid response. Please try again.')
    }

    return errorResponse(503, 'ai_unavailable', 'The AI assistant is unavailable right now. You can still complete the listing manually.')
  }
}
