// src/app/my-events/pending/[id]/page.tsx
"use client"; // <--- Add this directive to make it a Client Component

import { useEffect, useState } from 'react'; // <--- Import useEffect and useState
import { notFound, useParams } from 'next/navigation'; // <--- Import useParams for Client Components
import Link from 'next/link'; // It's good practice to import Link if you might add it later

// Import your event service
import eventService from '@/services/eventService';
// Import the updated types from the correct path
import { Event, EventStatus, SupportingDocument, Venue } from '@/types/event'; // <-- Ensure correct import
// import venueService from '@/services/venueService'; // Uncomment if used
import { formatDate, formatDateTime } from '@/helpers/eventHelpers';
// import eventBudgetService from '@/services/eventBudgetService'; // Uncomment if used
import BudgetTable from '@/components/BudgetTable';

// The page component is now a regular function, not async by default for the main export
export default function PendingEventDetailPage() {
    const params = useParams<{ id: string }>(); // <--- Get params using useParams hook

    // State for the event, loading status, and error
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // const [budgetCategoryMap, setBudgetCategoryMap] = useState<Map<number, string>>(new Map()); // If needed

    useEffect(() => {
        // Get the dynamic 'id' segment from the URL
        const eventIdString = params.id;

        if (!eventIdString || isNaN(parseInt(eventIdString, 10))) {
            notFound();
            return;
        }

        const eventId = parseInt(eventIdString, 10);
        if (isNaN(eventId)) {
            notFound();
            return;
        }

        // Asynchronous function to fetch event data
        const fetchEventData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                console.log("Fetching event data for ID:", eventId, "from Client Component");
                const fetchedEvent = await eventService.getEventById(eventId);
                setEvent(fetchedEvent);

            

            } catch (err: any) {
                console.error(`Failed to fetch event ${eventId}:`, err);
                if (err.isAxiosError && err.response?.status === 404) {
                    notFound();
                } else if (err.isAxiosError && err.response?.status === 403) {
                    setError(`Access Denied (403): You may not have permission to view this event or your session might be invalid. Please try logging in again.`);
                }
                else {
                    setError(`Failed to load event details: ${err.message || 'An unknown error occurred.'}`);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchEventData();

    }, [params.id]); // <--- Dependency array: re-run effect if eventId changes

    // --- Conditional Rendering based on Fetch Result ---

    if (isLoading) {
        return (
            <div className="page-container">
                <h1>Loading Event Details...</h1>
                <p>Please wait while we fetch the event information.</p>
                {/* You can add a spinner component here */}
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <h1>Event Details</h1>
                <p className="error-message">{error}</p>
                <Link href="/my-events">Back to Events List</Link>
            </div>
        );
    }

    if (!event) {
        // This case should ideally be handled by notFound() or error state,
        // but as a fallback:
        return (
            <div className="page-container">
                <h1>Event Details</h1>
                <p className="error-message">Could not load event details.</p>
                <Link href="/my-events">Back to Events List</Link>
            </div>
        );
    }

    // --- Render Event Details if Data is Successfully Fetched ---
    return (
        <div className="page-container"> {/* Use global page container style */}
            <h1>{event.name}</h1>

            {/* Status Section */}
            <div className="form-container" style={{ marginBottom: '20px' }}>
                <p>
                    <strong>Current Status:</strong>
                    <span style={{ fontWeight: 'bold', color: event.status === EventStatus.PENDING ? 'orange' : event.status === EventStatus.ACTIVE ? 'green' : 'grey', marginLeft: '10px' }}>
                        {event.status}
                    </span>
                </p>
                {event.status === EventStatus.PENDING && (
                    <p className="info-message" style={{ marginTop: '10px' }}>This event is pending approval. Details cannot be changed until approved.</p>
                )}
            </div>

            {/* Basic Event Information */}
            <div className=" section-card form-container" style={{ marginBottom: '20px' }}>
                <h2>Basic Information</h2>
                <div className="form-group">
                    <label className="form-label">Event Name:</label>
                    <p>{event.name}</p>
                </div>
                <div className="form-group">
                    <label className="form-label">Event Type:</label>
                    <p>{event.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</p>
                </div>
                <div className="form-group">
                    <label className="form-label">Description:</label>
                    <p>{event.description || 'No description provided.'}</p>
                </div>
                <div className="form-group">
                    <label className="form-label">Organizer:</label>
                    <p>{event.organizerName}</p>
                </div>
                <div className="form-group">
                    <label className="form-label">Expected Participants:</label>
                    <p>{event.participantsNo}</p>
                </div>
            </div>

            {/* Supporting Document Section */}
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
                        <p>{formatDateTime(event.supportingDocument.uploadedAt)}</p>
                    </div>
                    <div className="form-group">
                        <a
                            href={`data:${event.supportingDocument.fileType};base64,${event.supportingDocument.data}`}
                            download={event.supportingDocument.filename}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="button-secondary"
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
                        {/* No 'await' needed here as 'event' is now state fetched in useEffect */}
                        {event.sessions.map((session, index) => (
                            <li key={session.id || index} className="session-item"> {/* Use session.id if available for a more stable key */}
                                {session.sessionName && <h3 style={{ fontWeight: 'bold', fontSize: '1rem' }}>{session.sessionName}</h3>}
                                <p><strong>Date:</strong> {formatDate(session.startDateTime)}</p>
                                <p><strong>Time:</strong> {formatDateTime(session.startDateTime)} - {formatDateTime(session.endDateTime)}</p>
                                <p><strong>Venues:</strong></p>
                                <ul style={{ paddingLeft: '20px' }}>
                                    {session.venues.map((venue: Venue, idx: number) => (
                                        <li key={venue.id || idx}> {/* Use venue.id if available */}
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
            {event.eventBudgets && event.eventBudgets.length > 0 && (
                <div className="section-card form-container" style={{ marginBottom: '20px' }}>
                    <h2>Budget Allocation</h2>
                    <BudgetTable budgets={event.eventBudgets} /* budgetCategories={budgetCategoryMap} */ /> {/* Pass categories if fetched */}
                </div>
            )}

            {/* Optional: Actions based on status and user role */}
            {/* In Client Components, you'd typically get user from a client-side AuthContext */}
            {/* Example:
            {/*
            import { useAuth } from '@/context/AuthContext'; // Assuming you have an AuthContext
            // ...
            // const { user } = useAuth();
            // ...
            <div className="form-actions">
                 {user && event.status === EventStatus.PENDING && (
                      <>
                         <button className="button-secondary" onClick={() => router.push(`/my-events/edit/${event.id}`)}>Edit Event</button>
                         <button className="button-secondary" onClick={handleCancelEvent}>Cancel Event</button>
                         {user.role === 'Admin' && <button className="button-primary" onClick={handleApproveEvent}>Approve Event</button>}
                      </>
                 )}
            </div>
            */}
        </div>
    );
}