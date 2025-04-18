// src/app/pending-events/page.tsx
'use client'; // Mark as Client Component because it uses useEffect for data fetching

import React, { useState, useEffect } from 'react';

// Define interfaces for the data structure of pending events
// These should match the data structure you expect from your backend API
interface Venue {
  id: string;
  name: string;
  capacity: number;
  // Add other venue details if your API returns them
}

interface Session {
  id: string; // Backend-assigned session ID
  date: string; // Date in YYYY-MM-DD format
  startTime: string; // Time in HH:mm format
  endTime?: string;   // Optional end time in HH:mm format
  venue: Venue; // The venue object for this session
  // eventId: string; // Link back to the parent event (may or may not be in the session object from API)
}

interface PendingEvent {
  id: string; // Backend-assigned event ID
  title: string;
  description: string;
  sessions: Session[]; // Array of sessions for this event
  maxParticipants?: number; // Optional, if not always set
  visibility: 'public' | 'private' | 'unlisted';
  status: 'pending_approval'; // Expected status for this page
  // Add other event details like organizer, creation date, etc. if needed
}

// --- MOCK PENDING EVENTS DATA ---
// In a real application, you would fetch this data from your backend API
const mockPendingEvents: PendingEvent[] = [
  {
    id: 'event-pending-1',
    title: 'Quarterly Review Meeting',
    description: 'Review performance for the last quarter and plan for the next.',
    sessions: [
      {
        id: 'session-p1-1',
        date: '2025-05-25',
        startTime: '14:00',
        endTime: '16:00',
        venue: { id: 'venue-b', name: 'Conference Room 1', capacity: 50 },
      },
    ],
    maxParticipants: 30,
    visibility: 'private',
    status: 'pending_approval',
  },
  {
    id: 'event-pending-2',
    title: 'Product Launch Webinar',
    description: 'Introducing our new product line to the market.',
    sessions: [
      {
        id: 'session-p2-1',
        date: '2025-06-10',
        startTime: '10:00',
        endTime: '11:30',
        venue: { id: 'venue-a', name: 'Grand Hall', capacity: 500 }, // Could be a webinar platform conceptually
      },
      {
        id: 'session-p2-2',
        date: '2025-06-10', // Same day, different time/venue conceptually
        startTime: '18:00',
        endTime: '19:30',
        venue: { id: 'venue-c', name: 'Auditorium', capacity: 200 },
      },
    ],
    maxParticipants: 150,
    visibility: 'public',
    status: 'pending_approval',
  },
  // Add more mock pending events as needed
];
// ---------------------------------


export default function PendingEventsPage() {
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pending events when the component mounts
  useEffect(() => {
    const fetchPendingEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with your actual API endpoint to fetch pending events for the current organizer
        // You will need to pass authentication tokens or cookies here.
        // The API should return events with status 'pending_approval' for the logged-in organizer.
        // Example API endpoint: '/api/my-events?status=pending_approval'
        // For now, we use mock data:
        const response = await Promise.resolve({ // Simulate an API call with mock data
             ok: true,
             json: () => Promise.resolve(mockPendingEvents)
        });

        // const response = await fetch('/api/my-events?status=pending_approval', {
        //     // Include auth headers
        // });


        // if (!response.ok) {
        //   throw new Error(`HTTP error! status: ${response.status}`);
        // }
        const data: PendingEvent[] = await response.json();
        setPendingEvents(data);

      } catch (e: any) {
        console.error("Failed to fetch pending events:", e);
        setError("Failed to load pending events. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingEvents();
  }, []); // Empty dependency array ensures this runs only once on mount

  if (loading) {
    return (
      <div className="page-container">
        <h1>Pending Events</h1>
        <div className="loading-message">Loading pending events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <h1>Pending Events</h1>
        <div className="error-message" style={{ color: 'red' }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Pending Events</h1>

      {pendingEvents.length === 0 ? (
        <div className="no-events-message form-container"> {/* Use form-container style for the message box */}
          No events pending approval at this time.
        </div>
      ) : (
        <div className="events-list">
          {pendingEvents.map(event => (
            <div key={event.id} className="event-item form-container"> {/* Use form-container style for each event */}
              <h2>{event.title}</h2>
              <p><strong>Status:</strong> {event.status.replace('_', ' ')}</p> {/* Display status, format it */}
              <p><strong>Description:</strong> {event.description}</p>
              {event.maxParticipants !== undefined && (
                <p><strong>Expected Participants:</strong> {event.maxParticipants}</p>
              )}
              <p><strong>Visibility:</strong> {event.visibility}</p>

              {/* Display Event Sessions */}
              {event.sessions && event.sessions.length > 0 && (
                <div className="event-sessions">
                  <h3>Sessions:</h3>
                  <ul>
                    {event.sessions.map((session, index) => (
                      <li key={session.id}>
                        <strong>Session {index + 1}:</strong>
                        <p>Date: {session.date}</p>
                        <p>Time: {session.startTime} {session.endTime && `- ${session.endTime}`}</p>
                        <p>Venue: {session.venue.name} (Capacity: {session.venue.capacity})</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Add more event details here as needed */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}