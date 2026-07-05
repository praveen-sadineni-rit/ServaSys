"use client";

import { useState, useEffect, useRef } from "react";
import Navbar, { Logo } from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ── Hero announcement banner ──
   Auto-detects US federal holidays by date (see FEDERAL_HOLIDAYS below) and shows
   the matching message on the day itself, hiding automatically the next day.
   To run a manual/custom promo instead (overrides the holiday check), set
   MANUAL_ANNOUNCEMENT.active to true and fill in the fields. */
const MANUAL_ANNOUNCEMENT: { active: boolean; message: string; subMessage: string; background: string } = {
  active: false,
  message: "",
  subMessage: "",
  background: "linear-gradient(90deg, #B22234, #2D2A6E)",
};

/* Nth weekday of a month, e.g. 3rd Monday of January. weekday: 0=Sun..6=Sat, n: 1-based */
function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month, 1 + offset + (n - 1) * 7);
}

/* Last weekday of a month, e.g. last Monday of May */
function lastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  const lastDay = new Date(year, month + 1, 0);
  const offset = (lastDay.getDay() - weekday + 7) % 7;
  return new Date(year, month, lastDay.getDate() - offset);
}

type Holiday = {
  name: string;
  message: string;
  subMessage: string;
  background: string;
  getDate: (year: number) => Date;
};

/* All 11 US federal holidays, with accurate floating-date rules baked in */
const FEDERAL_HOLIDAYS: Holiday[] = [
  {
    name: "New Year's Day",
    message: "🎉 Happy New Year from Serva Systems LLC",
    subMessage: "wishing you a year of growth, innovation, and success 🎊",
    background: "linear-gradient(90deg, #6d28d9, #2D2A6E)",
    getDate: (y) => new Date(y, 0, 1),
  },
  {
    name: "Martin Luther King Jr. Day",
    message: "✊🏾 Honoring Martin Luther King Jr. Day",
    subMessage: "celebrating his legacy of equality, justice, and service",
    background: "linear-gradient(90deg, #2D2A6E, #F5A623)",
    getDate: (y) => nthWeekdayOfMonth(y, 0, 1, 3),
  },
  {
    name: "Presidents Day",
    message: "🇺🇸 Happy Presidents Day from Serva Systems LLC",
    subMessage: "honoring the leadership and legacy of our nation's presidents",
    background: "linear-gradient(90deg, #B22234, #2D2A6E)",
    getDate: (y) => nthWeekdayOfMonth(y, 1, 1, 3),
  },
  {
    name: "Memorial Day",
    message: "🎖️ Honoring Memorial Day",
    subMessage: "remembering and honoring those who made the ultimate sacrifice",
    background: "linear-gradient(90deg, #171340, #B22234)",
    getDate: (y) => lastWeekdayOfMonth(y, 4, 1),
  },
  {
    name: "Juneteenth",
    message: "✊🏿 Happy Juneteenth",
    subMessage: "celebrating freedom, resilience, and progress",
    background: "linear-gradient(90deg, #b45309, #2D2A6E)",
    getDate: (y) => new Date(y, 5, 19),
  },
  {
    name: "Independence Day",
    message: "🎆 Happy Independence Day from Serva Systems LLC",
    subMessage: "celebrating freedom, innovation, and the people who build the future 🇺🇸",
    background: "linear-gradient(90deg, #B22234, #2D2A6E)",
    getDate: (y) => new Date(y, 6, 4),
  },
  {
    name: "Labor Day",
    message: "🛠️ Happy Labor Day from Serva Systems LLC",
    subMessage: "celebrating the hard work and dedication of teams everywhere",
    background: "linear-gradient(90deg, #F5A623, #2D2A6E)",
    getDate: (y) => nthWeekdayOfMonth(y, 8, 1, 1),
  },
  {
    name: "Columbus Day",
    message: "🧭 Happy Columbus Day",
    subMessage: "marking a moment in the history of exploration",
    background: "linear-gradient(90deg, #7c3aed, #2D2A6E)",
    getDate: (y) => nthWeekdayOfMonth(y, 9, 1, 2),
  },
  {
    name: "Veterans Day",
    message: "🎖️ Honoring Veterans Day",
    subMessage: "thank you to all who served",
    background: "linear-gradient(90deg, #171340, #B22234)",
    getDate: (y) => new Date(y, 10, 11),
  },
  {
    name: "Thanksgiving Day",
    message: "🦃 Happy Thanksgiving from Serva Systems LLC",
    subMessage: "grateful for our clients, partners, and team",
    background: "linear-gradient(90deg, #b45309, #F5A623)",
    getDate: (y) => nthWeekdayOfMonth(y, 10, 4, 4),
  },
  {
    name: "Christmas Day",
    message: "🎄 Merry Christmas from Serva Systems LLC",
    subMessage: "wishing you joy, peace, and prosperity this holiday season",
    background: "linear-gradient(90deg, #b91c1c, #F5A623)",
    getDate: (y) => new Date(y, 11, 25),
  },
];

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getTodaysHolidayAnnouncement(): { active: boolean; message: string; subMessage: string; background: string } {
  if (MANUAL_ANNOUNCEMENT.active) return MANUAL_ANNOUNCEMENT;
  const today = new Date();
  const holiday = FEDERAL_HOLIDAYS.find((h) => isSameCalendarDay(h.getDate(today.getFullYear()), today));
  if (!holiday) return { active: false, message: "", subMessage: "", background: "" };
  return { active: true, message: holiday.message, subMessage: holiday.subMessage, background: holiday.background };
}

