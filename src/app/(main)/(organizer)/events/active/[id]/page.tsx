
// src/app/events/[id]/page.tsx
'use client'; // Mark as Client Component

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // To get route parameters (the event ID)
import eventService from '@/services/eventService';
import { Event, Session, TeamMember, Venue } from '@/types/event'; // Ensure Venue is imported
import { formatDate, formatDateTime } from '@/helpers/eventHelpers'; // Assuming this path is correct
import BudgetTable from '@/components/BudgetTable';



interface UserSearchResult {
  id: string;
  name: string;
  email: string;
}

// Mock User Search Results (keep for example)
const mockUserSearchResults: UserSearchResult[] = [
  { id: 'user-3', name: 'Charlie Brown', email: 'charlie.b@example.com' },
  { id: 'user-4', name: 'David Green', email: 'david.g@example.com' },
];



// --- Component Definition (NON-ASYNC) ---
export default function ActiveEventDetailsPage() {
  const params = useParams();
  // Ensure params.id exists and is handled correctly before parsing
  const eventIdString = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;
  const eventId = eventIdString ? Number(eventIdString) : null; // Now eventId can be null initially

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // State for QR Code display
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  // const [team, setTeam] = useState<TeamMember[]>([]); // Not used directly, event.team is used

  // --- State for grouped sessions ---
  // const [sessions, setSessions] = useState<Session[]>([]);
  // const [loadingSessions, setLoadingSessions] = useState(false); // Loading state for sessions specifically
  // const [sessionError, setSessionError] = useState<string | null>(null); // Error state for sessions

  // Assume current user ID is available (e.g., from auth context)
  const currentUserId = 1; // TODO: Replace with actual logged-in user ID

  // Effect 1: Fetch main event details
  useEffect(() => {
    // Only fetch if eventId is a valid number
    if (eventId === null || isNaN(eventId)) {
        setError("Invalid Event ID.");
        setLoading(false);
        return;
    }

    const fetchEventDetails = async () => {
      setLoading(true);
      setError(null);
      setEvent(null); // Reset event data on new fetch
      // setSessions([]); // Reset sessions
      // setSessionError(null);

      try {
        const fetchedEvent = await eventService.getEventById(eventId);
        if (!fetchedEvent) {
          throw new Error('Event not found');
        }
        console.log('Fetched Event:', fetchedEvent); // Debug log
        setEvent(fetchedEvent);
      } catch (e: any) {
        console.error("Failed to fetch event details:", e);
        setError(e.message || "Failed to load event details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();

    console.log("BUDGET");
    console.log(event?.eventBudgets[0].budgetCategoryName);

  }, [eventId]); // Refetch if eventId changes

  // // Effect 2: Process sessions AFTER event data is loaded
  // useEffect(() => {
  //   // Only run if event data exists, has venues, and sessions aren't already loaded/loading
  //   if (event && event.sessions && event.sessions.length > 0 && sessions.length === 0 && !loadingSessions) {
  //     const processSessions = async () => {
  //       setLoadingSessions(true);
  //       setSessionError(null);
  //       try {
  //         // Call the async groupSessions function
  //         const sessions = await groupSessions(event.eventVenues ?? []);
  //         setGroupedSessionsData(sessions); // Store results in state
  //       } catch (err: any) {
  //         console.error("Error processing sessions:", err);
  //         setSessionError("Failed to load session details."); // Set session-specific error
  //       } finally {
  //         setLoadingSessions(false);
  //       }
  //     };
  //     processSessions();
  //   } else if (event && (!event.eventVenues || event.eventVenues.length === 0)) {
  //        // Handle case where event exists but has no venues
  //        set([]);
  //        setLoadingSessions(false);
  //   }
    
  //   // Intentionally NOT depending on groupedSessionsData to avoid loops
  //   // Only depends on 'event' state changing and 'loadingSessions' state
  // }, [event, loadingSessions]); // Rerun when event data is fetched or if loading state changes


  // --- Handlers (Keep as they are, they correctly use async/await internally) ---
  const handleEditClick = () => {
    setIsEditing(!isEditing);
    console.log('Edit Event clicked');
  };


  // --- Rendering Logic ---
  if (loading) {
    return <div className="page-container"><p className="loading-message">Loading event details...</p></div>;
  }

  if (error) {
    return <div className="page-container"><p className="error-message">Error: {error}</p></div>;
  }

  if (!event) {
    // This state could be reached if eventId was invalid or fetch resulted in null without error state set properly
    return <div className="page-container"><p className="no-events-message">Event not found or could not be loaded.</p></div>;
  }

  // --- Render the component using 'event' and 'groupedSessionsData' states ---
  return (
    <div>
      {/* Event Header / Overview */}
      <div className="section-card form-container">
        <div className="flex justify-between items-center">
          <h1>{event.name}</h1>
          {currentUserId === event.organizerId && (
            <button onClick={handleEditClick} className="button-secondary">
              {isEditing ? 'Exit Edit Mode' : 'Edit Event'}
            </button>
          )}
        </div>
        <p><strong>Status:</strong> {event.status.replace('_', ' ')}</p>
        {event.participantsNo !== undefined && (
          <p><strong>Expected Participants:</strong> {event.participantsNo}</p>
        )}
        <div className="description-section">
          <p><strong>Description:</strong></p>
          <p>{event.description || 'No description provided.'}</p>
        </div>
      </div>

      {/* Budget Overview (Using event.eventBudgets) */}
      <div className="section-card form-container">
          <h2>Budget Overview</h2>
          {event.eventBudgets && event.eventBudgets.length > 0 ? (
            <BudgetTable budgets={event.eventBudgets} />
          ) : (
              <p>No budget information available for this event.</p>
          )}
      </div>


      {/* Sessions  */}
      <div className="section-card form-container">
          <h2>Sessions</h2>
          {event.sessions.length > 0 ? (
              <ul className="sessions-list">
                  {event.sessions.map((session, index) => (
                      <li key={`${session.sessionName}-${index}`} className="session-item"> {/* More stable key */}
                          {session.sessionName && <h3>{session.sessionName}</h3>}
                          <p><strong>Date:</strong> {formatDate(session.startDateTime)}</p>
                          <p><strong>Time:</strong> {formatDateTime(session.startDateTime)} - {formatDateTime(session.endDateTime)}</p>
                          {session.venues && session.venues.length > 0 ? (
                             <>
                                <p><strong>Venues:</strong></p>
                                <ul style={{ paddingLeft: '20px' }}>
                                    {session.venues.map((venue: Venue, idx: number) => (
                                        <li key={venue.id || idx}> {/* Prefer venue.id if available */}
                                            {venue.name} (Capacity: {venue.capacity})
                                        </li>
                                    ))}
                                </ul>
                             </>
                          ) : (
                             <p><strong>Venues:</strong> No venue details available.</p>
                          )}
                      </li>
                  ))}
              </ul>
          ) : (
               <p>No session information available for this event.</p> // Message when no sessions exist
          )}
      </div>

    </div>
  );
}