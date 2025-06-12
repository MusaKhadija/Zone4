import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zone4 - Foreign Exchange, Simplified',
  description: 'Trade currencies safely with verified agents in Nigeria. Secure, transparent, and regulated by CBN.',
  keywords: 'currency exchange, Nigeria, BDC, foreign exchange, Zone4, secure trading',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#2E7D32',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}