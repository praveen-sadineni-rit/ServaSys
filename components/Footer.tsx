import { Logo } from "./Navbar";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#171340" }} className="text-white pt-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12">
          {/* Brand */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <Logo />
              <div>
                <div className="text-white font-black text-base leading-tight tracking-tight">SERVA</div>
                <div className="font-semibold text-[9px] tracking-[0.15em] uppercase leading-tight" style={{ color: "#F5A623" }}>Systems LLC</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
              A newly founded technology partner. Systems, engineered to serve.
            </p>
            <div className="flex gap-4 mt-1">
              <a href="#" aria-label="LinkedIn" className="transition-opacity hover:opacity-80">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="4" fill="#0077B5" />
                  <path d="M7.5 9.5h-2v7h2v-7zm-1-3a1.15 1.15 0 1 0 0 2.3A1.15 1.15 0 0 0 6.5 6.5zM16.5 9.3c-1.4 0-2.1.6-2.5 1.1V9.5h-2v7h2v-3.8c0-.9.2-2.1 1.5-2.1s1.5 1.1 1.5 2v3.9h2v-4.1c0-2.4-1.2-3.1-2.5-3.1z" fill="white" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: "#F5A623" }}>
              Navigate
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Services", href: "#services" },
                { label: "About", href: "#about" },
                { label: "Why Serva Systems", href: "#why" },
                { label: "Contact", href: "#contact" },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: "#F5A623" }}>
              Contact
            </h3>
            <address className="not-italic text-sm space-y-1" style={{ color: "rgba(255,255,255,0.6)" }}>
              <p>331 E Main Street, Suite 200</p>
              <p>Rock Hill, SC 29730</p>
              <p className="mt-2">
                <a href="mailto:hr@servasys.com" className="hover:text-white transition-colors">hr@servasys.com</a>
              </p>
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="border-t py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}
        >
          <p>&copy; {new Date().getFullYear()} Serva Systems LLC. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
