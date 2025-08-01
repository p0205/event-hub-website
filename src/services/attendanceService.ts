// src/services/budgetService.ts
import { Attendee } from '@/types/event';
import api from './api'; // Import the central API client
import { HttpStatusCode } from 'axios';
import { PageData } from '@/types/api';

const attendanceService = {

    getCheckInParticipantsBySessionId: async (
        eventId: number,
        sessionId: number,
        page: number = 0, // Add page and size parameters for pagination
        size: number = 10, // Default to 10 per page 
        // Add sort and filter parameters if needed
        // sortBy?: string,
        // sortOrder?: 'asc' | 'desc'
    ): Promise<PageData<Attendee>> => {
        // Construct query parameters for pagination
        const params = {
            page: page, // Backend usually expects 0-indexed page number
            size: size,
            // Add sort and filter params here if implementing
            // sortBy: sortBy,
            // sortOrder: sortOrder,
        };

        // Use the correct endpoint path that your backend controller provides
        // Based on the backend example, this might be /api/sessions/{sessionId}/attendees
        const response = await api.get<PageData<Attendee>>(`events/${eventId}/attendance/${sessionId}`, {
            params: params // Pass pagination parameters
        });

        if (response.status !== HttpStatusCode.Ok) {
            // It's good practice to throw the actual error response if possible
            const errorData = response.data as { message?: string }; // Attempt to cast to proper type to access potential error body
            const errorMessage = errorData?.message || `Failed to get attendees for session ${sessionId}. Status: ${response.status}`;
            throw new Error(errorMessage);
        }

        // axios puts the response body in .data, which should match BackendPage<Attendee> type
        return response.data;
    },

    // Add new method to export attendance data as CSV
    exportAttendanceCSV: async (eventId: number, sessionId: number): Promise<Blob> => {
        try {
            const response = await api.get(`events/${eventId}/attendance/${sessionId}/export`, {
                responseType: 'blob' // Important: This tells axios to handle the response as a blob
            });

            if (response.status !== HttpStatusCode.Ok) {
                throw new Error('Failed to export attendance data');
            }

            return response.data;
        } catch (error: unknown) {
            console.error('Error exporting attendance data:', error);
            const errorResponse = error as { response?: { data?: { message?: string } } };
            throw new Error(errorResponse.response?.data?.message || 'Failed to export attendance data');
        }
    },

    // Add new method for QR code check-in
    checkIn: async (qrCodePayload: string, email: string): Promise<unknown> => {
        try {
            const response = await api.post('/check_in', {
                qrCodePayload,
                email
            });
            if (response.status !== HttpStatusCode.Ok && response.status !== HttpStatusCode.Created) {
                throw new Error(response.data?.message || 'Failed to check in');
            }
            return response.data;
        } catch (error: unknown) {
            console.error('Error during check-in:', error);
            const errorResponse = error as { response?: { data?: { message?: string } } };
            throw new Error(errorResponse.response?.data?.message || 'Failed to check in');
        }
    }
};

export default attendanceService;