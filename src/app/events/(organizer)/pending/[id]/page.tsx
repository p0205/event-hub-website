// src/app/events/pending/[id]/page.tsx
// This is a Server Component by default

import { notFound } from 'next/navigation'; // Import notFound for 404 handling

// Import your event service
import eventService from '@/services/eventService';
// Import the updated types from the correct path
// Make sure this path is correct and the file src/types/event.ts exists and is saved
import { Event, EventStatus, SupportingDocument, CreateSessionData, Venue, createBudgetCategoryMap } from '@/types/event'; // <-- Ensure correct import
import venueService from '@/services/venueService';
import { formatDate, formatDateTime, groupSessions } from '@/helpers/eventHelpers';
import eventBudgetService from '@/services/eventBudgetService';
import BudgetTable from '@/components/BudgetTable';






// The page component is an async function in Server Components
export default async function PendingEventDetailPage({ params }: { params: { id: string } }) {
    // Get the dynamic 'id' segment from the URL (e.g., '21' from /events/pending/21)
    const awaitedParams = await params;

    // Get the dynamic 'id' segment from the URL (e.g., '21' from /events/pending/21)
    const eventIdString = awaitedParams.id; // Access the id property from the awaited object
    if (!eventIdString || isNaN(parseInt(eventIdString, 10))) {
        // If the ID is missing or not a number, it's a malformed request, render Next.js's 404 page
        notFound();
    }

    // Convert the ID string to a number (as backend expects Integer/number)
    const eventId = parseInt(eventIdString, 10);


    // Handle case where the ID in the URL is not a valid number
    if (isNaN(eventId)) {
        // If the ID is not a number, it's a malformed request, render Next.js's 404 page
        notFound();
    }

    // Declare variables to hold the fetched event data and any potential error
    // >>> Ensure the 'Event' type here is the one imported from '@/types/event' <<<
    let event: Event | null = null as Event | null;
    let error: string | null = null;
    let budgetCategoryMap: Map<number, string> = new Map();

    try {
        // Call the service function to fetch the event details from the backend API.
        // The 'await' keyword pauses execution until the Promise returned by getEventById resolves.
        // This happens on the server during the request processing.
        // The type returned by getEventById is expected to match the imported Event interface.
        // If eventService.getEventById is correctly typed as Promise<Event>,
        // and the imported Event type is correct, this assignment should work without error.
        event = await eventService.getEventById(eventId);
        // Fetch budget categories (assuming you have a function like getAllBudgetCategories)



        console.log("This is from pending/[id]/page.tsx");
        // Optional: Add a check here if you *only* want to show PENDING events on this route.
        // If the fetched event's status is not PENDING, you could redirect or show a message.
        // Note: Redirecting in Server Components can be done using `redirect()` from 'next/navigation',
        // but it replaces the current page, unlike `router.push()` in Client Components.
        // For now, we'll display the details regardless of status, but the route is named '/pending'.
        // if (event?.status !== EventStatus.PENDING) {
        //     console.warn(`Event ${eventId} status is ${event?.status}, accessed via /pending route. Consider redirecting.`);
        //     // Example redirect: redirect(`/events/${event.status.toLowerCase()}/${eventId}`);
        // }

    } catch (err: any) {
        // Catch any errors that occur during the API call (network errors, backend errors like 404, 500).
        console.error(`Failed to fetch event ${eventId}:`, err);

        // Handle the error based on the response.
        // If the error has a response and the status is 404, it means the event was not found.
        if (err.response?.status === 404) {
            // Render Next.js's 404 page for Not Found errors
            notFound();
        }
        // For other types of errors (network issues, 500 errors, etc.), set an error message to display on the page.
        error = `Failed to load event details: ${err.message || 'An unknown error occurred.'}`;
    }

    // --- Conditional Rendering based on Fetch Result ---

    // If there was an error during fetching, or if the fetched event data is null/undefined,
    // display an error message page.
    if (error || !event) {
        return (
            <div className="page-container"> {/* Use global page container style */}
                <h1>Event Details</h1>
                {error ? (
                    <p className="error-message">{error}</p> // Display the specific error message
                ) : (
                    <p className="error-message">Could not load event details.</p> // Generic message if event is null without a specific error
                )}
                {/* Optional: Add a link back to the events list or dashboard */}
                {/* <Link href="/events">Back to Events List</Link> */}
            </div>
        );
    }


    // --- Render Event Details if Data is Successfully Fetched ---

    // If data is successfully fetched (event object is not null), render the event details.
    return (
        <div className="page-container"> {/* Use global page container style */}
            <h1>{event.name}</h1>

            {/* Status Section */}
            {/* Reuse global form-container style for a card-like section */}
            <div className="form-container" style={{ marginBottom: '20px' }}>
                <p>
                    <strong>Current Status:</strong>
                    {/* Display the event status using the EventStatus enum */}
                    {/* Apply basic color styling based on the status */}
                    <span style={{ fontWeight: 'bold', color: event.status === EventStatus.PENDING ? 'orange' : event.status === EventStatus.ACTIVE ? 'green' : 'grey', marginLeft: '10px' }}>
                        {event.status}
                    </span>
                </p>
                {/* Optional: Add messages or actions based on status */}
                {event.status === EventStatus.PENDING && (
                    <p className="info-message" style={{ marginTop: '10px' }}>This event is pending approval. Details cannot be changed until approved.</p>
                )}
                {/* Add messages for other statuses (e.g., Active, Completed) if needed */}
            </div>


            {/* Basic Event Information */}
            {/* Reuse global form-container style for a card-like section */}
            <div className=" section-card form-container" style={{ marginBottom: '20px' }}>
                <h2>Basic Information</h2>
                {/* Reuse global form-group style for layout */}
                <div className="form-group">
                    <label className="form-label">Event Name:</label>
                    <p>{event.name}</p>
                </div>
                <div className="form-group">
                    <label className="form-label">Description:</label>
                    {/* Display description or a placeholder if it's null or empty */}
                    <p>{event.description || 'No description provided.'}</p>
                </div>
                <div className="form-group">
                    <label className="form-label">Organizer ID:</label>
                    {/* Display the organizer's ID. In a real application, you'd likely fetch and display the organizer's name. */}
                    <p>{event.organizerId}</p>
                </div>
               
                {/* Use global form-group-inline for side-by-side elements */}
                
                <div className="form-group">
                    <label className="form-label">Expected Participants:</label>
                    {/* Display the number of participants from the backend response */}
                    <p>{event.participantsNo}</p>
                </div>
                {/* Add other basic details from the Event type if needed (e.g., visibility, capacity) */}
            </div>


            {/* Supporting Document Section */}
            {/* Conditionally render this section only if a supporting document exists in the event data */}
            {event.supportingDocument && (
                <div className="form-container" style={{ marginBottom: '20px' }}>
                    <h2>Supporting Document</h2>
                    <div className="form-group">
                        <label className="form-label">Filename:</label>
                        <p>{event.supportingDocument.filename}</p>
                    </div>
                    <div className="form-group">
                        <label className="form-label">File Type:</label>
                        <p>{event.supportingDocument.fileType}</p>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Uploaded At:</label>
                        {/* Use the imported formatDateTime helper function */}
                        <p>{formatDateTime(event.supportingDocument.uploadedAt)}</p>
                    </div>
                    {/* Provide a link to view/download the document */}
                    <div className="form-group">
                        {/* Create a data URL using the base64 encoded 'data' and 'fileType' */}
                        {/* This allows the browser to render/download the file directly */}
                        <a
                            href={`data:${event.supportingDocument.fileType};base64,${event.supportingDocument.data}`}
                            download={event.supportingDocument.filename} // Suggest the original filename when downloading
                            target="_blank" // Open the document in a new browser tab
                            rel="noopener noreferrer" // Security best practice when using target="_blank"
                            className="button-secondary" // Apply a button style for better appearance
                        >
                            View / Download Document
                        </a>
                    </div>
                </div>
            )}


            {/* Sessions */}
            {event.sessions && event.sessions.length > 0 && (
                <div className="section-card form-container">
                    <h2>Sessions</h2>
                    <ul className="sessions-list">
                        {(await (event.sessions)).map((session, index) => (
                            <li key={index} className="session-item">
                                {session.sessionName && <h3>{session.sessionName}</h3>}
                                <p><strong>Date:</strong> {formatDate(session.startDateTime)}</p>
                                <p><strong>Time:</strong> {formatDateTime(session.startDateTime)} - {formatDateTime(session.endDateTime)}</p>
                                <p><strong>Venues:</strong></p>
                                <ul style={{ paddingLeft: '20px' }}>
                                    {session.venues.map((venue: Venue, idx: number) => (
                                        <li key={idx}>
                                            {venue.name} (Capacity: {venue.capacity})
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            )}



            {/* Budget Section */}
            {/* Conditionally render this section if there are event budgets */}
            {event.eventBudgets && event.eventBudgets.length > 0 && (
                <div className="section-card form-container" style={{ marginBottom: '20px' }}>
                    <h2>Budget Allocation</h2>
                    <BudgetTable budgets={event.eventBudgets} />

                </div>
            )}


            {/* Optional: Actions based on status and user role (e.g., Edit, Cancel, Approve) */}
            {/* This would typically require fetching the current user's role (e.g., from AuthContext) */}
            {/* Since this is a Server Component, getting client-side user context is different. */}
            {/* You might pass user role as a prop from a layout or fetch it differently. */}
            {/* <div className="form-actions">
                 {event.status === EventStatus.PENDING && (
                      // Example buttons for Organizer/Admin when event is pending
                      <>
                         // These buttons would need to be Client Components or trigger Client Component logic
                         // <button className="button-secondary">Edit Event</button>
                         // <button className="button-secondary">Cancel Event</button>
                         // Admin specific button (requires checking user role)
                         // {user?.role === 'Admin' && <button className="button-primary">Approve Event</button>}
                      </>
                 )}
                  // Add buttons for other statuses/roles (e.g., Register for Active events)
             </div> */}


        </div>
    );
}