/* ── Scroll reveal ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

const ArrowRight = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
    <path d="M20 6L9 17L4 12" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── DATA ── */
const services = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Software Development",
    desc: "Custom web, mobile, and API engineering built on modern, maintainable foundations, sized to fit a startup budget or an enterprise roadmap.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M17 16a4 4 0 000-8 5 5 0 00-9.6-1.5A4.5 4.5 0 007 16h10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Cloud & DevOps",
    desc: "Cloud architecture, migration, and CI/CD automation across AWS, Azure, and GCP, so your infrastructure scales as fast as your business.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: "IT Systems Consulting",
    desc: "Architecture reviews, systems integration, and legacy modernization guided by engineers who've been in the trenches, not just the slide deck.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21M23 21V19C23 17.13 21.65 15.57 20 15.13M16 3.13C17.66 3.58 19 5.14 19 7C19 8.86 17.66 10.42 16 10.87M9 11C11.21 11 13 9.21 13 7C13 4.79 11.21 3 9 3C6.79 3 5 4.79 5 7C5 9.21 6.79 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Staff Augmentation",
    desc: "Vetted senior engineers who plug directly into your team, on your tools and your timeline, with no long-term lock-in required.",
  },
];

const whyUs = [
  { title: "Founder-led, not farmed out", desc: "You work directly with the people who founded Serva Systems, not a rotating account manager." },
  { title: "Transparent, fixed-scope pricing", desc: "You'll know the cost and timeline before we start. No surprise invoices, no scope creep." },
  { title: "Small by design, fast by default", desc: "Being newly founded means no bureaucracy. Decisions happen in days, not committee cycles." },
  { title: "Modern stack from day one", desc: "No legacy baggage to maintain. Every engagement starts with current, well-supported technology." },
];

