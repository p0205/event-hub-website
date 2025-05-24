// src/services/budgetService.ts
import { Role } from '@/types/event';
import api from './api'; // Import the central API client
import { HttpStatusCode } from 'axios';
import { PageData } from '@/types/api';

const roleService = {
    addRole: async (name: string): Promise<void> => { // Replace 'any' with actual types
        const response = await api.post(`/role`, name);
        if(response.status !== HttpStatusCode.Created) {
            throw new Error('Failed to add new role');
        }
    },

    fetchRolesByName: async (name: string): Promise<Role[]> => { // Replace 'any' with actual types
        const response = await api.get<Role[]>(`/role/byName`,{
            params: {
                name
            }
        });
        if(response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to fetch role');
        }
        return response.data;
    },

    fetchRolesInPages: async (pageNumber?:number, pageSize?:number): Promise<PageData<Role>> => { 
        const response = await api.get<PageData<Role>>(`/role/inPages`,{
            params:{
                pageNumber,
                pageSize
            }
        });
        if(response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to fetch role');
        }
        return response.data;
    },

    fetchRoles: async (): Promise<Role[]> => { 
        const response = await api.get<Role[]>(`/role`);
        if(response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to fetch role');
        }
        return response.data;
    },




    // Function to check if the user is currently authenticated (e.g., validates token/session)
    deleteRole: async (id: number): Promise<void> => { // Returns user data or null
        const response = await api.delete(`/role/${id}`);
        if (response.status !== HttpStatusCode.NoContent) {
            throw new Error('Failed to delete role');
        }
    },

};

export default roleService;