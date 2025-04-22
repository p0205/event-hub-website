import api from './api'; // Import the central API client

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
export const createEventService = async (
  eventFormData: FormData
): Promise<CreateEventSuccessResponse> => {
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
      if (! (response.status === 201)) {
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
      const successData: CreateEventSuccessResponse = await response.data;
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
};

// --- Example Usage (in your CreateEventPage component) ---
/*
import { createEventService } from './path/to/eventService'; // Adjust path

// Inside your handleSubmit function...
try {
  // ... (prepare apiFormData as before) ...

  const result = await createEventService(apiFormData);
  console.log('Event created successfully:', result);
  alert(`Event submitted successfully! ID: ${result.eventId}`);
  // Handle success (e.g., redirect, reset form)

} catch (error: any) {
  console.error("Submission Failed:", error);
  // Display error message to the user
  setFormError(error.message || "An unexpected error occurred during submission.");
  // Optionally inspect error.details or error.statusCode
} finally {
  setIsLoading(false);
}
*/
