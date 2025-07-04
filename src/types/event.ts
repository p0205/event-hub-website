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
  
}

export enum EventType {
    TALK = 'TALK',
    SEMINAR = 'SEMINAR',
    WORKSHOP = 'WORKSHOP',
    CONFERENCE = 'CONFERENCE',
    SYMPOSIUM = 'SYMPOSIUM',
    HACKATHON = 'HACKATHON',
    CODE_CHALLENGE = 'CODE_CHALLENGE',
    INNOVATION_PITCH = 'INNOVATION_PITCH',
    BOOTCAMP = 'BOOTCAMP',
    CAREER_TALK = 'CAREER_TALK',
    SOFT_SKILLS_TRAINING = 'SOFT_SKILLS_TRAINING',
    STUDENT_FORUM = 'STUDENT_FORUM',
    CLUB_MEETING = 'CLUB_MEETING',
    INDUSTRY_VISIT = 'INDUSTRY_VISIT',
    COMPANY_SHOWCASE = 'COMPANY_SHOWCASE',
    NETWORKING_EVENT = 'NETWORKING_EVENT',
    COMPETITION = 'COMPETITION',
    EXHIBITION = 'EXHIBITION',
    FESTIVAL = 'FESTIVAL',
    CULTURAL_EVENT = 'CULTURAL_EVENT',
}

  
export interface CalendarEvent {
    eventId: number;
    eventName: string;
    eventType? :string;
    description? :string;
    sessionId: number;
    sessionName: string;
    startDateTime: string;
    endDateTime: string;
    venueNames: string;
}

interface EventDetailsSessionDTO {
    id: number;
    sessionName: string;
    startDateTime: string;
    endDateTime: string;
    venues: SimpleVenueDTO[];
}

export interface EventDetails {
    id: number;
    eventName: string;
    description: string;
    registerDate: string;
    startDateTime: string;
    endDateTime: string;
    organizerName: string;
    picName: string;
    picContact: string;
    picEmail: string;
    sessions: EventDetailsSessionDTO[];
    eventType: string;
}
/**
 * Interface for the main Event object structure.
 */
export interface Event {
    id?: number; // Backend uses Integer
    name?: string;
    description?: string | null; // Description can be null
    organizerId?: number; // Backend uses Integer
    organizerName?: string; // Backend uses Integer
    startDateTime?: string; // ISO string like "YYYY-MM-DDTHH:mm:ss"
    endDateTime?: string | null; // End time can be null
    status: EventStatus; // Use the enum
    supportingDocument?: SupportingDocument | null; // Optional supporting document
    participantsNo?: number; // Number of participants
    sessions: Session[]; // Array of session/venue details (backend calls them EventVenue)
    eventBudgets: EventBudget[]; // Array of budget details (backend calls them EventBudget)
    team?: TeamMember[];     // Added team members
    posters?: string[]; 
    type: EventType;

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
    budgetCategoryName: string; // Store category name used in select
}
export interface AddExpensePayload {
    budgetCategoryId: number | null;
    amount: number;

}
/**
 * Interface for a Venue.
 */
export interface Venue {
    id: string;
    name: string;
    fullName: string;
    location: string; // e.g., building, room number
    capacity: number;
    // Add other venue properties
}

export interface SimpleVenueDTO {
    id: string;
    name: string;
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

export interface EventMedia {
    id: number;
    filename: string;
    fileUrl: string;
    uploadedAt: string;
}
export interface EventReport {
    id: number;
    reportType: string;
    fileUrl?: string;
    generatedAt?: string;
}

export interface SessionAttendance {
    sessionName: string;
    totalAttendees: number;
    sessionAttendanceRate: number;
}

export interface AttendanceOverview {
    attendanceReport: EventReport;
    sessionAttendances: SessionAttendance[];
}
export interface BudgetOverview {
    budgetReport: EventReport;
    totalBudget: number;
    totalExpenses: number;
    remaining: number;
}

export interface FeedbackOverview {
    feedbackReport: EventReport;
    averageRating: number;
    feedbackCount: number;
    ratings: Rating[];
}

export interface Rating {
    rating: number;
    numberOfRating: number;
}

export interface EventReportOverview {
    eventName: string;
    attendance: AttendanceOverview;
    budget: BudgetOverview;
    feedback: FeedbackOverview;
}

/**
 * DTO for manual inputs required to generate a post-event article.
 */
export interface ArticleManualInputsDto {
    organizingBody: string;
    creditIndividuals: string;
    eventObjectives: string;
    activitiesConducted: string;
    targetAudience: string;
    perceivedImpact: string;
    acknowledgements: string;
    appreciationMessage: string;
    language: string; // 'en' for English, 'ms' for Bahasa Melayu
}

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
    type: string;  // Add type field
}



export interface CreateSessionData {
    id: string; // Unique ID for managing the session in the UI
    sessionName: string; // Name for the specific session/part of the event
    startDateTime: string; // Combined Date + Time for this session's start
    endDateTime: string; // Combined Date + Time for this session's end
    venueIds?: string[]; // allow multiple venues for a session
    qr_code_path?: string;
    date?: string; // Separate date field for form input control
    startTimeOnly: string; // Separate start time field for form input control
    endTimeOnly: string; // Separate end time field for form input control
    durationError?: string;   // For duration error messages
    durationWarning?: string  // For duration warning messages
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

export interface DemographicsSummary {
    totalNumber: number;
    byFaculty: Record<string, number>;
    byCourse: Record<string, number>;
    byYear: Record<string, number>; // Assuming year might be treated as number for grouping
    byGender: Record<string, number>; // Added gender demographics
    byRole: Record<string, number>; // Added role demographics
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
export interface Attendee {
    userId: string;
    name: string;
    email: string;
    faculty?: string; // Include faculty for context in the list
    course?: string; // Include course
    year?: number; // Include year
    // Attendance status for the selected session
    checkinDateTime: string; // Timestamp if attended
    phoneNo: string;
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
    roles: string; // Role assigned in this event's team
}

export interface SearchUserInTeam {
    id: number;
    name: string;
    email: string;
    hasRole: number;
}
