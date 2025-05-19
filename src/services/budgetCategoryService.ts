// src/services/budgetService.ts
import { BudgetCategory } from '@/types/event';
import api from './api'; // Import the central API client
import { HttpStatusCode } from 'axios';
import { PageData } from '@/types/api';

const budgetCategoryService = {
    addBudgetCategory: async (name: string): Promise<BudgetCategory> => { // Replace 'any' with actual types
        const response = await api.post(`/budgetCategory`, name);
        if(response.status !== HttpStatusCode.Created) {
            throw new Error('Failed to add new budget category');
        }
        return response.data; // axios puts the response body in .data
    },

    fetchBudgetCategory: async (id: number): Promise<BudgetCategory> => { // Replace 'any' with actual types
        const response = await api.get<BudgetCategory>(`/budgetCategory/${id}`);
        if(response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to fetch budget category');
        }
        return response.data;
    },

    fetchBudgetCategoryByName: async (name: string): Promise<BudgetCategory[]> => { // Replace 'any' with actual types
        const response = await api.get<BudgetCategory[]>(`/budgetCategory/byName`,{
            params: {
                name
            }
        });
        if(response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to fetch budget category');
        }
        return response.data;
    },

    fetchBudgetCategoriesByPage: async ( pageNumber?: number, pageSize?: number): Promise<PageData<BudgetCategory>> => { 
        const response = await api.get<PageData<BudgetCategory>>(`/budgetCategory`,{
            params:{
                pageNumber,
                pageSize
            }
        });
        if(response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to fetch budget categories');
        }
        return response.data;
    },

    fetchBudgetCategories: async (): Promise<BudgetCategory[]> => { 
        const response = await api.get<BudgetCategory[]>(`/budgetCategory/all`);
        if(response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to fetch budget categories');
        }
        return response.data;
    },

    // Function to check if the user is currently authenticated (e.g., validates token/session)
    deleteBudgetCategory: async (id: number): Promise<void> => { // Returns user data or null
        const response = await api.delete(`/budgetCategory/${id}`);
        if (response.status !== HttpStatusCode.NoContent) {
            throw new Error('Failed to delete budget category');
        }
    },

};

export default budgetCategoryService;