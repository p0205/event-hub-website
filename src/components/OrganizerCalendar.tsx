// // components/OrganizerCalendar.js
// 'use client'; // Mark this as a Client Component if using Next.js App Router

// import React, { useState, useEffect } from 'react';
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
// import interactionPlugin from '@fullcalendar/interaction'; // needed for interaction
// import timeGridPlugin from '@fullcalendar/timegrid'; // needed for timegrid views
// // You might need to import FullCalendar's core CSS
// // Option 1: If using CSS Modules or global CSS import
// // import '@fullcalendar/core/main.css'; // Adjust path based on your setup
// // import '@fullcalendar/daygrid/main.css';
// // import '@fullcalendar/timegrid/main.css';
// // Option 2: Often handled in _app.js or layout.js for global styles

// // Define the expected structure for your events
// interface CalendarEvent {
//     id: string;
//     title: string;
//     start: string | Date; // ISO8601 string or Date object
//     end?: string | Date;  // Optional
//     allDay?: boolean;
//     // Add custom properties within extendedProps
//     extendedProps?: {
//       description?: string;
//       location?: string;
//       organizerId?: string; // Example organizer ID
//     };
//     // Optional: Direct styling properties (commented out for global style)
//     // backgroundColor?: string;
//     // borderColor?: string;
//     // textColor?:string;
//   }


// // --- MOCK EVENT DATA ---
// // Define an array of mock events conforming to the CalendarEvent interface
// // Using dates around May 2025 for this example
// const mockEvents: CalendarEvent[] = [
//     {
//       id: 'mock-event-1',
//       title: 'Strategy Session',
//       start: '2025-05-05T10:00:00', // Specific start time
//       end: '2025-05-05T12:00:00',   // Specific end time
//       extendedProps: {
//         description: 'Plan Q3 marketing strategy.',
//         location: 'Board Room',
//         organizerId: 'org123',
//       },
//     },
//     {
//       id: 'mock-event-2',
//       title: 'All-Day Workshop',
//       start: '2025-05-08', // Date string implies all-day
//       allDay: true,        // Explicitly set allDay to true
//       extendedProps: {
//         description: 'Workshop on new development techniques.',
//         organizerId: 'org123',
//       },
//     },
//     {
//       id: 'mock-event-3',
//       title: 'Client Call - Acme Corp',
//       start: '2025-05-10T15:30:00',
//       // No 'end' time - FullCalendar might assume a default duration or render based on view settings
//       extendedProps: {
//         location: 'Zoom Meeting',
//         organizerId: 'org123',
//       },
//     },
//     {
//       id: 'mock-event-4',
//       title: 'Team Lunch',
//       start: '2025-05-10T12:00:00',
//       end: '2025-05-10T13:00:00',
//       extendedProps: {
//         location: 'Local Cafe',
//         organizerId: 'org123',
//       },
//     },
//     {
//       id: 'mock-event-5',
//       title: 'Conference Trip',
//       start: '2025-05-19',
//       end: '2025-05-22', // Event spans May 19, 20, 21 (ends *before* the 22nd)
//       allDay: true,
//       extendedProps: {
//         description: 'Annual Tech Conference',
//         location: 'Convention Center',
//         organizerId: 'org123',
//       },
//     },
//   ];
//   //
// export default function OrganizerCalendar() {
//   const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Function to fetch events (we'll refine this)
// //   const fetchEvents = async () => {
// //     setLoading(true);
// //     setError(null);
// //     try {
// //       // IMPORTANT: This URL needs to fetch events *for the logged-in organizer*
// //       // You'll likely need to pass an auth token or session cookie.
// //       const response = await fetch('/api/events/my-events'); // Example API endpoint

// //       if (!response.ok) {
// //         throw new Error(`HTTP error! status: ${response.status}`);
// //       }
// //       const data: CalendarEvent[] = await response.json();

