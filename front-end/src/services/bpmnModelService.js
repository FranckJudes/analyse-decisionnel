const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;

function getAuthHeaders(contentType = 'application/json') {
  const token = sessionStorage.getItem('token');
  const headers = {};
  if (contentType) headers['Content-Type'] = contentType;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
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

const BpmnModelService = {
  getDeployedProcesses: () =>
    apiFetch(`${API_URL}/bpmn/deployed-processes`, {
      headers: getAuthHeaders(null),
    }),

  checkDeploymentStatus: (processKey) =>
    apiFetch(`${API_URL}/bpmn/check-deployment/${processKey}`, {
      headers: getAuthHeaders(null),
    }),

  startProcessInstance: (processKey) =>
    apiFetch(`${API_URL}/bpmn/start-process/${processKey}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }),

  getMyDeployedProcesses: () =>
    apiFetch(`${API_URL}/api/process-engine/my-deployed-processes`, {
      headers: getAuthHeaders(null),
    }),

  getMyProcessInstances: () =>
    apiFetch(`${API_URL}/api/process-engine/my-process-instances`, {
      headers: getAuthHeaders(null),
    }),

  getBpmnModel: (bpmnId) =>
    apiFetch(`${API_URL}/bpmn/${bpmnId}`, {
      headers: getAuthHeaders(null),
    }),

  uploadBpmnModel: (formData) =>
    apiFetch(`${API_URL}/bpmn/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      body: formData,
    }),

  startProcessInstanceViaEngine: (processDefinitionKey, variables = {}) =>
    apiFetch(`${API_URL}/api/process-engine/start/${processDefinitionKey}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(variables),
    }),
};

export default BpmnModelService;
