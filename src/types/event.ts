// src/types/event.ts

/**
 * Interface for the main Event object structure.
 */
export interface Event {
    id: string;
    name: string;
    description?: string; // Optional description
    date: string; // Event date (e.g., 'YYYY-MM-DD')
    startTime: string; // Event start time (e.g., 'HH:mm')
    endTime?: string; // Optional event end time (e.g., 'HH:mm')
    venue?: Venue; // Assuming venue details are nested or linked
    organizerId: string; // ID of the user who organized the event
    status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'ARCHIVED' | 'CANCELLED'; // Event status
    // Add other event properties like capacity, registration status, etc.
    capacity?: number;
    isRegistrationOpen: boolean;
    registeredParticipantsCount?: number; // Optional: count from backend
    // Add sessions if they are part of the main event object
    sessions?: Session[];
    // Add participants if they are part of the main event object (might be too large for list views)
    participants?: Participant[];
}

/**
 * Interface for data needed to create a new Event.
 */
// src/types/event.ts

/**
 * Interface for data needed to create a new Event.
 */
    export interface CreateEventData {
        name: string;
        description: string;
        organizerId: number;
        startDateTime: string; // ISO format, e.g., "2025-05-21T09:00"
        endDateTime: string;
        participantsNo: number | '';
        eventVenues: EventVenue[];
        eventBudgets:EventBudget[];
    supportingDocument?: File;
    }

    export interface EventBudget {
        id: string; // Unique ID for managing the item in the UI
        amountAllocated: number | ''; // Allow empty string for input control
        amountSpent: number; // Typically starts at 0 for creation
        budgetCategoryId?: number; // ID from backend
        categoryName?: string; // Store category name used in select
    }
    
    export interface EventVenue {
        id: string; // Unique ID for managing the session in the UI
        sessionName: string; // Name for the specific session/part of the event
        startDateTime: string; // Combined Date + Time for this session's start
        endDateTime?: string; // Combined Date + Time for this session's end
        venueId?: string; // ID of the selected venue for this session
        date?: string; // Separate date field for form input control
        startTimeOnly?: string; // Separate start time field for form input control
        endTimeOnly?: string; // Separate end time field for form input control
    }
    
/**
 * Interface for data needed to update an existing Event.
 * Uses Partial to indicate that not all fields are required for an update.
 */
export interface UpdateEventData extends Partial<CreateEventData> {
    // You might include the event ID here if your update endpoint requires it in the body
    // id: string;
    // Add any other fields specific to updating
    status?: Event['status']; // Allow updating status
}


/**
 * Interface for a Session within an Event.
 */
export interface Session {
    id: string;
    eventId: string; // Link back to the event
    name: string;
    date: string; // Session date (can be different from event date)
    startTime: string; // Session start time
    endTime?: string; // Optional session end time
    venueId: string; // Link to session venue
    // Add other session properties
    description?: string;
    speaker?: string;
    qrCodeUrl?: string; // URL for the attendance QR code (if backend generates)
}

/**
 * Interface for data needed to create a new Session.
 */
export interface CreateSessionData {
    name: string;
    date: string;
    startTime: string;
    endTime?: string;
    venueId: string;
    description?: string;
    speaker?: string;
    // Backend will typically link it to the event ID upon creation
}


/**
 * Interface for a Participant registered for an Event.
 */
export interface Participant {
    id: string; // Participant's user ID
    name: string; // Participant's name
    email: string; // Participant's email
    faculty?: string | null;
    course?: string | null;
    year?: number | null;
    // Add other participant details if needed (e.g., registration date)
    registrationDate?: string;
}

/**
 * Interface for an Attendance Record for a specific Participant and Session.
 */
export interface AttendanceRecord {
    id: string; // ID of the attendance record itself
    participantId: string; // ID of the participant
    sessionId: string; // ID of the session
    timestamp: string; // When attendance was recorded (ISO string)
    method: 'QR' | 'Manual'; // How attendance was recorded
    // Add other relevant attendance details
}

/**
 * Interface for a Venue.
 */
export interface Venue {
    id: string;
    name: string;
    location: string; // e.g., building, room number
    capacity?: number;
    // Add other venue properties
}

// You would define interfaces for Budget, Team, Media, Report data in their respective files (budget.ts, team.ts, media.ts, report.ts)
