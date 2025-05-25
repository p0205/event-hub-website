// src/app/@breadcrumb/events/active/[id]/participants/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; 
import {
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/Breadcrumbs';
import eventService from '@/services/eventService'; 

export default function ParticipantsBreadcrumbSlot() {
    const params = useParams<{ id: string }>(); // <--- Get params using the hook

    const [eventName, setEventName] = useState<string>('Loading Event...'); // Default loading state
    const [eventId, setEventId] = useState<number | null>(null); // State for the numeric event ID
    const [error, setError] = useState<string | null>(null); // State for error handling
    const [isLoading, setIsLoading] = useState<boolean>(true); // State for loading status

    useEffect(() => {
        const eventIdString = params.id;

        if (!eventIdString || isNaN(parseInt(eventIdString, 10))) {
            console.error("Invalid event ID for participants breadcrumb:", eventIdString);
            setError("Invalid event ID.");
            setIsLoading(false);
            // As before, notFound() here is tricky; parent page should handle full 404.
            return;
        }

        const numericEventId = parseInt(eventIdString, 10);
        setEventId(numericEventId); // Store the numeric ID for use in links

        const fetchEventNameForBreadcrumb = async () => {
            setIsLoading(true);
            setError(null);
            try {
                console.log("Fetching event name for participants breadcrumb (Client Component), ID:", numericEventId);
                const name = await eventService.getEventNameById(numericEventId);
                setEventName(name);
            } catch (err: any) {
                console.error(`Failed to fetch event name for breadcrumb ${numericEventId}/participants:`, err);
                if (err.isAxiosError && err.response?.status === 404) {
                    setError("Event name not found.");
                } else if (err.isAxiosError && err.response?.status === 403) {
                    setError("Access Denied (403).");
                } else {
                    setError('Error Loading Event Name');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchEventNameForBreadcrumb();

    }, [params.id]); // <--- Dependency array, re-run if id changes

    // Display for loading or error states
    let displayEventName: string = eventName;
    if (isLoading) {
        displayEventName = 'Loading...';
    } else if (error) {
        displayEventName = error; // Show the error message in place of the event name
    }

    return (
        <BreadcrumbList>
            <BreadcrumbItem>
                <BreadcrumbLink href="/events">Events</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
                <BreadcrumbLink href="/events/active">Active</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
                {/* Link to the specific event page.
                    Disable link if eventId is not yet available or if there was an error fetching the name.
                */}
                {eventId && !error ? (
                    <BreadcrumbLink href={`/events/active/${eventId}`}>
                        {displayEventName}
                    </BreadcrumbLink>
                ) : (
                    // Display the name (which could be 'Loading...' or an error message)
                    // without a link if ID is missing or there's an error.
                    <BreadcrumbPage className="capitalize">{displayEventName}</BreadcrumbPage>
                )}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
                <BreadcrumbPage>Team</BreadcrumbPage> {/* "Team" or "Participants" */}
            </BreadcrumbItem>
        </BreadcrumbList>
    );
}