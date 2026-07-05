/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  async rewrites() {
    // The route folder is /Timesheet (capital T) and Next.js filesystem routing
    // is case-sensitive, so the lowercase /timesheet people type would 404.
    // A rewrite (internal, not a redirect) serves the same content without a new
    // request — so no redirect loop despite Next matching sources case-insensitively.
    return [
      { source: "/timesheet", destination: "/Timesheet" },
      { source: "/timesheet/:path*", destination: "/Timesheet/:path*" },
    ];
  },
};

module.exports = nextConfig;
