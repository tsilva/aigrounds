import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@/components/google-analytics";
import "./globals.css";

const SITE_URL = "https://aigrounds.tsilva.eu";
const SITE_TITLE = "AI Grounds | Interactive AI Playgrounds";
const SITE_DESCRIPTION = "Learn AI concepts through hands-on interactive playgrounds. Explore Monte Carlo Tree Search, algorithms, and machine learning concepts visually. Free educational platform for AI learners.";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    "AI education",
    "machine learning",
    "interactive learning",
    "Monte Carlo Tree Search",
    "MCTS",
    "algorithms",
    "AI playground",
    "educational platform",
    "AI concepts",
    "visual learning",
    "programming education",
    "computer science",
  ],
  authors: [{ name: "Tiago Silva" }],
  creator: "Tiago Silva",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      {
        url: "/brand/web-seo/favicon/favicon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/brand/web-seo/favicon/favicon-48.png",
        sizes: "48x48",
        type: "image/png",
      },
    ],
    apple: "/brand/web-seo/apple-touch-icon.png",
  },
  manifest: "/brand/web-seo/site.webmanifest",
  openGraph: {
    title: SITE_TITLE,
    description: "Interactive AI playgrounds for learning algorithms and machine learning concepts through hands-on exploration. Start with Monte Carlo Tree Search.",
    type: "website",
    url: SITE_URL,
    siteName: "AI Grounds",
    locale: "en_US",
    images: [
      {
        url: "/brand/web-seo/og-image-1200x630.png",
        width: 1200,
        height: 630,
        alt: "AI Grounds interactive AI playgrounds",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: "Learn AI concepts through interactive playgrounds. Explore algorithms visually with Monte Carlo Tree Search.",
    creator: "@tiagosilva",
    images: ["/brand/web-seo/og-image-1200x630.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "AI Grounds",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  author: {
    "@type": "Person",
    name: "Tiago Silva",
    url: "https://www.tsilva.eu",
  },
  applicationCategory: "EducationalApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
