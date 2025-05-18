// src/app/layout.tsx
import './globals.css'; // Make sure your global styles are imported here

import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'FTMK Event Hub', // Your app title
  description: 'Your event management platform', // Your app description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {/*
            The children prop here will be the content of either:
            - The layout.tsx within a route group (e.g., app/(main)/layout.tsx)
            - A page.tsx directly under app/ or another route group without a layout.tsx (e.g., app/signup/page.tsx)
          */}
          {children}
        </AuthProvider>
        <Toaster richColors position="bottom-center" /> {/* Global Toaster */}
      </body>
    </html>
  );
}