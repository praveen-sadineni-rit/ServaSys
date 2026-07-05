"use client";

import { createClient } from "@/lib/supabase/client";
import { DEMO_COOKIE_NAME } from "../_lib/authMode";

export default function AppHeader({ userEmail, demoMode }: { userEmail: string; demoMode: boolean }) {
  const supabase = createClient();

  async function handleSignOut() {
    if (demoMode) {
      document.cookie = `${DEMO_COOKIE_NAME}=; path=/Timesheet; max-age=0; SameSite=Lax`;
    } else {
      await supabase.auth.signOut();
    }
    window.location.assign("/Timesheet");
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-end gap-3 text-sm text-gray-600">
        <span>
          Signed in as <span className="font-medium text-[#1a1a1a]">{userEmail}</span>
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-[#1a1a1a] transition hover:border-timesheetRust hover:text-timesheetRust"
        >
          Sign out
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-b border-black/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 style={{ fontFamily: "var(--font-playfair)" }} className="text-3xl font-bold text-[#1a1a1a] sm:text-4xl">
            Timesheet <span className="italic text-timesheetRust">Weekly</span> Splitter
          </h1>
          <p className="mt-2 max-w-xl text-sm text-gray-600">
            Upload any vendor timesheet — daily hours or a single weekly total — and split it into
            Monday-to-Sunday weeks for one month. Review every day before it totals.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full border border-timesheetRust/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-timesheetRust">
          Mon → Sun · Month-clipped
        </span>
      </div>
    </div>
  );
}
