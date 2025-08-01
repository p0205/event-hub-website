// src/app/(main)/layout.tsx
// This layout applies to all routes within the (main) route group.

import Topbar from '@/components/Topbar';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
export default async function MainLayout({

  breadcrumb,
  children,
}: Readonly<{
  breadcrumb: React.ReactNode;
  children: React.ReactNode;
}>) {

  return (

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