// src/services/budgetService.ts
import { EventMedia } from '@/types/event';
import api from './api'; // Import the central API client
import { HttpStatusCode } from 'axios';

const eventMediaService = {
    addEventMedia: async (formdata: FormData, eventId :number): Promise<void> => {
        const response = await api.post(`/events/${eventId}/media`, formdata);
        if(response.status !== HttpStatusCode.Created) {
            throw new Error('Failed to add new media');
        }
        // return response.data; // axios puts the response body in .data
    },

    getEventMedia: async (eventId: number): Promise<EventMedia[]> => { 
        const response = await api.get<EventMedia[]>(`/events/${eventId}/media`);
        if(response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to get event media');
        }
        return response.data;
    },


};

export default eventMediaService;