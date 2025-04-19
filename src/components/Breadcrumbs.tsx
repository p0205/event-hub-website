// src/components/Breadcrumbs.tsx
'use client'; // This is a Client Component because it uses usePathname

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React from 'react'; // Import React for Fragment

// Helper function to format URL segments into readable text
const formatSegment = (segment: string) => {
  if (!segment) return 'Home'; // Handle the root segment (empty string)

  // Replace hyphens with spaces and capitalize the first letter of each word
  const words = segment.replace(/-/g, ' ').split(' ');
  const formattedWords = words.map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  );
  return formattedWords.join(' ');
};

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Split the pathname by '/', filter out empty segments
  // Example: "/dashboard/create-event" -> ["dashboard", "create-event"]
  const segments = pathname.split('/').filter(segment => segment.length > 0);

  // Build the breadcrumb trail
  const breadcrumbItems = segments.map((segment, index) => {
    // Construct the URL path for this breadcrumb item
    // For "/dashboard/create-event", the paths are:
    // index 0: segment="dashboard", href="/dashboard"
    // index 1: segment="create-event", href="/dashboard/create-event"
    const href = '/' + segments.slice(0, index + 1).join('/');

    const isLast = index === segments.length - 1; // Check if this is the last segment
    const name = formatSegment(segment); // Format the segment text

    return (
      <React.Fragment key={href}>
        {/* Add a separator before this item if it's not the first one */}
        {index > 0 && (
          <span className="breadcrumb-separator"> &gt; </span>
        )}
        {/* If it's the last item, display as text (current page) */}
        {isLast ? (
          <span className="breadcrumb-current">{name}</span>
        ) : (
          // Otherwise, display as a link
          (<Link href={href} className="breadcrumb-link" legacyBehavior>
            {name}
          </Link>)
        )}
      </React.Fragment>
    );
  });

   // Add a "Home" breadcrumb at the beginning if not on the home page
   // The home page is "/"
   const homeBreadcrumb = pathname !== '/' ? (
     <React.Fragment>
       <Link href="/" className="breadcrumb-link">
         Home
       </Link>
       {/* Add a separator after Home if there are other segments */}
       {segments.length > 0 && <span className="breadcrumb-separator"> &gt; </span>}
     </React.Fragment>
   ) : null; // Don't show Home breadcrumb if already on the home page

  return (
    <nav aria-label="breadcrumb" className="breadcrumbs-container">
      {/* Render the Home breadcrumb if it exists */}
      {homeBreadcrumb}
      {/* Render the breadcrumb items based on URL segments */}
      {breadcrumbItems}
    </nav>
  );
}