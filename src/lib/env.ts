declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL?: string;
    readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export type PublicEnv = Readonly<{
  supabaseUrl: string;
  supabasePublishableKey: string;
}>;

type RequiredEnvName =
  | 'VITE_SUPABASE_URL'
  | 'VITE_SUPABASE_PUBLISHABLE_KEY';

function readRequiredEnv(name: RequiredEnvName): string {
  const value = import.meta.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.local and provide the value.`,
    );
  }

  return value;
}

function validateSupabaseUrl(value: string): string {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error('VITE_SUPABASE_URL must be a valid URL.');
  }

  if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
    throw new Error('VITE_SUPABASE_URL must use HTTP or HTTPS.');
  }

  return parsedUrl.toString().replace(/\/$/, '');
}

function validatePublishableKey(value: string): string {
  if (/[\r\n]/.test(value)) {
    throw new Error(
      'VITE_SUPABASE_PUBLISHABLE_KEY cannot contain line breaks.',
    );
  }

  if (
    value.toLowerCase().startsWith('sb_secret_') ||
    value.toLowerCase().includes('service_role') ||
    hasServiceRoleClaim(value)
  ) {
    throw new Error(
      'VITE_SUPABASE_PUBLISHABLE_KEY cannot contain a Supabase secret key.',
    );
  }

  return value;
}

function hasServiceRoleClaim(value: string): boolean {
  const segments = value.split('.');

  if (segments.length !== 3) {
    return false;
  }

  try {
    const encodedPayload = segments[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(segments[1].length / 4) * 4, '=');
    const claims: unknown = JSON.parse(
      globalThis.atob(encodedPayload),
    );

    return (
      typeof claims === 'object' &&
      claims !== null &&
      'role' in claims &&
      claims.role === 'service_role'
    );
  } catch {
    // Opaque publishable keys and malformed legacy-looking values are left
    // to Supabase for validation. Only an explicit service-role claim fails.
    return false;
  }
}

export const env: PublicEnv = Object.freeze({
  supabaseUrl: validateSupabaseUrl(readRequiredEnv('VITE_SUPABASE_URL')),
  supabasePublishableKey: validatePublishableKey(
    readRequiredEnv('VITE_SUPABASE_PUBLISHABLE_KEY'),
  ),
});