// //       // Ensure data matches FullCalendar's expected format
// //       // (Often includes title, start, end, id)
// //       setEvents(data);

// //     } catch (e: any) {
// //       console.error("Failed to fetch events:", e);
// //       setError("Failed to load events. Please try again.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

//   // Fetch events when the component mounts
// //   useEffect(() => {
// //     fetchEvents();
// //   }, []); // Empty dependency array means run once on mount

// // --- Event Handlers (can still be used to test interactions) ---
// const handleDateClick = (arg: any) => {
//     // Example: Log the date clicked
//     console.log('Date clicked: ', arg.dateStr);
//     alert('You clicked on ' + arg.dateStr);
//   };

//   const handleEventClick = (arg: any) => {
//     // Example: Log event details and custom properties
//     console.log('Event clicked: ', arg.event);
//     console.log('Title: ', arg.event.title);
//     console.log('Description: ', arg.event.extendedProps?.description);
//     console.log('Location: ', arg.event.extendedProps?.location);
//     alert('Clicked on event: ' + arg.event.title);
//   };

//   // --- Custom Event Content Rendering ---
//   const renderEventContent = (eventInfo: any) => {
//     // eventInfo contains details about the event and how it's being rendered
//     return (
//       <>
//         {/* Display the time if available */}
//         {eventInfo.timeText && (
//           <div style={{ fontWeight: 'bold', fontSize: '0.85em' }}>
//             {eventInfo.timeText}
//           </div>
//         )}
//         {/* Display the event title */}
//         <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85em' }}>
//           {eventInfo.event.title}
//         </div>
//       </>
//     );
//   };
//   // ------------------------------------

//   // --- Rendering ---
//   if (loading) {
//     return <div>Loading calendar...</div>;
//   }

//   if (error) {
//     return <div style={{ color: 'red' }}>{error}</div>;
//   }

//   return (
//     <div>
//       {/* Ensure FullCalendar's CSS is loaded globally or imported here */}
//       {/* You might need to import the core FullCalendar CSS files like:
//           import '@fullcalendar/core/main.css';
//           import '@fullcalendar/daygrid/main.css';
//           import '@fullcalendar/timegrid/main.css';
//       */}
//       <FullCalendar
//         plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//         initialView="dayGridMonth" // Start with month view
//         headerToolbar={{
//           left: 'prev,next today',
//           center: 'title',
//           right: 'dayGridMonth,timeGridWeek,timeGridDay' // Add view switchers
//         }}
//         events={events} // Pass the fetched events here
//         dateClick={handleDateClick} // Optional: Handle date clicks
//         eventClick={handleEventClick} // Optional: Handle event clicks
//         editable={false} // Optional: Allow drag-and-drop editing
//         selectable={true} // Optional: Allow selecting date ranges
//         // Add other FullCalendar options as needed
//         // eventDrop={(info) => console.log('Event dropped:', info.event)}
//         // select={(info) => console.log('Selected:', info.startStr, info.endStr)}
//         height="auto" // Adjust height as needed
//         // Optional: Set the initial date to be near your mock events for easier testing
//         initialDate={new Date()}

//         // --- GLOBAL EVENT STYLING ---
//         eventColor="#3788d8" // Use a standard FullCalendar blue for background and border
//         eventTextColor="#ffffff" // Set text color to white
//         // --------------------------

//         // --- OPTION TO CONTROL EVENT DISPLAY ---
//         eventDisplay="block" // Keep eventDisplay="block" to ensure block rendering
//         // -------------------------------------

//         // --- CUSTOM EVENT CONTENT ---
//         eventContent={renderEventContent} // Use the custom render function
//         // ----------------------------
//         // --- ADDED EVENT TIME FORMAT ---
//         eventTimeFormat={{ // Use an object for structured formatting
//             hour: 'numeric', // Display hour (e.g., 1, 2, ..., 12)
//             minute: '2-digit', // Display minute with two digits (e.g., 00, 30)
//             meridiem: 'short' // Display 'am' or 'pm'
//           }}
//       />
//     </div>
//   );
// }


