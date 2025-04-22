// src/types/auth.ts

// Interface for the data expected when a user logs in
interface LoginCredentials {
    email: string;
    password: string;
    // Add other fields if your login requires them (e.g., rememberMe)
    // rememberMe?: boolean;
}

// Interface for the data expected when a user registers
interface RegistrationData {
    name: string;
    email: string;
    password: string;
    // Add other required/optional fields for registration (e.g., faculty, course, year)
    // faculty?: string;
    // course?: string;
    // year?: number;
}

// Interface for the response data after a successful login or checking auth status
// Adjust this based on what your backend API actually returns
interface AuthSuccessResponse {
    token: string; // Example: if your backend returns a JWT
    user: { // Example: nested user object with basic details
        id: string;
        name: string;
        email: string;
        role: 'Admin' | 'Event Organizer' | 'Participant'; // Make sure roles match your User type
        // Add other basic user details returned upon auth
    };
    // Add other data returned by the backend
    // refreshToken?: string;
    // expiresIn?: number;
}


// Export the interfaces so they can be used in other files
export type { LoginCredentials, RegistrationData, AuthSuccessResponse };