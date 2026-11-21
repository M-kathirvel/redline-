import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Redline Marketing | Make Your Brand Impossible to Ignore",
  description: "Coimbatore's digital growth partner for social media, branding, ads, SEO, content, strategy, and promotion shoots.",
  openGraph: {
    title: "Redline Marketing",
    description: "Social media • Branding • Ads • SEO • Content • Strategy",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
