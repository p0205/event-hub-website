import {
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "../../../../../components/Breadcrumbs";

import eventService from '@/services/eventService'; // Adjust path as needed

// Import the Event type for type safety
import { Event } from '@/types/event'; // Adjust path as needed

// Import notFound for handling cases where the event ID is invalid or not found
import { notFound } from 'next/navigation';

export default async function BreadcrumbSlot({ params }: { params: Promise<{ id: string }> }) {
    const awaitedParams = await params;
    const eventIdString = awaitedParams.id;

    // Handle case where ID is missing or not a valid number
    if (!eventIdString || isNaN(parseInt(eventIdString, 10))) {
        // If the ID is missing or not a number, it's a malformed request, render Next.js's 404 page
        notFound();
    }

    const eventId = parseInt(eventIdString, 10);

    let eventName: string = 'Loading Event...'; // Default loading state

    try {
        // --- Call the API to fetch the event details ---
        // Use your eventService to get the event by ID.
        // This happens on the server side.
        eventName = await eventService.getEventNameById(eventId);

        // If the event is found, use its name

    } catch (err: any) {
        console.error(`Failed to fetch event name for breadcrumb ${eventId}:`, err);
        // If fetching fails (e.g., 404, 500), display an error message or fallback text
        // If it's a 404, calling notFound() is generally better than just showing text.
        if (err.response?.status === 404) {
            notFound(); // Render Next.js 404 page if the API returned 404
        }
        eventName = 'Error Loading Event Name'; // Fallback text for other errors
    }


    return (
        <BreadcrumbList>
            {" "}


            <BreadcrumbItem>
                <BreadcrumbLink href="/events">Events</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
                <BreadcrumbLink href="/events/pending">Pending</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
                <BreadcrumbPage className="capitalize">{eventName}</BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
    );
}