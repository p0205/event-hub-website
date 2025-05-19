// src/app/(auth)/layout.tsx
import React from 'react';
import "./auth.css";

// This layout will wrap all pages within the (auth) route group,
// such as /signup and /login.
// It inherits the root layout's <html>, <body>, AuthProvider, and Toaster.

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Apply the background color and centering styles here.
    // min-h-screen ensures it takes at least the full viewport height.
    // flex, items-center, justify-center are common for centering content.
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/*
        The 'children' prop will render the specific page content,
        e.g., the component from app/(auth)/signup/page.tsx
      */}
      {children}
    </div>
  );
}