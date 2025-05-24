// src/app/events/page.tsx
'use client'; // Client component for data fetching and state

import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Import Link for navigation
import EventCard from '@/components/organizers/events/EventCard'; // Import the reusable card component
import { EventStatus, SimpleEvent } from '@/types/event';
import { eventService } from '@/services';
import { useAuth } from '@/context/AuthContext';

export default function EventsLandingPage() {
  const { user } = useAuth();
  const [activeEvents, setActiveEvents] = useState<SimpleEvent[]>([]);
  const [pendingEvents, setPendingEvents] = useState<SimpleEvent[]>([]);
  const [completedEvents, setCompletedEvents] = useState<SimpleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // State to manage the expanded/collapsed state of each section
  const [isActiveExpanded, setIsActiveExpanded] = useState(true);
  const [isPendingExpanded, setIsPendingExpanded] = useState(true);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);

  // Handler for the search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // --- Filtering Logic ---
  // Filter each event list based on the search term
  const filteredActiveEvents = activeEvents.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPendingEvents = pendingEvents.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompletedEvents = completedEvents.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // --- End Filtering Logic ---

  // Function to toggle the expansion state of a section
  const toggleSectionExpansion = (section: EventStatus.ACTIVE | EventStatus.PENDING | EventStatus.COMPLETED) => {

    switch (section) {
      case EventStatus.ACTIVE:
        setIsActiveExpanded(!isActiveExpanded);
        break;
      case EventStatus.PENDING:
        setIsPendingExpanded(!isPendingExpanded);
        break;
      case EventStatus.COMPLETED:
        setIsCompletedExpanded(!isCompletedExpanded);
        break;
      default:
        break;
    }
  };


  // Fetch events when the component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const eventList = await eventService.fetchEvents(user.id); // Pass the organizerId if needed
        setActiveEvents(eventList.activeEvents);
        setPendingEvents(eventList.pendingEvents);
        setCompletedEvents(eventList.completedEvents);

      } catch (e: any) {
        console.error("Failed to fetch events:", e);
        setError(`Failed to load events: ${e.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []); // Empty dependency array means run once on mount

  if (loading) {
    return (
      <div className="page-container"> {/* Reuse page container style */}
        <h1>Events</h1>
        <p className="loading-message">Loading events...</p> {/* Reuse loading message style */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <h1>Events</h1>
        <p className="error-message">Error: {error}</p> {/* Reuse error message style */}
      </div>
    );
  }

  return (
    <div className="page-container"> {/* Reuse page container style */}
      {/* Breadcrumbs will be rendered by the layout */}
      <h1>Events</h1>


      {/* Search Bar */}
      <div className="event-search-bar" style={{ marginBottom: '30px' }}>
        <label htmlFor="event-search" className="form-label"></label> {/* Reuse label style */}

        {/* --- New Wrapper for Icon and Input --- */}
        <div className="search-input-container">
          <span className="search-icon"> {/* Icon Element */}
            🔍 {/* Search icon character - you can use an SVG or icon font here */}
          </span>
          <input
            type="text"
            id="event-search"
            className="form-input" // Reuse form input style for basic input styles
            value={searchTerm}
            onChange={handleSearchInputChange}
            placeholder="Search Event"
          />
        </div>
        {/* --- End New Wrapper --- */}
      </div>



      {/* Link to Create New Event - can be placed here or in the sidebar */}
      <div className="create-event-link" style={{ marginBottom: '30px' }}>
        <Link href="/events/create" className="button-primary"> {/* Reuse button primary style */}
          + Create New Event
        </Link>
      </div>


      {/* Active Events Section */}
      <div className="events-section">
        <div className="section-header"> {/* Container for title and button */}
          {/* Collapse Button - Now placed BEFORE the h2 */}
          <button
            className="collapse-button"
            onClick={() => toggleSectionExpansion(EventStatus.ACTIVE)}
            aria-expanded={isActiveExpanded} // Accessibility attribute
          >
            {/* Use a simple character for the arrow/caret */}
            {/* Rotate the character based on state */}
            {isActiveExpanded ? '▼' : '►'}
          </button>
          {/* Section Title */}
          <h2>Active Events</h2>
        </div>
        {/* Conditionally render the grid based on state */}
        {isActiveExpanded && (
          activeEvents.length === 0 ? (
            <p className="no-events-message">No active events found.</p>
          ) : (
            <div className="event-grid"> {/* CSS Grid container */}
              {activeEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )
        )}
      </div>

      {/* Pending Events Section */}
      <div className="events-section">
        <div className="section-header"> {/* Container for title and button */}
          {/* Collapse Button */}
          <button
            className="collapse-button"
            onClick={() => toggleSectionExpansion(EventStatus.PENDING)}
            aria-expanded={isPendingExpanded} // Accessibility attribute
          >
            {isPendingExpanded ? '▼' : '►'}
          </button>
          {/* Section Title */}
          <h2>Pending Approval</h2>
        </div>
        {/* Conditionally render the grid based on state */}
        {isPendingExpanded && (
          pendingEvents.length === 0 ? (
            <p className="no-events-message">No events pending approval.</p>
          ) : (
            <div className="event-grid">
              {pendingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )
        )}
      </div>

      {/* Completed Events Section */}
      <div className="events-section">
        <div className="section-header"> {/* Container for title and button */}
          {/* Collapse Button */}
          <button
            className="collapse-button"
            onClick={() => toggleSectionExpansion(EventStatus.COMPLETED)}
            aria-expanded={isCompletedExpanded} // Accessibility attribute
          >
            {isCompletedExpanded ? '▼' : '►'}
          </button>
          {/* Section Title */}
          <h2>Completed Events</h2>
        </div>
        {/* Conditionally render the grid based on state */}
        {isCompletedExpanded && (
          completedEvents.length === 0 ? (
            <p className="no-events-message">No completed events found.</p>
          ) : (
            <div className="event-grid">
              {completedEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )
        )}
      </div>

    </div>
  );
}