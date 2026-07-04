import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Serva Systems LLC | Technology Systems, Engineered to Serve",
  description:
    "Serva Systems LLC is a newly founded technology partner delivering software development, cloud engineering, and IT systems consulting built around your business.",
  keywords:
    "software development, cloud engineering, IT systems consulting, staff augmentation, Rock Hill SC, technology partner",
  authors: [{ name: "Serva Systems LLC" }],
  openGraph: {
    title: "Serva Systems LLC | Technology Systems, Engineered to Serve",
    description: "A newly founded technology partner built around your business.",
    url: "https://servasys.com",
    siteName: "Serva Systems LLC",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
