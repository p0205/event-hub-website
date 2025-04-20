// src/app/events/page.tsx
'use client'; // Client component for data fetching and state

import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Import Link for navigation
import EventCard from '@/components/organizers/events/EventCard'; // Import the reusable card component

// Define the interface for the event data needed on this page
interface EventSummary {
  id: string;
  title: string;
  status: 'active' | 'pending_approval' | 'completed' | string; // Include other statuses if needed
  // Add other minimal fields needed for the card display if any
  // Example: nextSessionDate?: string;
}

export default function EventsLandingPage() {
  const [activeEvents, setActiveEvents] = useState<EventSummary[]>([]);
  const [pendingEvents, setPendingEvents] = useState<EventSummary[]>([]);
  const [completedEvents, setCompletedEvents] = useState<EventSummary[]>([]);
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
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPendingEvents = pendingEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompletedEvents = completedEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // --- End Filtering Logic ---

  // Function to toggle the expansion state of a section
  const toggleSectionExpansion = (section: 'active' | 'pending' | 'completed') => {
    
    switch (section) {
      case 'active':
        setIsActiveExpanded(!isActiveExpanded);
        break;
      case 'pending':
        setIsPendingExpanded(!isPendingExpanded);
        break;
      case 'completed':
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
        // TODO: Replace with your actual API calls to fetch events by status
        // This example assumes separate endpoints for each status.
        // You might have a single endpoint that takes a status parameter: /api/events?status=active
        // Or a single endpoint that returns all categorized events.

        // --- Simulate fetching data ---
        const mockFetch = async (status: string) => {
             // Simulate different mock data based on status
             const mockData: EventSummary[] = [];
             if (status === 'active') {
                 mockData.push({ id: 'event-active-1', title: 'Project Kickoff', status: 'active' });
                 mockData.push({ id: 'event-active-2', title: 'Client Workshop', status: 'active' });
                 mockData.push({ id: 'event-active-3', title: 'Team Building', status: 'active' }); // Add a few more for testing scroll
                 mockData.push({ id: 'event-active-4', title: 'Product Demo', status: 'active' });
             } else if (status === 'pending_approval') {
                 mockData.push({ id: 'event-pending-1', title: 'Quarterly Review Submission', status: 'pending_approval' });
                  mockData.push({ id: 'event-pending-2', title: 'Annual Planning Request', status: 'pending_approval' });
             } else if (status === 'completed') {
                 mockData.push({ id: 'event-completed-1', title: 'Annual Conference 2024', status: 'completed' });
                 mockData.push({ id: 'event-completed-2', title: 'Team Building Retreat', status: 'completed' });
                 mockData.push({ id: 'event-completed-3', title: 'Holiday Party', status: 'completed' });
             }
             // Simulate API delay
            //  await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay slightly
             return mockData;
        };

        const activeData = await mockFetch('active');
        const pendingData = await mockFetch('pending_approval');
        const completedData = await mockFetch('completed');
        // --- End Simulate fetching data ---


        // Actual API calls examples:
        // const [activeRes, pendingRes, completedRes] = await Promise.all([
        //     fetch('/api/my-events?status=active', { /* auth headers */ }),
        //     fetch('/api/my-events?status=pending_approval', { /* auth headers */ }),
        //     fetch('/api/my-events?status=completed', { /* auth headers */ }),
        // ]);

        // if (!activeRes.ok || !pendingRes.ok || !completedRes.ok) {
        //     throw new Error('Failed to fetch one or more event lists');
        // }

        // const activeData = await activeRes.json();
        // const pendingData = await pendingRes.json();
        // const completedData = await completedRes.json();


        setActiveEvents(activeData);
        setPendingEvents(pendingData);
        setCompletedEvents(completedData);

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
       <div className="create-event-link" style={{marginBottom: '30px'}}>
           <Link href="/create-event" className="button-primary"> {/* Reuse button primary style */}
               + Create New Event
           </Link>
       </div>


      {/* Active Events Section */}
      <div className="events-section">
        <div className="section-header"> {/* Container for title and button */}
             {/* Collapse Button - Now placed BEFORE the h2 */}
            <button
                className="collapse-button"
                onClick={() => toggleSectionExpansion('active')}
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
                onClick={() => toggleSectionExpansion('pending')}
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
                onClick={() => toggleSectionExpansion('completed')}
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