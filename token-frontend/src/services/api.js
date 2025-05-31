const API_URL = import.meta.env.VITE_API_URL || 'https://token-app-732c.onrender.com';

export const getApiUrl = (endpoint) => {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${API_URL}/${cleanEndpoint}`;
};

export default {
    getApiUrl
}; 