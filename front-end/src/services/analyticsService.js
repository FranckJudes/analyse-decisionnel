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

export const AnalyticsService = {
  getAllEventLogs: (startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiFetch(`/api/analytics/logs?${params.toString()}`);
  },

  getProcessDefinitions: () => apiFetch('/api/analytics/process-definitions'),

  getProcessMetrics: (processDefinitionId) =>
    apiFetch(`/api/analytics/metrics/${processDefinitionId}`),

  getProcessMapData: (processDefinitionId) =>
    apiFetch(`/api/analytics/process-map/${processDefinitionId}`),

  getProcessLogsForAnalytics: (processDefinitionKey, startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiFetch(`/api/analytics/process-logs/${processDefinitionKey}?${params.toString()}`);
  },

  processDiscovery: (logs, algorithm = 'alpha') =>
    apiFetch('/api/analytics/process-discovery', {
      method: 'POST',
      body: JSON.stringify({ logs, algorithm }),
    }),

  processVariants: (logs, maxVariants = 10) =>
    apiFetch('/api/analytics/process-variants', {
      method: 'POST',
      body: JSON.stringify({ logs, maxVariants }),
    }),

  bottleneckAnalysis: (logs, analysisType = 'waiting_time') =>
    apiFetch('/api/analytics/bottleneck-analysis', {
      method: 'POST',
      body: JSON.stringify({ logs, analysisType }),
    }),

  performancePrediction: (logs, predictionType = 'completion_time', parameters = {}) =>
    apiFetch('/api/analytics/performance-prediction', {
      method: 'POST',
      body: JSON.stringify({ logs, predictionType, parameters }),
    }),

  socialNetworkAnalysis: (logs, analysisType = 'handover_of_work') =>
    apiFetch('/api/analytics/social-network-analysis', {
      method: 'POST',
      body: JSON.stringify({ logs, analysisType }),
    }),

  exportLogsAsCsv: (processDefinitionId = null, startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (processDefinitionId) params.append('processDefinitionId', processDefinitionId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('type', 'logs');
    const url = `${API_URL}/api/analytics/export/csv?${params.toString()}`;
    return fetch(url, { credentials: 'include' })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'process_logs.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  },

  exportStarSchemaCsv: (type) => {
    const url = `${API_URL}/api/analytics/export/csv?type=${encodeURIComponent(type)}`;
    return fetch(url, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`Export failed: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${type}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  },

  exportStarSchemaExcel: () => {
    const url = `${API_URL}/api/analytics/export/excel`;
    return fetch(url, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`Export failed: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'power_bi_star_schema.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  },
};

export default AnalyticsService;
