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

export default function BreadcrumbSlot() {
    const params = useParams<{ id: string }>();
    const [eventName, setEventName] = useState<string>('Loading...');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const eventIdString = params.id;

        // Validate ID
        if (!eventIdString || isNaN(parseInt(eventIdString, 10))) {
            setError("Invalid event ID");
            setIsLoading(false);
            return;
        }

        const eventId = parseInt(eventIdString, 10);

        const fetchEventName = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                console.log("Fetching event name for breadcrumb, ID:", eventId);
                const name = await eventService.getEventNameById(eventId);
                
                if (name) {
                    setEventName(name);
                } else {
                    setError("Event not found");
                }
            } catch (err: any) {
                console.error(`Failed to fetch event name for breadcrumb ${eventId}:`, err);
                
                if (err.isAxiosError && err.response?.status === 404) {
                    setError("Event not found");
                } else if (err.isAxiosError && err.response?.status === 403) {
                    setError("Access denied");
                } else {
                    setError("Failed to load event");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchEventName();
    }, [params.id]);

    // Determine what to display in the breadcrumb
    const getDisplayText = () => {
        if (isLoading) return 'Loading...';
        if (error) return error;
        return eventName;
    };

    return (
        <BreadcrumbList>
            <BreadcrumbItem>
                <BreadcrumbLink href="/my-events">My Events</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
                <BreadcrumbLink href="/my-events/completed">Completed</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
                <BreadcrumbPage className="capitalize">
                    {getDisplayText()}
                </BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
    );
}