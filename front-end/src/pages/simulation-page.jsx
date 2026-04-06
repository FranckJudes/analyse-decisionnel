/**
 * SimulationPage — Générateur de logs synthétiques
 *
 * Génère des event logs simulés à partir d'un modèle de processus BPMN simplifié.
 * Scénarios : Nominal, Dégradé, Optimisé.
 * Permet d'exporter les logs et de les envoyer directement à EventLogPage.
 */
import React, { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSimulation } from '../context/simulation-context';
import {
  Play,
  RefreshCw,
  Download,
  Settings,
  Layers,
  AlertTriangle,
  Activity,
  Zap,
  CheckCircle,
  Clock,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

// ─── Process templates ────────────────────────────────────────────────────────

const PROCESS_TEMPLATES = {
  onboarding: {
    label: 'Onboarding client',
    activities: [
      { id: 'reception', name: 'Réception demande', baseDuration: 0.5, actors: ['Système', 'Agent accueil'] },
      { id: 'verification', name: 'Vérification identité', baseDuration: 1.5, actors: ['Agent KYC'] },
      { id: 'validation', name: 'Validation manager', baseDuration: 8, actors: ['Manager'] },
      { id: 'creation_compte', name: 'Création compte', baseDuration: 0.5, actors: ['Système'] },
      { id: 'notification', name: 'Notification client', baseDuration: 0.1, actors: ['Système'] },
    ],
    variants: [
      { name: 'Nominal', path: ['reception', 'verification', 'validation', 'creation_compte', 'notification'], weight: 70 },
      { name: 'Rapide', path: ['reception', 'verification', 'creation_compte', 'notification'], weight: 20 },
      { name: 'Rejet', path: ['reception', 'verification', 'notification'], weight: 10 },
    ],
  },
  reclamation: {
    label: 'Traitement réclamation',
    activities: [
      { id: 'reception', name: 'Réception réclamation', baseDuration: 0.5, actors: ['Agent SAV'] },
      { id: 'analyse', name: 'Analyse', baseDuration: 4, actors: ['Agent SAV', 'Expert'] },
      { id: 'escalade', name: 'Escalade', baseDuration: 24, actors: ['Manager', 'Direction'] },
      { id: 'resolution', name: 'Résolution', baseDuration: 8, actors: ['Agent SAV', 'Expert'] },
      { id: 'cloture', name: 'Clôture & satisfaction', baseDuration: 0.5, actors: ['Agent SAV'] },
    ],
    variants: [
      { name: 'Simple', path: ['reception', 'analyse', 'resolution', 'cloture'], weight: 60 },
      { name: 'Complexe', path: ['reception', 'analyse', 'escalade', 'resolution', 'cloture'], weight: 30 },
      { name: 'Non résolu', path: ['reception', 'analyse', 'cloture'], weight: 10 },
    ],
  },
  approbation: {
    label: 'Approbation budget',
    activities: [
      { id: 'soumission', name: 'Soumission demande', baseDuration: 1, actors: ['Demandeur'] },
      { id: 'controle', name: 'Contrôle financier', baseDuration: 6, actors: ['Contrôleur'] },
      { id: 'approbation_n1', name: 'Approbation N+1', baseDuration: 12, actors: ['Manager'] },
      { id: 'approbation_n2', name: 'Approbation Direction', baseDuration: 24, actors: ['Directeur'] },
      { id: 'engagement', name: 'Engagement budgétaire', baseDuration: 2, actors: ['Comptable'] },
    ],
    variants: [
      { name: 'Faible montant', path: ['soumission', 'controle', 'approbation_n1', 'engagement'], weight: 55 },
      { name: 'Fort montant', path: ['soumission', 'controle', 'approbation_n1', 'approbation_n2', 'engagement'], weight: 35 },
      { name: 'Refus', path: ['soumission', 'controle', 'approbation_n1'], weight: 10 },
    ],
  },
};

// ─── Simulation engine ────────────────────────────────────────────────────────

function weightedRandom(items) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

function jitter(base, factor) {
  return base * (1 + (Math.random() * 2 - 1) * factor);
}

function generateLogs({ processKey, numCases, scenario, startDate, errorRate }) {
  const template = PROCESS_TEMPLATES[processKey];
  if (!template) return [];

  const actMap = Object.fromEntries(template.activities.map(a => [a.id, a]));
  const logs = [];
  const start = new Date(startDate);

  const scenarioFactors = {
    nominal:   { durationFactor: 1.0,  errorBoost: 0,   jitterFactor: 0.2 },
    degrade:   { durationFactor: 2.5,  errorBoost: 0.15, jitterFactor: 0.5 },
    optimise:  { durationFactor: 0.55, errorBoost: -errorRate * 0.6, jitterFactor: 0.1 },
  };

  const sf = scenarioFactors[scenario] ?? scenarioFactors.nominal;
  const effectiveErrorRate = Math.max(0, errorRate + sf.errorBoost);

  for (let c = 0; c < numCases; c++) {
    const caseId = `CASE-${String(c + 1).padStart(4, '0')}`;
    const variant = weightedRandom(template.variants);
    const caseStart = new Date(start.getTime() + c * 3600_000 * (Math.random() * 6));
    let currentTime = new Date(caseStart);

    for (const actId of variant.path) {
      const act = actMap[actId];
      if (!act) continue;
      const duration = jitter(act.baseDuration * sf.durationFactor, sf.jitterFactor);
      const actor = act.actors[Math.floor(Math.random() * act.actors.length)];
      const isError = Math.random() < effectiveErrorRate;

      logs.push({
        case_id: caseId,
        activity: act.name,
        timestamp: currentTime.toISOString().replace('T', ' ').slice(0, 19),
        actor,
        status: isError ? 'error' : (duration > act.baseDuration * 1.8 ? 'slow' : 'completed'),
        duration_min: Math.round(duration * 60),
        variant: variant.name,
        process: template.label,
      });

      currentTime = new Date(currentTime.getTime() + duration * 3_600_000);
    }
  }

  return logs;
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function toCSV(logs) {
  if (!logs.length) return '';
  const headers = Object.keys(logs[0]);
  const rows = logs.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','));
  return [headers.join(','), ...rows].join('\n');
}

