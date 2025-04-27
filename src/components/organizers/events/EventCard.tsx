// src/components/EventCard.tsx
import { EventStatus, SimpleEvent } from '@/types/event';
import Link from 'next/link';
import React from 'react';

// Define the minimum data needed for the card display
interface EventCardProps {
  id: string;
  title: string;
  status: 'active' | 'pending_approval' | 'completed' | string; // Include other statuses if needed
  // Add other relevant summary info here if you want to display it on the card,
  // e.g., next session date, number of sessions, visibility icon, etc.
  // Example: nextSessionDate?: string;
}

export default function EventCard({ event }: { event: SimpleEvent }) {
  // Determine a simple visual representation (like initials) based on the title
  const initials = event.name.split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2) // Take up to 2 initials
    .toUpperCase();

  // Determine a color based on status (example)
  const statusColor = () => {
    switch (event.status) {
      case EventStatus.ACTIVE : return 'bg-green-500'; // Example Tailwind classes or use CSS variables
      case EventStatus.PENDING: return 'bg-yellow-500';
      case EventStatus.COMPLETED: return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    // Wrap the card content in a Next.js Link for navigation
    <Link href={`/events/${event.status.toLowerCase()}/${event.id}`}  className="event-card-link" passHref>
       {/* Use an anchor tag for semantic correctness and apply styles */}
        <div className="event-card"> {/* The card container */}
          <div className={`event-card-icon ${statusColor()}`}> {/* Icon/Initials area */}
            {/* You could use an actual icon here based on event type or status */}
            <span>{initials}</span>
          </div>
          <div className="event-card-content"> {/* Event Title and other info */}
            <h3 className="event-card-title">{event.name}</h3>
            {/* Add other basic info here if needed */}
            {/* <p className="event-card-status">Status: {event.status}</p> */}
            {/* Example: <p className="event-card-date">{event.nextSessionDate}</p> */}
          </div>
          {/* Optional: Add icons for quick actions or info like in the Teams example */}
          {
          /* <div className="event-card-actions">
               <span className="icon">👁️</span> // Example visibility icon
               <span className="icon">👥</span> // Example team icon
               <span className="icon">📅</span> // Example calendar icon
            </div> */
            }
        </div>
    </Link>
  );
}