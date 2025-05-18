// src/types/auth.ts

import { User } from "./user";

// Interface for the data expected when a user logs in
interface LoginCredentials {
    email: string;
    rawPassword: string;
    // Add other fields if your login requires them (e.g., rememberMe)
    // rememberMe?: boolean;
}

// Interface for the data expected when a user registers
interface RegistrationData {
    userDTO: User;
    phoneNo: string;
    rawPassword: string;
    // Add other required/optional fields for registration (e.g., faculty, course, year)
    // faculty?: string;
    // course?: string;
    // year?: number;
}


// Export the interfaces so they can be used in other files
export type { LoginCredentials, RegistrationData };