// Supabase connection values. Fall back to inert placeholders when the env vars
// aren't set (e.g. a production deploy running in demo mode) so constructing the
// client never throws — in demo mode the client is never used for real requests.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