// components/OrganizerCalendar.tsx
'use client';

import React, { useState, useEffect } from 'react'; // Keep useState for local state
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

// --- TYPE DEFINITIONS ---

enum EventStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    ARCHIVED = 'ARCHIVED',
}

// Keep these type definitions as they describe the structure used by CalendarEvent
interface Venue { id: number | string; name: string; /* ... */ }
interface SupportingDocument { id: number; /* ... */ }
interface EventBudget { id: number; /* ... */ }
interface TeamMember { id: number; /* ... */ }

export interface Session {
    id: string;
    sessionName: string;
    startDateTime: string;
    endDateTime?: string;
    venues: Venue[];
    qrCodeImage?: Blob;
}

export interface Event {
    id?: number;
    name?: string;
    description?: string | null;
    organizerId?: number;
    startDateTime?: string;
    endDateTime?: string | null;
    status: EventStatus;
    supportingDocument?: SupportingDocument | null;
    participantsNo?: number;
    sessions: Session[];
    eventBudgets: EventBudget[];
    team?: TeamMember[];
    posters?: string[];
}

interface SimpleSession {
    id: string;
    sessionName: string;
    startDateTime: string;
    endDateTime?: string;
}

// FullCalendar Event Data Structure (what FullCalendar uses, represents an Event)
interface CalendarEvent {
    id: string;
    title: string;
    start: string | Date;
    end?: string | Date;
    allDay?: boolean;
    extendedProps?: {
      simpleSessions?: SimpleSession[];
      description?: string | null;
      status?: EventStatus;
      organizerId?: string;
      participantsNo?: number;
      rawBackendEvent?: Event;
    };
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
}

// --- MOCK CALENDAR EVENT DATA ---
// This data will be used directly since the API fetch is commented out.
const mockCalendarEvents: CalendarEvent[] = [
    {
      id: 'mock-event-1',
      title: 'Mock Strategy Session',
      start: '2025-05-05T10:00:00',
      end: '2025-05-05T12:00:00',
      extendedProps: {
        description: 'Mock Q3 marketing strategy plan meeting.',
        status: EventStatus.PUBLISHED,
        simpleSessions: [
            { id: 's-mock-1a', sessionName: 'Kickoff Meeting', startDateTime: '2025-05-05T10:00:00', endDateTime: '2025-05-05T10:30:00' },
            { id: 's-mock-1b', sessionName: 'Brainstorming', startDateTime: '2025-05-05T10:30:00', endDateTime: '2025-05-05T12:00:00' },
        ],
        organizerId: 'org123',
      },
      backgroundColor: '#ff9f89',
      borderColor: '#ff9f89'
    },
    {
      id: 'mock-event-2',
      title: 'Mock All-Day Workshop',
      start: '2025-05-08',
      allDay: true,
      extendedProps: {
        description: 'Mock workshop on new development techniques.',
        status: EventStatus.ACTIVE,
        simpleSessions: [
             { id: 's-mock-2a', sessionName: 'Morning Session', startDateTime: '2025-05-08T09:00:00', endDateTime: '2025-05-08T12:00:00' },
             { id: 's-mock-2b', sessionName: 'Afternoon Session', startDateTime: '2025-05-08T13:00:00', endDateTime: '2025-05-08T17:00:00' },
         ],
        organizerId: 'org123',
      },
       backgroundColor: '#3788d8',
       borderColor: '#3788d8'
    },
    {
      id: 'mock-event-3',
      title: 'Mock Client Call - Acme Corp',
      start: '2025-05-10T15:30:00',
      extendedProps: {
        description: 'Mock client discussion with Acme Corp.',
        status: EventStatus.COMPLETED,
        simpleSessions: [
            { id: 's-mock-3a', sessionName: 'Client Discussion', startDateTime: '2025-05-10T15:30:00', endDateTime: '2025-05-10T16:30:00' },
        ],
        organizerId: 'org123',
      },
       backgroundColor: '#6c757d',
       borderColor: '#6c757d'
    },
    {
      id: 'mock-event-4',
      title: 'Mock Team Lunch',
      start: '2025-05-10T12:00:00',
      end: '2025-05-10T13:00:00',
      extendedProps: {
        description: 'Casual team lunch break.',
        status: EventStatus.ACTIVE,
        simpleSessions: [],
        organizerId: 'org123',
      },
       backgroundColor: '#28a745',
       borderColor: '#28a745'
    },
    {
      id: 'mock-event-5',
      title: 'Mock Conference Trip',
      start: '2025-05-19',
      end: '2025-05-22', // Event spans May 19, 20, 21 (ends *before* the 22nd)
      allDay: true,
      extendedProps: {
        description: 'Mock Annual Tech Conference attendance.',
        status: EventStatus.ARCHIVED,
        simpleSessions: [],
        organizerId: 'org123',
      },
       backgroundColor: '#ffc107',
       borderColor: '#ffc107',
       textColor: '#343a40'
    },
  ];
  //
