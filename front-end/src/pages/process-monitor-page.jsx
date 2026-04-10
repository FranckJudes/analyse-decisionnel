/**
 * ProcessMonitorPage — Pilotage BPMN interactif avec overlay KPIs
 *
 * Modes :
 *  - Mode live   : données depuis backend Camunda
 *  - Mode démo   : données mockées + BPMN embarqué (fallback si backend indispo)
 *  - Mode import : logs injectés depuis SimulationContext (pipeline Simulation→Monitor)
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Home, ChevronRight, Activity, RefreshCw, Clock, CheckCircle,
  AlertTriangle, TrendingUp, Info, X, BarChart2, Zap, FlaskConical,
  Upload, WifiOff,
} from 'lucide-react';
import BpmnKpiViewer from '../components/bpmn/BpmnKpiViewer';
import AnalyticsService from '../services/analyticsService';
import BpmnModelService from '../services/bpmnModelService';
import { useSimulation } from '../context/simulation-context';
import {
  DEMO_BPMN_XML,
  DEMO_LOGS,
  DEMO_METRICS,
  DEMO_PROCESSES,
} from '../data/demo-data';

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDuration(minutes) {
  if (minutes == null || isNaN(minutes)) return '–';
  if (minutes >= 1440) return `${(minutes / 1440).toFixed(1)}j`;
  if (minutes >= 60)   return `${(minutes / 60).toFixed(1)}h`;
  return `${Math.round(minutes)}min`;
}

function buildKpiData(logs) {
  const byActivity = {};
  for (const log of logs) {
    const id = log.taskName || log.activityName || log.activityId || log.activity;
    if (!id) continue;
    if (!byActivity[id]) byActivity[id] = { durations: [], errors: 0, count: 0 };
    const dur = (log.durationMs || log.durationInMillis || 0) / 60000;
    byActivity[id].durations.push(dur);
    byActivity[id].count++;
    if (log.eventType === 'ERROR' || log.error || log.status === 'error') byActivity[id].errors++;
  }
  const result = {};
  for (const [id, data] of Object.entries(byActivity)) {
    const durs = data.durations.filter(d => d > 0);
    const avg  = durs.length ? durs.reduce((a, b) => a + b, 0) / durs.length : 0;
    result[id] = {
      avgDuration: avg,
      minDuration: durs.length ? Math.min(...durs) : 0,
      maxDuration: durs.length ? Math.max(...durs) : 0,
      count:       data.count,
      errorRate:   data.count ? data.errors / data.count : 0,
      threshold:   avg * 0.8 || 30,
      status:      (data.count ? data.errors / data.count : 0) > 0.15 ? 'error'
                 : avg > 60 ? 'slow' : 'ok',
    };
  }
  return result;
}

function computeGlobalKpis(logs, metrics) {
  const total     = metrics?.totalInstances ?? logs.length;
  const completed = metrics?.completedInstances ?? 0;
  const rate      = metrics?.completionRate ?? (total ? completed / total : 0);
  const avgTime   = metrics?.averageExecutionTime ?? metrics?.averageDuration ?? null;
  const errors    = logs.filter(l => l.eventType === 'ERROR' || l.status === 'error').length;
  const errorRate = logs.length ? errors / logs.length : 0;
  const kd = buildKpiData(logs);
  let bottleneck = null; let maxAvg = 0;
  for (const [id, kpi] of Object.entries(kd)) {
    if (kpi.avgDuration > maxAvg) { maxAvg = kpi.avgDuration; bottleneck = id; }
  }
  return { total, completed, conformity: rate, avgTime, errorRate, bottleneck, bottleneckDuration: maxAvg };
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function NodeTooltip({ nodeId, kpi, onClose }) {
  if (!nodeId || !kpi) return null;
  return (
    <div className="absolute top-4 right-4 z-20 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{nodeId}</h4>
        <button onClick={onClose} className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
          <X className="h-4 w-4 text-slate-400" />
        </button>
      </div>
      <div className="space-y-2 text-xs">
        {[
          { label: 'Durée moyenne', val: fmtDuration(kpi.avgDuration), cls: 'font-semibold text-slate-900 dark:text-white' },
          { label: 'Min', val: fmtDuration(kpi.minDuration), cls: 'text-emerald-600 font-medium' },
          { label: 'Max', val: fmtDuration(kpi.maxDuration), cls: 'text-red-600 font-medium' },
          { label: 'Exécutions', val: kpi.count ?? 0, cls: 'font-semibold text-blue-600' },
          { label: "Taux d'erreur", val: `${((kpi.errorRate ?? 0) * 100).toFixed(1)}%`, cls: kpi.errorRate > 0.1 ? 'text-red-600 font-semibold' : 'text-emerald-600 font-semibold' },
        ].map(({ label, val, cls }) => (
          <div key={label} className="flex justify-between">
            <span className="text-slate-500">{label}</span>
            <span className={cls}>{val}</span>
          </div>
        ))}
      </div>
      {kpi.avgDuration != null && kpi.threshold != null && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Écart vs seuil</span>
            <span>{kpi.avgDuration <= kpi.threshold ? '✅ Dans les délais' : '⚠ Dépassement'}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${kpi.avgDuration <= kpi.threshold ? 'bg-emerald-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(100, (kpi.avgDuration / (kpi.threshold * 1.5)) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const palette = {
    blue:   'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green:  'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    yellow: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    red:    'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    purple: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
  };
  return (
    <div className={`rounded-xl p-4 ${palette[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium opacity-80">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-[11px] opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Bannière de mode ─────────────────────────────────────────────────────────

function ModeBanner({ mode, source, onSwitchDemo, onSwitchLive }) {
  if (mode === 'loading') return null;
  if (mode === 'demo') return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-sm text-amber-700 dark:text-amber-400">
      <FlaskConical className="h-4 w-4 shrink-0" />
      <span><strong>Mode démo</strong> — Données simulées (backend non requis)</span>
      <button onClick={onSwitchLive} className="ml-auto text-xs underline hover:no-underline">
        Essayer mode live →
      </button>
    </div>
  );
  if (mode === 'import') return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl text-sm text-indigo-700 dark:text-indigo-400">
      <Upload className="h-4 w-4 shrink-0" />
      <span><strong>Logs importés</strong> depuis {source === 'simulation' ? 'le module de simulation' : "l'ETL"}</span>
      <button onClick={onSwitchDemo} className="ml-auto text-xs underline hover:no-underline">
        Retour mode démo
      </button>
    </div>
  );
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl text-sm text-emerald-700 dark:text-emerald-400">
      <Activity className="h-4 w-4 shrink-0" />
      <span><strong>Mode live</strong> — Connecté au backend Camunda</span>
      <button onClick={onSwitchDemo} className="ml-auto text-xs underline hover:no-underline">
        Passer en démo
      </button>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export function ProcessMonitorPage() {
  const { sharedLogs, sharedSource, sharedProcessKey } = useSimulation();

  // mode: 'live' | 'demo' | 'import'
  const [mode, setMode]                   = useState('loading');
  const [processes, setProcesses]         = useState(DEMO_PROCESSES);
  const [selectedKey, setSelectedKey]     = useState('onboarding_client');
  const [startDate, setStartDate]         = useState('');
  const [endDate, setEndDate]             = useState('');
  const [bpmnXml, setBpmnXml]             = useState(DEMO_BPMN_XML);
  const [logs, setLogs]                   = useState([]);
  const [metrics, setMetrics]             = useState(null);
  const [kpiData, setKpiData]             = useState({});
  const [globalKpis, setGlobalKpis]       = useState(null);
  const [loading, setLoading]             = useState(false);
  const [selectedNode, setSelectedNode]   = useState(null);
  const [selectedNodeKpi, setSelectedNodeKpi] = useState(null);
  const [activeTaskIds, setActiveTaskIds] = useState([]);

  // Si des logs partagés arrivent depuis Simulation/ETL → passer en mode import + charger BPMN
  useEffect(() => {
    if (!sharedLogs?.length) return;
    setMode('import');
    applyLogs(sharedLogs, null);

    // Charger le BPMN du processus simulé si on a une clé
    if (sharedProcessKey) {
      fetch(`${API_URL}/api/process-engine/bpmn/${encodeURIComponent(sharedProcessKey)}`, { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          const wrapped = data?.data ?? data;
          const xml = wrapped?.bpmnXml ?? wrapped?.xml ?? (typeof wrapped === 'string' ? wrapped : null);
          if (xml) setBpmnXml(xml);
        })
        .catch(() => {/* garder le BPMN actuel */});
    }
  }, [sharedLogs, sharedProcessKey]);

  // ── Polling des tâches actives (mode live uniquement) ──────────────────────
  useEffect(() => {
    if (mode !== 'live') {
      setActiveTaskIds([]);
      return;
    }
    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/api/process-engine/tasks/my-tasks`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        const keys = [...new Set(list.map(t => t.taskDefinitionKey).filter(Boolean))];
        setActiveTaskIds(keys);
      } catch (_) {}
    };
    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [mode]);

  function applyLogs(rawLogs, rawMetrics) {
    // Normaliser les logs (formats simulation vs Camunda)
    const normalized = rawLogs.map((l, i) => ({
      ...l,
      id: l.id || `log-${i}`,
      taskName: l.taskName || l.activity || l.activityName || l.activityId,
      durationMs: l.durationMs || l.durationInMillis || ((l.duration_min || 0) * 60000),
    }));
    setLogs(normalized);
    const kd = buildKpiData(normalized);
    setKpiData(kd);
    setGlobalKpis(computeGlobalKpis(normalized, rawMetrics));
    setMetrics(rawMetrics);
  }

  // ── Chargement mode démo ────────────────────────────────────────────────────
  function loadDemo() {
    setMode('demo');
    setProcesses(DEMO_PROCESSES);
    setSelectedKey('onboarding_client');
    setBpmnXml(DEMO_BPMN_XML);
    applyLogs(DEMO_LOGS, DEMO_METRICS);
  }

  // ── Chargement mode live ────────────────────────────────────────────────────
  const loadLive = useCallback(async () => {
    setLoading(true);
    try {
      // Charger processus
      const defs = await AnalyticsService.getProcessDefinitions().catch(() => []);
      const normalized = (Array.isArray(defs) ? defs : []).map((p, i) => ({
        id: String(p.id || p.key || i),
        key: String(p.key || p.id || i),
        name: p.name || p.key || `Processus ${i + 1}`,
      }));
      if (normalized.length === 0) throw new Error('no_processes');
      setProcesses(normalized);
      setSelectedKey(normalized[0].key);

      // Charger logs + métriques
      const key = normalized[0].key;
      const [metricsData, logsData] = await Promise.all([
        AnalyticsService.getProcessMetrics(key).catch(() => null),
        AnalyticsService.getProcessLogsForAnalytics(key, startDate || null, endDate || null).catch(() => []),
      ]);
      applyLogs(logsData || [], metricsData);

      // Charger BPMN XML
      BpmnModelService.getMyDeployedProcesses()
        .then(procs => {
          const proc = (Array.isArray(procs) ? procs : [])
            .find(p => p.processDefinitionKey === key || p.key === key);
          if (proc?.bpmnXml) { setBpmnXml(proc.bpmnXml); return; }
          if (proc?.id) return BpmnModelService.getBpmnModel(proc.id)
            .then(d => { if (d?.bpmnXml) setBpmnXml(d.bpmnXml); });
        })
        .catch(() => setBpmnXml(DEMO_BPMN_XML));

      setMode('live');
    } catch {
      // Backend indisponible → fallback démo
      loadDemo();
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // ── Refresh selon mode ──────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    if (mode === 'demo') { loadDemo(); return; }
    if (mode === 'import') { applyLogs(sharedLogs, null); return; }
    setLoading(true);
    try {
      const [metricsData, logsData] = await Promise.all([
        AnalyticsService.getProcessMetrics(selectedKey).catch(() => null),
        AnalyticsService.getProcessLogsForAnalytics(selectedKey, startDate || null, endDate || null).catch(() => []),
      ]);
      applyLogs(logsData || [], metricsData);
    } catch {
      loadDemo();
    } finally {
      setLoading(false);
    }
  }, [mode, selectedKey, startDate, endDate, sharedLogs]);

  // Init : essayer live d'abord, fallback démo automatique si backend indispo
  useEffect(() => {
    if (sharedLogs?.length > 0) return; // logs partagés prioritaires
    loadLive();
  }, []);

  const activityRows = Object.entries(kpiData)
    .sort((a, b) => (b[1].avgDuration || 0) - (a[1].avgDuration || 0))
    .slice(0, 10);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto w-full max-w-none space-y-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200">
            <Home className="h-4 w-4" /> Accueil
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
            <Activity className="h-4 w-4" /> Pilotage de processus
          </span>
        </nav>

        {/* Bannière de mode */}
        <ModeBanner
          mode={mode}
          source={sharedSource}
          onSwitchDemo={loadDemo}
          onSwitchLive={loadLive}
        />

        {/* Sélecteurs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-48">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Processus</label>
              <select
                value={selectedKey}
                onChange={e => setSelectedKey(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {processes.map(p => (
                  <option key={p.key} value={p.key}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Début</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Fin</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* ── BPMN Viewer avec overlay ── */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-500" />
              Diagramme BPMN — Overlay de performance
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse inline-block"/> En cours</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"/> Dans les délais</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500 inline-block"/> Ralenti</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block"/> Critique</span>
            </div>
          </div>
          <div className="relative" style={{ height: 480 }}>
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                <RefreshCw className="h-10 w-10 animate-spin" />
                <p className="text-sm">Chargement du diagramme…</p>
              </div>
            ) : bpmnXml ? (
              <BpmnKpiViewer
                xml={bpmnXml}
                kpiData={kpiData}
                activeTasks={activeTaskIds}
                onNodeClick={(id, kpi) => { setSelectedNode(id); setSelectedNodeKpi(kpi); }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                <WifiOff className="h-12 w-12 opacity-30" />
                <p className="text-sm">Aucun diagramme BPMN disponible.</p>
                <button onClick={loadDemo} className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Charger le diagramme de démo
                </button>
              </div>
            )}
            <NodeTooltip nodeId={selectedNode} kpi={selectedNodeKpi} onClose={() => { setSelectedNode(null); setSelectedNodeKpi(null); }} />
          </div>
        </div>

        {/* ── KPIs globaux ── */}
        {globalKpis && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <KpiCard icon={BarChart2}    label="Instances totales"    value={globalKpis.total}                                               color="blue" />
            <KpiCard icon={CheckCircle} label="Taux de complétion"   value={`${((globalKpis.conformity || 0) * 100).toFixed(1)}%`}          color={globalKpis.conformity >= 0.8 ? 'green' : 'yellow'} />
            <KpiCard icon={Clock}       label="Cycle time moyen"     value={fmtDuration(globalKpis.avgTime)}                                color="purple" />
            <KpiCard icon={AlertTriangle} label="Taux d'erreur"      value={`${((globalKpis.errorRate || 0) * 100).toFixed(1)}%`}           color={globalKpis.errorRate < 0.05 ? 'green' : globalKpis.errorRate < 0.15 ? 'yellow' : 'red'} />
            <KpiCard icon={TrendingUp}  label="Goulot principal"     value={globalKpis.bottleneck ? globalKpis.bottleneck.slice(0, 16) : '–'} sub={globalKpis.bottleneck ? fmtDuration(globalKpis.bottleneckDuration) : undefined} color="red" />
          </div>
        )}

        {/* ── Tableau activités ── */}
        {activityRows.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Performance par activité
                <span className="ml-2 text-xs text-slate-400 font-normal">(triées par durée décroissante)</span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    {['Activité', 'Durée moy.', 'Min', 'Max', 'Exécutions', "Taux d'erreur", 'Statut'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400 tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {activityRows.map(([id, kpi]) => (
                    <tr key={id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors"
                        onClick={() => { setSelectedNode(id); setSelectedNodeKpi(kpi); }}>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{id}</td>
                      <td className="px-4 py-3 font-semibold text-blue-600">{fmtDuration(kpi.avgDuration)}</td>
                      <td className="px-4 py-3 text-emerald-600">{fmtDuration(kpi.minDuration)}</td>
                      <td className="px-4 py-3 text-red-500">{fmtDuration(kpi.maxDuration)}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{kpi.count}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${kpi.errorRate > 0.1 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {((kpi.errorRate || 0) * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          kpi.status === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                          kpi.status === 'slow'  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                        }`}>
                          {kpi.status === 'error' && <><AlertTriangle className="h-3 w-3"/> Critique</>}
                          {kpi.status === 'slow'  && <><Clock className="h-3 w-3"/> Ralenti</>}
                          {kpi.status === 'ok'    && <><CheckCircle className="h-3 w-3"/> Normal</>}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* État vide */}
        {!loading && logs.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-12 text-center text-slate-400">
            <Info className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-slate-600 dark:text-slate-300">Aucune donnée d'exécution disponible</p>
            <p className="text-sm mt-1">Utilisez le module de simulation pour générer des données.</p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={loadDemo} className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                Charger données démo
              </button>
              <Link to="/simulation" className="px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300">
                Aller à la simulation →
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
