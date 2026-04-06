const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;

function getAuthHeaders(contentType = 'application/json') {
  const token = sessionStorage.getItem('token');
  const headers = {};
  if (contentType) headers['Content-Type'] = contentType;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) },
  });
  if (response.status === 401) {
    sessionStorage.removeItem('token');
    window.location.href = '/login';
  }
  if (!response.ok) throw new Error(await response.text());
  if (response.status === 204) return null;
  const data = await response.json();
  if (data && typeof data === 'object' && 'success' in data && data.success === true && 'data' in data) {
    return data.data;
  }
  return data;
}

const ConceptionService = {
  // Upload + déploie le BPMN XML sur le backend
  uploadBpmn: async (bpmnXml) => {
    const blob = new Blob([bpmnXml], { type: 'application/xml' });
    const formData = new FormData();
    formData.append('file', blob, 'diagram.bpmn');
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_URL}/bpmn/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return data?.data ?? data;
  },

  // Récupère tous les processus déployés (pour conception-page)
  getDeployedProcesses: () => apiFetch('/api/process-engine/my-deployed-processes'),

  // Récupère toutes les instances de processus en cours
  getAllInstances: () => apiFetch('/api/process-engine/my-process-instances'),

  // Démarre une nouvelle instance d'un processus
  startInstance: (processDefinitionKey, variables = {}) =>
    apiFetch(`/api/process-engine/start/${processDefinitionKey}`, {
      method: 'POST',
      body: JSON.stringify(variables),
    }),

  // Récupère les instances actives d'un processus spécifique
  getInstancesByProcess: (processKey) =>
    apiFetch(`/api/process-engine/instances/${processKey}`),
};

export default ConceptionService;
