import api from "./api";

const userService = {
    getUserById: async (userId: string) => {
        const response = await api.get('/users', {
            params: { id: userId }
        });
        if (response.status !== 200) {
        throw new Error('Failed to fetch user by id');
        }
        return response.data;
    },

    getUserByEmail: async (email: string) => {
        const response = await api.get('/users', {
            params: { email: email }
        });
        if (response.status !== 200) {
        throw new Error('Failed to fetch user by id');
        }
        return response.data;
    }

}

export default userService;