// src/app/@breadcrumb/events/active/[id]/participants/page.tsx

import {
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "../../../../../../components/Breadcrumbs"; // Adjust path!

import eventService from '@/services/eventService'; // Adjust path!
import { notFound } from 'next/navigation';

export default async function BreadcrumbSlot({ params }: { params: Promise<{ id: string }> }) {
    const awaitedParams = await params;
    const eventIdString = awaitedParams.id;

    if (!eventIdString || isNaN(parseInt(eventIdString, 10))) {
         notFound();
    }

    const eventId = parseInt(eventIdString, 10);

    let eventName: string = 'Loading Event...';

    try {
        eventName = await eventService.getEventNameById(eventId);
    } catch (err: any) {
        console.error(`Failed to fetch event name for breadcrumb ${eventId}/participants:`, err);
         if (err.response?.status === 404) {
              notFound();
         }
        eventName = 'Error Loading Event Name';
    }

    return (
        <BreadcrumbList>
             {/* Add the Home link if desired */}
            {/* Example:
            <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            */}

            <BreadcrumbItem>
                <BreadcrumbLink href="/events">Events</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
                <BreadcrumbLink href="/events/active">Active</BreadcrumbLink> {/* Correct href */}
            </BreadcrumbItem>
            <BreadcrumbSeparator />

            {/* Link to the specific event page, using the fetched name */}
            <BreadcrumbItem>
                 <BreadcrumbLink href={`/events/active/${eventId}`}>
                    {eventName} {/* Use the fetched name */}
                 </BreadcrumbLink>
            </BreadcrumbItem>
             <BreadcrumbSeparator />

            {/* The last item: "Participants" */}
            <BreadcrumbItem>
                <BreadcrumbPage>Participants</BreadcrumbPage> {/* Hardcoded page name */}
            </BreadcrumbItem>

        </BreadcrumbList>
    );
}