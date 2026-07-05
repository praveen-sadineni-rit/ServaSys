import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isDemoMode } from "./app/Timesheet/_lib/authMode";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./lib/supabase/config";

// Scoped to /Timesheet (and the lowercase alias) via matcher below — the rest
// of servasys.com never runs this middleware.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // In demo mode there's no Supabase session to refresh — skip the call so we
  // don't hit the placeholder URL on every request.
  if (isDemoMode()) {
    return response;
  }

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Refreshes the session cookie if it's expired — required for Server Components
  // to reliably read an up-to-date session.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/Timesheet/:path*", "/timesheet/:path*"],
};
