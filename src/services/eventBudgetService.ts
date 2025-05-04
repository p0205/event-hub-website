// src/services/budgetService.ts
import { BudgetCategory, EventBudget } from '@/types/event';
import api from './api'; // Import the central API client
import { HttpStatusCode } from 'axios';

const eventBudgetService = {
    addEventBudget: async (eventBudget: EventBudget, eventId: number): Promise<void> => { // Replace 'any' with actual types
        const response = await api.post(`/events/${eventId}/budget`, eventBudget);
        if(response.status !== HttpStatusCode.Created) {
            throw new Error('Failed to add new budget to event');
        }
        return response.data; // axios puts the response body in .data
    },

    getEventBudgets: async (eventId: number): Promise<EventBudget[]> => { // Replace 'any' with actual types
        const response = await api.get<EventBudget[]>(`/events/${eventId}/budget`);
        if(response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to get event budgets');
        }
        return response.data;
    },

    // Function to check if the user is currently authenticated (e.g., validates token/session)
    deleteBudgetCategory: async (eventId: number, budgetId:number): Promise<void> => { // Returns user data or null
        const response = await api.delete(`/events/${eventId}/budget/${budgetId}`);
        if (response.status !== HttpStatusCode.NoContent) {
            throw new Error('Failed to delete budget category');
        }
    },

};

export default eventBudgetService;