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

export interface CalendarEvent{
    eventId: number;
    eventName: string;
    sessionId: number;
    sessionName: string;
    startDateTime: string;
    endDateTime: string;
    venueNames: string;
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
    status: EventStatus; // Use the enum
    supportingDocument?: SupportingDocument | null; // Optional supporting document
    participantsNo?: number; // Number of participants
    sessions: Session[]; // Array of session/venue details (backend calls them EventVenue)
    eventBudgets: EventBudget[]; // Array of budget details (backend calls them EventBudget)
    team?: TeamMember[];     // Added team members
    posters?: string[]; // Array of poster image URLs (example)

}



export interface SupportingDocument {
    id: number;
    filename: string;
    fileType: string; // e.g., "application/pdf"
    data: string; // Base64 encoded file content
    uploadedAt: string; // ISO string
}

export interface EventBudget {
    id: string; // Unique ID for managing the item in the UI
    amountAllocated: number; // Allow empty string for input control
    amountSpent: number; // Typically starts at 0 for creation
    budgetCategoryId?: number; // ID from backend
    budgetCategoryName?: string; // Store category name used in select
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

export function createBudgetCategoryMap(budgetCategories: { id: number, name: string }[]) {
    return new Map<number, string>(
        budgetCategories.map((cat) => [cat.id, cat.name])
    );
}

export interface Session {
    id: string; // Unique ID for managing the session in the UI
    sessionName: string; // Name for the specific session/part of the event
    startDateTime: string; // Combined Date + Time for this session's start
    endDateTime?: string; // Combined Date + Time for this session's end
    venues: Venue[]; // ID of the selected venue for this session
    qrCodeImage?: Blob; // Separate date field for form input control
}

export interface EventMedia{
    id:number;
    filename: string;
    fileUrl: string;
    uploadedAt: string;
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
    participantsNo: number | '';
    sessions: CreateSessionData[];
    eventBudgets: EventBudget[];
    supportingDocument?: File;
}



export interface CreateSessionData {
    id: string; // Unique ID for managing the session in the UI
    sessionName: string; // Name for the specific session/part of the event
    startDateTime: string; // Combined Date + Time for this session's start
    endDateTime: string; // Combined Date + Time for this session's end
    venueIds?: string[]; // allow multiple venues for a session
    qr_code_path?: string;
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
// export interface Session {
//     id: string; // Unique ID for managing the session in the UI (not backend ID)
//     eventId: string; // Link back to the event
//     name: string;
//     date: string; // Session date (can be different from event date)
//     startTime: string; // Session start time
//     endTime?: string; // Optional session end time
//     venueId: string; // Link to session venue
//     // Add other session properties
//     description?: string;
//     speaker?: string;
//     qrCodeUrl?: string; // URL for the attendance QR code (if backend generates)
// }


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


export interface SimpleEvent {
    id: number;
    name: string;
    startDateTime: string;
    status: EventStatus;
    createdAt: string;
}

export interface EventList {
    pendingEvents: SimpleEvent[];
    activeEvents: SimpleEvent[];
    completedEvents: SimpleEvent[];
}

export interface Role {
    id: number;
    name: string;
}
export interface TeamMember {
    userId: number; // User ID
    name: string;
    email: string;
    role: string; // Role assigned in this event's team
}
