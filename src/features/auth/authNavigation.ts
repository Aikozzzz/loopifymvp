export function getSafeRedirectPath(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('from' in state)) {
    return '/feed'
  }

  const from = state.from

  if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//')) {
    return '/feed'
  }

  return from
}
