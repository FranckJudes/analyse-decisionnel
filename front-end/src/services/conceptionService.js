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

const ConceptionService = {
  // Upload + déploie le BPMN XML sur le backend
  uploadBpmn: async (bpmnXml) => {
    const blob = new Blob([bpmnXml], { type: 'application/xml' });
    const formData = new FormData();
    formData.append('file', blob, 'diagram.bpmn');
    const response = await fetch(`${API_URL}/bpmn/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return data?.data ?? data;
  },

  // Déploie un processus BPMN avec ses métadonnées et configurations de tâches
  deployProcess: async ({ bpmnXml, processName, processDescription = '', configurations = [] }) => {
    const blob = new Blob([bpmnXml], { type: 'application/xml' });
    const fileName = (processName || 'process').replace(/\s+/g, '-').toLowerCase() + '.bpmn';
    const formData = new FormData();
    formData.append('file', blob, fileName);
    formData.append('configurations', JSON.stringify(configurations));
    formData.append('metadata', JSON.stringify({ processName, processDescription }));
    formData.append('deployToEngine', 'true');
    formData.append('forceCreate', 'true');
    const response = await fetch(`${API_URL}/api/process-engine/deploy`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return data?.data ?? data;
  },

  // Supprime un processus
  deleteProcess: (processKey) =>
    apiFetch(`/api/process-engine/process/${processKey}`, { method: 'DELETE' }),

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
