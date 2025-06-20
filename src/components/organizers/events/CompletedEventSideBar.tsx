// src/components/EventSubmenuSidebar.tsx
'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import React from 'react';

// Define the submenu items for an individual event
const eventManagementItems = [
    { name: 'Overview', hrefSegment: '' }, // Segment for the URL
    { name: 'Team', hrefSegment: 'team' },
    { name: 'Budget', hrefSegment: 'budget' },
    { name: 'Participants', hrefSegment: 'participants' },
    { name: 'Attendance', hrefSegment: 'attendance' },
    { name: 'Media', hrefSegment: 'media' },
    { name: 'Reports', hrefSegment: 'reports' },

];

export default function CompletedEventSubmenuSidebar() {
    const params = useParams();
    const eventId = params.id as string; // Get the event ID from the URL
    const pathname = usePathname(); // Get the current path

    // Determine the base path for this event (e.g., /my-events/event-active-1)
    const eventBasePath = `/my-events/completed/${eventId}`;

    // Function to determine if a submenu link is active
    const isSubmenuLinkActive = (hrefSegment: string) => {
        // The full path for a submenu item is /my-events/[id]/hrefSegment
        const itemPath = `${eventBasePath}/${hrefSegment}`;
        // Check if the current pathname exactly matches the item path
        // or starts with it for nested routes within a submenu section (less common)
        // For 'overview', it should also be active on the base /my-events/[id] path
         if (hrefSegment === '') {
             return pathname === eventBasePath ;
         }
        return pathname.startsWith(itemPath);
    };

    return (
        // This will be the event-specific sidebar
        <aside className="event-submenu-sidebar">
            <div className="event-submenu-header">
                 {/* Optional: Display the Event Title here (might need to fetch it or pass it down) */}
                 {/* <h3>Event Title Placeholder</h3> */}
                 {/* Link back to the main Events grid page */}
                 <Link href="/my-events" className="back-to-events-link">
                     &lt; All Events {/* Use &lt; for < */}
                 </Link>
            </div>
            <nav>
                <ul className="event-submenu-nav-list">
                    {eventManagementItems.map(item => (
                        <li key={item.name} className={`event-submenu-nav-item ${isSubmenuLinkActive(item.hrefSegment) ? 'completed' : ''}`}>
                            {/* Link to the specific event management sub-page */}
                            <Link href={`${eventBasePath}/${item.hrefSegment}`} className="event-submenu-nav-link">
                                {/* Optional: Add icons for each submenu item */}
                                {/* <span className="event-submenu-icon"></span> */}
                                <span className="event-submenu-nav-text">{item.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}