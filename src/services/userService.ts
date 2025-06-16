import { User } from "@/types/user";
import api from "./api";
import { PageData } from "@/types/api";
import { HttpStatusCode } from "axios";

interface PaginatedResponse<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
}

const userService = {

    createUser: async (createData: User): Promise<User> => {
        try {
            console.log(createData);
            const response = await api.post(`/users`, createData);

            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data || 'Failed to create new user. Please try again.');
        }
    },

    deleteUser: async (userId: number): Promise<void> => {
        try {
            const response = await api.delete(`/users/${userId}`);


            if (response.status !== HttpStatusCode.NoContent) {
                throw new Error('Failed to delete user');
            }
        } catch (error: any) {
            if (error.response?.status === HttpStatusCode.NotFound) {
                throw new Error(`User not found with ID: ${userId}`);
            }
            throw new Error(error.response?.data || 'Error deleting user');
        }
    },

    updateUser: async (userId: number, updateData: User): Promise<User> => {
        try {
            const response = await api.patch(`/users/${userId}/update`, updateData);

            if (response.status === HttpStatusCode.BadRequest) {
                throw new Error('Invalid phone number format');
            }

            if (response.status === HttpStatusCode.NotFound) {
                throw new Error(`User not found with ID: ${userId}`);
            }

            if (response.status !== HttpStatusCode.Ok) {
                throw new Error('Failed to update user information');
            }

            return response.data;
        } catch (error: any) {
            if (error.response?.status === HttpStatusCode.BadRequest) {
                throw new Error('Invalid phone number format');
            }
            if (error.response?.status === HttpStatusCode.NotFound) {
                throw new Error(`User not found with ID: ${userId}`);
            }
            throw new Error(error.response?.data || 'Error updating user information');
        }
    },



    getAllUsers: async (pageNumber?: number, pageSize?: number): Promise<PageData<User>> => {
        const response = await api.get('/users', {
            params: {
                pageNumber,
                pageSize
            }
        });
        if (response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to fetch users');
        }
        return response.data;
    },


    getUserById: async (userId: string): Promise<User[]> => {
        const response = await api.get('/users', {
            params: { id: userId }
        });
        if (response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to fetch user by id');
        }
        return response.data;
    },

    getUserByEmail: async (email: string): Promise<User[]> => {
        const response = await api.get('/users/email', {
            params: { email: email }
        });
        if (response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to fetch user by email');
        }
        return response.data;
    },

    getUserByName: async (name: string): Promise<User[]> => {
        const response = await api.get('/users/name', {
            params: { name: name }
        });
        if (response.status !== HttpStatusCode.Ok) {
            throw new Error('Failed to fetch user by name');
        }
        return response.data;
    },

    getUserByNameOrEmail: async (query: string): Promise<User[]> => {
        try {
            const response = await api.get('/users/name_or_email', {
                params: { query: query }
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === HttpStatusCode.NotFound) {
                throw new Error('No User found');
            }
            throw new Error('Failed to get users');
        }
    }
}

export default userService;