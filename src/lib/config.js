
// Using VITE_API_URL which should be the full base URL, e.g., http://localhost:5000 or https://api.yourdomain.com
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Construct API and Image base URLs from the main API_URL
export const API_BASE_URL = `${API_URL}/api`;
export const IMAGE_BASE_URL = API_URL;
