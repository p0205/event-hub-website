import { User } from "@/types/user";
import api from "./api";

const userService = {
    getUserById: async (userId: string) : Promise<User[]>=> {
        const response = await api.get('/users', {
            params: { id: userId }
        });
        if (response.status !== 200) {
        throw new Error('Failed to fetch user by id');
        }
        return response.data;
    },

    getUserByEmail: async (email: string) : Promise<User[]> => {
        const response = await api.get('/users/email', {
            params: { email: email }
        });
        if (response.status !== 200) {
        throw new Error('Failed to fetch user by id');
        }
        return response.data;
    },



    getUserByName: async (name: string) : Promise<User[]> => {
        const response = await api.get('/users/name', {
            params: { name: name }
        });
        if (response.status !== 200) {
        throw new Error('Failed to fetch user by id');
        }
        return response.data;
    },

    getUserByNameOrEmail: async (query: string) : Promise<User[]> => {
        const response = await api.get('/users/name_or_email', {
            params: { query: query }
        });
        if (response.status !== 200) {
        throw new Error('Failed to fetch user by id');
        }
        return response.data;
    }


}

export default userService;