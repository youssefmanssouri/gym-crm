import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://gym-crm-gules.vercel.app'),
  title: {
    default: 'Apex Gym CRM & Management System',
    template: '%s | Apex Gym CRM',
  },
  description:
    'Modern Fitness Facility & Member Management System featuring AI workout generation, nutrition planning, QR attendance terminals, and facility operations dashboard.',
  keywords: [
    'gym crm',
    'fitness management',
    'gym software',
    'workout planner',
    'nutrition software',
    'attendance terminal',
    'next.js crm',
    'youssef manssouri',
  ],
  authors: [{ name: 'Youssef Manssouri', url: 'https://www.youssefmanssouri.site' }],
  creator: 'Youssef Manssouri',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gym-crm-gules.vercel.app',
    title: 'Apex Gym CRM & Management System',
    description:
      'Modern Fitness Facility & Member Management System featuring AI workout generation, nutrition planning, QR attendance terminals, and facility operations dashboard.',
    siteName: 'Apex Gym CRM',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apex Gym CRM & Management System',
    description:
      'Modern Fitness Facility & Member Management System featuring AI workout generation and facility operations.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Apex Gym CRM & Management System',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  author: {
    '@type': 'Person',
    name: 'Youssef Manssouri',
    url: 'https://www.youssefmanssouri.site',
  },
  description:
    'Modern Fitness Facility & Member Management System featuring AI workout generation, nutrition planning, QR attendance terminals, and facility operations dashboard.',
  offers: {
    '@type': 'Offer',
    price: '0.00',
    priceCurrency: 'USD',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-zinc-950 text-zinc-100 antialiased font-sans">{children}</body>
    </html>
  );
}
