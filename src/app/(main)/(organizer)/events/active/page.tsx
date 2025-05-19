// src/app/events/active/page.tsx

// src/app/events/page.tsx
'use client'; // Client component for data fetching and state


import Link from 'next/link'; // Import Link for client-side navigation

// Import your event service to fetch event data
import eventService from '@/services/eventService';

// Import the necessary types from your types file
// Ensure the path is correct (@/types/event) and src/types/event.ts is saved
import {
    EventStatus,
    SimpleEvent, // Import EventStatus enum
} from '@/types/event';

// Import helper functions for date formatting
// Ensure the path is correct (@/lib/formatters) and src/lib/formatters.ts is saved
import {
    formatDate, // Helper to format date only
    formatDateTime, // Helper to format date and time (for created at)
} from '@/helpers/eventHelpers';
import { useEffect, useState } from 'react';


// The page component is defined as an async function.
// In Server Components, you can perform asynchronous operations like data fetching directly here.
export default function ActiveEventsPage() {

    const [activeEvents, setActiveEvents] = useState<SimpleEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const currentUserId = 1; // TODO: Replace with actual logged-in user ID

    // Effect 1: Fetch main event details
    useEffect(() => {
      // Only fetch if eventId is a valid number
      const fetchActiveEvents = async () => {
        setLoading(true);
        setError(null);
        setActiveEvents([]); // Reset event data on new fetch
  
        try {
          const activeEvents = await eventService.getEventsByStatus(currentUserId,EventStatus.ACTIVE);
          if (!activeEvents) {
            throw new Error('Failed to fetch active events');
          }
          console.log('Fetched Event:', activeEvents); // Debug log
          setActiveEvents(activeEvents);
        } catch (e: any) {
          console.error("Failed to fetch active events:", e);
          setError(e.message || "Failed to fetch active events. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      fetchActiveEvents();
    }, []); 
  
    // --- Conditional Rendering based on Fetch Result ---

    // If there was an error during fetching, display an error message page.
    if (error) {
         return (
              <div className="page-container"> {/* Use global page container style */}
                  <h1>Active Events</h1>
                  <p className="error-message">{error}</p> {/* Display the specific error message */}
              </div>
         );
    }

    // If no active events were found after fetching, display a message.
    if (activeEvents.length === 0) {
         return (
              <div className="page-container"> {/* Use global page container style */}
                  <h1>Active Events</h1>
                  <p className="info-message">No active events found at this time.</p> {/* Use info-message class */}
              </div>
         );
    }


    // --- Render the List of Active Events if Data is Successfully Fetched ---

    // If data is successfully fetched and there are events, render the list.
    return (
        <div className="page-container"> {/* Use global page container style */}
            <h1>Active Events</h1>

            {/* List container */}
            <ul className="event-list"> {/* Add a class for styling the list */}
                {/* Map over the activeEvents array to display each event */}
                {activeEvents.map((event) => (
                    // Use the event ID as the unique key for each list item
                    <li key={event.id} className="event-list-item"> {/* Add a class for styling each list item */}
                        {/* Use Link component for navigation to the event details page */}
                        {/* The href uses the dynamic route segment /events/active/[id] */}
                        <Link href={`/events/active/${event.id}`} className="event-list-link"> {/* Add a class for the link area */}
                            {/* Content within the link */}
                            <div className="event-list-details"> {/* Container for event details */}
                                <h2 className="event-list-title">{event.name}</h2> {/* Event Name */}
                                <p className="event-list-meta"> {/* Container for meta info */}
                                    {/* Expected Participants: <strong>{event.participantsNo}</strong> | */}
                                    Date: <strong>{formatDate(event.startDateTime)}</strong> | {/* Format event date */}
                                    Created At: <strong>{formatDateTime(event.createdAt)}</strong> {/* Format created at date (using start date as fallback) */}
                                </p>
                                {/* Add other details if needed */}
                                {/* <p>{event.description}</p> */}
                            </div>
                            {/* The ">" icon or indicator for navigation */}
                            <div className="event-list-indicator"> {/* Container for the indicator */}
                                &gt; {/* HTML entity for > */}
                                {/* Or use an icon like Font Awesome: <i className="fas fa-chevron-right"></i> */}
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>

        </div>
    );
}