export default function Home() {
  const [formStatus, setFormStatus] = useState<"idle" | "sent">("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`New inquiry from ${form.name || "website"}`);
    const body = encodeURIComponent(`${form.message}\n\nFrom: ${form.name} (${form.email})`);
    window.location.href = `mailto:hr@servasys.com?subject=${subject}&body=${body}`;
    setFormStatus("sent");
  };

  // Computed client-side (not at build time) so the banner reflects the visitor's actual date,
  // since this page is statically generated and wouldn't otherwise re-check the date per visit.
  const [announcement, setAnnouncement] = useState<{ active: boolean; message: string; subMessage: string; background: string }>({
    active: false, message: "", subMessage: "", background: "",
  });
  useEffect(() => {
    setAnnouncement(getTodaysHolidayAnnouncement());
  }, []);

  return (
    <div id="top">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #171340 0%, #2D2A6E 55%, #211C4D 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-96 h-96 rounded-full bg-[#F5A623]/10 blur-3xl -top-20 -right-20 animate-float-slow" />
          <div className="absolute w-72 h-72 rounded-full bg-[#4338CA]/30 blur-3xl bottom-0 left-0 animate-float" />
        </div>

        {/* Holiday announcement banner — auto-detected client-side, see getTodaysHolidayAnnouncement() above */}
        {announcement.active && (
          <div className="relative overflow-hidden border-b border-white/10" style={{ background: announcement.background }}>
            <div className="marquee-track marquee-slow py-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center flex-shrink-0">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <span key={j} className="flex items-center gap-2 px-8 text-white text-xs font-semibold tracking-wide whitespace-nowrap">
                      {announcement.message}
                      <span className="text-white/50">&middot;</span>
                      {announcement.subMessage}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative max-w-5xl mx-auto px-6 lg:px-10 pt-20 pb-24 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest" style={{ background: "rgba(245,166,35,0.15)", color: "#F5A623", border: "1px solid rgba(245,166,35,0.3)" }}>
              Newly Founded &middot; Rock Hill, SC
            </span>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="mt-8 text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              Technology Systems,<br />Engineered to <span style={{ color: "#F5A623" }}>Serve</span>.
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-6 text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
              Serva Systems LLC is a newly founded technology partner delivering software development,
              cloud engineering, and IT systems consulting, built around your business, not the other way around.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#contact" className="btn-primary">
                Start a Conversation <ArrowRight />
              </a>
              <a href="#services" className="btn-outline-white">
                See What We Do
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── About / Story ── */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#F5A623" }}>Our Story</p>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black" style={{ color: "#171340" }}>
              Why We Started Serva Systems
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-base sm:text-lg leading-relaxed" style={{ color: "#52546b" }}>
              Serva Systems LLC was founded on a simple idea: technology partners should serve the business,
              not the other way around. We&apos;re a brand-new company, and we&apos;re proud of it, it means no legacy
              overhead, no inherited processes, and no reason to do things the way they&apos;ve always been done.
              Just a small, senior team building software and systems the right way, from the very first client on.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-24" style={{ background: "#f8f9fb" }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#F5A623" }}>What We Do</p>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black" style={{ color: "#171340" }}>
              Services Built Around You
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.1}>
                <div
                  className="h-full p-8 rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1"
                  style={{ boxShadow: "0 2px 16px rgba(23,19,64,0.06)", borderTop: "3px solid #F5A623" }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: "rgba(45,42,110,0.08)", color: "#2D2A6E" }}>
                    {s.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: "#171340" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#52546b" }}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section id="why" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#F5A623" }}>Why Serva Systems</p>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black" style={{ color: "#171340" }}>
              New Company, Clear Advantages
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 max-w-3xl mx-auto">
            {whyUs.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08} className="flex gap-3">
                <CheckIcon />
                <div>
                  <p className="font-bold text-sm" style={{ color: "#171340" }}>{item.title}</p>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: "#52546b" }}>{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-24" style={{ background: "#f8f9fb" }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#F5A623" }}>Get In Touch</p>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black" style={{ color: "#171340" }}>
              Let&apos;s Build Something
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Info */}
            <Reveal className="lg:col-span-2 flex flex-col gap-5">
              <div style={{ background: "#ffffff", borderRadius: 12, padding: "24px 28px", boxShadow: "0 2px 12px rgba(23,19,64,0.06)", borderLeft: "4px solid #F5A623" }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#F5A623", marginBottom: 8 }}>Office</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#171340", marginBottom: 2 }}>331 E Main Street, Suite 200</p>
                <p style={{ fontSize: 14, color: "#6B7280" }}>Rock Hill, SC 29730</p>
              </div>
              <div style={{ background: "#ffffff", borderRadius: 12, padding: "24px 28px", boxShadow: "0 2px 12px rgba(23,19,64,0.06)", borderLeft: "4px solid #F5A623" }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#F5A623", marginBottom: 8 }}>Email</p>
                <a href="mailto:hr@servasys.com" style={{ fontSize: 15, fontWeight: 600, color: "#171340" }}>hr@servasys.com</a>
              </div>
              <div style={{ background: "#ffffff", borderRadius: 12, padding: "24px 28px", boxShadow: "0 2px 12px rgba(23,19,64,0.06)", borderLeft: "4px solid #F5A623" }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#F5A623", marginBottom: 8 }}>Web</p>
                <a href="https://www.servasys.com" style={{ fontSize: 15, fontWeight: 600, color: "#171340" }}>www.servasys.com</a>
              </div>
            </Reveal>

            {/* Form */}
            <Reveal delay={0.1} className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8" style={{ boxShadow: "0 2px 16px rgba(23,19,64,0.06)" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#52546b" }}>Name</label>
                    <input
                      type="text" required value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: "#e7e8f0" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#52546b" }}>Email</label>
                    <input
                      type="email" required value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jane@company.com"
                      className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: "#e7e8f0" }}
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#52546b" }}>Message</label>
                  <textarea
                    required rows={5} value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your project..."
                    className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none"
                    style={{ borderColor: "#e7e8f0" }}
                  />
                </div>
                <button type="submit" className="btn-primary w-full sm:w-auto justify-center">
                  {formStatus === "sent" ? "Opening your email client..." : "Send Message"} <ArrowRight />
                </button>
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
