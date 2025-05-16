import venueService from "@/services/venueService";
import { CreateSessionData, Venue } from "@/types/event";
import { Time } from "@internationalized/date";

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

// Utility function to parse a time string (e.g., "14:30") into a Time object
export const parseTimeString = (timeString: string): Time | undefined => {
    const [hour, minute] = timeString.split(':').map(Number);
    if (!isNaN(hour) && !isNaN(minute)) {
        return new Time(hour, minute);
    }
    return undefined;
};


  
