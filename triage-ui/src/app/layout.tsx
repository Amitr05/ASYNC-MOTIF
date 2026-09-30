import type { Metadata } from "next";
import "./globals.css";

/*
 * Typefaces are self-hosted through npm (@fontsource-variable/*), not Google Fonts,
 * so `next build` works without network access (Docker, CI, offline demos).
 * Inter substitutes for Atlassian Sans (not publicly licensed);
 * JetBrains Mono is the evidence typeface for quotes, ARR figures and Gherkin.
 */

export const metadata: Metadata = {
  title: "Motif — Your users already wrote the roadmap",
  description:
    "Turn customer feedback into an evidence-backed, revenue-ranked roadmap.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
