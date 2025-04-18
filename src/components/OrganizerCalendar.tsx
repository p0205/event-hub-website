// components/OrganizerCalendar.js
'use client'; // Mark this as a Client Component if using Next.js App Router

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction'; // needed for interaction
import timeGridPlugin from '@fullcalendar/timegrid'; // needed for timegrid views
// You might need to import FullCalendar's core CSS
// Option 1: If using CSS Modules or global CSS import
// import '@fullcalendar/core/main.css'; // Adjust path based on your setup
// import '@fullcalendar/daygrid/main.css';
// import '@fullcalendar/timegrid/main.css';
// Option 2: Often handled in _app.js or layout.js for global styles

// Define the expected structure for your events
interface CalendarEvent {
    id: string;
    title: string;
    start: string | Date; // ISO8601 string or Date object
    end?: string | Date;  // Optional
    allDay?: boolean;
    // Add custom properties within extendedProps
    extendedProps?: {
      description?: string;
      location?: string;
      organizerId?: string; // Example organizer ID
    };
    // Optional: Direct styling properties (commented out for global style)
    // backgroundColor?: string;
    // borderColor?: string;
    // textColor?:string;
  }


// --- MOCK EVENT DATA ---
// Define an array of mock events conforming to the CalendarEvent interface
// Using dates around May 2025 for this example
const mockEvents: CalendarEvent[] = [
    {
      id: 'mock-event-1',
      title: 'Strategy Session',
      start: '2025-05-05T10:00:00', // Specific start time
      end: '2025-05-05T12:00:00',   // Specific end time
      extendedProps: {
        description: 'Plan Q3 marketing strategy.',
        location: 'Board Room',
        organizerId: 'org123',
      },
    },
    {
      id: 'mock-event-2',
      title: 'All-Day Workshop',
      start: '2025-05-08', // Date string implies all-day
      allDay: true,        // Explicitly set allDay to true
      extendedProps: {
        description: 'Workshop on new development techniques.',
        organizerId: 'org123',
      },
    },
    {
      id: 'mock-event-3',
      title: 'Client Call - Acme Corp',
      start: '2025-05-10T15:30:00',
      // No 'end' time - FullCalendar might assume a default duration or render based on view settings
      extendedProps: {
        location: 'Zoom Meeting',
        organizerId: 'org123',
      },
    },
    {
      id: 'mock-event-4',
      title: 'Team Lunch',
      start: '2025-05-10T12:00:00',
      end: '2025-05-10T13:00:00',
      extendedProps: {
        location: 'Local Cafe',
        organizerId: 'org123',
      },
    },
    {
      id: 'mock-event-5',
      title: 'Conference Trip',
      start: '2025-05-19',
      end: '2025-05-22', // Event spans May 19, 20, 21 (ends *before* the 22nd)
      allDay: true,
      extendedProps: {
        description: 'Annual Tech Conference',
        location: 'Convention Center',
        organizerId: 'org123',
      },
    },
  ];
  //
export default function OrganizerCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch events (we'll refine this)
//   const fetchEvents = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       // IMPORTANT: This URL needs to fetch events *for the logged-in organizer*
//       // You'll likely need to pass an auth token or session cookie.
//       const response = await fetch('/api/events/my-events'); // Example API endpoint

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data: CalendarEvent[] = await response.json();

//       // Ensure data matches FullCalendar's expected format
//       // (Often includes title, start, end, id)
//       setEvents(data);

//     } catch (e: any) {
//       console.error("Failed to fetch events:", e);
//       setError("Failed to load events. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

  // Fetch events when the component mounts
//   useEffect(() => {
//     fetchEvents();
//   }, []); // Empty dependency array means run once on mount

// --- Event Handlers (can still be used to test interactions) ---
const handleDateClick = (arg: any) => {
    // Example: Log the date clicked
    console.log('Date clicked: ', arg.dateStr);
    alert('You clicked on ' + arg.dateStr);
  };

  const handleEventClick = (arg: any) => {
    // Example: Log event details and custom properties
    console.log('Event clicked: ', arg.event);
    console.log('Title: ', arg.event.title);
    console.log('Description: ', arg.event.extendedProps?.description);
    console.log('Location: ', arg.event.extendedProps?.location);
    alert('Clicked on event: ' + arg.event.title);
  };

  // --- Custom Event Content Rendering ---
  const renderEventContent = (eventInfo: any) => {
    // eventInfo contains details about the event and how it's being rendered
    return (
      <>
        {/* Display the time if available */}
        {eventInfo.timeText && (
          <div style={{ fontWeight: 'bold', fontSize: '0.85em' }}>
            {eventInfo.timeText}
          </div>
        )}
        {/* Display the event title */}
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85em' }}>
          {eventInfo.event.title}
        </div>
      </>
    );
  };
  // ------------------------------------

  // --- Rendering ---
  if (loading) {
    return <div>Loading calendar...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div>
      {/* Ensure FullCalendar's CSS is loaded globally or imported here */}
      {/* You might need to import the core FullCalendar CSS files like:
          import '@fullcalendar/core/main.css';
          import '@fullcalendar/daygrid/main.css';
          import '@fullcalendar/timegrid/main.css';
      */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth" // Start with month view
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay' // Add view switchers
        }}
        events={events} // Pass the fetched events here
        dateClick={handleDateClick} // Optional: Handle date clicks
        eventClick={handleEventClick} // Optional: Handle event clicks
        editable={false} // Optional: Allow drag-and-drop editing
        selectable={true} // Optional: Allow selecting date ranges
        // Add other FullCalendar options as needed
        // eventDrop={(info) => console.log('Event dropped:', info.event)}
        // select={(info) => console.log('Selected:', info.startStr, info.endStr)}
        height="auto" // Adjust height as needed
        // Optional: Set the initial date to be near your mock events for easier testing
        initialDate={new Date()}

        // --- GLOBAL EVENT STYLING ---
        eventColor="#3788d8" // Use a standard FullCalendar blue for background and border
        eventTextColor="#ffffff" // Set text color to white
        // --------------------------

        // --- OPTION TO CONTROL EVENT DISPLAY ---
        eventDisplay="block" // Keep eventDisplay="block" to ensure block rendering
        // -------------------------------------

        // --- CUSTOM EVENT CONTENT ---
        eventContent={renderEventContent} // Use the custom render function
        // ----------------------------
        // --- ADDED EVENT TIME FORMAT ---
        eventTimeFormat={{ // Use an object for structured formatting
            hour: 'numeric', // Display hour (e.g., 1, 2, ..., 12)
            minute: '2-digit', // Display minute with two digits (e.g., 00, 30)
            meridiem: 'short' // Display 'am' or 'pm'
          }}
      />
    </div>
  );
}