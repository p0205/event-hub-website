// src/app/layout.tsx
import AuthGuard from '@/components/AuthGuard';
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
        <AuthGuard>
            {children}
          </AuthGuard>
        </AuthProvider>
        <Toaster richColors position="bottom-center" /> {/* Global Toaster */}
      </body>
    </html>
  );
}