// ─── Mini stats ───────────────────────────────────────────────────────────────

function computeStats(logs) {
  if (!logs.length) return null;
  const cases = [...new Set(logs.map(l => l.case_id))];
  const errors = logs.filter(l => l.status === 'error').length;
  const durations = logs.map(l => l.duration_min).filter(d => d > 0);
  const avgDur = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  const activities = [...new Set(logs.map(l => l.activity))];
  const variants = {};
  logs.forEach(l => { if (l.variant) variants[l.variant] = (variants[l.variant] || 0) + 1; });

  return {
    totalEvents: logs.length,
    totalCases: cases.length,
    errorRate: ((errors / logs.length) * 100).toFixed(1),
    avgDurationMin: avgDur.toFixed(0),
    activities: activities.length,
    variants: Object.entries(variants).map(([name, count]) => ({ name, count })),
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

const SCENARIOS = [
  {
    key: 'nominal',
    label: 'Nominal',
    description: 'Processus standard sans perturbation',
    icon: CheckCircle,
    color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    activeColor: 'bg-emerald-500 text-white border-emerald-500',
    iconColor: 'text-emerald-500',
  },
  {
    key: 'degrade',
    label: 'Dégradé',
    description: 'Temps allongés, taux d\'erreur élevé',
    icon: AlertTriangle,
    color: 'border-red-400 bg-red-50 dark:bg-red-900/20',
    activeColor: 'bg-red-500 text-white border-red-500',
    iconColor: 'text-red-500',
  },
  {
    key: 'optimise',
    label: 'Optimisé',
    description: 'Processus optimisé, temps réduits',
    icon: Zap,
    color: 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20',
    activeColor: 'bg-indigo-500 text-white border-indigo-500',
    iconColor: 'text-indigo-500',
  },
];

export function SimulationPage() {
  const { publishLogs } = useSimulation();
  const navigate = useNavigate();
  const [processKey, setProcessKey] = useState('onboarding');
  const [numCases, setNumCases] = useState(50);
  const [scenario, setScenario] = useState('nominal');
  const [startDate, setStartDate] = useState('2025-01-01');
  const [errorRate, setErrorRate] = useState(0.05);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [running, setRunning] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  function sendToMonitor() {
    // Convertir les logs simulation vers le format attendu par ProcessMonitorPage
    const converted = logs.map((l, i) => ({
      id: `sim-${i}`,
      taskName: l.activity,
      durationMs: (l.duration_min || 0) * 60000,
      eventType: l.status === 'error' ? 'ERROR' : 'COMPLETE',
      status: l.status,
      processInstanceId: l.case_id,
    }));
    publishLogs(converted, 'simulation');
    navigate({ to: '/process-monitor' });
  }
  const [showConfig, setShowConfig] = useState(true);

  const run = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const result = generateLogs({ processKey, numCases, scenario, startDate, errorRate });
      setLogs(result);
      setStats(computeStats(result));
      setRunning(false);
      setShowPreview(true);
    }, 400);
  }, [processKey, numCases, scenario, startDate, errorRate]);

  function handleDownload() {
    const csv = toCSV(logs);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation_${processKey}_${scenario}_${numCases}cases.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const template = PROCESS_TEMPLATES[processKey];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900 p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Module de simulation</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Générez des event logs synthétiques pour démonstration et test
          </p>
        </div>
        {logs.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={sendToMonitor}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Activity className="w-4 h-4" />
              Visualiser dans Process Monitor
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Configuration panel ── */}
        <div className="lg:col-span-1 space-y-4">

          {/* Process selector */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <button
              onClick={() => setShowConfig(v => !v)}
              className="w-full flex items-center justify-between text-base font-semibold text-slate-900 dark:text-white mb-0"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-400" />
                Configuration
              </span>
              {showConfig ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showConfig && (
              <div className="mt-4 space-y-4">
                {/* Process */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Processus métier
                  </label>
                  <select
                    value={processKey}
                    onChange={e => setProcessKey(e.target.value)}
                    className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {Object.entries(PROCESS_TEMPLATES).map(([key, t]) => (
                      <option key={key} value={key}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Num cases */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Nombre de cas : <strong>{numCases}</strong>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={500}
                    step={10}
                    value={numCases}
                    onChange={e => setNumCases(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>10</span><span>500</span>
                  </div>
                </div>

                {/* Error rate */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Taux d'erreur de base : <strong>{(errorRate * 100).toFixed(0)}%</strong>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={0.3}
                    step={0.01}
                    value={errorRate}
                    onChange={e => setErrorRate(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>0%</span><span>30%</span>
                  </div>
                </div>

                {/* Start date */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Scenario selector */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              Scénario de simulation
            </h2>
            <div className="space-y-2">
              {SCENARIOS.map(sc => (
                <button
                  key={sc.key}
                  onClick={() => setScenario(sc.key)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-start gap-3 ${
                    scenario === sc.key
                      ? sc.activeColor
                      : `${sc.color} border-transparent hover:border-current`
                  }`}
                >
                  <sc.icon className={`w-4 h-4 mt-0.5 shrink-0 ${scenario === sc.key ? 'text-white' : sc.iconColor}`} />
                  <div>
                    <p className={`text-sm font-semibold ${scenario === sc.key ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                      {sc.label}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${scenario === sc.key ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                      {sc.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Run button */}
          <button
            onClick={run}
            disabled={running}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md"
          >
            {running
              ? <><RefreshCw className="w-4 h-4 animate-spin" />Simulation en cours…</>
              : <><Play className="w-4 h-4" />Lancer la simulation</>
            }
          </button>
        </div>

        {/* ── Right panel: process info + results ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Process graph */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-slate-400" />
              Modèle de processus — <span className="text-indigo-600 dark:text-indigo-400">{template.label}</span>
            </h2>

            {/* Activities flow */}
            <div className="flex items-center flex-wrap gap-2 mb-4">
              {template.activities.map((act, i) => (
                <React.Fragment key={act.id}>
                  <div className="flex flex-col items-center">
                    <div className="px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-medium text-slate-700 dark:text-slate-300 text-center max-w-[120px]">
                      {act.name}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">{act.baseDuration}h base</span>
                  </div>
                  {i < template.activities.length - 1 && (
                    <div className="text-slate-300 dark:text-slate-600 text-lg shrink-0">→</div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Variants */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Variants du processus</p>
              {template.variants.map(v => (
                <div key={v.name} className="flex items-center gap-3">
                  <div className="w-20 text-right">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{v.name}</span>
                  </div>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${v.weight}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 w-8 text-right">{v.weight}%</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {v.path.map((actId, pi) => {
                      const act = template.activities.find(a => a.id === actId);
                      return (
                        <React.Fragment key={actId}>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {act?.name ?? actId}
                          </span>
                          {pi < v.path.length - 1 && <span className="text-slate-300 text-xs">›</span>}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Événements générés', value: stats.totalEvents, icon: Layers, color: 'bg-indigo-500' },
                { label: 'Cas simulés', value: stats.totalCases, icon: BarChart2, color: 'bg-violet-500' },
                { label: "Taux d'erreur", value: `${stats.errorRate}%`, icon: AlertTriangle, color: 'bg-red-500' },
                { label: 'Durée moy.', value: `${stats.avgDurationMin} min`, icon: Clock, color: 'bg-amber-500' },
                { label: 'Activités uniques', value: stats.activities, icon: Zap, color: 'bg-emerald-500' },
                { label: 'Scénario', value: SCENARIOS.find(s => s.key === scenario)?.label ?? scenario, icon: CheckCircle, color: 'bg-slate-600' },
              ].map(s => (
                <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex items-center gap-3">
                  <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center text-white shrink-0`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">{s.label}</p>
                    <p className="text-base font-bold text-slate-900 dark:text-white">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Variant distribution */}
          {stats?.variants?.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Distribution des variants simulés</h3>
              <div className="space-y-2">
                {stats.variants.map((v, i) => {
                  const pct = Math.round((v.count / stats.totalEvents) * 100);
                  const colors = ['bg-indigo-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500'];
                  return (
                    <div key={v.name} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 w-24 text-right">{v.name}</span>
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 w-12">{v.count} evt</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preview table */}
          {logs.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <button
                onClick={() => setShowPreview(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Aperçu des logs générés
                  </span>
                  <span className="text-xs text-slate-400">({logs.length} événements)</span>
                </div>
                {showPreview ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {showPreview && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-700">
                        {['case_id', 'activity', 'timestamp', 'actor', 'status', 'duration_min', 'variant'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {logs.slice(0, 20).map((row, i) => (
                        <tr key={i} className={`hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors ${row.status === 'error' ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                          <td className="px-4 py-2 font-mono text-slate-500 dark:text-slate-400">{row.case_id}</td>
                          <td className="px-4 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.activity}</td>
                          <td className="px-4 py-2 font-mono text-slate-400 whitespace-nowrap">{row.timestamp}</td>
                          <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{row.actor}</td>
                          <td className="px-4 py-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              row.status === 'error'   ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              row.status === 'slow'    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                              'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-slate-500">{row.duration_min}</td>
                          <td className="px-4 py-2 text-slate-400">{row.variant}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {logs.length > 20 && (
                    <p className="px-4 py-2 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-700">
                      … {logs.length - 20} événements supplémentaires — téléchargez le CSV pour voir tout
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
