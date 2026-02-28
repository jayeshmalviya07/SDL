import axiosInstance from './axiosInstance';

const userService = {
    // Delete Hub Admin (Super Admin only)
    deleteHubAdmin: async (id) => {
        const response = await axiosInstance.delete(`/hub-admins/${id}`);
        return response.data;
    },

    // Delete Wish Master (Super Admin or Hub Admin)
    deleteWishMaster: async (id) => {
        const response = await axiosInstance.delete(`/delivery/${id}`);
        return response.data;
    },

    // Get Inactive Employees (Super Admin only)
    getInactiveEmployees: async () => {
        const response = await axiosInstance.get('/superadmin/inactive-employees');
        return response.data;
    }
};

export default userService;