// --- API Configuration (Commented Out) ---
// const API_ENDPOINT_ACTIVE_EVENTS = '/api/events/active';

export default function OrganizerCalendar() {
  // Initialize state directly with mock events.
  const [events, setEvents] = useState<CalendarEvent[]>(mockCalendarEvents);

  // Comment out loading and error states as there's no async fetch
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // Comment out the fetch function and the useEffect hook
  // const fetchEvents = async () => {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const response = await fetch(API_ENDPOINT_ACTIVE_EVENTS, {
  //       method: 'GET',
  //       headers: { 'Content-Type': 'application/json', /* Add Auth Token/Headers */ },
  //       // credentials: 'include',
  //     });

  //     if (!response.ok) {
  //        let errorBodyText = 'Unknown error';
  //        try {
  //           errorBodyText = await response.text();
  //           let errorData;
  //           try {
  //               errorData = JSON.parse(errorBodyText);
  //               errorBodyText = errorData.message || (typeof errorData === 'object' ? JSON.stringify(errorData) : errorBodyText);
  //           } catch (parseError) {
  //               console.error("Failed to parse error response as JSON:", parseError);
  //           }
  //         } catch (readError) {
  //           console.error("Failed to read error response body as text:", readError);
  //           errorBodyText = `Failed to read error response body. Status: ${response.status}`;
  //         }
  //         throw new Error(`Failed to fetch events: ${errorBodyText} (Status: ${response.status})`);
  //     }

  //     const backendEvents: Event[] = await response.json();

  //     const formattedCalendarEvents: CalendarEvent[] = backendEvents
  //       .filter(event => event.id && event.name && event.startDateTime)
  //       .map((event: Event): CalendarEvent => {
  //         const simpleSessions: SimpleSession[] = (event.sessions || [])
  //           .filter(session => session.id && session.startDateTime)
  //           .map(session => ({
  //             id: session.id,
  //             sessionName: session.sessionName,
  //             startDateTime: session.startDateTime,
  //             endDateTime: session.endDateTime,
  //           }));

  //           let eventColor = '#3788d8';
  //           let eventTextColor = '#ffffff';

  //           switch (event.status) {
  //               case EventStatus.COMPLETED:
  //               case EventStatus.ARCHIVED:
  //                   eventColor = '#6c757d';
  //                   break;
  //               case EventStatus.CANCELLED:
  //                   eventColor = '#dc3545';
  //                   break;
  //               case EventStatus.DRAFT:
  //                   eventColor = '#ffc107';
  //                   eventTextColor = '#343a40';
  //                   break;
  //               case EventStatus.ACTIVE:
  //               case EventStatus.PUBLISHED:
  //               default:
  //                   eventColor = '#28a745';
  //                   break;
  //           }


  //         return {
  //           id: String(event.id!),
  //           title: event.name!,
  //           start: event.startDateTime!,
  //           end: event.endDateTime ?? undefined,
  //           allDay: undefined,
  //           extendedProps: {
  //             simpleSessions: simpleSessions,
  //             description: event.description,
  //             status: event.status,
  //             organizerId: event.organizerId ? String(event.organizerId) : undefined,
  //             participantsNo: event.participantsNo,
  //             rawBackendEvent: event,
  //           },
  //           backgroundColor: eventColor,
  //           borderColor: eventColor,
  //           textColor: eventTextColor,
  //         };
  //       });

  //     setEvents(formattedCalendarEvents);

  //   } catch (e: any) {
  //     console.error("Failed to fetch or process events:", e);
  //     setError(`Failed to load calendar data: ${e.message || 'Please check console.'}`);
  //     // setEvents(mockCalendarEvents); // No need to set again if initial state is mock
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Comment out the useEffect hook
  // useEffect(() => {
  //   fetchEvents();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // --- Event Handlers ---
  // Handle click on a specific date (e.g., to add a new event)
  const handleDateClick = (arg: any) => {
    console.log('Date clicked: ', arg.dateStr);
    alert('Date clicked: ' + arg.dateStr + '\n(Adding events is not yet implemented)');
  };

  // Handle click on an existing event
  const handleEventClick = (arg: any) => {
    const clickedCalendarEvent: CalendarEvent = arg.event;
    const props = clickedCalendarEvent.extendedProps;
    const sessions = props?.simpleSessions || [];

    console.log('Event Calendar Event clicked: ', clickedCalendarEvent);
    console.log('Event ID: ', clickedCalendarEvent.id);
    console.log('Title: ', clickedCalendarEvent.title);
    console.log('Description: ', props?.description);
    console.log('Status: ', props?.status);
    console.log('Sessions:', sessions);

    let sessionDetails = `Event: ${clickedCalendarEvent.title || 'Untitled Event'}\n`;
    sessionDetails += `Status: ${props?.status || 'Unknown'}\n\n`;

    if (props?.description) {
      sessionDetails += `Description: ${props.description}\n\n`;
    }

    sessionDetails += `Sessions (${sessions.length}):\n`;
    if (sessions.length > 0) {
        sessions.forEach(session => {
            const start = new Date(session.startDateTime).toLocaleString();
            const end = session.endDateTime ? new Date(session.endDateTime).toLocaleString() : 'N/A';
            sessionDetails += `- ${session.sessionName || 'Untitled Session'} (ID: ${session.id})\n  Starts: ${start}\n  Ends: ${end}\n`;
        });
    } else {
        sessionDetails += "- No detailed sessions available.";
    }

    alert(sessionDetails);
  };

  // --- Custom Event Content Rendering ---
  const renderEventContent = (eventInfo: any) => {
    return (
      <>
        {eventInfo.timeText && (
          <div style={{ fontWeight: 'bold', fontSize: '0.85em', lineHeight: 1 }}>
            {eventInfo.timeText}
          </div>
        )}
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85em', lineHeight: 1.2 }}>
          {eventInfo.event.title}
        </div>
      </>
    );
  };
  // ------------------------------------

  // --- Rendering Logic ---
  // No loading or error states to manage since we're using local mock data.

  return (
    <div className="organizer-calendar-container" style={{ padding: '20px' }}>
      <h2>Event Calendar (Mock Data)</h2> {/* Indicate mock data is being used */}

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events} // Use the state initialized with mock data
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        editable={false}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        nowIndicator={true}
        height="auto"
        contentHeight="auto"
        aspectRatio={2}

        // eventColor and eventTextColor can be set here or on individual mock events
        // eventColor="#3788d8"
        // eventTextColor="#ffffff"

        eventDisplay="block"
        eventContent={renderEventContent}
        eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
            hour12: true
          }}
      />
    </div>
  );
}