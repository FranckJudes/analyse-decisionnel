const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!response.ok) throw new Error(await response.text());
  if (response.status === 204) return null;
  const data = await response.json();
  if (data && typeof data === 'object' && 'success' in data && data.success === true && 'data' in data) {
    return data.data;
  }
  if (data && typeof data === 'object' && 'data' in data && !('success' in data)) {
    return data.data;
  }
  return data;
}

const UsersAdminService = {
  getAllUsers: () => apiFetch('/api/users'),
  getUserById: (id) => apiFetch(`/api/users/${id}`),
  createUser: (userData) =>
    apiFetch('/api/users', { method: 'POST', body: JSON.stringify(userData) }),
  updateUser: (id, userData) =>
    apiFetch(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) }),
  deleteUser: (id) => apiFetch(`/api/users/${id}`, { method: 'DELETE' }),
  resetUserPassword: (id) =>
    apiFetch(`/api/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({}) }),
};

export default UsersAdminService;
