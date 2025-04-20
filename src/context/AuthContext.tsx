// src/context/AuthContext.tsx (Conceptual - add these mock users inside your AuthProvider)
// Assuming your User interface is defined like this (adjust if yours is different):
'use client'; // Ensure this is a client component

interface User {
    id: string;
    name: string;
    email: string;
    // This is the key property for sidebar filtering
    role: 'Admin' | 'Event Organizer' | 'Participant'; // Define your specific authenticated roles
    profileImageUrl?: string;
    faculty?: string | null;
    course?: string | null;
    year?: number | null;
    // Add other user properties that might be in your actual User object
}

// --- Mock User Data for Testing Roles ---

const mockAdminUser: User = {
    id: 'mock-user-admin',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Admin', // Role: Admin
    profileImageUrl: 'https://i.pravatar.cc/150?u=admin-test', // Unique image for easy identification
    faculty: 'Administration',
    course: null,
    year: null,
};

const mockEventOrganizerUser: User = {
    id: 'mock-user-organizer',
    name: 'Event Organizer User',
    email: 'organizer@example.com',
    role: 'Event Organizer', // Role: Event Organizer
    profileImageUrl: 'https://i.pravatar.cc/150?u=organizer-test',
    faculty: 'Management',
    course: 'Event Management',
    year: 4, // Could still have academic details if they are also students
};

const mockParticipantUser: User = {
    id: 'mock-user-participant',
    name: 'Participant User',
    email: 'participant@example.com',
    role: 'Participant', // Role: Participant
    profileImageUrl: 'https://i.pravatar.cc/150?u=participant-test',
    faculty: 'Computer Science',
    course: 'Software Engineering',
    year: 3,
};

// Inside the useEffect in AuthContext.tsx
// src/context/AuthContext.tsx

// Import React hooks and types needed
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import your User interface (adjust path as needed)
// import User from '@/types/user';

// ... rest of your AuthContext.tsx code below this line ...

// Assuming your User interface is defined like this (adjust if yours is different):
interface User {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Event Organizer' | 'Participant'; // Define your specific authenticated roles
    profileImageUrl?: string;
    faculty?: string | null;
    course?: string | null;
    year?: number | null;
    // Add other user properties that might be in your actual User object
}

// --- Mock User Data for Testing Roles ---
// ... (mock user objects here) ...

// --- End Mock User Data ---


// Define the shape of your Auth Context
interface AuthContextType {
    user: User | null; // The logged-in user, or null if not logged in
    loading: boolean; // True while checking auth status
    login: (credentials: any) => Promise<void>; // Placeholder login function
    logout: () => Promise<void>; // Placeholder logout function
    // Add other auth-related functions if needed
}

// Create the Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the Auth Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // The useEffect hook to check initial auth status
    useEffect(() => { // <-- 'useEffect' is now imported and recognized
        const checkAuthStatus = async () => {
            setLoading(true);
            try {
                // Simulate checking authentication status (e.g., reading from cookie/localStorage)
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async check

                // === To test different roles, COMMENT OUT the other lines and keep ONE ===

                // Simulate Admin logged in:
                setUser(mockAdminUser);

                // Simulate Event Organizer logged in:
                // setUser(mockEventOrganizerUser); // <-- Example: set this user

                // Simulate Participant logged in:
                // setUser(mockParticipantUser);

                // Simulate Guest (Not logged in):
                // setUser(null);


            } catch (error) {
                console.error('Error checking auth status:', error);
                setUser(null); // Default to not logged in on error
            } finally {
                setLoading(false);
            }
        };
        checkAuthStatus();
    }, []); // Empty dependency array means this runs once on mount

    // TODO: Implement actual login and logout functions that interact with your backend API
    const login = async (credentials: any) => {
       console.log("Simulating login with:", credentials);
       // Example: const response = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
       // On success: const userData = await response.json(); setUser(userData);
       // On failure: handle error
    };

    const logout = async () => {
        console.log("Simulating logout");
       // Example: const response = await fetch('/api/auth/logout', { method: 'POST' });
       // On success: setUser(null);
    };


    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to easily consume the AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) { // Check for undefined
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};