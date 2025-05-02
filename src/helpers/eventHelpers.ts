import venueService from "@/services/venueService";
import { CreateSessionData, Venue } from "@/types/event";

// Helper function to format date and time
export const formatDateTime = (dateTimeString: string | null | undefined): string => {
    if (!dateTimeString) return 'N/A';
    try {
        const date = new Date(dateTimeString);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        // Format as 'YYYY-MM-DD HH:mm' or similar readable format
        // Adjust locale and options as needed
        return date.toLocaleString(undefined, {
            // year: 'numeric',
            // month: 'short',
            // day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true, // Use 12-hour format with AM/PM
        });
    } catch (error) {
        console.error("Error formatting date:", dateTimeString, error);
        return 'Error Formatting Date';
    }
};

// Helper function to format date only
export const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return 'Error Formatting Date';
    }
};

// Helper to group sessions by sessionName + startDateTime + endDateTime
export const groupSessions = async (eventVenues: CreateSessionData[]): Promise<{ sessionName: string; startDateTime: string; endDateTime: string; venues: Venue[] }[]> => {
    const sessionMap: Map<string, { sessionName: string; startDateTime: string; endDateTime: string; venues: Venue[] }> = new Map(); // Use a Map to group sessions by unique keys

    console.log("Event Venues:", eventVenues); // Debugging log

    // Use a for...of loop instead of forEach to correctly handle await
    for (const eventVenue of eventVenues) {
        const key = `${eventVenue.sessionName}-${eventVenue.startDateTime}-${eventVenue.endDateTime}`;

        // Ensure the session entry exists in the map
        if (!sessionMap.has(key)) {
            sessionMap.set(key, {
                sessionName: eventVenue.sessionName,
                startDateTime: eventVenue.startDateTime,
                endDateTime: eventVenue.endDateTime || '', // Handle potential null/undefined endDateTime
                venues: []
            });
        }

        // Get the session object (we know it exists now)
        const session = sessionMap.get(key)!; // Use non-null assertion (!) as we ensured it exists

        try {
            // --- Correction: Await the fetch directly inside the loop ---
            const venue = await venueService.fetchVenue(eventVenue.venueId);
            console.log("Adding venue to session:", venue); // Debugging log

            if (venue) { // Optional: Check if venue fetch was successful
                session.venues.push(venue); // Push venue info
                console.log("Current session venues for key", key, ":", session.venues); // Debugging log
            } else {
                 console.warn(`Venue not found for ID: ${eventVenue.venueId}`);
                 // Optionally push a placeholder or skip if venue fetch fails
            }
        } catch (error) {
            console.error(`Error fetching venue ${eventVenue.venueId} for session ${key}:`, error);
            // Decide how to handle errors, e.g., skip adding the venue
        }
    }

    const groupedSessions = Array.from(sessionMap.values());
    console.log("Grouped Sessions (Final):", groupedSessions); // Debugging log
    return groupedSessions;
};
  
