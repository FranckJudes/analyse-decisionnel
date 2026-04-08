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

const WorkflowService = {
  startProcess: (processName, userId, variables = {}) =>
    apiFetch(`/workflows/start?processName=${encodeURIComponent(processName)}&userId=${userId}`, {
      method: 'POST',
      body: JSON.stringify(variables),
    }),

  getActiveInstances: (userId) => apiFetch(`/workflows/user/${userId}/active`),

  getWorkflowInstance: (instanceId) => apiFetch(`/workflows/${instanceId}`),

  getAvailableProcesses: () => apiFetch('/api/process-engine/processes'),
};

export default WorkflowService;
