// src/app/active-events/page.tsx
'use client'; // Mark as Client Component

import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Import Link for navigation

// Define interfaces for the data structure of active events
// These should match the data structure you expect from your backend API
interface Venue {
  id: string;
  name: string;
  capacity: number;
}

interface Session {
  id: string;
  date: string; // Date in YYYY-MM-DD format
  startTime: string; // Time in HH:mm format
  endTime?: string;   // Optional end time in HH:mm format
  venue: Venue; // The venue object for this session
}

interface ActiveEvent { // Renamed to reflect the page's focus, but structure is general event info
  id: string; // Backend-assigned event ID - crucial for the details page link
  title: string;
  description: string; // Can show a snippet in the list
  sessions: Session[]; // Include session info for display in the list
  maxParticipants?: number;
  visibility: 'public' | 'private' | 'unlisted';
  status: 'active'; // Expected status for this page
  // Add other basic event details relevant for the list view
}

// --- MOCK ACTIVE EVENTS DATA ---
// In a real application, you would fetch this data from your backend API
const mockActiveEvents: ActiveEvent[] = [
  {
    id: 'event-active-1',
    title: 'Weekly Team Sync',
    description: 'Regular check-in with the team to discuss progress.',
    sessions: [
      {
        id: 'session-a1-1',
        date: '2025-04-21', // Example date in the near future
        startTime: '10:00',
        endTime: '11:00',
        venue: { id: 'venue-b', name: 'Conference Room 1', capacity: 50 },
      },
    ],
    maxParticipants: 15,
    visibility: 'private',
    status: 'active',
  },
  {
    id: 'event-active-2',
    title: 'Client Demo - New Feature',
    description: 'Demonstration of the upcoming feature for our client.',
    sessions: [
      {
        id: 'session-a2-1',
        date: '2025-04-23',
        startTime: '15:00',
        endTime: '16:00',
        venue: { id: 'venue-d', name: 'Meeting Room 3', capacity: 25 },
      },
    ],
    maxParticipants: 5,
    visibility: 'public', // Could be public if it's a public demo
    status: 'active',
  },
    {
    id: 'event-active-3',
    title: 'Monthly All-Hands Meeting',
    description: 'Company-wide meeting to share updates and announcements.',
    sessions: [
      {
        id: 'session-a3-1',
        date: '2025-05-01', // Example date
        startTime: '09:00',
        endTime: '10:00',
        venue: { id: 'venue-c', name: 'Auditorium', capacity: 200 },
      },
    ],
    maxParticipants: 180,
    visibility: 'private',
    status: 'active',
  },
  // Add more mock active events as needed
];
// ---------------------------------


export default function ActiveEventsPage() {
  const [activeEvents, setActiveEvents] = useState<ActiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch active events when the component mounts
  useEffect(() => {
    const fetchActiveEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with your actual API endpoint to fetch active events for the current organizer
        // You will need to pass authentication tokens or cookies here.
        // The API should return events with status 'active' for the logged-in organizer.
        // Example API endpoint: '/api/my-events?status=active'
        // For now, we use mock data:
        const response = await Promise.resolve({ // Simulate an API call with mock data
             ok: true,
             json: () => Promise.resolve(mockActiveEvents)
        });

        // const response = await fetch('/api/my-events?status=active', {
        //     // Include auth headers
        // });


        // if (!response.ok) {
        //   throw new Error(`HTTP error! status: ${response.status}`);
        // }
        const data: ActiveEvent[] = await response.json();
        setActiveEvents(data);

      } catch (e: any) {
        console.error("Failed to fetch active events:", e);
        setError("Failed to load active events. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveEvents();
  }, []); // Empty dependency array ensures this runs only once on mount

  if (loading) {
    return (
      <div className="page-container">
        <h1>Active Events</h1>
        <div className="loading-message">Loading active events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <h1>Active Events</h1>
        <div className="error-message" style={{ color: 'red' }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Active Events</h1>

      {activeEvents.length === 0 ? (
        <div className="no-events-message form-container"> {/* Use form-container style for the message box */}
          No active events found at this time.
        </div>
      ) : (
        <div className="events-list">
          {activeEvents.map(event => (
            // Wrap each event item in a Link component
            <Link href={`/events/${event.id}`} key={event.id} passHref legacyBehavior>
              <a className="event-item-link"> {/* Use an anchor tag with a class for styling */}
                <div className="event-item form-container"> {/* Apply item styling */}
                  <h2>{event.title}</h2>
                   {/* Display some basic info */}
                   <p><strong>Status:</strong> {event.status}</p>
                   {event.maxParticipants !== undefined && (
                    <p><strong>Expected Participants:</strong> {event.maxParticipants}</p>
                   )}
                   {/* You can add more basic info or a snippet of description here */}
                    {event.sessions && event.sessions.length > 0 && (
                        <p><strong>First Session:</strong> {event.sessions[0].date} at {event.sessions[0].startTime} at {event.sessions[0].venue.name}</p>
                    )}
                   {/* Note: Full details should be on the dedicated event details page */}
                </div>
              </a>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}