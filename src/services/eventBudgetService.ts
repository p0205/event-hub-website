// src/services/budgetService.ts
import { AddExpensePayload, BudgetCategory, EventBudget } from '@/types/event';
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

    recordExpense: async (eventId: number, expenseData: AddExpensePayload): Promise<void> => { // Correctly receive expenseData here
        try {
            // Send expenseData directly as the request body.
            // Axios will automatically stringify this JavaScript object to JSON.
            const response = await api.post(`/events/${eventId}/budget/newExpense`, expenseData);

            // The backend should ideally return 200 OK for an update or 201 Created for a new entry.
            // We check for both as either is a successful outcome for this "upsert" operation.
            if (response.status !== HttpStatusCode.Created) {
                // Throw an error if the status is neither 200 nor 201, indicating an issue.
                throw new Error(`Failed to record expense. Server responded with status: ${response.status}`);
            }
            console.log('Expense recorded successfully:', response.data);
            // No need to return response.data if the Promise<void> indicates no return value is expected by the caller.
        } catch (error: any) {
            console.error('Error recording expense:', error.response?.data || error.message);
            // Re-throw a more user-friendly error message for the component to handle.
            throw new Error(error.response?.data?.message || 'Failed to record expense due to an unknown error.');
        }
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