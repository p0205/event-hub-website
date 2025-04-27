// src/app/events/active/[id]/layout.tsx

import EventSubmenuSidebar from '@/components/organizers/events/EventSideBar'; // Import the new Event Submenu Sidebar

// Layout for individual event pages (/events/[id] and its sub-routes)
export default function EventDetailLayout({
  children, // This will be the nested page components (e.g., overview/page.tsx, participants/page.tsx)
  params, // Get the event ID from the route parameters
}: {
  children: React.ReactNode;
  params: { id: string }; // Define params type
}) {
//   const eventId = params.id; // Access the event ID

  // Return the layout structure directly, without <html> or <body>
  return (
    <div className="flex items-stretch flex-1 event-content-panel-wrapper">

       {/* Secondary Event Submenu Sidebar */}
       {/* This sidebar is specific to this layout */}
       <EventSubmenuSidebar /> {/* Pass nothing, it gets ID from useParams */}


      {/* The main content area where individual pages will be rendered */}
      {/* flex-1 takes remaining horizontal space, overflow-y-auto allows scrolling */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Breadcrumbs are within the main content area */}
      

        {/* Add some space between breadcrumbs and page content */}
        <div>
            
          {children} {/* The content of the nested page files */}
        </div>
      </main>
    </div>
  );
}