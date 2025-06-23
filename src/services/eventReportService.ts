// src/services/budgetService.ts
import { ArticleManualInputsDto, EventMedia, EventReport, EventReportOverview } from '@/types/event';
import api from './api'; // Import the central API client
import { HttpStatusCode } from 'axios';


  
const eventReportService = {


    getEventReportOverview: async (eventId: number): Promise<EventReportOverview> => { 
        const response = await api.get<EventReportOverview>(`/events/${eventId}/report/overview`);
        if(response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to get event media');
        }
        return response.data;
    },

    getAttendanceReport: async (eventId: number): Promise<EventReport> => { 
        const response = await api.get<EventReport>(`/events/${eventId}/report/attendance`);
        if(response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to get event media');
        }
        return response.data;
    },
    getBudgetReport: async (eventId: number): Promise<EventReport> => { 
        const response = await api.get<EventReport>(`/events/${eventId}/report/budget`);
        if(response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to get event media');
        }
        return response.data;
    },

    
    generateFeedbackReport: async (eventId: number, commentsLimit?: number): Promise<Blob> => {
        try {
            const response = await api.get(`/events/${eventId}/report/feedback`, {
                params: { commentsLimit },
                responseType: 'blob' // Important: This tells axios to handle the response as a blob
            });

            if (response.status !== HttpStatusCode.Ok) {
                throw new Error('Failed to generate feedback report');
            }

            return response.data;
        } catch (error: any) {
            console.error('Error generating feedback report:', error);
            throw new Error(error.response?.data?.message || 'Failed to generate feedback report');
        }
    },

    /**
     * Generate a post-event article by combining event data and manual inputs.
     * @param eventId The unique identifier of the event.
     * @param manualInputs The manual inputs required for article generation.
     * @returns The generated article as a plain text string.
     */
    getPostEventArticle: async (eventId: number, manualInputs: ArticleManualInputsDto): Promise<string> => {
        try {
            const response = await api.post(`/events/${eventId}/report/article`, manualInputs, {
                headers: { 'Content-Type': 'application/json' },
                responseType: 'text',
            });
            if (response.status !== HttpStatusCode.Ok) {
                throw new Error('Failed to generate post-event article');
            }
            // Axios will put the plain text response in response.data
            return response.data;
        } catch (error: any) {
            console.error('Error generating post-event article:', error);
            throw new Error(error.response?.data?.message || 'Failed to generate post-event article');
        }
    },

};

export default eventReportService;