// Get the base API URL from environment variables
const getApiUrl = (endpoint) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${baseUrl}/${endpoint}`;
};

export { getApiUrl }; 