// src/app/layout.tsx
import './globals.css'; // Make sure your global styles are imported here

// Import your layout components
import Topbar from '@/components/Topbar';
import Sidebar from '@/components/Sidebar'; // Make sure this is your modified Sidebar.tsx
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'FTMK Event Hub', // Your app title
  description: 'Your event management platform', // Your app description
};

export default function RootLayout({
  breadcrumb,
  children,
}: Readonly<{
  breadcrumb: React.ReactNode;
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {/* Main container for the entire app layout - uses flex column to stack Topbar above content */}
          {/* Apply min-h-screen here */}
          <div className="flex flex-col min-h-screen">

            {/* The global Topbar */}
            <Topbar />

            {/* Container for the Sidebar and the main page content - uses flex row */}
            {/* flex-1 allows this div to take remaining vertical space */}
            {/* items-stretch makes children stretch vertically */}
            <div className="flex items-stretch min-h-screen">

              {/* The global Sidebar - Assuming the Sidebar component itself has the narrow-sidebar class defining its width and background */}
              {/* Remove the w-64 bg-white shadow-md classes from this wrapper div */}
              {/* The Sidebar component's root should occupy 100% height of this div */}
              <div className="sidebar-container-wrapper bg-white shadow-md"> {/* Optional wrapper for clarity */}
                <Sidebar /> {/* Your Sidebar component */}
              </div>


              {/* The main content area where individual pages will be rendered */}
              {/* flex-1 takes remaining horizontal space, overflow-y-auto allows scrolling */}
              {/* Ensure p-6 and space-y-6 are correct for your main content spacing */}
              <main className=" flex-1 bg-gray-100 p-6 space-y-6 overflow-y-auto">
                {/* Breadcrumbs are within the main content area */}
                {breadcrumb}

                {/* Add some space between breadcrumbs and page content */}
                <div>
                  {children} {/* The content of your page files */}
                </div>
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}