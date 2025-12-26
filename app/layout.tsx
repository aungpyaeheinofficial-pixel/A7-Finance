import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Myanmar Finance AI | Business Advisor',
  description: 'AI-powered Financial Operating Brain for Myanmar SMEs, Banks, and Financial Institutions',
  keywords: 'Myanmar, Finance, AI, Business Advisor, SME, Banking, Financial Analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="my">
      <head>
        {/* Fonts - Inter for English, Noto Sans Myanmar for Burmese */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Myanmar:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        
        {/* Favicon */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%234A90E2'/><text y='.9em' font-size='70' x='15'>✓</text></svg>" />
        
        {/* Meta */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#4A90E2" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
