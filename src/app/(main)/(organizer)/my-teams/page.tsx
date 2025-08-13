// src/app/my-teams/page.tsx
'use client'; // Client component for data fetching and state

import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Import Link for navigation
import { EventStatus, SimpleTeamEvent } from '@/types/event';
import { useAuth } from '@/context/AuthContext';
import TeamEventCard from '@/components/organizers/events/TeamEventCard';
import teamService from '@/services/teamService';

// Add styles for the section title links
const styles = {
  sectionTitleLink: {
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
    '&:hover': {
      color: '#2563eb', // blue-600
    },
  },
};

export default function MyTeamsPage() {
  const { user } = useAuth();
  const [activeEvents, setActiveEvents] = useState<SimpleTeamEvent[]>([]);
  const [completedEvents, setCompletedEvents] = useState<SimpleTeamEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // State to manage the expanded/collapsed state of each section
  const [isActiveExpanded, setIsActiveExpanded] = useState(true);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);

  // Handler for the search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Function to toggle the expansion state of a section
  const toggleSectionExpansion = (section: EventStatus.ACTIVE | EventStatus.COMPLETED) => {
    switch (section) {
      case EventStatus.ACTIVE:
        setIsActiveExpanded(!isActiveExpanded);
        break;
      case EventStatus.COMPLETED:
        setIsCompletedExpanded(!isCompletedExpanded);
        break;
      default:
        break;
    }
  };

  const filterEvents = (events: SimpleTeamEvent[]) => {
    if (!searchTerm.trim()) return events;

    return events.filter(event => {
      // Enhanced null/undefined checks
      if (!event) {
        console.warn('Filtering: Found null/undefined event in events array');
        return false;
      }

      if (!event.name) {
        console.warn('Filtering: Found event without name:', event);
        return false;
      }

      // Safe filtering with fallback for roles
      const eventName = event.name.toLowerCase();
      const eventRoles = (event.roles || '').toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      return eventName.includes(searchLower) || eventRoles.includes(searchLower);
    });
  };

  useEffect(() => {
    const fetchTeamEvents = async () => {
      setError(null);
      try {
        if (!user) return; // Do nothing if user is null

        const teamEventList = await teamService.fetchTeamEvents(Number(user.id));

        // Add data validation and cleaning
        const cleanActiveEvents = (teamEventList.ACTIVE || []).filter(event => {
          if (!event || !event.name) {
            console.warn('Removing invalid active event:', event);
            return false;
          }
          return true;
        });

        const cleanCompletedEvents = (teamEventList.COMPLETED || []).filter(event => {
          if (!event || !event.name) {
            console.warn('Removing invalid completed event:', event);
            return false;
          }
          return true;
        });

        setActiveEvents(cleanActiveEvents);
        setCompletedEvents(cleanCompletedEvents);

      } catch (e: unknown) {
        console.error("Failed to fetch team events:", e);
        setError(`Failed to load team events: ${e || 'Unknown error'}`);
      } 
    };

    fetchTeamEvents();
  }, [user]);

  // if (loading) {
  //   return (
  //     <div className="page-container"> {/* Reuse page container style */}
  //       <h1>My Teams</h1>
  //       <p className="loading-message">Loading team events...</p> {/* Reuse loading message style */}
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="page-container">
        <h1>My Teams</h1>
        <p className="error-message">Error: {error}</p> {/* Reuse error message style */}
      </div>
    );
  }

  // Filter events based on search term
  const filteredActiveEvents = filterEvents(activeEvents);
  const filteredCompletedEvents = filterEvents(completedEvents);

  return (
    <div className="page-container"> {/* Reuse page container style */}
      {/* Breadcrumbs will be rendered by the layout */}

      <div className='page-header'>
        <div className={'page-title-section'}>
          <h2>My Teams</h2>
          <p className={'page-subtitle'}>
            Events where you&apos;re part of the team, invited by another organizer.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="event-search-bar" style={{ marginBottom: '30px' }}>
        <label htmlFor="team-event-search" className="form-label"></label> {/* Reuse label style */}

        {/* --- New Wrapper for Icon and Input --- */}
        <div className="search-input-container">
          <span className="search-icon"> {/* Icon Element */}
            🔍 {/* Search icon character - you can use an SVG or icon font here */}
          </span>
          <input
            type="text"
            id="team-event-search"
            className="form-input" // Reuse form input style for basic input styles
            value={searchTerm}
            onChange={handleSearchInputChange}
            placeholder="Search Event or Role"
          />
        </div>
        {/* --- End New Wrapper --- */}
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
            {isActiveExpanded ? '▼' : '►'}
          </button>
          {/* Section Title as Link */}
          <Link href="/my-teams/active" style={styles.sectionTitleLink}>
            <h2>Active Team Events</h2>
          </Link>
        </div>
        {/* Conditionally render the grid based on state */}
        {isActiveExpanded && (
          filteredActiveEvents.length === 0 ? (
            <p className="no-events-message">
              {searchTerm ? 'No active team events match your search.' : 'No active team events found.'}
            </p>
          ) : (
            <div className="event-grid"> {/* CSS Grid container */}
              {filteredActiveEvents.map(event => (
                <TeamEventCard key={event.id} event={event} />
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
          {/* Section Title as Link */}
          <Link href="/my-teams/completed" style={styles.sectionTitleLink}>
            <h2>Completed Team Events</h2>
          </Link>
        </div>
        {/* Conditionally render the grid based on state */}
        {isCompletedExpanded && (
          filteredCompletedEvents.length === 0 ? (
            <p className="no-events-message">
              {searchTerm ? 'No completed team events match your search.' : 'No completed team events found.'}
            </p>
          ) : (
            <div className="event-grid">
              {filteredCompletedEvents.map(event => (
                <TeamEventCard key={event.id} event={event} />
              ))}
            </div>
          )
        )}
      </div>

    </div>
  );
}