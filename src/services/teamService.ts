// src/services/budgetService.ts
import { Role, SearchUserInTeam, TeamMember } from '@/types/event';
import api from './api'; // Import the central API client
import { HttpStatusCode } from 'axios';
import { PageData } from '@/types/api';

const teamService = {

    getRoles: async (): Promise<Role[]> => {
        const response = await api.get('/role');
        if (response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to fetch roles');
        }
        return response.data; // axios puts the response body in .data

    },// Replace 'any' with actual types

    addTeamMembers: async (eventId: number, userIds: number[], roleId: number): Promise<string> => { // Replace 'any' with actual types
        console.log("eventId", eventId);
        console.log("userId", userIds);
        console.log("roleId", roleId);
        const response = await api.post(`/events/${eventId}/teams`, null, {
            params: {
                userIds: userIds,
                roleId: roleId
            }
        });

        if (response.status !== HttpStatusCode.Created) {
            return response.data;
        }
        return "Add team member successfully."; // axios puts the response body in .data
    },


    getTeamMembers: async (eventId: number, pageNumber?: number, pageSize?: number, sortBy?: string): Promise<PageData<TeamMember>> => { // Replace 'any' with actual types
        const response = await api.get(`/events/${eventId}/teams`, {
            params: {
                pageNumber,
                pageSize,
                sortBy
            }
        });
        if (response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to fetch team members');
        }
        return response.data; // axios puts the response body in .data
    },

    deleteTeamMember: async (eventId: number, userId: number): Promise<void> => { // Replace 'any' with actual types
        const response = await api.delete(`/events/${eventId}/teams/${userId}`);
        if (response.status !== HttpStatusCode.NoContent) {
            throw new Error('Failed to delete team member');
        }
        return;
    },

    searchUserInTeam: async(eventId: number, query: string, roleId:number): Promise<SearchUserInTeam[]> => { // Replace 'any' with actual types
    const response = await api.get(`/events/${eventId}/teams/search`,
        {
            params:
            {
                query,
                roleId
            }
        }
    );
    if (response.status !== HttpStatusCode.Ok) {
        throw new Error('Failed to search team member');
    }
    return response.data;
}
};

export default teamService;