import apiClient from './axios';

// --- Categories ---
export const getCategories = async () => {
  const response = await apiClient.get('/api/categories');
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await apiClient.post('/api/categories', categoryData);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  const response = await apiClient.put(`/api/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await apiClient.delete(`/api/categories/${id}`);
  return response.data;
};

// --- Locations ---
export const getLocations = async (params) => {
  const response = await apiClient.get('/api/locations', { params });
  return response.data;
};

export const createLocation = async (formData) => {
  const response = await apiClient.post('/api/locations', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // return response.data;

  // Add validation to ensure the response is a valid location object
  if (response.data && typeof response.data === 'object' && response.data._id) {
    return response.data;
  } else {
    throw new Error('Réponse invalide du serveur lors de la création du lieu.');
  }
};

export const updateLocation = async (id, formData) => {
  const response = await apiClient.put(`/api/locations/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getLocationById = async (id) => {
  const response = await apiClient.get(`/api/locations/${id}`);
  return response.data;
};

export const deleteLocation = async (id) => {
  const response = await apiClient.delete(`/api/locations/${id}`);
  return response.data;
};

export const approveLocation = async (id) => {
  const response = await apiClient.patch(`/api/locations/${id}/approve`);
  return response.data;
};

export const rejectLocation = async (id) => {
  const response = await apiClient.patch(`/api/locations/${id}/reject`);
  return response.data;
};

export const setPendingLocation = async (id) => {
  const response = await apiClient.patch(`/api/locations/${id}/set-pending`);
  return response.data;
};


// --- Events ---
export const getEvents = async (params) => {
  const response = await apiClient.get('/api/events', { params });
  return response.data;
};

export const getPaginatedEvents = async (params) => {
  const response = await apiClient.get('/api/events/paginated', { params });
  return response.data;
};

export const getPaginatedLocations = async (params) => {
  const response = await apiClient.get('/api/locations/paginated', { params });
  return response.data;
};

export const getEventById = async (id) => {
  const response = await apiClient.get(`/api/events/${id}`);
  return response.data;
};

export const createEvent = async (formData) => {
  const response = await apiClient.post('/api/events', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateEvent = async (id, formData) => {
  const response = await apiClient.put(`/api/events/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await apiClient.delete(`/api/events/${id}`);
  return response.data;
};

export const submitForApproval = async (id) => {
  const response = await apiClient.patch(`/api/events/${id}/submit-for-approval`);
  return response.data;
};

export const approveEvent = async (id) => {
  const response = await apiClient.patch(`/api/events/${id}/approve`);
  return response.data;
};

export const rejectEvent = async ({ id, reason }) => {
  const response = await apiClient.patch(`/api/events/${id}/reject`, { rejectionReason: reason });
  return response.data;
};

export const cancelEvent = async (id) => {
  const response = await apiClient.patch(`/api/events/${id}/cancel`);
  return response.data;
};

export const revertToDraft = async (id) => {
  const response = await apiClient.patch(`/api/events/${id}/revert-to-draft`);
  return response.data;
};

export const revertRejectedToDraft = async (id) => {
  const response = await apiClient.patch(`/api/events/${id}/revert-rejected-to-draft`);
  return response.data;
};

export const cancelApproval = async (id) => {
  const response = await apiClient.patch(`/api/events/${id}/cancel-approval`);
  return response.data;
};

export const revertFromRejectionByOrganizer = async (id) => {
  const response = await apiClient.patch(`/api/events/${id}/revert-from-rejection`);
  return response.data;
};

// --- Event Participation ---
export const registerForFreeEvent = async (id) => {
  const response = await apiClient.post(`/api/events/${id}/register`);
  return response.data;
};

export const unregisterFromEvent = async (id) => {
  const response = await apiClient.delete(`/api/events/${id}/register`);
  return response.data;
};


// --- Auth ---
export const registerUser = async (userData) => {
  const response = await apiClient.post('/api/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await apiClient.post('/api/auth/login', credentials);
  return response.data;
};

export const refreshToken = async () => {
  const response = await apiClient.post('/api/auth/refresh-token');
  return response.data;
};

export const logout = async () => {
  const response = await apiClient.post('/api/auth/logout');
  return response.data;
};

// --- Users (Admin) ---
export const getUsers = async () => {
  const response = await apiClient.get('/api/admin/users');
  return response.data;
};

export const updateUserRole = async ({ id, role }) => {
  const response = await apiClient.patch(`/api/admin/users/${id}/role`, { role });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/api/admin/users/${id}`);
  return response.data;
};

// --- Profile ---
export const getMyProfile = async () => {
  const response = await apiClient.get('/api/users/me');
  return response.data;
};

export const updateMyProfile = async (profileData) => {
  const response = await apiClient.put('/api/users/me', profileData);
  return response.data;
};

// --- Dashboard ---
export const getDashboardStats = async () => {
  const response = await apiClient.get('/api/admin/dashboard-stats');
  return response.data;
};

export const getEventActivityStats = async (year, month) => {
  const params = { year };
  if (month !== undefined) {
    params.month = month;
  }
  const response = await apiClient.get('/api/admin/event-activity-stats', { params });
  return response.data;
};

// --- Organizer Dashboard ---
export const getOrganizerDashboardStats = async () => {
  const response = await apiClient.get('/api/users/me/dashboard-stats');
  return response.data;
};

export const getOrganizerEventsWithParticipants = async () => {
  const response = await apiClient.get('/api/users/me/events-with-participants');
  return response.data;
};

// --- User Participated Events ---
export const getParticipatedEvents = async (params) => {
  const response = await apiClient.get('/api/users/me/participated-events', { params });
  return response.data;
};

// --- Contact ---
export const sendContactMessage = async (data) => {
  const response = await apiClient.post('/api/contact', data);
  return response.data;
};

export const simulatePaymentForEvent = async (eventId) => {
  const response = await apiClient.post(`/api/events/${eventId}/simulate-payment`);
  return response.data;
};

// --- Tickets ---
export const getMyTickets = async () => {
  const response = await apiClient.get('/api/tickets/my-tickets');
  return response.data;
};

// --- Settings ---
export const getSettings = async () => {
  const response = await apiClient.get('/api/settings');
  return response.data;
};

export const updateSettings = async (formData) => {
  const response = await apiClient.put('/api/settings', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};