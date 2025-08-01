
// src/app/my-events/[id]/page.tsx
'use client'; // Mark as Client Component

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // To get route parameters (the event ID)
import eventService from '@/services/eventService';
import { Event, Venue } from '@/types/event'; // Ensure Venue is imported
import { formatDate, formatDateTime } from '@/helpers/eventHelpers'; // Assuming this path is correct
import BudgetTable from '@/components/BudgetTable';




export default function CompletedEventDetailsPage() {
  const params = useParams();
  // Ensure params.id exists and is handled correctly before parsing
  const eventIdString = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;
  const eventId = eventIdString ? Number(eventIdString) : null; // Now eventId can be null initially

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



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
      } catch (err: unknown) {
        console.error("[ParticipantReviewUI] Failed to save participants:", err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage || "Failed to load event details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();

  }, [eventId]); // Refetch if eventId changes


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
      <div className='page-header'>
        <div className={'page-title-section'}>
          <h2>{event.name}</h2>

        </div>
      </div>
      {/* Event Header / Overview */}
      <div className="section-card form-container">
        <div className="flex justify-between items-center">

          {/*            
          {currentUserId === event.organizerId && (
            <button onClick={handleEditClick} className="button-secondary">
              {isEditing ? 'Exit Edit Mode' : 'Edit Event'}
            </button>
          )} */}
        </div>
        <p><strong>Status:</strong> {event.status.replace('_', ' ')}</p>
        {event.participantsNo !== undefined && (
          <p><strong>Expected Participants:</strong> {event.participantsNo}</p>
        )}
        <p><strong>Event Type:</strong> {event.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</p>

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
                          {venue.name}
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