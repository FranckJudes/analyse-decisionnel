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

const GroupeService = {
  getAllGroups: () => apiFetch('/api/groupes'),
  getGroupById: (id) => apiFetch(`/api/groupes/${id}`),
  createGroup: (groupData) =>
    apiFetch('/api/groupes', { method: 'POST', body: JSON.stringify(groupData) }),
  updateGroup: (id, groupData) =>
    apiFetch(`/api/groupes/${id}`, { method: 'PUT', body: JSON.stringify(groupData) }),
  deleteGroup: (id) => apiFetch(`/api/groupes/${id}`, { method: 'DELETE' }),
  getUsersInGroup: (groupId) => apiFetch(`/api/groupes/${groupId}/users`),
  getUsersWithoutGroup: () => apiFetch('/api/groupes/users/without-group'),
  addUsersToGroup: (groupId, userIds) =>
    apiFetch(`/api/groupes/${groupId}/users`, { method: 'POST', body: JSON.stringify(userIds) }),
  removeUserFromGroup: (groupId, userId) =>
    apiFetch(`/api/groupes/${groupId}/users/${userId}`, { method: 'DELETE' }),
};

export default GroupeService;
