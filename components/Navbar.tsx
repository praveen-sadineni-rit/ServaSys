"use client";

import { useState, useEffect } from "react";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Why Us", href: "#why" },
  { label: "Contact", href: "#contact" },
];

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2L35.6 11V29L20 38L4.4 29V11L20 2Z" fill="#2D2A6E" />
      <path d="M13 27L20 20L27 13" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="13" cy="27" r="3" fill="white" />
      <circle cx="20" cy="20" r="3" fill="white" />
      <circle cx="27" cy="13" r="4" fill="#F5A623" />
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
        scrolled ? "shadow-md" : "border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <a href="#top" className="flex items-center gap-3 flex-shrink-0">
            <Logo />
            <div>
              <div className="text-[#2D2A6E] font-black text-base leading-tight tracking-tight">SERVA</div>
              <div className="text-[#F5A623] font-semibold text-[9px] tracking-[0.15em] uppercase leading-tight">Systems LLC</div>
            </div>
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-5 text-sm font-semibold text-gray-700 hover:text-[#2D2A6E] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a href="#contact" className="btn-primary">
              Start a Conversation
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-gray-600 hover:text-[#2D2A6E] transition-colors p-2">
            {mobileOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="px-6 py-6 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm font-semibold text-gray-700 hover:text-[#2D2A6E] border-b border-gray-50 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4">
              <a href="#contact" onClick={() => setMobileOpen(false)} className="btn-primary w-full justify-center">
                Start a Conversation
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
