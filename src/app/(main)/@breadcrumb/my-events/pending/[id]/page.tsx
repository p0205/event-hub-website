"use client";

import {
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/Breadcrumbs";

import eventService from '@/services/eventService';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from "react";

export default function BreadcrumbSlot() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [eventName, setEventName] = useState<string>('Loading Event...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const eventIdString = params.id;

        if (!eventIdString || isNaN(parseInt(eventIdString, 10))) {
            console.error("Invalid event ID for breadcrumb:", eventIdString);
            setError("Invalid event ID.");
            return;
        }

        const eventId = parseInt(eventIdString, 10);

        const fetchEventName = async () => {
            try {
                const name = await eventService.getEventNameById(eventId);
                setEventName(name);
            } catch (err: any) {
                console.error(`Failed to fetch event name for breadcrumb ${eventId}:`, err);
                if (err.isAxiosError && err.response?.status === 404) {
                    setError("Event name not found.");
                    router.push("/404"); // Optional, navigate to a 404 page if needed
                } else if (err.isAxiosError && err.response?.status === 403) {
                    setError("Access Denied (403).");
                } else {
                    setError("Error Loading Event Name");
                }
            }
        };

        fetchEventName();

    }, [params.id]);

    // Render Error State
    if (error) {
        return <BreadcrumbList><BreadcrumbPage>{error}</BreadcrumbPage></BreadcrumbList>;
    }

    return (
        <BreadcrumbList>
            <BreadcrumbItem>
                <BreadcrumbLink href="/my-events">My Events</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
                <BreadcrumbLink href="/my-events/pending">Pending</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
                <BreadcrumbPage className="capitalize">{eventName}</BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
    );
}
