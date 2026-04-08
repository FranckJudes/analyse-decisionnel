const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;

async function apiFetch(path, options = {}) {
  // If options.headers is explicitly set to null, skip default Content-Type (for multipart)
  const headers = options.headers === null
    ? {}
    : { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const response = await fetch(path, {
    ...options,
    credentials: 'include',
    headers,
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

const BpmnModelService = {
  getDeployedProcesses: () =>
    apiFetch(`${API_URL}/bpmn/deployed-processes`),

  checkDeploymentStatus: (processKey) =>
    apiFetch(`${API_URL}/bpmn/check-deployment/${processKey}`),

  startProcessInstance: (processKey) =>
    apiFetch(`${API_URL}/bpmn/start-process/${processKey}`, {
      method: 'POST',
    }),

  getMyDeployedProcesses: () =>
    apiFetch(`${API_URL}/api/process-engine/my-deployed-processes`),

  getMyProcessInstances: () =>
    apiFetch(`${API_URL}/api/process-engine/my-process-instances`),

  getBpmnModel: (bpmnId) =>
    apiFetch(`${API_URL}/bpmn/${bpmnId}`),

  uploadBpmnModel: (formData) =>
    apiFetch(`${API_URL}/bpmn/upload`, {
      method: 'POST',
      headers: null,
      body: formData,
    }),

  startProcessInstanceViaEngine: (processDefinitionKey, variables = {}) =>
    apiFetch(`${API_URL}/api/process-engine/start/${processDefinitionKey}`, {
      method: 'POST',
      body: JSON.stringify(variables),
    }),
};

export default BpmnModelService;
