type AuthErrorDetails = {
  message?: unknown
  status?: unknown
  code?: unknown
}

function getAuthErrorDetails(error: unknown): AuthErrorDetails {
  if (typeof error !== 'object' || error === null) {
    return {}
  }

  return error as AuthErrorDetails
}

export function isAuthRateLimitError(error: unknown): boolean {
  const details = getAuthErrorDetails(error)
  const message = typeof details.message === 'string' ? details.message : ''
  const code = typeof details.code === 'string' ? details.code : ''

  return (
    details.status === 429 ||
    code === 'over_email_send_rate_limit' ||
    code === 'over_request_rate_limit' ||
    message.toLowerCase().includes('rate limit')
  )
}

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  const details = getAuthErrorDetails(error)
  const message = typeof details.message === 'string' ? details.message : ''
  const normalizedMessage = message.toLowerCase()

  if (isAuthRateLimitError(error)) {
    return 'Signup emails are temporarily rate-limited. Wait before retrying; production deployments should use custom SMTP.'
  }

  if (
    normalizedMessage.includes('invalid login credentials') ||
    normalizedMessage.includes('invalid credentials')
  ) {
    return 'That email and password combination was not recognized.'
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.'
  }

  if (normalizedMessage.includes('user already registered')) {
    return 'An account with this email already exists. Try signing in instead.'
  }

  return message || fallback
}
