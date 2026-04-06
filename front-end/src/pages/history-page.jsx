import React, { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import {
  BarChart3, LineChart, Network, Clock, RefreshCw, Download,
  Home, ChevronRight, History, CheckCircle, AlertCircle, Activity
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs } from '../components/ui/tabs';
import toast from 'react-hot-toast';
import AnalyticsService from '../services/analyticsService';

function StatCard({ label, value, sub, color = 'blue' }) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    green: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  };
  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
    </div>
  );
}

function OverviewTab({ metrics, loading }) {
  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="h-8 w-8 animate-spin text-slate-400" /></div>;
  if (!metrics) return <div className="text-center py-12 text-slate-400">Aucune métrique disponible. Sélectionnez un processus.</div>;

  const total = metrics.totalInstances ?? 0;
  const completed = metrics.completedInstances ?? 0;
  const rate = metrics.completionRate ?? 0;
  const avgTime = metrics.averageExecutionTime ?? metrics.averageDuration ?? null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Instances totales" value={total} color="blue" />
        <StatCard label="Instances terminées" value={completed} color="green" />
        <StatCard label="Taux de complétion" value={`${(rate * 100).toFixed(1)}%`} color={rate > 0.8 ? 'green' : 'orange'} />
        <StatCard label="Temps moyen" value={avgTime ?? 'N/A'} color="purple" />
      </div>

      <Card>
        <CardHeader><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Résumé</h3></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Processus actifs</span>
              <span className="font-semibold text-blue-600">{total - completed} en cours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Processus terminés</span>
              <span className="font-semibold text-green-600">{completed} terminés</span>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Taux de complétion</span>
                <span>{(rate * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${rate > 0.8 ? 'bg-green-500' : rate > 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, (rate * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TaskMetricsTab({ metrics, loading }) {
  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="h-8 w-8 animate-spin text-slate-400" /></div>;
  if (!metrics?.taskMetrics?.length) return <div className="text-center py-12 text-slate-400">Aucune métrique de tâche disponible.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            {['Tâche', 'Durée moyenne (min)', "Nombre d'exécutions", 'Efficacité'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {metrics.taskMetrics.map((task, i) => (
            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{task.taskName}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  task.averageDuration < 30 ? 'bg-green-100 text-green-700' :
                  task.averageDuration < 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>{task.averageDuration} min</span>
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{task.count}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${
                      (task.efficiency || 85) > 80 ? 'bg-green-500' :
                      (task.efficiency || 85) > 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} style={{ width: `${task.efficiency || 85}%` }} />
                  </div>
                  <span className="text-xs text-slate-500">{task.efficiency || 85}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EventLogsTab({ logs, loading, onExport }) {
  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="h-8 w-8 animate-spin text-slate-400" /></div>;
  if (!logs.length) return <div className="text-center py-12 text-slate-400">Aucun log d'événement disponible.</div>;

  const typeColors = {
    START: 'bg-green-100 text-green-700',
    END: 'bg-blue-100 text-blue-700',
    TASK: 'bg-orange-100 text-orange-700',
    GATEWAY: 'bg-purple-100 text-purple-700',
    ERROR: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      <div className="flex justify-end mb-3">
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4" /> Exporter CSV
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              {['ID', 'Type', 'Processus', 'Instance', 'Tâche', 'Utilisateur', 'Horodatage', 'Durée'].map((h) => (
                <th key={h} className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-500 tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {logs.slice(0, 100).map((log, i) => (
              <tr key={log.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="px-3 py-2 font-mono text-xs text-slate-500">{log.id || '–'}</td>
                <td className="px-3 py-2">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${typeColors[log.eventType] || 'bg-slate-100 text-slate-600'}`}>
                    {log.eventType || '–'}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-slate-500 max-w-[120px] truncate">{log.processDefinitionId || '–'}</td>
                <td className="px-3 py-2 text-xs text-slate-500 max-w-[100px] truncate">{log.processInstanceId || '–'}</td>
                <td className="px-3 py-2 text-xs">{log.taskName || '–'}</td>
                <td className="px-3 py-2 text-xs text-slate-500">{log.userId || '–'}</td>
                <td className="px-3 py-2 text-xs text-slate-500 whitespace-nowrap">
                  {log.timestamp ? new Date(log.timestamp).toLocaleString('fr-FR') : '–'}
                </td>
                <td className="px-3 py-2">
                  {log.durationMs ? (
                    <span className={`text-xs ${log.durationMs < 1000 ? 'text-green-600' : log.durationMs < 5000 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {log.durationMs}ms
                    </span>
                  ) : '–'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length > 100 && (
          <p className="text-center text-xs text-slate-400 py-2">Affichage des 100 premiers sur {logs.length} entrées</p>
        )}
      </div>
    </div>
  );
}

export function HistoryPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [processDefinitions, setProcessDefinitions] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [eventLogs, setEventLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const defs = await AnalyticsService.getProcessDefinitions();
        const normalized = (defs || []).map((p, i) => {
          const id = typeof p === 'string' ? p : (p?.id || p?.processDefinitionId || p?.key || `proc-${i}`);
          const name = typeof p === 'object' ? (p?.name || p?.key || id) : p;
          return { id: String(id), name: String(name) };
        });
        setProcessDefinitions(normalized);
        if (normalized.length > 0) setSelectedProcess(normalized[0].id);
      } catch {
        toast.error('Erreur lors du chargement des processus');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedProcess) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const [metricsData, logsData] = await Promise.all([
          AnalyticsService.getProcessMetrics(selectedProcess).catch(() => null),
          AnalyticsService.getAllEventLogs(startDate || null, endDate || null).catch(() => []),
        ]);
        setMetrics(metricsData);
        const filtered = (logsData || []).filter((log) => {
          const pid = log.processDefinitionId || log.processDefinitionKey;
          return pid === selectedProcess;
        });
        setEventLogs(filtered.map((log, idx) => ({
          id: log.id || `${log.processInstanceId || 'pi'}-${idx}`,
          eventType: log.eventType || log.activityType || 'TASK',
          processDefinitionId: log.processDefinitionId || log.processDefinitionKey,
          processInstanceId: log.processInstanceId,
          taskName: log.taskName || log.activityName,
          userId: log.userId || log.assignee,
          timestamp: log.timestamp || log.startTime,
          durationMs: log.durationMs || log.durationInMillis,
        })));
      } catch {
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [selectedProcess, startDate, endDate]);

  const tabs = [
    { id: 'overview', label: "Vue d'ensemble", icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'task-metrics', label: 'Métriques des tâches', icon: <LineChart className="h-4 w-4" /> },
    { id: 'event-logs', label: "Logs d'événements", icon: <Clock className="h-4 w-4" /> },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200">
            <Home className="h-4 w-4" /> Accueil
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
            <History className="h-4 w-4" /> Analyse des processus BPMN
          </span>
        </nav>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Analyse des processus BPMN</h1>
              <Button variant="outline" size="sm" onClick={() => setSelectedProcess((prev) => { return prev; })} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Rafraîchir
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-48">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Processus</label>
                <select
                  value={selectedProcess}
                  onChange={(e) => setSelectedProcess(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading || processDefinitions.length === 0}
                >
                  {processDefinitions.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Date de début</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Date de fin</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="px-6 pt-4">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>
          <CardContent>
            {activeTab === 'overview' && <OverviewTab metrics={metrics} loading={loading} />}
            {activeTab === 'task-metrics' && <TaskMetricsTab metrics={metrics} loading={loading} />}
            {activeTab === 'event-logs' && (
              <EventLogsTab
                logs={eventLogs}
                loading={loading}
                onExport={() => AnalyticsService.exportLogsAsCsv(selectedProcess, startDate || null, endDate || null)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
