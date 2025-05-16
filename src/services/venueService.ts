// src/services/venueService.ts
import { Venue } from '@/types/event';
import api from './api'; // Import the central API client
import { HttpStatusCode } from 'axios';

const venueService = {
    addVenue: async (venue: Venue): Promise<Venue> => { // Replace 'any' with actual types
        const response = await api.post(`/venue`, venue);
        if(response.status !== HttpStatusCode.Created) {
            throw new Error('Failed to add new venue');
        }
        return response.data; // axios puts the response body in .data
    },

    fetchVenue: async (id: number): Promise<Venue> => { // Replace 'any' with actual types
        const response = await api.get<Venue>(`/venue/${id}`);
        if(response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to fetch venue');
        }
        return response.data;
    },

    fetchVenues: async (): Promise<Venue[]> => { 
        const response = await api.get<Venue[]>(`/venue`);
        if(response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to fetch venues');
        }
        return response.data;
    },

    fetchVenuesByCapacity: async (capacity:number): Promise<Venue[]> => { 
        const response = await api.get<Venue[]>(`/venue/capacity`,{
            params:{capacity}
        });
        if(response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to fetch venues');
        }
        return response.data;
    },

    // Function to check if the user is currently authenticated (e.g., validates token/session)
    deleteVenue: async (id: number): Promise<void> => { // Returns user data or null
        const response = await api.delete(`/venue/${id}`);
        if (response.status !== HttpStatusCode.NoContent) {
            throw new Error('Failed to delete venue');
        }
    },

};

export default venueService;