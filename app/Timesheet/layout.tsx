import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";

// Loaded only for this route via next/font — doesn't touch the root layout's
// <head> or the marketing site's Inter-only setup.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Timesheet Weekly Splitter",
  robots: { index: false, follow: false },
};

export default function TimesheetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${playfair.variable} min-h-screen bg-timesheetCream text-[#1a1a1a]`}>
      {children}
    </div>
  );
}
