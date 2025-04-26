// src/types/event.ts
/**
 * Enum for possible Event Status values from the backend.
 */
export enum EventStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    ARCHIVED = 'ARCHIVED',
    CANCELLED = 'CANCELLED',
    // Add other statuses if your backend supports them
}
/**
 * Interface for the main Event object structure.
 */
export interface Event {
    id?: number; // Backend uses Integer
    name?: string;
    description?: string | null; // Description can be null
    organizerId?: number; // Backend uses Integer
    startDateTime?: string; // ISO string like "YYYY-MM-DDTHH:mm:ss"
    endDateTime?: string | null; // End time can be null
    status?: EventStatus; // Use the enum
    qrCodePath?: string | null; // Path to QR code, can be null
    supportingDocument?: SupportingDocument | null; // Optional supporting document
    participantsNo?: number; // Number of participants
    eventVenues?: EventVenue[]; // Array of session/venue details (backend calls them EventVenue)
    eventBudgets: EventBudget[]; // Array of budget details (backend calls them EventBudget)
    // Note: The backend response doesn't include nested User or full Venue objects directly in the main Event structure here.
}



export interface SupportingDocument {
    id: number;
    filename: string;
    fileType: string; // e.g., "application/pdf"
    data: string; // Base64 encoded file content
    uploadedAt: string; // ISO string
}

/**
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
    eventBudgets: EventBudget[];
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
    venueIds: string[]; // ID of the selected venue for this session
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
    id: string; // Unique ID for managing the session in the UI (not backend ID)
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
    capacity: number;
    // Add other venue properties
}

export interface BudgetCategory {
    id: number;
    name: string;
}

export interface SimpleEvent {
    id: number;
    name: string;
    startDateTime: string;
    status: EventStatus;
}

export interface EventList{
    pendingEvents: SimpleEvent[];
    activeEvents: SimpleEvent[];
    completedEvents: SimpleEvent[];
}