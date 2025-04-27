// --- eventService.ts ---
import { HttpStatusCode } from 'axios';
import api from './api'; // Import the central API client
import { Event, EventList, SimpleEvent } from '@/types/event';

/**
 * Represents the expected successful response structure from the create event API.
 * Adjust this based on what your backend actually returns.
 */
interface CreateEventSuccessResponse {
  eventId: number; // Example: ID of the newly created event
  message: string; // Example: Confirmation message
  // Include other relevant data returned by the API
  // e.g., final event details, approval status, etc.
}

interface GetEventSuccessResponse {

  message: string; // Example: Confirmation message
  event: Event; // Example: Event object containing all details
  // Include other relevant data returned by the API
  // e.g., final event details, approval status, etc.
}

/**
* Represents the expected error response structure from the API.
* Adjust this based on how your backend formats errors.
*/
interface ApiErrorResponse {
  message: string; // Primary error message
  errors?: Record<string, string[]>; // Optional field-specific errors
  statusCode?: number; // HTTP status code
}

/**
* Service function to create a new event by sending data to the backend API.
*
* @param {FormData} eventFormData - The FormData object containing all event details,
* including serialized JSON for nested structures
* (like eventVenues, eventBudgets) and the optional
* supportingDocument file.
* @returns {Promise<CreateEventSuccessResponse>} A promise that resolves with the success response from the API.
* @throws {Error} Throws an error if the API call fails, containing details from the API response if possible.
*/

const eventService = {

  // ... (other service functions like createEvent, getAllEvents, etc.) ...

  /**
   * Fetches a specific event by its ID.
   * Corresponds to backend: GET /events/{id}
   * @param id The ID of the event to fetch. (Backend uses Integer, so frontend passes number)
   * @returns A Promise resolving to a single Event object.
   * @throws An error if the event is not found (e.g., 404) or another API error occurs.
   */
  getEventById: async (id: number): Promise<Event> => {
    console.log("API Call: GET /events/", id);
    // Makes a GET request to the backend endpoint /events/:id
    // Axios will automatically append this path to the baseURL configured in api.ts
    // Example: If baseURL is http://localhost:8080, this calls http://localhost:8080/events/21
    // The <Event> after api.get is a TypeScript generic indicating the expected shape of the response data.
    const response = await api.get<Event>(`/events/${id}`);

    if (response.status !== HttpStatusCode.Ok) {
      throw new Error('Failed to fetch event');
    }
    // Axios puts the actual data payload from the backend response body into the .data property.
    return response.data;

    // Note: If the backend returns a non-2xx status code (like 404 Not Found),
    // Axios will typically throw an error by default. This error can be caught
    // by the component or code that calls getEventById (e.g., in a try...catch block).
  },

  /**
 * Fetches a specific event by its ID.
 * Corresponds to backend: GET /events/{id}
 * @param id The ID of the event to fetch. (Backend uses Integer, so frontend passes number)
 * @returns A Promise resolving to a string event name.
 * @throws An error if the event is not found (e.g., 404) or another API error occurs.
 */
  getEventNameById: async (id: number): Promise<string> => {
    console.log("API Call: GET /events/", id, "/name");
    // Makes a GET request to the backend endpoint /events/:id
    const response = await api.get<string>(`/events/${id}/name`);

    if (response.status !== HttpStatusCode.Ok) {
      throw new Error('Failed to fetch event name');
    }
    // Axios puts the actual data payload from the backend response body into the .data property.
    return response.data;

  },


  createEventService: async (
    eventFormData: FormData
  ): Promise<Event> => {
    // --- Configuration ---
    // Replace with your actual API endpoint for creating events
    const API_ENDPOINT = '/events'; // Example: Adjust to your backend route

    try {
      console.log('Sending data to API endpoint:', API_ENDPOINT);
      // Log FormData contents (for debugging - might not show files easily)
      // eventFormData.forEach((value, key) => {
      //     console.log(`${key}:`, value);
      // });

      const response = await api.post(API_ENDPOINT, eventFormData);

      // Check if the response status code indicates success (e.g., 200 OK, 201 Created)
      if (!(response.status === 201)) {
        let errorData: ApiErrorResponse | null = null;
        try {
          // Attempt to parse error details from the response body
          errorData = await response.data;
        } catch (parseError) {
          // If parsing fails, use the status text as the message
          console.error("Failed to parse error response:", parseError);
        }

        // Construct a meaningful error message
        const errorMessage =
          errorData?.message ||
          `API Error: ${response.status} ${response.statusText}`;

        console.error('API Error Response:', errorData || response.statusText);
        // Throw an error that includes details if available
        const error = new Error(errorMessage) as Error & { details?: any; statusCode?: number };
        error.details = errorData; // Attach full error details if parsed
        error.statusCode = response.status;
        throw error;
      }

      // Parse the successful JSON response
      const successData: Event = await response.data;
      console.log('API Success Response:', successData);

      return successData;

    } catch (error) {
      // Handle network errors or errors thrown from response handling
      console.error('Error in createEventService:', error);

      // Re-throw the error so the calling component can handle it (e.g., update UI)
      // If it's not already a detailed error, wrap it
      if (error instanceof Error && !(error as any).statusCode) {
        throw new Error(`Network error or client-side issue: ${error.message}`);
      }
      throw error; // Re-throw the original (potentially detailed) error
    }
  },

  fetchEvents: async (organizerId:number): Promise<EventList> => {
    console.log("API Call: GET /events/byOrganizer");
    // Makes a GET request to the backend endpoint /events
    const response = await api.get<EventList>(`/events/byOrganizer`, {
      params: { organizerId }
    });

    if (response.status !== HttpStatusCode.Ok) {
      throw new Error('Failed to fetch events list');
    }
    // Axios puts the actual data payload from the backend response body into the .data property.
    return response.data;
  },

  getEventsByStatus: async (organizerId:number, status: string): Promise<SimpleEvent[]> => {
    console.log("API Call: GET /events/byOrganizerAndStatus");
    // Makes a GET request to the backend endpoint /events
    const response = await api.get<SimpleEvent[]>(`/events/byOrganizerAndStatus`, {
      params: { organizerId, status }
    });

    if (response.status !== HttpStatusCode.Ok) {
      throw new Error('Failed to fetch events list');
    }
    // Axios puts the actual data payload from the backend response body into the .data property.
    return response.data;
  }

  // ... (rest of the eventService object) ...
};


export default eventService; 