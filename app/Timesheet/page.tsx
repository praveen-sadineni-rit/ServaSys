import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode, DEMO_COOKIE_NAME } from "./_lib/authMode";
import AuthCard from "./_components/AuthCard";
import TimesheetSplitterApp from "./_components/TimesheetSplitterApp";

export default async function TimesheetPage() {
  const demoMode = isDemoMode();

  let userEmail: string | null = null;

  if (demoMode) {
    userEmail = cookies().get(DEMO_COOKIE_NAME)?.value ?? null;
  } else {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  }

  if (!userEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <AuthCard demoMode={demoMode} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <TimesheetSplitterApp userEmail={userEmail} demoMode={demoMode} />
    </main>
  );
}
