import api from './api';

const programService = {
    // Get all programs (can filter by activeOnly=true)
    getAllPrograms: async (params = {}) => {
        const response = await api.get('/programs', { params });
        return response.data;
    },

    // Get single program
    getProgramById: async (id) => {
        const response = await api.get(`/programs/${id}`);
        return response.data;
    },

    // Create program (Admin)
    createProgram: async (programData) => {
        const response = await api.post('/programs', programData);
        return response.data;
    },

    // Update program (Admin)
    updateProgram: async (id, programData) => {
        const response = await api.put(`/programs/${id}`, programData);
        return response.data;
    },

    // Delete program (Admin)
    deleteProgram: async (id) => {
        const response = await api.delete(`/programs/${id}`);
        return response.data;
    },

    // Reorder programs (Admin)
    reorderPrograms: async (orderedIds) => {
        const response = await api.put('/programs/reorder', { orderedIds });
        return response.data;
    }
};

export default programService;
