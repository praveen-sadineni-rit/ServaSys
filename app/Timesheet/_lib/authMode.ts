// The tool runs in "demo mode" until a real Supabase project is configured.
// In demo mode any email + password signs you in (stored in a plain cookie),
// so the tool can be used/tested locally without provisioning Supabase. As soon
// as real NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY values are set in the environment,
// this returns false and the app uses real Supabase auth instead.

export const DEMO_COOKIE_NAME = "ts_demo_user";

export function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !key) return true;
  // Placeholder values shipped in .env.local.example / the local .env.local.
  if (url.includes("placeholder") || key.includes("placeholder")) return true;
  return false;
}
