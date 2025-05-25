// src/app/(main)/@breadcrumb/events/active/[id]/page.tsx (or your actual path for BreadcrumbSlot)
"use client";

import { useEffect, useState } from 'react'; // <--- Import React hooks
import { useParams, notFound } from 'next/navigation'; // <--- Import useParams for client-side param access
import {
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/Breadcrumbs'; // Assuming this path is correct
import eventService from '@/services/eventService'; // Adjust path as needed

export default function BreadcrumbSlot() {
    const params = useParams<{ id: string }>(); // <--- Get params using the hook

    const [eventName, setEventName] = useState<string>('Loading Event...'); // Default loading state
    const [error, setError] = useState<string | null>(null); // State for error handling
    const [isLoading, setIsLoading] = useState<boolean>(true); // State for loading status

    useEffect(() => {
        const eventIdString = params.id;

        if (!eventIdString || isNaN(parseInt(eventIdString, 10))) {
            // If the ID is missing or not a number, trigger notFound.
            // Note: In Client Components, notFound() should ideally be called during rendering,
            // or you might need to handle this by setting an error state and rendering an error UI.
            // For simplicity here, we'll set an error, but in a real app, you might redirect or show a specific "not found" UI.
            console.error("Invalid event ID for breadcrumb:", eventIdString);
            setError("Invalid event ID.");
            setIsLoading(false);
            // notFound(); // Calling notFound directly in useEffect can be problematic.
                       // It's better to set state and handle it in the return statement.
                       // Or, if this component is part of a page that itself calls notFound(), that might be sufficient.
            return;
        }

        const eventId = parseInt(eventIdString, 10);

        const fetchEventName = async () => {
            setIsLoading(true);
            setError(null);
            try {
                console.log("Fetching event name for breadcrumb (Client Component), ID:", eventId);
                const name = await eventService.getEventNameById(eventId);
                setEventName(name);
            } catch (err: any) {
                console.error(`Failed to fetch event name for breadcrumb ${eventId}:`, err);
                if (err.isAxiosError && err.response?.status === 404) {
                    // If API returns 404, set an error state or handle as "Not Found"
                    setError("Event name not found.");
                    // To truly show a 404 page, the parent page component would typically call notFound()
                    // based on this error state, or you'd redirect.
                } else if (err.isAxiosError && err.response?.status === 403) {
                    setError("Access Denied (403).");
                }
                else {
                    setError('Error Loading Event Name');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchEventName();

    }, [params.id]); // <--- Dependency array, re-run if id changes

    // Handle loading state
    if (isLoading) {
        // You might want a more subtle loading indicator for a breadcrumb
        // or just show "Loading Event..." as the eventName state already does.
        // For this example, we'll rely on the initial eventName state.
    }

    // Handle error state for the breadcrumb item
    if (error && eventName !== 'Error Loading Event Name' && eventName !== 'Event name not found.' && eventName !== 'Access Denied (403).') {
        // If an error occurred but eventName hasn't been updated to an error message yet,
        // update it now. This handles the case where notFound() isn't directly callable
        // in a way that stops rendering of this component.
        // A more robust solution might involve the parent page handling the notFound() call.
        // For now, we'll just display an error in the breadcrumb.
        // This logic can be simplified if notFound() is handled by the page containing this slot.
    }
    
    // If the error state indicates a "Not Found" or critical error where the breadcrumb shouldn't render
    // or should render a specific "Not Found" message, you can adjust the rendering here.
    // For instance, if `error` is "Event name not found.", you might want to call `notFound()`
    // if this component is the one responsible for it, or ensure the parent page does.
    // Since `notFound()` directly in `useEffect` is tricky, we'll display the error message.
    // A common pattern is for the main page component to fetch critical data and call `notFound()`,
    // and breadcrumbs would just reflect the data or a loading/error state.

    return (
        <BreadcrumbList>
            <BreadcrumbItem>
                <BreadcrumbLink href="/events">Events</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
                {/* This link might need to be dynamic based on where the user is coming from,
                    or if this breadcrumb is specifically for "pending" events, it could be:
                    <BreadcrumbLink href="/events/pending">Pending</BreadcrumbLink>
                    For now, using "Active" as per your original code.
                */}
                <BreadcrumbLink href="/events/active">Active</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
                <BreadcrumbPage className="capitalize">
                    {isLoading ? 'Loading...' : error ? error : eventName}
                </BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
    );
}