// src/services/budgetService.ts
import { Session } from '@/types/event';
import api from './api'; // Import the central API client
import { HttpStatusCode } from 'axios';

const sessionService = {
    getSessionsByEventId: async (eventId: number): Promise<Session[]> => { // Replace 'any' with actual types
        const response = await api.get(`/events/${eventId}/sessions`);
        if(response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to fetch sessions');
        }
        return response.data; // axios puts the response body in .data
    },

    generateQRCode: async (eventId: number, sessionId: number, expiresAt?: string): Promise<Blob> => {
        try {
            const url = `/events/${eventId}/attendance/${sessionId}/qr_generate`; 
            console.log(url);
            const params: { expiresAt?: string } = {};

            if (expiresAt) {
                params.expiresAt = expiresAt;
            }

            // Use responseType: 'blob' to handle binary data like images
            const response = await api.get(url, {
                params,
                responseType: 'blob' // Important for binary data
            });

            if (response.status !== HttpStatusCode.Ok) {
                throw new Error(`Failed to generate QR code. Status: ${response.status}`);
            }

            return response.data;

        } catch (error) {
            console.error('Error generating QR code:', error);
            throw error;
        }
    }
};

export default sessionService;