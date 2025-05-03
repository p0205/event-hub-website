// src/services/budgetService.ts
import { Role, TeamMember } from '@/types/event';
import api from './api'; // Import the central API client
import { HttpStatusCode } from 'axios';

const teamService = {

    getRoles: async (): Promise<Role[]> => {
        const response = await api.get('/roles');
        if (response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to fetch roles');
        }
        return response.data; // axios puts the response body in .data

    },// Replace 'any' with actual types

    addTeamMember: async (eventId: number, userId: number, roleId: number): Promise<string> => { // Replace 'any' with actual types
        console.log("eventId", eventId);
        console.log("userId", userId);
        console.log("roleId", roleId);
        const response = await api.post(`/events/${eventId}/teams`, null, {
            params: {
              userId: userId,
              roleId: roleId
            }
          });
                  
        if (response.status !== HttpStatusCode.Created) {
            return response.data;
        }
        return "Add team member successfully."; // axios puts the response body in .data
    },

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


    getTeamMembers: async (eventId: number): Promise<TeamMember[]> => { // Replace 'any' with actual types
        const response = await api.get(`/events/${eventId}/teams`);
        if (response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to fetch team members');
        }
        return response.data; // axios puts the response body in .data
    },

};

export default teamService;