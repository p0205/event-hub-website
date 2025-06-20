// src/app/(main)/layout.tsx
// This layout applies to all routes within the (main) route group.

// Import your layout components
import Topbar from '@/components/Topbar';
import Sidebar from '@/components/Sidebar';
import { redirect } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { AuthProvider } from '@/context/AuthContext';
// import { getUserFromCookie } from '@/lib/auth';

// breadcrumb is likely something specific to your layout structure.
// In the App Router, passing props like this from the root layout
// to nested layouts isn't the standard pattern.
// If breadcrumbs are dynamic based on the route, consider generating
// them within a client component inside this layout or within the pages.
// For simplicity, we'll remove it as a prop here.

export default async function MainLayout({

  breadcrumb,
  children,
}: Readonly<{
  breadcrumb: React.ReactNode;
  children: React.ReactNode;
}>) {
  // const user = await getUserFromCookie();

  // if (!user) {
  //   redirect('/sign-in'); // this will not render anything before redirect
  // }
  return (
    // Note: The root app/layout.tsx provides the <html> and <body> tags.
    // This layout focuses on the structure within the body for the (main) group.

      <AuthGuard>
        <div className="flex flex-col min-h-screen">
          {/* The Topbar for routes in the (main) group */}
          <Topbar />

          {/* Container for the Sidebar and the main page content */}
          <div className="flex items-stretch flex-1">
            {/* The Sidebar for routes in the (main) group */}
            <div className="sidebar-container-wrapper bg-white shadow-md">
              <Sidebar />
            </div>

            {/* The main content area for pages within the (main) group */}
            <main className="flex-1 bg-gray-100 p-6 space-y-6 overflow-y-auto">
              {/* Remove {breadcrumb} unless you implement a way to provide it here */}
              {breadcrumb}
              <div>
                {children} {/* The content of your page files within (main) */}
              </div>
            </main>
          </div>
        </div>
      </AuthGuard>

  );
}